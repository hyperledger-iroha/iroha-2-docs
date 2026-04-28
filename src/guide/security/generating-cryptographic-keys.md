# Generating Cryptographic Keys

Use `kagami keys` to generate client, peer, and validator key material for the
current Iroha 2 and Iroha 3 codebase.

## Basic Usage

From the Iroha source checkout:

```bash
cargo run --bin kagami -- keys --algorithm ed25519
```

JSON output is usually easiest to copy into TOML or automation:

```bash
cargo run --bin kagami -- keys --algorithm ed25519 --json
```

The command prints a public key and an exposed private key. Treat the private
key as secret material; do not commit generated production keys.

## Algorithms

Common algorithms are:

- `ed25519` for client accounts, streaming identities, and most development
  networks.
- `secp256k1` when you need a secp256k1 account identity.
- `bls_normal` for validator consensus keys when the build enables BLS support.

Check the exact algorithms supported by your build with:

```bash
cargo run --bin kagami -- keys --help
```

## Deterministic Development Keys

For reproducible fixtures, pass a seed:

```bash
cargo run --bin kagami -- keys --algorithm ed25519 --seed "dev-alice" --json
```

Seeds are private-key material. Use them only for local development and tests.

## BLS Proofs-of-Possession

NPoS and Nexus validator profiles require BLS validator keys and PoPs:

```bash
cargo run --bin kagami -- keys --algorithm bls_normal --pop --json
```

The JSON includes `pop_hex` when `--pop` is used. Use that value with the
generated topology or `trusted_peers_pop` entries required by the profile.

## Output Formats

Use the default output for terminal inspection, `--json` for automation, and
`--compact` when another script needs plain line-oriented values:

```bash
cargo run --bin kagami -- keys --algorithm ed25519 --compact
```

For full generated Kagami help:

```bash
cargo run -p iroha_kagami -- advanced markdown-help > crates/iroha_kagami/CommandLineHelp.md
```
