# Agent Handbook

## Purpose
- This repo hosts the VitePress-powered documentation for Hyperledger Iroha 2.
- Page sources live under `src/`; shared utilities and scripts live in `etc/`.
- The site pulls code snippets via the custom CLI (`pnpm get-snippets`) and may call an external compatibility matrix service.

## Environment
- Use Node.js 18+ and pnpm 9 (enforced by `packageManager` entry).
- After cloning, run `pnpm install` (postinstall will fetch snippets automatically).
- Provide these optional env vars when needed:
  - `VITE_COMPAT_MATRIX_URL` – URL of the compatibility matrix service (required for matrix pages to load).
  - `VITE_FEEDBACK_URL` – enables the “Share feedback” button.

## Key Commands
- `pnpm dev` – start local VitePress dev server.
- `pnpm build` – generate static site output.
- `pnpm serve` – preview built site.
- `pnpm get-snippets` – refresh embedded code samples from source repos.
- `pnpm cli --help` – inspect additional CLI utilities in `etc/cli`.

## Quality Gates
- `pnpm format:fix` / `pnpm format:check` – Prettier + ESLint formatting.
- `pnpm lint` – eslint rules for TS/Vue sources.
- `pnpm typecheck` – TypeScript no-emit validation.
- `pnpm test` – Vitest suite (unit tests for CLI helpers and link validators).

## Project Layout Highlights
- `src/index.md` – landing page entry point; other directories mirror published doc sections.
- `src/example_code/` – language-specific code embedded into tutorials.
- `etc/` – snippet tooling, schema definitions, link validators.
- `uno.config.ts`, `vitest.config.ts`, `tsconfig.json` – UnoCSS, Vitest, and TS setup used by tooling and IDEs.

## Workflow Tips
- Maintain deterministic snippet output: update snippet source repos before running `pnpm get-snippets`.
- For content edits, build locally (`pnpm dev` or `pnpm build`) to verify navigation and layout.
- Keep new articles within `src/<section>/`; add them to VitePress sidebar config if navigation needs updates.
- When changing CLI utilities, extend tests in `etc/*.spec.ts` and run `pnpm test`.
