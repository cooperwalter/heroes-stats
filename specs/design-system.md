# Design System

The application uses a light modern aesthetic inspired by analytics dashboards like Linear and Vercel. Data readability is the priority — clean typography, generous whitespace, and subtle visual hierarchy through shadows and borders rather than heavy color or decoration.

## Why This Matters

Heroes of the Storm players visit stats sites to make quick decisions: which hero to pick, which talents to take. Dense, noisy UIs slow this down. A clean light theme with strong typographic hierarchy lets users scan a table of 90+ heroes and immediately spot the outliers.

## Visual Foundation

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#f8f9fb` | Page background |
| `surface` | `#ffffff` | Cards, table, modals |
| `surface-hover` | `#f3f4f6` | Hover states on interactive surfaces |
| `border` | `#e5e7eb` | Default borders |
| `border-strong` | `#d1d5db` | Emphasized borders (active filters) |
| `text` | `#111827` | Primary text |
| `text-secondary` | `#374151` | Table cell text, descriptions |
| `text-muted` | `#6b7280` | Labels, captions, secondary info |
| `accent` | `#2563eb` | Links, active states, interactive elements |
| `accent-light` | `#eff6ff` | Active filter backgrounds |
| `green` | `#059669` | Win rates above 52% |
| `green-bg` | `#ecfdf5` | Win rate pill background (high) |
| `yellow` | `#d97706` | Win rates between 48-52% |
| `red` | `#dc2626` | Win rates below 48% |
| `red-bg` | `#fef2f2` | Win rate pill background (low) |

### Typography

- **Font family:** Inter, with system-ui fallback
- **Headings:** 700 weight, -0.03em letter-spacing
- **Body:** 400-500 weight, 0.875rem (14px) base size
- **Labels/captions:** 500-600 weight, 0.75rem (12px), uppercase with 0.05em letter-spacing
- **Numbers in tables:** tabular-nums font-feature for alignment

### Spacing and Rounding

- Card border-radius: 10-12px
- Button/filter border-radius: 8px
- Pill badges: 9999px (fully rounded)
- Container max-width: 1200px, centered with 2rem padding
- Card padding: 1rem to 1.25rem
- Table cell padding: 0.5625rem to 0.75rem

### Shadows

- `shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)` — filters, stat cards
- `shadow`: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` — table wrapper
- `shadow-md`: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` — hover states

## Components

### Navigation Bar

Sticky top bar with white background, 56px height, 1px bottom border, `shadow-sm`. Contains brand name on the left ("Nexus" in accent color + "Stats" in text color) and navigation links on the right. Active link uses accent color and 600 weight.

### Filter Buttons

Horizontal row of toggle buttons for game mode, plus a dropdown for MMR tier. Each button is a white surface with border, `shadow-sm`, 0.8125rem text, 500 weight. Active state: `accent-light` background, accent border, accent text color, 600 weight.

### Stat Cards

Row of 4 cards in a CSS grid. Each card: white surface, 1px border, 10px radius, `shadow-sm`. Contains an uppercase muted label (0.75rem) and a large bold value (1.5rem, 700 weight).

### Data Table

White surface wrapper with 12px radius, 1px border, `shadow`. Thead has `bg` background color. Column headers are uppercase, muted, 0.75rem, sortable (pointer cursor, hover darkens text, sorted column uses accent color). Rows have 1px bottom borders, hover highlights with `surface-hover`. Last row has no bottom border.

### Win Rate Pill Badge

Inline-flex element with 9999px radius, 0.8125rem text, 600 weight. Background and text color determined by threshold: green-bg/green (>52%), yellow-bg/yellow (48-52%), red-bg/red (<48%).

### Mini Bar

60px wide, 6px tall, `bg` background with 3px radius. Fill uses accent color at 60% opacity for pick rate, green for win rate.

### Talent Cards

Flex row of cards, one per talent choice in a tier. White surface, 1px border, 10px radius, `shadow-sm`. On hover: accent border, `shadow-md`. Best talent (highest win rate): green border, green-bg gradient background. Contains talent icon (32px square, 6px radius), talent name (0.8125rem, 600 weight), and stats row (win rate, popularity, games played in 0.75rem muted text with bold values).

### Build Rows

White surface, 1px border, 10px radius, `shadow-sm`. Contains rank number, row of 7 talent icons (32px squares), and right-aligned win rate + game count. On hover: accent border, `shadow-md`.

## Responsive Behavior

Desktop-first layout. On screens below 768px, the data table scrolls horizontally within its container. Stat cards collapse to a 2x2 grid. Talent cards stack vertically. Filter buttons wrap to multiple lines.

## Acceptance Criteria

- All color tokens are defined as CSS custom properties on `:root`
- Win rate color coding consistently uses the >52% / 48-52% / <48% thresholds across all views
- Interactive elements (buttons, table headers, cards) have visible hover states
- Table numbers use tabular-nums for column alignment
- The layout is usable on viewport widths down to 375px
