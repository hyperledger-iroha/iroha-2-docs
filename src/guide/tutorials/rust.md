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
git clone https://github.com/hyperledger-iroha/iroha.git
cd iroha
cargo build --workspace
```

Run the reference client against the default local network:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain list all
```

## Using the Rust Client Crate

When developing inside the monorepo, depend on the local crate directly:

```toml
[dependencies]
iroha = { path = "../iroha/crates/iroha" }
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
