# Genesis Reference

In the current Iroha 3 workflow, a `genesis.json` manifest describes the first
transactions and parameters that will be applied when the network starts.

The signed artifact distributed to peers is a Norito-encoded `.nrt` file
produced by `kagami genesis sign`.

## Main Fields

A genesis manifest can define:

- `chain` for the chain identifier
- `executor` for an optional executor upgrade bytecode path
- `ivm_dir` for IVM libraries used by triggers and upgrades
- `consensus_mode` for the initial mode advertised by the manifest
- `transactions` for ordered parameter updates, instructions, triggers, and topology
- `crypto` for the initial crypto snapshot

Within `transactions`, topology entries pair peer ids and PoPs together:

```json
{
  "peer": "ea0130...",
  "pop_hex": "0xabcd..."
}
```

## Generate a Manifest

Use Kagami to generate a template:

```bash
cargo run -p iroha_kagami -- genesis generate \
  --consensus-mode npos \
  --ivm-dir defaults \
  --genesis-public-key <PUBLIC_KEY> > genesis.json
```

For the public SORA Nexus dataspace, `npos` is the expected consensus mode.
Other Iroha 3 deployments may use permissioned or NPoS depending on the target
profile.

## Sign the Manifest

After editing and validating the JSON, sign it into a deployable `.nrt` block:

```bash
cargo run -p iroha_kagami -- genesis sign genesis.json \
  --private-key <PRIVATE_KEY> \
  --out-file genesis.signed.nrt
```

`kagami genesis sign` reads the genesis public key from the manifest and uses
the supplied private key, seed, and algorithm to produce the deployable signed
block. The result is the file that peers should reference from their config.

## Configure `irohad`

Point the daemon at the signed genesis block:

```toml
[genesis]
file = "genesis.signed.nrt"
public_key = "<PUBLIC_KEY>"
```

## Related Tools

- `kagami genesis validate`
- `kagami genesis normalize`
- `kagami genesis embed-pop`
- `kagami localnet`
- `cargo xtask kagami-profiles`

For the full upstream details, see:

- [docs/genesis.md](https://github.com/hyperledger-iroha/iroha/blob/main/docs/genesis.md)
- [crates/iroha_kagami/README.md](https://github.com/hyperledger-iroha/iroha/blob/main/crates/iroha_kagami/README.md)
