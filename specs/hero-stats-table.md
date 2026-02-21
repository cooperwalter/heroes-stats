# Hero Stats Table

The hero stats table is the application's homepage. It presents win rates, pick rates, ban rates, and game counts for every hero in Heroes of the Storm, filtered by game mode and MMR tier. Players use this to quickly identify which heroes are strong or weak in the current patch.

## Why This Matters

Before queueing for a game, players want to know: "What's good right now?" A sortable table with clear win rate indicators answers this in seconds. Filtering by game mode matters because hero balance differs significantly between Storm League (draft) and Quick Match (random). Filtering by MMR tier matters because heroes that dominate in Bronze may be weak in Master.

## Route

`/` — the hero stats table is the homepage and primary entry point.

## Filters

Two filters displayed as a horizontal bar above the table:

### Game Mode

Toggle buttons: **Storm League** (default, selected on page load), Quick Match, ARAM, Unranked Draft. Only one can be active at a time. Selecting a mode re-fetches data for that mode.

The game mode values sent to the API are: `"Storm League"`, `"Quick Match"`, `"ARAM"`, `"Unranked Draft"`.

### MMR Tier

Dropdown select: **All Ranks** (default), Master, Diamond, Platinum, Gold, Silver, Bronze, Wood. Only one can be selected. "All Ranks" sends no `league_tier` parameter. Individual tiers map to API values: Master=6, Diamond=5, Platinum=4, Gold=3, Silver=2, Bronze=1, Wood=0.

## Summary Cards

Four stat cards displayed in a row above the table:

| Card | Value | Source |
|------|-------|--------|
| Total Games | Sum of `games_played` across all heroes | Computed from hero stats response |
| Heroes Played | Count of heroes with `games_played > 0` | Computed from hero stats response |
| Avg Win Rate | Average of all hero win rates | Computed from hero stats response |
| Most Banned | Hero with highest `ban_rate` | Computed from hero stats response |

## Table

### Columns

| Column | Content | Default Sort | Sortable |
|--------|---------|-------------|----------|
| # | Rank number based on current sort order | — | No |
| Hero | Portrait placeholder + hero name + role subtitle | — | Yes (alphabetical) |
| Win Rate | Percentage in a color-coded pill badge | Descending (default) | Yes |
| Change | Win rate delta from previous patch (e.g. +2.1% / -0.4%) | — | Yes |
| Pick Rate | Percentage + 60px mini bar | — | Yes |
| Ban Rate | Percentage | — | Yes |
| Games Played | Integer with comma formatting | — | Yes |

### Win Rate Change

The "Change" column compares the current minor patch's win rate against the previous minor patch. This requires fetching hero stats for both the current and previous patch versions and computing the difference. If no previous patch data is available (e.g., a new hero), display "—".

### Row Behavior

- Clicking anywhere on a row navigates to `/heroes/{heroSlug}` where `heroSlug` is the hero's `short_name` from the Heroes endpoint
- Rows highlight on hover with `surface-hover` background
- The cursor is a pointer on hover

### Default State

On page load: Storm League selected, All Ranks selected, sorted by win rate descending.

## Data Flow

1. Route loader calls `getPatches()` to resolve the latest minor patch version
2. Route loader calls `getHeroStats()` with: latest patch as `timeframe`, `timeframe_type="minor"`, `game_type="Storm League"`, `mode="json"`
3. Route loader calls `getHeroes()` to get hero metadata (names, roles, short_names)
4. For win rate change: route loader also calls `getHeroStats()` for the previous minor patch version
5. Client renders the table from loader data
6. When filters change, the route re-fetches with updated parameters via URL search params

Filter state is stored in URL search parameters (`?mode=sl&tier=all`) so that filtered views are linkable and shareable. Game mode abbreviations in the URL: `sl` (Storm League), `qm` (Quick Match), `aram` (ARAM), `ud` (Unranked Draft).

## Loading and Error States

- While data is loading, show a skeleton table with pulsing placeholder rows (8 rows)
- If the API returns an error, show an inline error message above the table: "Failed to load hero stats. Please try again." with a retry button
- If data loads but contains zero heroes, show "No data available for this game mode and rank."

## Acceptance Criteria

- The table displays all heroes returned by the API for the selected filters
- Changing game mode re-fetches and updates the table without a full page reload
- Changing MMR tier re-fetches and updates the table without a full page reload
- Sorting by any sortable column reorders rows client-side without re-fetching
- Win rate values are color-coded: green (>52%), yellow (48-52%), red (<48%)
- Clicking a hero row navigates to that hero's talent page
- Filter state is reflected in the URL and restored on page load from URL params
- Numbers are formatted with commas (e.g., 3,204)
- Win rate change shows a + or - prefix and is colored green (positive) or red (negative)
