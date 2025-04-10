# Working with Iroha Binaries

Working with Iroha involves several different binaries (e.g., `iroha`). This is a reference of available binaries, and the methods of their installation.

Iroha 2 provides the following binary executables:

- [`irohad`](https://github.com/hyperledger-iroha/iroha/tree/main/crates/irohad) — the main Iroha CLI that is used to start a peer daemon.
- [`iroha`](https://github.com/hyperledger-iroha/iroha/tree/main/crates/iroha) — Iroha Client CLI that is used to interact with an Iroha peer.
- [`kagami`](https://github.com/hyperledger-iroha/iroha/tree/main/crates/iroha_kagami) — a tool that is used to generate and validate various types of data (e.g., cryptographic keys, genesis blocks, default client and peer configuration files).
  
  > See also:
  > - [Generating Cryptographic Keys](../guide/security/generating-cryptographic-keys.md) — instructions on how to generate cryptographic keys with `kagami`.
  > - [Configure Iroha > Genesis Block: Generation](../guide/configure/genesis.md#generation) — instructions on how to generate a default genesis block with `kagami`.
  > - [Configure Iroha > Client Configuration: Generation](../guide/configure/client-configuration.md#generation) — instructions on how to generate a default client configuration file with `kagami`.

There are two main ways to work with Iroha 2 binaries:

- [Using the source GitHub repository](#source):
   - [Installing from the GitHub source repository](#source-install).
   - [Running from a cloned GitHub repository](#source-run).
- [Using the pre-built Docker images](#docker-install).


## Using the Source GitHub Repository {#source}

To perform any of the actions using the GitHub repository (i.e., [building & installing](#source-install), or [running](#source-run) binaries), first install the [Rust toolchain](https://www.rust-lang.org/tools/install).

### Installing from the GitHub Source Repository {#source-install}

You can install Iroha 2 binaries system-wide with the Rust `cargo` tool:

::: code-group

```shell [irohad]
cargo install --git https://github.com/hyperledger-iroha/iroha.git irohad --locked
irohad --help
```
```shell [iroha]
cargo install --git https://github.com/hyperledger-iroha/iroha.git iroha_cli --locked
iroha --help
```

```shell [kagami]
cargo install --git https://github.com/hyperledger-iroha/iroha.git iroha_kagami --locked
kagami --help
```
:::

::: tip
For more details on `cargo install` and its `[options]`, see [The Cargo Book > cargo-install(1)](https://doc.rust-lang.org/cargo/commands/cargo-install.html).
:::

### Running from a Cloned GitHub Repository {#source-run}

You may want to run the binaries without installing them system-wide. This will involve cloning Iroha's source code and using `cargo run`.

First, clone the [hyperledger-iroha/iroha](https://github.com/hyperledger-iroha/iroha.git) GitHub repository:
```shell
git clone https://github.com/hyperledger-iroha/iroha.git <clone-folder>
cd <clone-folder>
```

To run an Iroha 2 binary with `cargo install`, execute one of the following commands in your terminal:

::: code-group

```shell [irohad]
cargo run --release --bin irohad -- --help
```

```shell [iroha]
cargo run --release --bin iroha -- --help
```

```shell [kagami]
cargo run --release --bin kagami -- --help
```

:::

::: tip

For more details on `cargo run` and its `[options]`, see [The Cargo Book > cargo-run(1)](https://doc.rust-lang.org/cargo/commands/cargo-run.html).

:::

## Using the Pre-Built Docker Images {#docker-install}

First, install [Docker](https://docs.docker.com/get-docker/).

Then, to install a binary from a pre-built Docker image, execute one of the following commands:

::: code-group

```shell [iroha]
docker run -t hyperledger/iroha:dev iroha
```

```shell [kagami]
docker run -t hyperledger/iroha:dev kagami
```

:::

For most tasks `iroha` binary requires: 
- a config file that needs to be mapped to the container 
- access to the host machine's network connection

Below is an example of how to launch `iroha` with a your custom config and network access.

```shell
docker run --network host -v /path/to/host/config:/config -t hyperledger/iroha:dev iroha --config /config/custom-client-config.toml
```

where:

`custom-client-config.toml` - is the name of your customs config file

`/path/to/host/config` - is the location of your custom config on your host machine


::: tip

`irohad` should be started using `docker compose`. Please refer to the sample configuration in the [Iroha 2 repository](https://github.com/hyperledger-iroha/iroha/blob/main/defaults/docker-compose.yml).

:::
