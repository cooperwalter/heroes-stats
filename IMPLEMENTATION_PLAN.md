# Implementation Plan

Heroes of the Storm stats dashboard using TanStack Start, Bun, and the HeroesProfile API. Players use this to quickly check hero win rates, pick rates, and optimal talent builds before queueing for a game.

**Status: All 6 phases implemented. Build, lint, typecheck, and 36 unit tests pass.**

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

---

## Phase 1: Project Scaffolding — COMPLETE

- [x] AGENTS.md fixed: TanStack Start, not TanStack Router + TanStack Query
- [x] TanStack Start project initialized with Bun and Vite
- [x] All production and dev dependencies installed
- [x] Boilerplate: `vite.config.ts`, `src/router.tsx`, `src/routes/__root.tsx`, `src/entry-client.tsx`, `src/server.ts`
- [x] `tsconfig.json` with strict mode, path aliases (`~/` -> `src/`)
- [x] `biome.json` configured for Biome v2
- [x] `vitest.config.ts` configured
- [x] `package.json` scripts: dev, build, typecheck, lint, format, test
- [x] Environment variable validation (`src/lib/env.ts`)
- [x] Directory structure: routes/, lib/, components/, styles/
- [x] Root-level `notFoundComponent` (404 page)
- [x] Default `<title>` in root layout
- [x] `.gitignore` configured

## Phase 2: Design System — COMPLETE

- [x] Global CSS with all design tokens (`src/styles/global.css`)
- [x] Format utilities (`src/lib/format.ts`): `getWinRateColor`, `formatNumber`, `formatPercent`
- [x] NavBar, FilterBar, StatCard, WinRatePill, MiniBar, HeroPortrait
- [x] TalentCard, BuildRow, SkeletonRow, SkeletonCard, ErrorMessage
- [x] NavBar integrated into root layout
- [x] Responsive behavior at 768px breakpoint

## Phase 3: API Proxy Layer — COMPLETE

- [x] TypeScript interfaces for all API shapes (`src/lib/types.ts`)
- [x] Filter mapping with search schema (`src/lib/filters.ts`)
- [x] In-memory cache with TTL (`src/lib/cache.ts`)
- [x] 6 server functions (`src/lib/api.ts`): getPatches, getHeroes, getHeroStats, getTalentDetails, getTalentBuilds, getHeroTalents
- [x] Patch resolution (`src/lib/patches.ts`)

## Phase 4: Hero Stats Table — COMPLETE

- [x] Route at `/` with search param validation
- [x] Route loader: resolveLatestPatch -> parallel getHeroes + getHeroStats (current + previous)
- [x] FilterBar integration, 4 summary StatCards
- [x] Sortable data table with all columns, default win rate descending sort
- [x] Win rate change column (green/red/em dash)
- [x] Row click navigates to `/heroes/$heroSlug` preserving filters
- [x] Error, empty, and pending states

## Phase 5: Hero Talent Page — COMPLETE

- [x] Dynamic route at `/heroes/$heroSlug` with search param validation
- [x] Route loader: validate slug, parallel talent data fetch
- [x] 404 for invalid hero slugs via `notFound()`
- [x] 7 talent tier sections with TalentCards, best talent highlighted
- [x] Popular builds section with up to 5 BuildRows
- [x] Filter changes update URL and re-fetch
- [x] Error and empty states

## Phase 6: Polish & Testing — COMPLETE

- [x] 36 unit tests across 4 test files, all passing:
  - cache.test.ts (7 tests): expiry, key generation, get/set, overwrites
  - patches.test.ts (6 tests): version sorting, previousPatch null, error handling
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
