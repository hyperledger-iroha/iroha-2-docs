# Working with Iroha Binaries

The current Iroha 2 and Iroha 3 operator workflow revolves around three
primary binaries:

- [`irohad`](https://github.com/hyperledger-iroha/iroha/tree/i23-features/crates/irohad) for running a peer daemon
- [`iroha`](https://github.com/hyperledger-iroha/iroha/tree/i23-features/crates/iroha_cli) for CLI and operator commands
- [`kagami`](https://github.com/hyperledger-iroha/iroha/tree/i23-features/crates/iroha_kagami) for keys, genesis, localnets, and profiles

The source tree also exposes track-specific aliases:

- `iroha2` and `iroha3` for CLI flows
- `iroha2d` and `iroha3d` for daemon startup

Use those aliases when scripts need to make the selected build line explicit.
Use `iroha` and `irohad` for general examples and shared automation.

## Build from Source

From the upstream workspace root:

```bash
cargo build --release -p irohad -p iroha_cli -p iroha_kagami
```

The release binaries are then available in `target/release/`.

To inspect the command surface:

```bash
./target/release/irohad --help
./target/release/iroha --help
./target/release/kagami --help
./target/release/iroha3 --help
./target/release/iroha3d --help
```

## Run Directly from the Repository

If you do not want to install anything globally, use `cargo run`:

```bash
cargo run --bin irohad -- --help
cargo run --bin iroha -- --help
cargo run --bin kagami -- --help
cargo run --bin iroha3 -- --help
cargo run --bin iroha3d -- --help
```

## Docker Image

The upstream workspace uses `kagami localnet` and `kagami docker` to generate
Docker Compose files that match the checked-out code. The `hyperledger/iroha:dev`
image can be used with those generated files.

Run the CLI in a container:

```bash
docker run -t hyperledger/iroha:dev iroha --help
```

Run Kagami in a container:

```bash
docker run -t hyperledger/iroha:dev kagami --help
```

For peer startup, generate a localnet and Compose file first:

```bash
cargo run --bin kagami -- localnet --build-line iroha3 --peers 4 --out-dir ./localnet
cargo run --bin kagami -- docker --peers 4 --config-dir ./localnet --image hyperledger/iroha:dev --out-file ./localnet/docker-compose.yml --force
docker compose -f ./localnet/docker-compose.yml up
```

## Which Binary Should I Use?

- Use `irohad` when you are starting or operating peers.
- Use `iroha` when you need to query the ledger, submit transactions, or inspect operator endpoints.
- Use `kagami` when you need keys, genesis manifests, profile bundles, or localnet assets.
- Use `iroha2`/`iroha2d` or `iroha3`/`iroha3d` when a script must pin the Iroha track.
