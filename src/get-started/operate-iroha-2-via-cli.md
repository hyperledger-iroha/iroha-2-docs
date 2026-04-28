# Operate Iroha 3 via CLI

The `iroha` binary is the reference CLI for working with the current Torii,
ledger, and operator surfaces. This page covers the commands you are most
likely to use first.

## 1. Prerequisites

Start a local network first:

- [Launch Iroha 3](./launch-iroha-2.md)

The examples below assume the default client config from the upstream
repository:

```bash
./defaults/client.toml
```

## 2. Basic CLI Setup

Show the top-level help:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml --help
```

The CLI is organized into five main command groups:

- `ledger` for on-ledger reads and writes
- `ops` for operator diagnostics
- `offline` for offline allowance and transfer flows
- `app` for app API helpers
- `tools` for diagnostics and developer utilities

Use `--output-format text` for human-readable operator output and `--machine`
for strict automation mode.

## 3. Basic Ledger Commands

List all domains:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain list all
```

Register a domain:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain register --id docs
```

Send a simple ping transaction:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger transaction ping --msg "hello from iroha"
```

Subscribe to block events:

```bash
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
- [Full CLI help](https://github.com/hyperledger-iroha/iroha/blob/main/crates/iroha_cli/CommandLineHelp.md)
