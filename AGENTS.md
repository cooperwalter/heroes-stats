## Build & Run

- Runtime & package manager: **Bun**
- Frontend framework: **TanStack Start** (includes TanStack Router)
- Build tool: **Vite**
- Install dependencies: `bun install`
- Dev server: `bun run dev` (runs `vite dev`)
- Build: `bun run build` (runs `vite build`)

## Validation

Run these after implementing to get immediate feedback:

- Tests: `bun run test` (runs `vitest run`)
- Typecheck: `bun run typecheck` (runs `tsc --noEmit`)
- Lint (Biome): `bun run lint` (runs `biome check .`)
- Format (Biome): `bun run format` (runs `biome format --write .`)
- Auto-fix all lint+format: `bunx @biomejs/biome check --write .`

## Operational Notes

### Codebase Patterns

- TanStack Start server functions (`createServerFn`) for server-side data fetching/caching
- Route loaders for page data loading
- CSS custom properties for design system (no Tailwind, no CSS-in-JS)
- In-memory Map cache for API responses
- Linting and formatting via **Biome** (`biome.json` config)