# API Proxy Layer

The API proxy layer is a set of TanStack Start server functions that sit between the client and the HeroesProfile API. It keeps the API token secret, caches responses to reduce upstream load and improve latency, and provides typed responses to the client.

## Why This Matters

The HeroesProfile API requires an API token that must not be exposed to the browser. Hero stats data changes infrequently (at most when new replays are processed), so caching aggressively is safe and dramatically improves page load times. Typed responses catch integration errors at build time rather than in production.

## Architecture

```
Browser → TanStack Start Server Function → In-Memory Cache → HeroesProfile API
```

Each server function is created with `createServerFn` from `@tanstack/react-start`. Server functions run on the server only — the API token and caching logic never reach the client bundle.

## Environment Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `HEROESPROFILE_API_TOKEN` | Yes | API token from api.heroesprofile.com |

The application fails to start with a clear error message if `HEROESPROFILE_API_TOKEN` is not set.

## Server Functions

### `getPatches`

Fetches available patch versions from the HeroesProfile API.

- **Upstream:** `GET /api/Patches?api_token={token}&mode=json`
- **Parameters:** None
- **Returns:** Object mapping major patch versions to arrays of minor patch strings
- **Cache TTL:** 60 minutes (patches change rarely)
- **Used by:** Patch resolution logic, both route loaders

### `getHeroes`

Fetches hero metadata.

- **Upstream:** `GET /api/Heroes?api_token={token}&mode=json`
- **Parameters:** None
- **Returns:** Object keyed by hero name, each with: `id`, `name`, `short_name`, `role`, `new_role`, `type`, `attribute_id`
- **Cache TTL:** 60 minutes (hero roster changes only on game patches)
- **Used by:** Both route loaders for hero metadata

### `getHeroStats`

Fetches aggregate hero statistics for a given patch, game mode, and optional MMR tier.

- **Upstream:** `GET /api/Heroes/Stats?api_token={token}&mode=json&timeframe_type={type}&timeframe={version}&game_type={gameType}`
- **Parameters:**
  - `timeframeType`: `"major"` or `"minor"`
  - `timeframe`: Patch version string (e.g., `"2.55.15.96477"`)
  - `gameType`: Full game type name (e.g., `"Storm League"`)
  - `leagueTier` (optional): Comma-separated tier numbers (e.g., `"6"` for Master)
- **Returns:** Object keyed by hero name, each with: `wins`, `losses`, `games_played`, `win_rate`, `popularity`, `ban_rate`, `pick_rate`, `bans`
- **Cache TTL:** 15 minutes
- **Used by:** Hero stats table route loader

### `getTalentDetails`

Fetches per-talent win rates and popularity for a hero.

- **Upstream:** `GET /api/Heroes/Talents/Details?api_token={token}&mode=json&timeframe_type={type}&timeframe={version}&game_type={gameType}&hero={heroName}`
- **Parameters:**
  - `timeframeType`: `"major"` or `"minor"`
  - `timeframe`: Patch version string
  - `gameType`: Full game type name
  - `hero`: Full hero name (e.g., `"Maiev"`)
  - `leagueTier` (optional): Comma-separated tier numbers
- **Returns:** Object keyed by hero name, then talent level (1, 4, 7, 10, 13, 16, 20), then talent name, each with: `games_played`, `wins`, `losses`, `win_rate`, `popularity`
- **Cache TTL:** 15 minutes
- **Used by:** Hero talent page route loader

### `getTalentBuilds`

Fetches the top talent builds for a hero.

- **Upstream:** `GET /api/Heroes/Talents/Builds?api_token={token}&mode=json&timeframe_type={type}&timeframe={version}&game_type={gameType}&hero={heroName}`
- **Parameters:**
  - `timeframeType`: `"major"` or `"minor"`
  - `timeframe`: Patch version string
  - `gameType`: Full game type name
  - `hero`: Full hero name
  - `leagueTier` (optional): Comma-separated tier numbers
- **Returns:** Object keyed by hero name, containing array of up to 5 build objects with: `win_rate` (float), `build_talents` (array of 7 talent name strings)
- **Cache TTL:** 15 minutes
- **Used by:** Hero talent page route loader

### `getHeroTalents`

Fetches talent metadata (names, descriptions, icons) for a hero.

- **Upstream:** `GET /api/Heroes/Talents?api_token={token}&mode=json&hero={heroName}`
- **Parameters:**
  - `hero`: Full hero name
- **Returns:** Object keyed by hero name, containing array of talent objects with: `talent_id`, `title`, `description`, `level`, `hotkey`, `icon`
- **Cache TTL:** 60 minutes (talent metadata only changes on game patches)
- **Used by:** Hero talent page route loader

## Caching

### Implementation

A simple in-memory `Map<string, { data: unknown; expiry: number }>`. Each server function checks the cache before making an upstream request. If a cached entry exists and has not expired, it is returned immediately.

### Cache Key Format

`{functionName}:{sortedParamString}` — e.g., `getHeroStats:gameType=Storm League&timeframe=2.55.15.96477&timeframeType=minor`

Parameters are sorted alphabetically to ensure consistent keys regardless of argument order.

### Cache Invalidation

Entries are evicted passively (checked on read and skipped if expired). No background cleanup process in v1 — the cache is small enough that expired entries don't cause memory issues.

### Cache TTLs

| Function | TTL | Rationale |
|----------|-----|-----------|
| `getPatches` | 60 min | Patches change at most every few weeks |
| `getHeroes` | 60 min | Hero roster changes only on game patches |
| `getHeroTalents` | 60 min | Talent metadata changes only on game patches |
| `getHeroStats` | 15 min | Stats update as new replays are processed |
| `getTalentDetails` | 15 min | Stats update as new replays are processed |
| `getTalentBuilds` | 15 min | Stats update as new replays are processed |

## Patch Resolution

A helper function `resolveLatestPatch` fetches the patches list and returns the most recent minor patch version string. It also returns the second-most-recent minor patch for computing win rate change on the hero stats table.

Logic:
1. Call `getPatches()`
2. Sort major patch keys by version number descending
3. Take the first (latest) major patch
4. Sort its minor patches by version string descending
5. Return the first as `currentPatch` and the second as `previousPatch`

## Error Handling

Each server function wraps its upstream fetch in a try/catch. On failure:

- **Network error or timeout (10s):** Return `{ error: "upstream_unavailable", message: "HeroesProfile API is not responding" }`
- **Non-200 status:** Return `{ error: "upstream_error", message: "HeroesProfile API returned {status}", status: number }`
- **Invalid JSON:** Return `{ error: "parse_error", message: "Failed to parse API response" }`

The return type of each server function is a discriminated union: `{ data: T } | { error: string; message: string }`. This ensures the client always handles both success and failure paths.

## Type Definitions

All API response shapes are defined as TypeScript interfaces in a shared types file. Server functions return these typed interfaces, providing type safety from the API boundary through to the React components.

## Acceptance Criteria

- The API token is never included in client-side JavaScript bundles
- The application fails to start with a descriptive error if `HEROESPROFILE_API_TOKEN` is not set
- Cached responses are returned within 1ms (no upstream call)
- Expired cache entries trigger a fresh upstream request
- All server functions return typed success/error discriminated unions
- Upstream requests time out after 10 seconds
- `resolveLatestPatch` correctly identifies the most recent and second-most-recent minor patch versions
