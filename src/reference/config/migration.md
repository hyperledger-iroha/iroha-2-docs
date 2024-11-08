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

## CLI and Environment

Here, the **After** column contains _all_ new supported environment
variables. Environment variables aren't mentioned in the **Before** column
were removed.

|                              Before | After                                                                                                            |
| ----------------------------------: | ---------------------------------------------------------------------------------------------------------------- |
|                `IROHA2_CONFIG_PATH` | removed, use [`--config`](../cli#arg-config) instead                                                             |
|               `IROHA2_GENESIS_PATH` | [`GENESIS_FILE`](genesis-params#param-file)                                                                      |
|                  `IROHA_PUBLIC_KEY` | [`PUBLIC_KEY`](base-params#param-public-key)                                                                     |
|                 `IROHA_PRIVATE_KEY` | split into [`PRIVATE_KEY_ALGORITHM` and `PRIVATE_KEY_PAYLOAD`](base-params#param-private-key)                    |
|                    `TORII_P2P_ADDR` | [`P2P_ADDRESS`](network-params#param-address)                                                                    |
|  `IROHA_GENESIS_ACCOUNT_PUBLIC_KEY` | [`GENESIS_PUBLIC_KEY`](genesis-params#param-public-key)                                                          |
| `IROHA_GENESIS_ACCOUNT_PRIVATE_KEY` | split into [`GENESIS_PRIVATE_KEY_ALGORITHM` and `GENESIS_PRIVATE_KEY_PAYLOAD`](genesis-params#param-private-key) |
|                     `TORII_API_URL` | [`API_ADDRESS`](torii-params#param-address)                                                                      |
|                    `KURA_INIT_MODE` | [same](kura-params#param-init-mode)                                                                              |
|             `KURA_BLOCK_STORE_PATH` | [`KURA_STORE_DIR`](kura-params#param-store-dir)                                                                  |
|      `KURA_DEBUG_OUTPUT_NEW_BLOCKS` | [same](kura-params#param-debug-output-new-blocks)                                                                |
|                     `MAX_LOG_LEVEL` | [`LOG_LEVEL`](logger-params#param-level)                                                                         |
|                      `COMPACT_MODE` | removed, see [`LOG_FORMAT`](logger-params#param-format)                                                          |
|                   `TERMINAL_COLORS` | same, see [`--terminal-colors`](../cli#arg-terminal-colors)                                                      |
|         `SNAPSHOT_CREATION_ENABLED` | removed, see [`SNAPSHOT_MODE`](snapshot-params#param-mode)                                                       |
|                 `SNAPSHOT_DIR_PATH` | [`SNAPSHOT_STORE_DIR`](snapshot-params#param-store-dir)                                                          |
|            `SUMERAGI_TRUSTED_PEERS` | [same](sumeragi-params#param-trusted-peers)                                                                      |
|                   ...all other ones | removed                                                                                                          |

## Configuration Parameters

- New mandatory parameter: [`chain_id`](base-params#param-chain-id)

List of all old parameters:

- Root parameters: see [Base Params](base-params)
  - `PRIVATE_KEY`: became [`private_key`](base-params#param-private-key);
    rename `digest_function` to `algorithm`
  - `PUBLIC_KEY`: became [`public_key`](base-params#param-public-key)
- ~~`BLOCK_SYNC`~~: section removed
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
  - `BLOCK_BATCH_SIZE`: became
    [`network.max_blocks_per_gossip`](network-params#param-max-blocks-per-gossip)
  - `GOSSIP_PERIOD_MS`: became
    [`network.block_gossip_period`](network-params#param-block-gossip-period)
- ~~`DISABLE_PANIC_TERMINAL_COLORS`~~: removed
- `GENESIS`: see [Genesis Params](genesis-params)
  - `ACCOUNT_PRIVATE_KEY`: became
    [`genesis.private_key`](genesis-params#param-private-key); rename
    `digest_function` to `algorithm`
  - `ACCOUNT_PUBLIC_KEY`: became
    [`genesis.public_key`](genesis-params#param-public-key)
- `KURA`: see [Kura Params](kura-params)
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
  - ~~`BLOCKS_PER_STORAGE_FILE`~~: removed
  - `BLOCK_STORE_PATH`: became
    [`kura.store_dir`](kura-params#param-store-dir)
  - `DEBUG_OUTPUT_NEW_BLOCKS`: became
    [`kura.debug.output_new_blocks`](kura-params#param-debug-output-new-blocks)
  - `INIT_MODE`: same, lowercase
- `LOGGER`: see [Logger Params](logger-params)
  - ~~`COMPACT_MODE`~~: removed; now might be enabled with
    [`logger.format = "compact"`](logger-params#param-format)
  - ~~`LOG_FILE_PATH`~~: removed; use STDOUT redirection instead and enable
    JSON format with [`logger.format = "json"`](logger-params#param-format)
  - `MAX_LOG_LEVEL`: became [`logger.log_level`](logger-params#param-level)
  - ~~`TELEMETRY_CAPACITY`~~: removed
  - ~~`TERMINAL_COLORS`~~: removed; use [`--terminal-colors`](../cli#arg-terminal-colors)
    instead
- `NETWORK`: see [Network Params](network-params), some parameters migrated
  here
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
- `QUEUE`: see [Queue Params](queue-params)
  - `FUTURE_THRESHOLD_MS`: became
    [`queue.future_threshold`](queue-params#param-future-threshold)
  - `MAX_TRANSACTIONS_IN_QUEUE`: became
    [`queue.capacity`](queue-params#param-capacity)
  - `MAX_TRANSACTIONS_IN_QUEUE_PER_USER`: became
    [`queue.capacity_per_user`](queue-params#param-capacity-per-user)
  - `TRANSACTION_TIME_TO_LIVE_MS`: became
    [`queue.transaction_time_to_live`](queue-params#param-transaction-time-to-live)
- `SNAPSHOT`: see [Snapshot Params](snapshot-params)
  - `CREATE_EVERY_MS`: became
    [`snapshot.create_every`](snapshot-params#param-create-every)
  - `CREATION_ENABLED`: removed in favour of
    [`snapshot.mode`](snapshot-params#param-mode); see the mapping:
    <MigrationSnapshotModeTable />
  - `DIR_PATH`: became
    [`snapshot.store_dir`](snapshot-params#param-store-dir)
- `SUMERAGI`: see [Sumeragi Params](sumeragi-params)
  - ~~`ACTOR_CHANNEL_CAPACITY`~~: removed
  - ~~`BLOCK_TIME_MS`~~: removed[^1]
  - ~~`COMMIT_TIME_LIMIT_MS`~~: removed[^1]
  - `GOSSIP_BATCH_SIZE`: became
    [`network.max_transactions_per_gossip`](network-params#param-max-transactions-per-gossip)
  - `GOSSIP_PERIOD_MS`: became
    [`network.transaction_gossip_period`](network-params#param-transaction-gossip-period)
  - ~~`KEY_PAIR`~~: removed
  - ~~`MAX_TRANSACTIONS_IN_BLOCK`~~: removed[^1]
  - ~~`PEER_ID`~~: removed
  - `TRUSTED_PEERS`: [same, lowercase](sumeragi-params#param-trusted-peers)
- `TELEMETRY`: see [Telemetry Params](telemetry-params)
  - `FILE`: became `dev_telemetry.out_file` (todo)
  - `MAX_RETRY_DELAY_EXPONENT`: same, lowercase
  - `MIN_RETRY_PERIOD`: same, lowercase
  - `NAME`: same, lowercase
  - `URL`: same, lowercase
- `TORII`: see [Torii Params](torii-params)
  - `API_URL`: became [`torii.address`](torii-params#param-address)
  - ~~`FETCH_SIZE`~~: removed
  - `MAX_CONTENT_LEN`: same, lowercase
  - ~~`MAX_TRANSACTION_SIZE`~~: removed
  - `P2P_ADDR`: became [`network.address`](network-params#param-address)
  - `QUERY_IDLE_TIME_MS`: became `torii.query_idle_time`
- ~~`WSV`~~: temporarily moved to `chain_wide` section, but is going to be
  removed from the configuration entirely[^1]

[^1]: See [Chain Wide Params](chain-wide-params).

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

## See also

- [`peer.template.toml`](https://github.com/hyperledger/iroha/blob/8d0157a969a9388ca1f942709837a5a3e591d155/configs/peer.template.toml#L66)
- [New configuration reference](index)
