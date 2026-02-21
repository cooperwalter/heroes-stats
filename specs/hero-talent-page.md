# Hero Talent Page

The hero talent page shows detailed talent statistics for a single hero: win rates and pick rates for each talent at every tier, plus the most popular full talent builds. Players use this to decide which talents to pick in-game.

## Why This Matters

Heroes of the Storm has a talent system where players choose one of 3-4 talents at levels 1, 4, 7, 10, 13, 16, and 20. Knowing which talents have the highest win rate at a given tier — and which full builds perform best — directly impacts a player's chance of winning. This is the most actionable data on the site.

## Route

`/heroes/{heroSlug}` — where `heroSlug` is the hero's `short_name` from the Heroes API endpoint (e.g., `maiev`, `li-ming`, `kelthuzad`).

## Page Header

- Hero name as the page title (e.g., "Maiev")
- Hero role displayed as a subtitle (e.g., "Melee Assassin")
- "Back to all heroes" link navigating to `/`
- Same filters as the hero stats table: Game Mode toggle buttons and MMR Tier dropdown. Filter state is synced via URL search params, same encoding as the stats table (`?mode=sl&tier=all`). Changing filters re-fetches talent data.

## Talent Tiers

Seven sections, one per talent tier (levels 1, 4, 7, 10, 13, 16, 20). Each section contains:

### Tier Header

A level badge (accent-colored pill showing the level number) followed by "Level {N}" text. Uppercase, muted, small text.

### Talent Cards

A horizontal row of cards, one per talent available at that tier (typically 3-4 talents). Each card displays:

| Field | Source | Format |
|-------|--------|--------|
| Talent icon | Talent metadata `icon` field, rendered as an image if available, gray placeholder square otherwise | 32x32px, 6px radius |
| Talent name | Talent metadata `title` field | 0.8125rem, 600 weight |
| Win rate | Talent details `win_rate` field | Percentage, color-coded (green/yellow/red) |
| Popularity | Talent details `popularity` field | Percentage |
| Games played | Talent details `games_played` field | Integer with comma formatting |

### Best Talent Highlight

The talent with the highest win rate in each tier receives a visual highlight: green border and a subtle green-bg gradient background. If two talents have the same win rate, the one with more games played is highlighted.

### Talent Descriptions

Talent descriptions from the metadata are not shown by default to keep the view compact. A future version could add tooltips on hover.

## Talent Builds Section

Below all seven talent tiers, a "Popular Builds" section displays the top builds for this hero.

### Build Rows

Up to 5 builds displayed, ordered by the API's default ordering (which prioritizes a combination of win rate and games played). Each build row shows:

| Field | Source | Format |
|-------|--------|--------|
| Rank | Position in list (1-5) | Bold muted number |
| Talent icons | 7 icons, one per tier, from the `build_talents` array | 32x32px squares in a horizontal row |
| Win rate | Build `win_rate` field | Percentage, color-coded, bold, right-aligned |
| Games played | Computed or displayed from context | "N games" muted text below win rate |

Builds come from the `/Heroes/Talents/Builds` endpoint which returns up to 5 builds per hero.

## Data Flow

1. Route loader calls `getPatches()` to resolve the latest minor patch version
2. Route loader calls `getHeroes()` to validate the hero slug and get hero metadata
3. If the slug doesn't match any hero, render a 404 page
4. Route loader calls `getTalentDetails()` with: hero name, latest patch, selected game type and league tier
5. Route loader calls `getTalentBuilds()` with: hero name, latest patch, selected game type and league tier
6. Route loader calls `getHeroTalents()` to get talent metadata (names, descriptions, icons)
7. Client renders talent tiers and builds from loader data
8. When filters change, the route re-fetches with updated parameters

## Loading and Error States

- While data is loading, show skeleton cards for each tier (3 placeholder cards per tier, 7 tiers)
- If the API returns an error, show an inline error message: "Failed to load talent data for {heroName}. Please try again." with a retry button
- If a hero slug is not recognized, show a 404 page with a link back to the hero stats table
- If talent data is empty for a given filter combination (e.g., a hero with zero games in ARAM at Master tier), show "Not enough data for this hero with the selected filters."

## Acceptance Criteria

- All talent tiers (1, 4, 7, 10, 13, 16, 20) are displayed with correct talents per tier
- Talent win rates are color-coded using the same thresholds as the hero stats table
- The highest win-rate talent in each tier has a green border highlight
- Up to 5 talent builds are displayed in the builds section
- Changing game mode or MMR tier re-fetches and updates talent data
- Filter state is reflected in URL search params and shared with the hero stats table
- Invalid hero slugs render a 404 page
- Navigating back to `/` preserves the previously selected filters
