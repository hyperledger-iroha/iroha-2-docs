# On-Chain Configuration

Supplied using `Configure` ISI with all optional fields, known beforehand. All parameters have default values. Defaults
are explicitly submitted in the genesis block if not set by a user.

This page contains description of each field configurable.

## `block_time`

- **Type:** Number, milliseconds
- **Default:** 2 seconds

Time since the round start[^1] by which a new block should be created regardless if there were enough transactions or
not. Used to force block commits when there is a small influx of new transactions.

A block might be created earlier if there is enough transactions in the [Queue](config/params#queue). The limit of transactions
is configured by [`transactions_in_block`](#transactions-in-block).

**Example:**

```json
{
  "block_time": 2000
}
```

## `commit_time`

- **Type:** Number, milliseconds
- **Default:** 4 seconds

Time by which a newly created block should be committed. Prevents malicious nodes from stalling the network by not
participating in consensus.

The block creation is configured with [`block_time`](#block-time) and [`transactions_in_block`](#transactions-in-block).

**Example:**

```toml
commit_time = "4s"
```

## `transactions_in_block`

- **Type:** u32
- **Default:** $2^9 = 512$

The upper limit of the number of transactions per block. If there is enough transactions in the [Queue](config/params#queue),
the block is created immediately. Otherwise, the block is created when [`block_time`](#block-time) is elapsed since the
round start[^1].

**Example:**

```toml
transactions_in_block = 512
```

## `wsv_transaction_limits`

## `wsv_identifier_length_limits`

## `wsv_domain_metadata_limits`

## `wsv_account_metadata_limits`

## `wsv_asset_definition_metadata_limits`

## `wsv_asset_metadata_limits`

## `wasm_fuel_limit`

## `wasm_memory_limit`

[^1]:
    The round start happens on peers rotation, when the leader is elected. Generally it happens after the previous block
    is committed. See [Consensus](/blockchain/consensus) (todo: that page doesn't mention "round start" term ).
