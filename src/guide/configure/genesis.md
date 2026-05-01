# Genesis

Genesis defines the initial chain state. In the current Iroha 2 and Iroha 3
codebase, the editable source is a JSON manifest and the node consumes a signed
Norito transaction file.

::: details Default genesis manifest

<<< @/snippets/genesis.json

:::

## Files

The upstream repository ships a default manifest at `defaults/genesis.json`.
Kagami-generated networks write their own manifest and signed transaction into
the output directory:

```bash
cargo run --bin kagami -- localnet --build-line iroha3 --peers 4 --out-dir ./localnet
```

The generated `README.md` in that directory records the exact files and launch
commands for the selected profile.

## Peer Configuration

Peers point at the signed genesis transaction in the `[genesis]` section of
`config.toml`:

```toml
[genesis]
file = "./genesis.signed.nrt"
public_key = "ed0120..."
```

All peers in the network must agree on the signed genesis transaction and the
genesis public key.

## Signing Genesis

If you edit a manifest manually, validate and sign it before starting peers:

```bash
cargo run --bin kagami -- genesis validate ./genesis.json
cargo run --bin kagami -- genesis sign ./genesis.json \
  --private-key "$GENESIS_PRIVATE_KEY_HEX" \
  --algorithm ed25519 \
  --out-file ./genesis.signed.nrt
```

For NPoS or Nexus profiles, include the topology and BLS Proofs-of-Possession
required by the generated profile. Kagami `localnet`, `wizard`, and profile
generation commands handle those details automatically.

## Recommitting Genesis

A peer only commits genesis when its storage is empty. To test a new genesis in
a disposable localnet, stop the peers, remove their generated state directory,
and start from the new signed genesis. Do not replace genesis on a running
network unless every validator is coordinating the same migration.
