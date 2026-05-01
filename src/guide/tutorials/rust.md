# Rust

The Rust implementation lives in the main workspace and remains the most direct
way to work with the Iroha 3 codebase.

## What You Get

The upstream repository currently exposes:

- the `iroha` Rust client crate
- the `iroha` CLI as the most complete reference client
- shared data model, crypto, and Norito crates used by the SDK layer

## Recommended Starting Point

For the current state of the project, start with the reference CLI and the
workspace itself:

```bash
git clone --branch i23-features https://github.com/hyperledger-iroha/iroha.git
cd iroha
cargo build --workspace
```

Run the reference client with the checked-in default client config:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain list all
```

## Try Taira Read-Only

From the same workspace checkout, try the public Taira diagnostics helper:

```bash
cargo run --bin iroha -- taira doctor \
  --public-root https://taira.sora.org \
  --json
```

For route-level checks, use Torii's JSON API directly:

```bash
curl -fsS https://taira.sora.org/status \
  | jq '{blocks, txs_approved, txs_rejected, queue_size, peers}'

curl -fsS 'https://taira.sora.org/v1/assets/definitions?limit=5' \
  | jq -r '.items[] | [.id, .name, .total_quantity] | @tsv'
```

After you create `taira.client.toml`, the same binary can run signed canary
commands against Taira. Keep those separate from ordinary unit tests because
they require a faucet-funded account and live testnet availability.

## Using the Rust Client Crate

For the current source state, depend on the `i23-features` branch directly:

```toml
[dependencies]
iroha = { git = "https://github.com/hyperledger-iroha/iroha.git", branch = "i23-features", package = "iroha" }
```

If you need the most complete examples of how the Rust surfaces are used in
practice, inspect:

- `crates/iroha_cli`
- `crates/iroha/README.md`
- `crates/iroha_cli/README.md`

You can regenerate a local CLI help snapshot with:

```bash
cargo run -p iroha_cli --bin iroha -- tools markdown-help > crates/iroha_cli/CommandLineHelp.md
```

## Notes

- The CLI currently provides better coverage than the standalone crate docs.
- The workspace targets `std`; IVM/no-std builds are not the default path.
- For operator-style flows, the CLI documentation is the most current source.
