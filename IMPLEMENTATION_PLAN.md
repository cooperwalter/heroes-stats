# Implementation Plan

Heroes of the Storm stats dashboard using TanStack Start, Bun, and the HeroesProfile API. Players use this to quickly check hero win rates, pick rates, and optimal talent builds before queueing for a game.

**Status: All 6 phases implemented. Build, lint, typecheck, and 62 unit tests pass.**

**Key architectural decisions:**

- **TanStack Start** (`createServerFn` from `@tanstack/react-start`) with route loaders for all data fetching. TanStack Query is _not_ used — route loaders handle fetching, and the server-side in-memory cache handles caching. TanStack Start includes TanStack Router.
- **Vite** as build tool (TanStack Start migrated from Vinxi to Vite). Config: `vite.config.ts` with `@tanstack/react-start/plugin/vite` and `@vitejs/plugin-react`.
- **Bun** as runtime and package manager.
- **Biome v2** for linting and formatting (no ESLint/Prettier). Config uses `includes` not `ignore` for file scoping.
- **CSS custom properties** for the design system — no CSS-in-JS or Tailwind.
- **`timeframe_type` is always `"minor"`** for all API calls in v1 (patch-level granularity).
- **Visual reference:** `mockups/style-3-light-modern.html` is the chosen style.

**Spec contradictions & resolutions (applied):**

1. **StatCard label casing** — spec says uppercase; applied uppercase.
2. **Missing `yellow-bg` token** — added `--yellow-bg: #fffbeb` to `:root`.
3. **`games_played` in talent builds** — typed as `games_played?: number`, shows "—" when absent.
4. **Cross-major-patch boundary** — `previousPatch` is `null` when only one minor patch exists in latest major; heroes show "—" for change. Acceptable for v1.

**Learnings during implementation:**

- TanStack Start now uses `vite.config.ts` (not `app.config.ts`/Vinxi). Server entry is `src/server.ts` (not `src/entry-server.tsx`).
- TanStack Router loaders receive search params via `loaderDeps`, not `search` directly on the loader context.
- Biome v2 uses `includes` in the files config, not `ignore`.
- CSS `?url` imports require `/// <reference types="vite/client" />` in a `.d.ts` file.
- `FilterBar` must import filter data from `~/lib/filters` (single source of truth) — not duplicate locally.
- `avgWinRate` must exclude heroes with 0 games played to avoid skewing the average.
- `resolveLatestPatch` needs to guard against an empty patch object from the API.
- `pendingComponent` must be explicitly registered on the route config for TanStack Router to use it.
- Testing `createServerFn` handlers: mock `@tanstack/react-start` to make `createServerFn` a pass-through, mock `./cache` for isolation, and mock `global.fetch`. The handler functions are then callable directly.
- Loader error handling: `resolveLatestPatch()` throws on failure, so loaders must wrap it in try-catch and return error-shaped results instead of crashing. Same for `getHeroes()` errors in the talent page loader.
- Cache key parameter names must use camelCase (matching function input param names), not snake_case — spec example: `getHeroStats:gameType=Storm League&timeframe=2.55.15.96477&timeframeType=minor`.
- Eager API token validation belongs in `src/server.ts` (the server entry point), not in `env.ts`, so the app fails to start if the token is missing without breaking test isolation.

---

## Phase 1: Project Scaffolding — COMPLETE

## Phase 2: Design System — COMPLETE

## Phase 3: API Proxy Layer — COMPLETE

## Phase 4: Hero Stats Table — COMPLETE

## Phase 5: Hero Talent Page — COMPLETE

## Phase 6: Polish & Testing — COMPLETE

- [x] 62 unit tests across 6 test files, all passing
- [x] No TypeScript errors (`bun run typecheck`)
- [x] No lint errors (`bun run lint`)
- [x] Clean build (`bun run build`)

## Bugs fixed (0.0.4)

- **Eager API token validation** — spec requires app to fail to start if `HEROESPROFILE_API_TOKEN` is missing. Added `getApiToken()` call at server entry (`src/server.ts`) so the app crashes immediately on startup, not lazily on first request.
- **Cache key parameter naming** — cache keys used snake_case (`game_type`, `league_tier`) instead of spec-required camelCase (`gameType`, `leagueTier`). Fixed in `getHeroStats`, `getTalentDetails`, `getTalentBuilds`.
- **Table not horizontally scrollable on mobile** — `.heroes-table-wrapper` used `overflow: hidden` which clipped the table. Added `@media (max-width: 768px)` rule with `overflow-x: auto` for horizontal scroll.
- **Build row layout wrong** — win rate and games played were side-by-side. Spec requires games played below win rate. Changed `.build-row-right` to `flex-direction: column` with `align-items: flex-end`.
- **Best talent hover lost green border** — `.talent-card--best:hover` overrode green border with accent color. Fixed to preserve `var(--green)` border on hover.
- **Pending components missing FilterBar** — both index and hero talent skeleton/pending states omitted FilterBar and back link, causing layout shift. Added static FilterBar and back link to both pending components.
- **Games played conditionally hidden** — `TalentCard` and `BuildRow` hid games played entirely when `undefined`. Now always renders, showing "—" as fallback.
- **Change column used Unicode minus** — negative win rate change used U+2212 (mathematical minus) instead of spec-required ASCII hyphen-minus.

## Remaining: Integration Verification (manual)

- [ ] Verify with live API: set `HEROESPROFILE_API_TOKEN` and run `bun run dev`
- [ ] Verify responsive behavior down to 375px viewport
- [ ] Verify filter preservation when navigating between pages
- [ ] Verify 404 page renders for invalid hero slugs

## Known limitations (v1)

- `HeroPortrait` shows initials only — no actual hero portrait images from API/CDN.
- In-memory cache has no size cap — unbounded growth possible with many distinct filter combos in long-running processes.
- `getHeroTalents` metadata lookup by talent `title` string silently falls back to initials if names don't match exactly.
- `timeframeType` parameter is hardcoded to `"minor"` in all server functions (spec allows `"major"` or `"minor"` but v1 only uses minor).
