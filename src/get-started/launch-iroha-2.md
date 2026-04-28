# Launch Iroha 3

This page walks through the current local-network flow for Iroha 3 using the
default workspace assets from the upstream repository.

## 1. Local Multi-Peer Network with Docker

The simplest way to start a network is the provided four-peer compose file:

```bash
docker compose -f defaults/docker-compose.yml up
```

The default stack exposes:

- peer P2P ports `1337` to `1340`
- Torii HTTP ports `8080` to `8083`
- a ready-made client config at `defaults/client.toml`

The compose file signs the bundled genesis manifest with `kagami` before
starting the first peer, so you do not need to prepare a signed genesis block
manually for the default smoke test.

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
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain list all
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

```bash
docker compose -f defaults/docker-compose.yml down
```

After the network is running, continue with
[Operate Iroha 3 via CLI](/get-started/operate-iroha-2-via-cli.md).
