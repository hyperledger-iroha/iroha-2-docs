<script setup>
import MigrationSnapshotModeTable from './MigrationSnapshotModeTable.vue'
</script>

# Migrate Configuration

...from `2.0.0-pre-rc.20` to the new format.

::: danger

This is an unstable document, Work in Progress.

:::

Do the following:

- Update CLI and ENVs
- Use TOML for the config file
- Update parameters
- [Sign genesis with Kagami](../genesis.md)

## CLI and Environment

Here, the **After** column contains _all_ new supported environment
variables. Environment variables aren't mentioned in the **Before** column
were removed.

|                              Before | After                                                              |
| ----------------------------------: |--------------------------------------------------------------------|
|                `IROHA2_CONFIG_PATH` | removed, use [`--config`](../irohad-cli#arg-config) instead        |
|               `IROHA2_GENESIS_PATH` | [`GENESIS_FILE`](params#param-genesis-file)                        |
|                  `IROHA_PUBLIC_KEY` | [`PUBLIC_KEY`](params#param-public-key)                            |
|                 `IROHA_PRIVATE_KEY` | [`PRIVATE_KEY`](params#param-private-key)                          |
|                    `TORII_P2P_ADDR` | [`P2P_ADDRESS`](params#param-network-address)                      |
|  `IROHA_GENESIS_ACCOUNT_PUBLIC_KEY` | [`GENESIS_PUBLIC_KEY`](params#param-genesis-public-key)            |
| `IROHA_GENESIS_ACCOUNT_PRIVATE_KEY` | removed; genesis block is signed with it outside of Iroha          |
|                     `TORII_API_URL` | [`API_ADDRESS`](params#param-torii-address)                        |
|                    `KURA_INIT_MODE` | [same](params#param-kura-init-mode)                                |
|             `KURA_BLOCK_STORE_PATH` | [`KURA_STORE_DIR`](params#param-kura-store-dir)                    |
|      `KURA_DEBUG_OUTPUT_NEW_BLOCKS` | [same](params#param-kura-debug-output-new-blocks)                  |
|                     `MAX_LOG_LEVEL` | [`LOG_LEVEL`](params#param-logger-level)                           |
|                      `COMPACT_MODE` | removed, see [`LOG_FORMAT`](params#param-logger-format)            |
|                   `TERMINAL_COLORS` | same, see [`--terminal-colors`](../irohad-cli#arg-terminal-colors) |
|         `SNAPSHOT_CREATION_ENABLED` | removed, see [`SNAPSHOT_MODE`](params#param-snapshot-mode)         |
|                 `SNAPSHOT_DIR_PATH` | [`SNAPSHOT_STORE_DIR`](params#param-snapshot-store-dir)            |
|            `SUMERAGI_TRUSTED_PEERS` | [same](params#param-trusted-peers)                                 |
|                   ...all other ones | removed                                                            |

## Configuration Parameters

New mandatory parameters:

- [`chain_id`](params#param-chain-id)
- [`network.public_address`](params#param-network-public-address)

List of all old parameters:

- Root parameters: see [Root-Level Params](params#root)
  - `PRIVATE_KEY`: became [`private_key`](params#param-private-key)
  - `PUBLIC_KEY`: became [`public_key`](params#param-public-key)
- ~~`BLOCK_SYNC`~~: section removed
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
  - `BLOCK_BATCH_SIZE`: became
    [`network.block_gossip_size`](params#param-network-block-gossip-size)
  - `GOSSIP_PERIOD_MS`: became
    [`network.block_gossip_period_ms`](params#param-network-block-gossip-period-ms)
- ~~`DISABLE_PANIC_TERMINAL_COLORS`~~: removed
- `GENESIS`: see [Genesis Params](params#genesis)
  - `ACCOUNT_PRIVATE_KEY`: removed (must be used to sign the genesis block now)
  - `ACCOUNT_PUBLIC_KEY`: became
    [`genesis.public_key`](params#param-genesis-public-key)
- `KURA`: see [Kura Params](params#kura)
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
  - ~~`BLOCKS_PER_STORAGE_FILE`~~: removed
  - `BLOCK_STORE_PATH`: became
    [`kura.store_dir`](params#param-kura-store-dir)
  - `DEBUG_OUTPUT_NEW_BLOCKS`: became
    [`kura.debug.output_new_blocks`](params#param-kura-debug-output-new-blocks)
  - `INIT_MODE`: same, lowercase
- `LOGGER`: see [Logger Params](params#logger)
  - ~~`COMPACT_MODE`~~: removed; now might be enabled with
    [`logger.format = "compact"`](params#param-logger-format)
  - ~~`LOG_FILE_PATH`~~: removed; use STDOUT redirection instead and enable
    JSON format with [`logger.format = "json"`](params#param-logger-format)
  - `MAX_LOG_LEVEL`: became [`logger.log_level`](params#param-logger-level)
  - ~~`TELEMETRY_CAPACITY`~~: removed
  - ~~`TERMINAL_COLORS`~~: removed; use [`--terminal-colors`](../irohad-cli#arg-terminal-colors)
    instead
- `NETWORK`: see [Network Params](params#network), some parameters migrated
  here
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
- `QUEUE`: see [Queue Params](params#queue)
  - `FUTURE_THRESHOLD_MS`: removed
  - `MAX_TRANSACTIONS_IN_QUEUE`: became
    [`queue.capacity`](params#param-queue-capacity)
  - `MAX_TRANSACTIONS_IN_QUEUE_PER_USER`: became
    [`queue.capacity_per_user`](params#param-queue-capacity-per-user)
  - `TRANSACTION_TIME_TO_LIVE_MS`: became
    [`queue.transaction_time_to_live`](params#param-queue-transaction-time-to-live-ms)
- `SNAPSHOT`: see [Snapshot Params](params#snapshot)
  - `CREATE_EVERY_MS`: became
    [`snapshot.create_every_ms`](params#param-snapshot-create-every-ms)
  - `CREATION_ENABLED`: removed in favour of
    [`snapshot.mode`](params#param-snapshot-mode); see the mapping:
    <MigrationSnapshotModeTable />
  - `DIR_PATH`: became
    [`snapshot.store_dir`](params#param-snapshot-store-dir)
- `SUMERAGI`: see [Sumeragi Params](params#sumeragi)
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
  - ~~`BLOCK_TIME_MS`~~: removed[^1]
  - ~~`COMMIT_TIME_LIMIT_MS`~~: removed[^1]
  - `GOSSIP_BATCH_SIZE`: became
    [`network.transaction_gossip_size`](params#param-network-transaction-gossip-size)
  - `GOSSIP_PERIOD_MS`: became
    [`network.transaction_gossip_period_ms`](params#param-network-transaction-gossip-period-ms)
  - ~~`KEY_PAIR`~~: removed
  - ~~`MAX_TRANSACTIONS_IN_BLOCK`~~: removed[^1]
  - ~~`PEER_ID`~~: removed
  - `TRUSTED_PEERS`: [same, lowercase](params#param-trusted-peers)
- `TELEMETRY`: see [Telemetry Params](params#telemetry)
  - `FILE`: became [`dev_telemetry.out_file`](./params.md#param-dev-telemetry-out-file)
  - `MAX_RETRY_DELAY_EXPONENT`: same, lowercase
  - `MIN_RETRY_PERIOD`: same, lowercase
  - `NAME`: same, lowercase
  - `URL`: same, lowercase
- `TORII`: see [Torii Params](params#torii)
  - `API_URL`: became [`torii.address`](params#param-torii-address)
  - ~~`FETCH_SIZE`~~: removed
  - `MAX_CONTENT_LEN`: same, lowercase
  - ~~`MAX_TRANSACTION_SIZE`~~: removed
  - `P2P_ADDR`: became [`network.address`](params#param-network-address)
  - `QUERY_IDLE_TIME_MS`: became `torii.query_idle_time`
- ~~`WSV`~~: removed[^1]

[^1]: on-chain configuration removed from configuration file. TODO link reference.

## Example

**Complete setup before:**

::: code-group

```shell [CLI]
export IROHA2_CONFIG=./config.json
export IROHA2_GENESIS=./genesis.json

iroha --submit-genesis
```

```json [Configuration file]
{
  "PUBLIC_KEY": "ed01201C61FAF8FE94E253B93114240394F79A607B7FA55F9E5A41EBEC74B88055768B",
  "PRIVATE_KEY": {
    "digest_function": "ed25519",
    "payload": "282ED9F3CF92811C3818DBC4AE594ED59DC1A2F78E4241E31924E101D6B1FB831C61FAF8FE94E253B93114240394F79A607B7FA55F9E5A41EBEC74B88055768B"
  },
  "TORII": {
    "API_URL": "127.0.0.1:8080",
    "P2P_ADDR": "127.0.0.1:1337"
  },
  "GENESIS": {
    "ACCOUNT_PUBLIC_KEY": "ed01203F4E3E98571B55514EDC5CCF7E53CA7509D89B2868E62921180A6F57C2F4E255",
    "ACCOUNT_PRIVATE_KEY": {
      "digest_function": "ed25519",
      "payload": "038AE16B219DA35AA036335ED0A43C28A2CC737150112C78A7B8034B9D99C9023F4E3E98571B55514EDC5CCF7E53CA7509D89B2868E62921180A6F57C2F4E255"
    }
  },
  "KURA": {
    "BLOCK_STORE_PATH": "./storage"
  }
}
```

:::

**Complete setup after:**

::: code-group

```shell [CLI]
iroha --submit-genesis --config ./iroha.toml
```

```toml [Configuration file]
chain_id = "000"
public_key = "ed01201C61FAF8FE94E253B93114240394F79A607B7FA55F9E5A41EBEC74B88055768B"
private_key = { algorithm = "ed25519", payload = "282ED9F3CF92811C3818DBC4AE594ED59DC1A2F78E4241E31924E101D6B1FB831C61FAF8FE94E253B93114240394F79A607B7FA55F9E5A41EBEC74B88055768B" }

[network]
address = "127.0.0.1:1337"

[torii]
address = "127.0.0.1:8080"

[kura]
store_dir = "./storage"

[genesis]
public_key = "ed01203F4E3E98571B55514EDC5CCF7E53CA7509D89B2868E62921180A6F57C2F4E255"
private_key = { algorithm = "ed25519", payload = "038AE16B219DA35AA036335ED0A43C28A2CC737150112C78A7B8034B9D99C9023F4E3E98571B55514EDC5CCF7E53CA7509D89B2868E62921180A6F57C2F4E255" }
file = "./genesis.json"
```

:::
