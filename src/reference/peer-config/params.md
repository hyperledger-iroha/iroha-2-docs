---
outline: [ 2, 3 ]
---

# Configuration Parameters

[[toc]]

## Root-Level {#root}

### `chain_id` <Badge text="required" /> {#param-chain-id}

Chain ID that must be included in each transaction. Used to prevent replay attacks.

[//]: # (TODO: explain what replay attacks are)

- **Environment:** `CHAIN_ID`
- **Type:** String

::: code-group

```toml [Config File]
chain_id = "00000000-0000-0000-0000-000000000000"
```

```shell [Environment]
CHAIN_ID="00000000-0000-0000-0000-000000000000"
```

:::

### `public_key` <Badge text="required" /> {#param-public-key}

Public key of the peer.

- **Environment:** `PUBLIC_KEY`
- **Type:** String

::: code-group

```toml [Config File]
public_key = "ed0120FAFCB2B27444221717F6FCBF900D5BE95273B1B0904B08C736B32A19F16AC1F9"
```

```shell [Environment]
PUBLIC_KEY="ed0120FAFCB2B27444221717F6FCBF900D5BE95273B1B0904B08C736B32A19F16AC1F9"
```

:::

### `private_key` <Badge text="required" /> {#param-private-key}

Private key of the peer.

- **Environment:** `PRIVATE_KEY`
- **Type:** String

::: code-group

```toml [Config File]
private_key = "8026208F4C15E5D664DA3F13778801D23D4E89B76E94C1B94B389544168B6CB894F84F"
```

```shell [Environment]
PRIVATE_KEY="8026208F4C15E5D664DA3F13778801D23D4E89B76E94C1B94B389544168B6CB894F84F"
```

:::

### `trusted_peers`  {#param-trusted-peers}

List of predefined trusted peers.

- **Environment:** `TRUSTED_PEERS`
- **Type:** Array of strings in a format `PUBLIC_KEY@ADDRESS`

::: code-group

```toml [Config File]
trusted_peers = [
    "ed01201C61FAF8FE94E253B93114240394F79A607B7FA55F9E5A41EBEC74B88055768B@127.0.0.1:1337",
    "ed0120CC25624D62896D3A0BFD8940F928DC2ABF27CC57CEFEB442AA96D9081AAE58A1@127.0.0.1:1338",
    "ed0120FACA9E8AA83225CB4D16D67F27DD4F93FC30FFA11ADC1F5C88FD5495ECC91020@127.0.0.1:1339",
    "ed01208E351A70B6A603ED285D666B8D689B680865913BA03CE29FB7D13A166C4E7F1F@127.0.0.1:1340",
]
```

```shell [Environment]
# as JSON
TRUSTED_PEERS='["ed01204EE2FCD53E1730AF142D1E23951198678295047F9314B4006B0CB61850B1DB10@irohad2:1339","ed01209897952D14BDFAEA780087C38FF3EB800CB20B882748FC95A575ADB9CD2CB21D@irohad1:1338","ed0120CACF3A84B8DC8710CE9D6B968EE95EC7EE4C93C85858F026F3B4417F569592CE@irohad3:1340"]'
```

:::

## Genesis {#genesis}

### `genesis.file`  {#param-genesis-file}

File path[^paths] to the SCALE-encoded genesis block.

Must be paired with `--submit-genesis` CLI parameter.

- **Environment:** `GENESIS`
- **Type:** String, file path[^paths]

::: code-group

```toml [Config File]
[genesis]
file = "./genesis.scale"
```

```shell [Environment]
GENESIS="./genesis.scale"
```

:::

### `genesis.public_key` <Badge text="required" /> {#param-genesis-public-key}

Public key of the genesis key pair.

- **Environment:** `GENESIS_PUBLIC_KEY`
- **Type:** String, public key multihash

::: code-group

```toml [Config File]
[genesis]
public_key = "ed01208BA62848CF767D72E7F7F4B9D2D7BA07FEE33760F79ABE5597A51520E292A0CB"
```

```shell [Environment]
GENESIS_PUBLIC_KEY="ed01208BA62848CF767D72E7F7F4B9D2D7BA07FEE33760F79ABE5597A51520E292A0CB"
```

:::

## Network {#network}

### `network.address` <Badge text="required" /> {#param-network-address}

Address for p2p communication for consensus (sumeragi) and block synchronization (block_sync) purposes.

- **Environment:** `P2P_ADDRESS`
- **Type:** String, socket address (host/IPv4/IPv6 + port)

::: code-group

```toml [Config File]
[network]
address = "0.0.0.0:1337"
```

```shell [Environment]
P2P_ADDRESS="0.0.0.0:1337"
```

:::

### `network.public_address` <Badge text="required" /> {#param-network-public-address}

Peer-to-peer address (external, as seen by other peers).

Will be gossiped to connected peers so that they can gossip it to other peers.

- **Environment:** `P2P_PUBLIC_ADDRESS`
- **Type:** String, socket address (host/IPv4/IPv6 + port)

::: code-group

```toml [Config File]
[network]
public_address = "0.0.0.0:5000"
```

```shell [Environment]
P2P_PUBLIC_ADDRESS="0.0.0.0:5000"
```

:::

### `network.block_gossip_size`  {#param-network-block-gossip-size}

The amount of blocks that can be sent in a single synchronization message.

- **Type:** Number
- **Default:** `500`

::: code-group

```toml [Config File]
[network]
block_gossip_size = 256
```

:::

### `network.block_gossip_period_ms`  {#param-network-block-gossip-period-ms}

The time interval between requests to peers for the most recent block.

More frequent gossiping shortens the time to sync, but can overload the network.

- **Type:** Number (of milliseconds)
- **Default:** `10_000` (10 seconds)

::: code-group

```toml [Config File]
[network]
block_gossip_period_ms = 1_000
```

:::

### `network.transaction_gossip_size`  {#param-network-transaction-gossip-size}

Max number of transactions in a gossip batch message.

Smaller size leads to longer time to synchronise, but useful if you have high packet loss.

- **Type:** Number
- **Default:** `500`

::: code-group

```toml [Config File]
[network]
transaction_gossip_size = 256
```

:::

### `network.transaction_gossip_period_ms`  {#param-network-transaction-gossip-period-ms}

Period of gossiping pending transaction between peers.

More frequent gossiping shortens the time to sync, but can overload the network.

- **Type:** Number (of milliseconds)
- **Default:** `1_000` (1 second)

::: code-group

```toml [Config File]
[network]
transaction_gossip_period_ms = 5_000
```

:::

### `network.idle_timeout_ms`  {#param-network-idle-timeout-ms}

Duration of time after which connection with peer is terminated if peer is idle.

- **Type:** Number (of milliseconds)
- **Default:** `60_000` (60 seconds)

::: code-group

```toml [Config File]
[network]
idle_timeout_ms = 60_000
```

:::

## Torii {#torii}

### `torii.address` <Badge text="required" /> {#param-torii-address}

Address to which the Torii server must listen and to which the client(s) make their requests.

- **Environment:** `API_ADDRESS`
- **Type:** String, socket address (host/IPv4/IPv6 + port)

::: code-group

```toml [Config File]
[torii]
address = "0.0.0.0:8080"
```

```shell [Environment]
API_ADDRESS="0.0.0.0:8080"
```

:::

### `torii.max_content_len`  {#param-torii-max-content-len}

The maximum number of bytes in a raw request body accepted by
the [Transaction Endpoint](/reference/torii-endpoints#transaction).

This limit is used to prevent DOS attacks.

- **Type:** Number (of bytes)
- **Default:** `16_777_216` (16 MiB, $2^{20} \cdot 16$)

::: code-group

```toml [Config File]
[torii]
max_content_len = 16_777_216
```

:::

### `torii.query_idle_time_ms`  {#param-torii-query-idle-time-ms}

The time a query can remain in the store if unaccessed.

- **Type:** Number (of milliseconds)
- **Default:** `10_000` (10 seconds)

::: code-group

```toml [Config File]
[torii]
query_idle_time_ms = 10_000
```

:::

### `torii.query_store_capacity`  {#param-torii-query-store-capacity}

The upper limit of the number of live queries.

- **Type:** Number
- **Default:** `128`

::: code-group

```toml [Config File]
[torii]
query_store_capacity = 128
```

:::

### `torii.query_store_capacity_per_user`  {#param-torii-query-store-capacity-per-user}

The upper limit of the number of live queries for a single user.

- **Type:** Number
- **Default:** `128`

::: code-group

```toml [Config File]
[torii]
query_store_capacity_per_user = 128
```

:::

## Logger {#logger}

### `logger.level`  {#param-logger-level}

Logging verbosity.

Choose the level that best suits your use case. Refer to
[Stack Overflow](https://stackoverflow.com/questions/2031163/when-to-use-the-different-log-levels) for additional
details on how to use different log levels.

- **Environment:** `LOG_LEVEL`
- **Type:** String, possible values:
    - `TRACE`: All events, including low-level operations.
    - `DEBUG`: Debug-level messages, useful for diagnostics.
    - `INFO`: General informational messages.
    - `WARN`: Warnings that indicate potential issues.
    - `ERROR`: Errors that disrupt normal function but allow continued operation.
- **Default:** `INFO`

::: code-group

```toml [Config File]
[logger]
level = "INFO"
```

```shell [Environment]
LOG_LEVEL="INFO"
```

:::

### `logger.format`  {#param-logger-format}

Logs format.

- **Environment:** `LOG_FORMAT`
- **Type:** String, possible values: (TODO: describe)
    - `full`
    - `compact`
    - `pretty`
    - `json`
- **Default:** `full`

::: code-group

```toml [Config File]
[logger]
format = "json"
```

```shell [Environment]
LOG_FORMAT="json"
```

:::

## Kura {#kura}

_Kura_ is the persistent storage engine of Iroha (Japanese for _warehouse_).

### `kura.blocks_in_memory`  {#param-kura-blocks-in-memory}

At most N last blocks will be stored in memory.

Older blocks will be dropped from memory and loaded from the disk if they are needed.

- **Environment:** `KURA_BLOCKS_IN_MEMORY`
- **Type:** Number
- **Default:** `128`

::: code-group

```toml [Config File]
[kura]
blocks_in_memory = 256
```

```shell [Environment]
KURA_BLOCKS_IN_MEMORY=256
```

:::

### `kura.init_mode`  {#param-kura-init-mode}

Kura initialisation mode

- **Environment:** `KURA_INIT_MODE`
- **Type:** String, possible values:
    - `strict`: strict validation of all blocks
    - `fast`: Fast initialisation with only basic checks
- **Default:** `strict`

::: code-group

```toml [Config File]
[kura]
init_mode = "fast"
```

```shell [Environment]
KURA_INIT_MODE="fast"
```

:::

### `kura.store_dir`  {#param-kura-store-dir}

Specifies the directory[^paths] where the blocks are stored.

- **Environment:** `KURA_STORE_DIR`
- **Type:** String, file path[^paths]
- **Default:** `./storage` (see also: [`snapshot.store_dir`](#param-snapshot-store-dir))

::: code-group

```toml [Config File]
[kura]
store_dir = "/path/to/storage"
```

```shell [Environment]
KURA_STORE_DIR="/path/to/storage"
```

:::

### `kura.debug.output_new_blocks` <Badge type="warning" text="debug" /> {#param-kura-debug-output-new-blocks}

Flag to enable printing new blocks to console.

- **Environment:** `KURA_DEBUG_OUTPUT_NEW_BLOCKS`
- **Type:** Boolean
- **Default:** `false`

::: code-group

```toml [Config File]
[kura.debug]
output_new_blocks = true
```

```shell [Environment]
KURA_DEBUG_OUTPUT_NEW_BLOCKS=true
```

:::

## Queue {#queue}

### `queue.capacity`  {#param-queue-capacity}

The upper limit of the number of transactions waiting in the queue.

- **Type:** Number
- **Default:** `65_536`

::: code-group

```toml [Config File]
[queue]
capacity = 1_048_576
```

:::

### `queue.capacity_per_user`  {#param-queue-capacity-per-user}

The upper limit of the number of transactions waiting in the queue for a single user.

Use this option to apply throttling.

- **Type:** Number
- **Default:** 65_536

::: code-group

```toml [Config File]
[queue]
capacity_per_user = 1_048_576
```

:::

### `queue.transaction_time_to_live_ms`  {#param-queue-transaction-time-to-live-ms}

The transaction will be dropped after this time if it is still in the queue.

- **Type:** Number (of milliseconds)
- **Default:** `86_400_000` (24 hours)

::: code-group

```toml [Config File]
[queue]
transaction_time_to_live_ms = 43_200_000
```

:::

## Sumeragi {#sumeragi}

### `sumeragi.debug.force_soft_fork` <Badge type="warning" text="debug" /> {#param-sumeragi-debug-force-soft-fork}

TODO

- **Type:** Boolean
- **Default:** `false`

::: code-group

```toml [Config File]
[sumeragi.debug]
force_soft_fork = true
```

:::

## Snapshot {#snapshot}

This module is responsible for reading and writing snapshots of the
[World State View](/blockchain/world#world-state-view-wsv).

TODO: explain the purpose of snapshots, file formats, etc

::: tip Wipe Snapshots

In case if something is wrong with the snapshots system, and you want to start from a blank page (in terms of
snapshots), you could remove the directory specified by [`snapshot.store_dir`](#param-snapshot-store-dir).

:::

### `snapshot.mode`  {#param-snapshot-mode}

The mode the Snapshot system functions in.

- **Environment:** `SNAPSHOT_MODE`
- **Type:** String, possible values:
    - `read_write`: Iroha creates snapshots with a period specified by [
      `snapshot.create_every_ms`](#param-snapshot-create-every-ms).
      On startup, Iroha reads an existing snapshot (if any) and verifies that it is up-to-date with the blocks storage.
    - `readonly`: Similar to `read_write` but Iroha doesn't create any snapshots.
    - `disabled`: Iroha neither creates new snapshots nor reads an existing one on startup.
- **Default:** `read_write`

::: code-group

```toml [Config File]
[snapshot]
mode = "readonly"
```

```shell [Environment]
SNAPSHOT_MODE="readonly"
```

:::

### `snapshot.create_every_ms`  {#param-snapshot-create-every-ms}

Frequency of snapshots.

- **Type:** Number (of milliseconds)
- **Default:** `600_000` (10 minutes)

::: code-group

```toml [Config File]
[snapshot]
create_every_ms = 60_000
```

:::

### `snapshot.store_dir`  {#param-snapshot-store-dir}

Directory where to store snapshots.

- **Environment:** `SNAPSHOT_STORE_DIR`
- **Type:** String, file path[^paths]
- **Default:** `./storage/snapshot` (see also: [`kura.store_dir`](#param-kura-store-dir))

::: code-group

```toml [Config File]
[snapshot]
store_dir = "/path/to/storage"
```

```shell [Environment]
SNAPSHOT_STORE_DIR="/path/to/storage"
```

:::

## Telemetry {#telemetry}

TODO

`name` and `url` must be paired.

All `telemetry` section is optional.

### `telemetry.name`  {#param-telemetry-name}

The node's name to be displayed on the telemetry.

- **Type:** String

::: code-group

```toml [Config File]
[telemetry]
name = "iroha"
```

:::

### `telemetry.url`  {#param-telemetry-url}

The url of the telemetry. TODO update example value

- **Type:** String

::: code-group

```toml [Config File]
[telemetry]
url = "ws://substrate.telemetry.iroha"
```

:::

### `telemetry.min_retry_period_ms`  {#param-telemetry-min-retry-period-ms}

The minimum period of time to wait before reconnecting.

- **Type:** Number (of milliseconds)
- **Default:** `1_000` (1 second)

::: code-group

```toml [Config File]
[telemetry]
min_retry_period_ms = 5_000
```

:::

### `telemetry.max_retry_delay_exponent`  {#param-telemetry-max-retry-delay-exponent}

The maximum exponent of 2 that is used for increasing delay between reconnections.

- **Type:** Number
- **Default:** `4`

::: code-group

```toml [Config File]
[telemetry]
max_retry_delay_exponent = 4
```

:::

### `dev_telemetry.out_file`  {#param-dev-telemetry-out-file}

The filepath to write dev-telemetry to

- **Type:** String, file path[^paths]

::: code-group

```toml [Config File]
[dev_telemetry]
out_file = "/path/to/file.json"
```

:::

[^paths]: Relative file paths in the configuration file are resolved relative to the configuration file location. If
provided via Environment Variables, they are resolved relative to the Current Working Directory.