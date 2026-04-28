# Hyperledger Iroha 3 Documentation

This repository contains the VitePress source for the public Hyperledger Iroha
documentation site, updated for the Iroha 3 / SORA Nexus track.

The implementation source of truth lives in the main
[hyperledger-iroha/iroha](https://github.com/hyperledger-iroha/iroha/)
repository. In this workspace the sibling `../iroha` checkout is used as the
authoritative reference for binaries, configs, CLI help, genesis layout, and
SDK surfaces.

The site focuses on:

- Iroha 3 quickstart and local network launch
- CLI and operator workflows
- Rust, Python, JavaScript, Android, and Swift SDK entry points
- Torii, genesis, and binary reference material

## Development

Requirements:

- Node.js 18+
- pnpm 9

Install dependencies:

```bash
corepack enable
pnpm install
```

Run the docs locally:

```bash
pnpm dev
```

Build the static site:

```bash
pnpm build
```

Preview the built output:

```bash
pnpm serve
```

## Quality Gates

Format:

```bash
pnpm format:fix
pnpm format:check
```

Lint and typecheck:

```bash
pnpm lint
pnpm typecheck
```

Run tests:

```bash
pnpm test
```

Refresh embedded snippets:

```bash
pnpm get-snippets
```

## Optional Environment Variables

Enable the feedback modal submission target:

```bash
VITE_FEEDBACK_URL=https://example.com/get-feedback
```

Enable the compatibility matrix page:

```bash
VITE_COMPAT_MATRIX_URL=https://example.com/compat-matrix
```

The compatibility matrix uses the bundled
`src/public/compat-matrix.json` snapshot by default. That snapshot is generated
from the local sibling `../iroha` checkout and should be refreshed when SDK
coverage changes there.

Set `VITE_COMPAT_MATRIX_URL` only when you want to override the bundled
snapshot with a live endpoint. The endpoint must return the compatibility
matrix JSON expected by the docs site. The original service implementation
lives in
[`soramitsu/iroha2-docs-compat-matrix-service`](https://github.com/soramitsu/iroha2-docs-compat-matrix-service).

## License

Iroha documentation files are available under the Creative Commons Attribution
4.0 International License (CC-BY-4.0):
http://creativecommons.org/licenses/by/4.0/
