# Install Iroha 3

This page covers the current installation workflow for the Iroha 3 toolchain
and binaries using the upstream `hyperledger-iroha/iroha` workspace.

## 1. Prerequisites

Install these first:

- [Rust stable](https://www.rust-lang.org/tools/install)
- `git`
- optionally, Docker and Docker Compose for the local multi-peer quickstart

## 2. Clone the Workspace

```bash
git clone https://github.com/hyperledger-iroha/iroha.git
cd iroha
```

## 3. Build the Workspace

Build everything:

```bash
cargo build --workspace
```

For a smaller operator-focused build, compile just the main binaries:

```bash
cargo build --release -p irohad -p iroha_cli -p iroha_kagami
```

The resulting binaries are written to `target/debug/` or `target/release/`.

## 4. Verify the Installed Tools

```bash
cargo run --bin irohad -- --help
cargo run --bin iroha -- --help
cargo run --bin kagami -- --help
```

The three binaries you will usually use are:

- `irohad` for the peer daemon
- `iroha` for CLI access to Torii and operator endpoints
- `kagami` for keys, genesis manifests, and localnet profiles

## 5. Optional Docker Path

The upstream repository ships a ready-to-run compose stack and sample configs:

- `defaults/docker-compose.yml`
- `defaults/client.toml`
- `defaults/nexus/config.toml`
- `defaults/nexus/genesis.json`

If you prefer the containerized quickstart, continue with
[Launch Iroha 3](/get-started/launch-iroha-2.md).
