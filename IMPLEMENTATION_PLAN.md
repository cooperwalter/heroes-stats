# Implementation Plan

Heroes of the Storm stats dashboard using TanStack Start, Bun, and the HeroesProfile API. Players use this to quickly check hero win rates, pick rates, and optimal talent builds before queueing for a game.

**Status: All 6 phases implemented. Build, lint, typecheck, and 37 unit tests pass.**

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
3. **`games_played` in talent builds** — typed as `games_played?: number`, omitted gracefully when absent.
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

---

## Phase 1: Project Scaffolding — COMPLETE

## Phase 2: Design System — COMPLETE

## Phase 3: API Proxy Layer — COMPLETE

## Phase 4: Hero Stats Table — COMPLETE

## Phase 5: Hero Talent Page — COMPLETE

## Phase 6: Polish & Testing — COMPLETE

- [x] 37 unit tests across 4 test files, all passing:
  - cache.test.ts (7 tests): expiry, key generation, get/set, overwrites
  - patches.test.ts (7 tests): version sorting, previousPatch null, empty data, error handling
  - format.test.ts (12 tests): win rate color boundaries, number formatting, percent formatting
  - filters.test.ts (11 tests): mode/tier mapping, search schema validation and defaults
- [x] No TypeScript errors (`bun run typecheck`)
- [x] No lint errors (`bun run lint`)
- [x] Clean build (`bun run build`)

## Remaining: Integration Verification (manual)

- [ ] Verify with live API: set `HEROESPROFILE_API_TOKEN` and run `bun run dev`
- [ ] Verify responsive behavior down to 375px viewport
- [ ] Verify filter preservation when navigating between pages
- [ ] Verify 404 page renders for invalid hero slugs

## Known limitations (v1)

- `HeroPortrait` shows initials only — no actual hero portrait images from API/CDN.
- In-memory cache has no size cap — unbounded growth possible with many distinct filter combos in long-running processes.
- `getHeroTalents` metadata lookup by talent `title` string silently falls back to initials if names don't match exactly.
