# Contributing to Hyperledger Iroha Documentation

Thank you for helping improve the Hyperledger Iroha documentation. This
repository contains the VitePress source for the public documentation site.

Use this guide for documentation changes, site changes, and repository tooling
changes. For implementation details, verify behavior against the
[Hyperledger Iroha `i23-features` branch](https://github.com/hyperledger-iroha/iroha/tree/i23-features).

## Before You Start

- Search the existing
  [issues](https://github.com/hyperledger-iroha/iroha-2-docs/issues) and pull
  requests before opening a new one.
- Open an issue for substantial documentation changes so maintainers can confirm
  the scope before you invest time.
- For questions about Iroha behavior, use the community channels listed in
  [Receive support](src/help/index.md).
- Keep changes focused. Separate content updates, tooling updates, and generated
  snippet changes when possible.

## Development Environment

Requirements:

- Node.js 18 or later
- pnpm 9

Enable Corepack and install dependencies:

```bash
corepack enable
pnpm install
```

The install step runs `pnpm get-snippets` after dependencies are installed.
Snippet tooling reads from a local checkout of the
[`hyperledger-iroha/iroha` `i23-features` branch](https://github.com/hyperledger-iroha/iroha/tree/i23-features).
Set `IROHA_SOURCE_DIR` when you need to point it at a specific checkout:

```bash
IROHA_SOURCE_DIR=/path/to/iroha pnpm get-snippets
```

Optional environment variables:

- `VITE_COMPAT_MATRIX_URL` is required for compatibility matrix pages to load.
- `VITE_FEEDBACK_URL` enables the "Share feedback" button.

## Local Workflow

Start the local VitePress development server:

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

Refresh embedded code samples:

```bash
pnpm get-snippets
```

Use `pnpm cli --help` to inspect additional documentation tooling.

## Writing Documentation

- Place new pages under the relevant `src/<section>/` directory.
- Add new pages to the VitePress sidebar configuration when they should appear
  in navigation.
- Prefer relative links for internal documentation links.
- Keep examples reproducible and command blocks copy-pasteable.
- Verify version-specific claims against the Iroha source repository or the
  generated snippets.
- Avoid duplicating long code samples directly in Markdown. Prefer snippets
  sourced from tested files.
- Follow the surrounding page style for headings, terminology, and admonitions.

## Working With Snippets

Snippet sources are configured in `etc/snippet-sources.ts` and written to
`src/snippets/`. See [Code Snippets](src/documenting/snippets.md) for the full
workflow.

When adding or changing snippets:

- Prefer source files that are built or tested in their owning repository.
- Use stable permalinks for remote sources.
- Keep transform logic small and deterministic.
- Run `pnpm get-snippets` after updating snippet sources.
- Review generated snippet diffs before opening a pull request.

## Quality Checks

Run the checks that match your change before opening a pull request:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm cli validate-links .vitepress/dist
```

Use `pnpm format:fix` to apply formatting fixes.

For Markdown-only changes, at minimum run `pnpm build` and the link validator
when practical. For changes under `etc/`, extend or update tests and run
`pnpm test`.

## Pull Requests

- Fork the repository or create a feature branch.
- Keep the pull request focused on one topic.
- Describe what changed and why.
- Link the issue the pull request resolves, for example `Closes #123`.
- Mention which checks you ran.
- Use `git commit -s` so commits include a DCO sign-off.
- Respond to review comments and let reviewers decide when conversations are
  resolved.

Maintainers are listed in [MAINTAINERS.md](MAINTAINERS.md), and code ownership
is configured in [.github/CODEOWNERS](.github/CODEOWNERS).

## License

By contributing, you agree that your contributions are provided under the
repository license. Documentation content is licensed under the Creative Commons
Attribution 4.0 International License; see [README.md](README.md) and
[LICENSE](LICENSE) for details.
