# template-nextjs-biome

Next.js (App Router) + TypeScript template with Biome, Lefthook, and mise.

## Stack

- **Next.js 16** — App Router, TypeScript, no Tailwind, CSS Modules
- **Biome** — lint + format (replaces ESLint / Prettier)
- **Lefthook** — git hooks (pre-commit: Biome, pre-push: typecheck)
- **Storybook 10** — `@storybook/nextjs-vite` framework, addons: a11y, docs
- **mise** — Node / pnpm version management
- **pnpm** — package manager

## Requirements

- [mise](https://mise.jdx.dev/) installed
- Git

## Getting Started

```bash
# Install Node / pnpm pinned in mise.toml
mise install

# Install dependencies (also installs git hooks via the `prepare` script)
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start the Next.js dev server             |
| `pnpm build`        | Production build                         |
| `pnpm start`        | Start the production server              |
| `pnpm lint`         | Run Biome lint                           |
| `pnpm format`       | Run Biome formatter (writes changes)     |
| `pnpm check`        | Run Biome lint + format check            |
| `pnpm check:write`  | Run Biome lint + format with auto-fix    |
| `pnpm typecheck`    | Run `tsc --noEmit`                       |
| `pnpm storybook`    | Start Storybook (http://localhost:6006)  |
| `pnpm build-storybook` | Build static Storybook                |

## Git hooks (Lefthook)

- **pre-commit** — `biome check --write` on staged files (auto-fix + re-stage)
- **pre-push** — `pnpm typecheck`

Hooks are installed automatically on `pnpm install` via the `prepare` script.

## Conventions

- **No `@/` path alias.** Use relative imports.
- **Source under `src/`.**
