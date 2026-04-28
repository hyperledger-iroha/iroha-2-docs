# Launch Iroha 3

This page walks through the current local-network flow for Iroha 3 using the
default workspace assets from the upstream repository.

## 1. Generate a Local Multi-Peer Network

Generate a four-peer localnet from the current Kagami code:

```bash
cargo run --bin kagami -- localnet --build-line iroha3 --peers 4 --out-dir ./localnet
```

The output directory contains matching peer configs, `genesis.json`,
`genesis.signed.nrt`, `client.toml`, and helper scripts.

For a native local smoke test, start the generated peers directly:

```bash
./localnet/start.sh
```

For a containerized run, generate Compose from the same localnet directory:

```bash
cargo run --bin kagami -- docker \
  --peers 4 \
  --config-dir ./localnet \
  --image hyperledger/iroha:dev \
  --out-file ./localnet/docker-compose.yml \
  --force

docker compose -f ./localnet/docker-compose.yml up
```

The default generated stack exposes:

- peer P2P ports `1337` to `1340`
- Torii HTTP ports `8080` to `8083`
- a ready-made client config at `./localnet/client.toml`

## 2. Verify That the Network Is Up

Check the status endpoint on the first peer:

```bash
curl http://127.0.0.1:8080/status
```

The default health checks also use:

```bash
curl http://127.0.0.1:8080/status/blocks
```

You can immediately point the CLI at the bundled client config:

```bash
cargo run --bin iroha -- --config ./localnet/client.toml ledger domain list all
```

## 3. Nexus Profile

The repository also ships a SORA Nexus-oriented config profile under
`defaults/nexus/`.

To run a native peer with the Nexus profile:

```bash
./target/release/irohad --sora --config ./defaults/nexus/config.toml
```

Use `defaults/nexus/client.toml` for CLI access to that profile.

## 4. Stop the Local Network

For a native generated localnet:

```bash
./localnet/stop.sh
```

For the generated Compose stack:

```bash
docker compose -f ./localnet/docker-compose.yml down
```

After the network is running, continue with
[Operate Iroha 3 via CLI](/get-started/operate-iroha-2-via-cli.md).
