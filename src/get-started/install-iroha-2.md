# Install Iroha 2

This tutorial guides you through the steps to install Iroha 2 and its necessary binaries on your machine.

## 1. Prerequisites

To install Iroha 2, you need to set up the following first:
- [git](https://githowto.com/)
- [OpenSSL](https://www.openssl.org/)
- [Rust Toolchain](https://www.rust-lang.org/tools/install) (v1.60.0 or newer)

::: details TIP: How to Install OpenSSL

Note that in most Linux setups OpenSSL is already available to you.

- Install OpenSSL on Ubuntu:

  ```bash
  $ sudo apt-get install libssl-dev
  ```

- Install OpenSSL on macOS using [brew](https://brew.sh/):

  ```bash
  $ brew install openssl
  ```

Check the [OpenSSL installation guide](https://github.com/openssl/openssl/blob/master/INSTALL.md) for details.

:::


## 2. Clone Iroha from GitHub

1. Create a new directory for Iroha. In this tutorial we use `Git` as an example, but you can name it anything else:

   ```bash
   $ mkdir -p ~/Git
   ```

   ::: tip

   On macOS, if you get the `fatal: could not create work tree dir 'iroha': Read-only file system` error, that is because the home directory is not a real file system.

   To fix this, create a directory named `Git`.

   :::

2. Enter the directory that you created:

   ```bash
   $ cd ~/Git
   ```

3. Clone the [`iroha`](https://github.com/hyperledger-iroha/iroha) GitHub repository:

   ```bash
   $ git clone https://github.com/hyperledger-iroha/iroha.git
   ```

### 3. Install Iroha Binaries

To get started you need two of the binaries shipped with Iroha:

- `iroha`, the main command line tool for accessing the Iroha network as a user. It allows you to manage domains, accounts, and assets, and to query network status and events. To install `iroha` system-wide, use the following command:

```bash
$ cargo install --git https://github.com/hyperledger-iroha/iroha.git iroha_cli
```

- `kagami`, the tool that generates cryotpgraphic keys, configuration files and other necessary data. To install `kagami` system-wide, use the following command:

```bash
$ cargo install --git https://github.com/hyperledger-iroha/iroha.git iroha_kagami
```
