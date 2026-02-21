## Build & Run

- Runtime & package manager: **Bun**
- Frontend framework: **TanStack Router** + **TanStack Query**
- Install dependencies: `bun install`
- Dev server: `bun run dev`
- Build: `bun run build`

## Validation

Run these after implementing to get immediate feedback:

- Tests: `bun test`
- Typecheck: `bun run typecheck`
- Lint (Biome): `bun run lint`
- Format (Biome): `bun run format`

## Operational Notes

### Codebase Patterns

- Use Bun APIs where applicable (Bun.serve, Bun.file, etc.)
- Use TanStack Router for routing and TanStack Query for data fetching/caching
- Linting and formatting via **Biome** (`biome.json` config)