# Hyperledger Iroha 2 Tutorial

This repository contains the source files for [Hyperledger Iroha 2 Documentation](https://docs.iroha.tech/).

The tutorial is suitable for both experienced and novice users. It explains Iroha 2 concepts and features, and also offers language-specific step-by-step guides for these programming languages:

- [CLI](https://docs.iroha.tech/get-started/operate-iroha-2-via-cli.html)
- [Python](https://docs.iroha.tech/guide/tutorials/python.html)
- [Rust](https://docs.iroha.tech/guide/tutorials/rust.html)
- [Kotlin/Java](https://docs.iroha.tech/guide/tutorials/kotlin-java.html)
- [Javascript (TypeScript)](https://docs.iroha.tech/guide/tutorials/javascript.html)

If you are already familiar with Hyperledger Iroha, we invite you to read about [how Iroha 2 is different](https://docs.iroha.tech/get-started/iroha-2.html) from its previous version.

Check the [Hyperledger Iroha](https://github.com/hyperledger-iroha/iroha/) repository for more detailed information about API and available features.

## Contribution

If you want to contribute to Iroha 2 tutorial, please clone the repository and follow the steps below.

### Prepare the environment

1. **Install Node.js v16.9+.** To install it without a headache, use [NVM](https://github.com/nvm-sh/nvm#installing-and-updating) (Node Version Manager). You can run something like this:

   ```bash
   # Install NVM itself
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

   # Run it to use NVM in the current shell session or restart your shell
   export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
   ```

   Then you can install Node 18:

   ```bash
   nvm install 18
   ```

2. **Enable [Corepack](https://github.com/nodejs/corepack)**:

   ```bash
   corepack enable
   ```

3. **Install project dependencies.** From the root of the cloned repository, run:

   ```bash
   pnpm install
   ```

### Run dev mode

```bash
pnpm dev
```

It will start a local dev-server. You will be able to open a browser, observe rendered documentation, edit source files and see your edits on-demand.

### Formatting

We use [Prettier](https://prettier.io/) to format project sources. Its configuration is located at `./.prettierrc.js`. Check [options reference](https://prettier.io/docs/en/options.html) for all available options.

- **Format sources**: apply formatting to all project source files:

  ```bash
  pnpm format:fix
  ```

- **Check the formatting in sources**: ensure that all project source files match `Prettier` code style

  ```bash
  pnpm format:check
  ```

> We use `prettier-eslint` tool to override Prettier formatting for Vue components.

### Linting

To check whether ESLint rules pass, run:

```bash
pnpm lint
```

To fix auto-fixable issues, run:

```bash
pnpm lint --fix
```

### Testing

We use [Vitest](https://vitest.dev/) test framework to assure quality of non-trivial internal parts of the project.

To check whether tests pass, run:

```bash
pnpm vitest run
```

To run vitest in a watch-mode, run:

```bash
pnpm vitest
```

### Enabling feedback form

In order to enable the "Share feedback" button, the following environment variable should be provided:

```bash
VITE_FEEDBACK_URL=https://example.com/get-feedback
```

When a user submits the form, a simple POST request with a JSON body is sent to this URL.

This variable will be picked up by the application during dev/build mode. Read more about it in the [Vite documentation](https://vitejs.dev/guide/env-and-mode.html).

### Compatibility matrix

**Note:** configuring this is **required**.

The SDK Compatibility Matrix provides an insightful look into the interoperability of various stories across multiple SDKs within Hyperledger Iroha 2. 

The underlying data for the matrix is sourced from a [backend service](https://github.com/soramitsu/iroha2-docs-compat-matrix-service), ensuring low-latency response with preprocessed data. To configure access to the service (e.g. deployed at `https://docs-compat.iroha2.tachi.soramitsu.co.jp`), set the following environment variable:

```
VITE_COMPAT_MATRIX_URL=https://docs-compat.iroha2.tachi.soramitsu.co.jp/compat-matrix
```

## License

Iroha documentation files are made available under the Creative Commons
Attribution 4.0 International License (CC-BY-4.0), available at
http://creativecommons.org/licenses/by/4.0/
