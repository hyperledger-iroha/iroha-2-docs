# Hyperledger Iroha 2 Tutorial

This repository contains the source files for [Hyperledger Iroha 2 Tutorial](https://hyperledger.github.io/iroha-2-docs/).

The tutorial is suitable for both experienced and novice users. It explains Iroha 2 concepts and features, and also offers language-specific step-by-step guides for these programming languages:

- [Bash](https://hyperledger.github.io/iroha-2-docs/guide/bash.html)
- [Python](https://hyperledger.github.io/iroha-2-docs/guide/python.html)
- [Rust](https://hyperledger.github.io/iroha-2-docs/guide/rust.html)
- [Kotlin/Java](https://hyperledger.github.io/iroha-2-docs/guide/kotlin-java.html)
- [Javascript (TypeScript)](https://hyperledger.github.io/iroha-2-docs/guide/javascript.html)

If you are already familiar with Hyperledger Iroha, we invite you to read about [how Iroha 2 is different](https://hyperledger.github.io/iroha-2-docs/guide/iroha-2.html) from its previous version.

Check the [Hyperledger Iroha 2](https://github.com/hyperledger/iroha/tree/iroha2-dev#hyperledger-iroha) repository for more detailed information about API and available features.

## Contribution

If you want to contribute to Iroha 2 tutorial, please clone the repository and follow the steps below.

### Prepare the environment

1. **Install Node.js v16.** To install it without a headache, use [NVM](https://github.com/nvm-sh/nvm#installing-and-updating) (Node Version Manager). You can run something like this:

   ```bash
   # Install NVM itself
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

   # Run it to use NVM in the current shell session or restart your shell
   export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
   ```

   Then you can install Node 16:

   ```bash
   nvm install 16
   ```

2. **Install PNPM**, a package manager used by this project. If you've installed Node.js, you can install PNPM with this command:

   ```bash
   npm i -g pnpm
   ```

3. **Install the packages for this project.** From the root of the cloned repository, run:

   ```bash
   pnpm i
   ```

### Run dev mode

```bash
pnpm dev
```

It will start a local dev-server. You will be able to open a browser, observe rendered documentation, edit source files and see your edits on-demand.

### Format documentation

We use [Prettier](https://prettier.io/) to format Markdown files. Its configuration is located at `./.prettierrc.js`. Check [options reference](https://prettier.io/docs/en/options.html) for all available options.

- **Format doc files**: apply `Prettier` formatting to all Markdown files

  ```bash
  pnpm format:docs:fix
  ```

- **Check the formatting in doc files**: ensure that all documentation files match `Prettier` code style

  ```bash
  pnpm format:docs:check
  ```

## License

Iroha documentation files are made available under the Creative Commons
Attribution 4.0 International License (CC-BY-4.0), available at
http://creativecommons.org/licenses/by/4.0/
