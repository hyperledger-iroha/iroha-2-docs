# Keys for Network Deployment

Every network needs distinct key material for clients, peers, genesis signing,
and, for NPoS or Nexus profiles, BLS validator identities.

## Where Keys Are Used

- Client signing keys are stored in `client.toml` under `[account]`.
- Peer identity keys are stored in each peer `config.toml` as `public_key` and
  `private_key`.
- Peer discovery uses each peer's public key in `trusted_peers`.
- BLS validator Proofs-of-Possession are stored in `trusted_peers_pop` for NPoS
  profiles.
- Genesis signing uses the `[genesis].public_key` in peer config and the
  matching private key when signing the manifest.

For local or test deployments, let Kagami generate all of these files together:

```bash
cargo run --bin kagami -- localnet --build-line iroha3 --peers 4 --out-dir ./localnet
```

For an existing network or profile, use the guided flow:

```bash
cargo run --bin kagami -- wizard --profile nexus
```

## Generate Individual Key Pairs

Use `kagami keys` for standalone key material:

```bash
cargo run --bin kagami -- keys --algorithm ed25519 --json
```

For BLS validator material, include a Proof-of-Possession:

```bash
cargo run --bin kagami -- keys --algorithm bls_normal --pop --json
```

Use `--seed` only for reproducible development fixtures. For production
deployment, generate fresh keys and store private keys outside the repository.

## Peer Consistency

All validators must agree on the same genesis transaction, topology, trusted
peer public keys, and validator PoPs. A single missing or mismatched peer key can
prevent the network from starting or reaching consensus.

For a minimum Byzantine-fault-tolerant deployment, use at least four peers. Each
peer must have its own private key, but every peer configuration needs the same
trusted peer set.

## Client Accounts

The client account in `client.toml` must already exist on-chain. It can be
registered by the genesis manifest or by a later transaction. Avoid using the
genesis signing identity as a long-lived application account; genesis privileges
only apply during the genesis round, and production clients should use their own
accounts and roles.
