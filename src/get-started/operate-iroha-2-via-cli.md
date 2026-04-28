# Operate Iroha 3 via CLI

The `iroha` binary is the shared CLI for the current Iroha 2 and Iroha 3
codebase. The same source tree also exposes `iroha2` and `iroha3` aliases for
track-specific scripting, while `iroha` remains the stable command used in
these examples.

## 1. Prerequisites

Start a local network first:

- [Launch Iroha 3](./launch-iroha-2.md)

The examples below assume the default client configuration from the upstream
repository:

```bash
./defaults/client.toml
```

## 2. Basic CLI Setup

Show the top-level help:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml --help
```

The CLI is organized into these top-level command groups:

- `account` for account-oriented shortcuts
- `tx` / `transaction` for transaction-level helpers
- `ledger` for on-ledger reads and writes
- `ops` for operator diagnostics
- `app` for app API helpers
- `contract` / `contracts` for contract deployment and calls
- `tools` for diagnostics and developer utilities
- `taira` for Taira and Nexus-oriented workflows

Use `--output-format text` for human-readable operator output and `--machine`
for strict automation mode.

## 3. Basic Ledger Commands

List all domains:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain list all
```

Register a domain. Current Iroha IDs are dataspace-qualified, so use a domain
such as `docs.universal` rather than a bare `docs` literal:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain register --id docs.universal
```

Send a simple ping transaction:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger transaction ping --msg "hello from iroha"
```

Read a recent block or subscribe to block events:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger blocks 1 --timeout 30s
cargo run --bin iroha -- --config ./defaults/client.toml ledger events block
```

## 4. Operator Commands

Consensus status:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml --output-format text ops sumeragi status
```

Per-phase latency snapshot:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml --output-format text ops sumeragi phases
```

RBC throughput and active sessions:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml --output-format text ops sumeragi rbc status
cargo run --bin iroha -- --config ./defaults/client.toml --output-format text ops sumeragi rbc sessions
```

Collector plan and on-chain consensus parameters:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ops sumeragi collectors
cargo run --bin iroha -- --config ./defaults/client.toml ops sumeragi params
```

## 5. Where to Go Next

- [SDK tutorials](/guide/tutorials/)
- [Torii endpoints](/reference/torii-endpoints.md)
- [Working with Iroha binaries](/reference/binaries.md)
- [CLI README](https://github.com/hyperledger-iroha/iroha/blob/main/crates/iroha_cli/README.md)

To regenerate a full Markdown help snapshot from the source checkout, run:

```bash
cargo run -p iroha_cli --bin iroha -- tools markdown-help > crates/iroha_cli/CommandLineHelp.md
```
