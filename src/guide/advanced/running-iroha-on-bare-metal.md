# Running Iroha on Bare Metal

Use this workflow when you want to run peers directly on hosts instead of
through Docker Compose. The current source tree provides Kagami generators that
write matching genesis, peer configs, client config, and start/stop scripts.

## 1. Build the Binaries

From the upstream Iroha workspace:

```bash
cargo build --release -p irohad -p iroha_cli -p iroha_kagami
```

This produces:

- `target/release/irohad` for the peer daemon
- `target/release/iroha` for the CLI
- `target/release/kagami` for key, genesis, and localnet generation

The same workspace also builds `iroha2`/`iroha2d` and `iroha3`/`iroha3d`
aliases when scripts need to make the selected track explicit.

## 2. Generate a Local Network

Generate a four-peer Iroha 3 localnet:

```bash
target/release/kagami localnet --build-line iroha3 --peers 4 --out-dir ./localnet
```

For an Iroha 2-style localnet, set the build line explicitly:

```bash
target/release/kagami localnet --build-line iroha2 --peers 4 --out-dir ./localnet-iroha2
```

The output directory contains the generated `genesis.json`,
`genesis.signed.nrt`, peer `config.toml` files, `client.toml`, helper scripts,
and a generated `README.md` with exact commands for that bundle.

## 3. Start Peers

For a generated disposable localnet, use the generated script:

```bash
./localnet/start.sh
```

If you need to wire each peer into a process manager such as systemd, use the
launch command recorded in `./localnet/README.md` for each peer. Keep each
peer's `config.toml`, private key, storage directory, and ports separate.

## 4. Operate the Network

Use the generated client config:

```bash
target/release/iroha --config ./localnet/client.toml ledger domain list all
target/release/iroha --config ./localnet/client.toml --output-format text ops sumeragi status
```

Stop the generated localnet with:

```bash
./localnet/stop.sh
```

## 5. Production Notes

- Generate fresh private keys for production and store them outside the
  repository.
- Make every peer agree on the same signed genesis transaction, topology,
  trusted peers, and validator PoPs.
- Bind listener addresses to host-local interfaces only when the peer should
  not be reachable from other machines.
- Use a reverse proxy or firewall for Torii exposure, basic auth, TLS, and rate
  limiting.
- Treat changes to genesis or consensus topology as coordinated migrations, not
  single-peer file edits.

For containerized local development, use the [Launch Iroha 3](../../get-started/launch-iroha-2.md)
Docker Compose workflow.
