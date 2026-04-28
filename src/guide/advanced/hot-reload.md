# Hot Reload Iroha in a Docker Container

Use hot reload only for local debugging. For normal local development, prefer
rebuilding the image or restarting the generated Docker Compose stack from a
fresh Kagami bundle.

## Replace the Peer Binary

Build a Linux-compatible daemon binary from the upstream workspace:

```bash
cargo build --release -p irohad --target x86_64-unknown-linux-musl
```

Copy it into a running peer container, then restart that container:

```bash
docker cp target/x86_64-unknown-linux-musl/release/irohad <container>:/usr/local/bin/irohad
docker restart <container>
```

Use `docker ps` to confirm the container name. In the generated stack the peer
containers are defined by `./localnet/docker-compose.yml`.

## Recommit Genesis in a Disposable Network

A peer commits genesis only when its storage is empty. For a disposable Docker
network, stop the stack, remove generated state, regenerate or replace the
signed genesis bundle, and start again:

```bash
docker compose -f ./localnet/docker-compose.yml down
cargo run --bin kagami -- localnet --build-line iroha3 --peers 4 --out-dir ./localnet
cargo run --bin kagami -- docker --peers 4 --config-dir ./localnet --image hyperledger/iroha:dev --out-file ./localnet/docker-compose.yml --force
docker compose -f ./localnet/docker-compose.yml up
```

Do not replace genesis on a network whose state must be preserved.

## Use Custom Configuration

Current peer configuration is TOML. Bind mount or copy the generated
`config.toml`, `genesis.signed.nrt`, and related key files into the container
paths expected by the image, then restart the peer. Keep the generated files
together; mixing files from different Kagami runs can produce deserialization or
consensus failures.
