# Torii Endpoints

::: tip About Parity SCALE Codec

Messages for certain `TORII` operations are encoded with the Parity
<abbr title="Simple Concatenated Aggregate Little-Endian">SCALE</abbr> Codec
(`SCALE`) commonly used with the
[Parity Substrate](https://www.parity.io/technologies/substrate/) blockchain
framework, and other blockchains utilizing it.

For more information on `SCALE`, see the
[Substrate Documentation: Type encoding (SCALE)](https://docs.substrate.io/reference/scale-codec/)
article and its
[official GitHub repository](https://github.com/paritytech/parity-scale-codec).

<!-- TODO: link to our own article about SCALE, once it is written; Issue: https://github.com/hyperledger-iroha/iroha-2-docs/issues/367 -->

:::

Torii (Japanese: 鳥居 — Shinto shrine gateway) is the Iroha 2 module in charge
of handling `HTTP` and `WebSocket` requests. It is the main
<abbr title="Application Programming Interface">API</abbr> for interacting with
Iroha 2. Such interactions include sending transactions, making queries,
listening for blocks stream, etc.

<!-- TODO: Update the following as part of PR #397: https://github.com/hyperledger-iroha/iroha-2-docs/pull/397

To establish two-way communication with the `TORII` endpoints, the following addresses must be specified in the Iroha 2 configuration files:

1. In the `configs/client_cli/config.json` client configuration file:
   - `TORII_API_URL` — connects to the `TORII` module responsible for handling incoming and outgoing connections.\
   This address is the same as the `API_URL` address in the `configs/peer/config.json` peer configuration file.
   - `TORII_TELEMETRY_URL` — connects to the [Prometheus](https://prometheus.io/) endpoint address that is used as a [metrics](../guide/advanced/metrics.md) tool to monitor the network performance.

   ::: info

   To learn more, see [Client Configuration > Iroha Public Addresses](../guide/configure/client-configuration.md#iroha-public-addresses).

   :::

2. In the `configs/peer/config.json` peer configuration file:
   - `API_URL` — connects to the `TORII` module responsible for handling incoming and outgoing connections.\
   This address is the same as the `TORII_API_URL` address in the `configs/client_cli/config.json` client configuration file.
   - `TELEMETRY_URL` — connects to the [Prometheus](https://prometheus.io/) endpoint address that is used as a [metrics](../guide/advanced/metrics.md) tool to monitor the network performance.

   ::: info

   To learn more, see [Peer Configuration > Iroha Public Addresses](../guide/configure/peer-configuration.html#iroha-public-addresses).

   :::

-->

[[toc]]

## API Version

::: info

This operation requires the specific Iroha node being requested to be compiled
with the `telemetry` feature enabled.

<!-- TODO: Link to a topic about Iroha features/flags; Issue: https://github.com/hyperledger-iroha/iroha-2-docs/issues/465 -->

:::

- **Protocol**: `HTTP`
- **Method**: `GET`
- **Encoding**: `JSON`
- **Endpoint**: `/api_version`

#### Responses

| Code | Response | Description                                                                                 |
| :--: | -------- | ------------------------------------------------------------------------------------------- |
| 200  | OK       | Returns the current version of the API used by the requested Iroha 2 node as a JSON string. |

**Example**:

```
1
```

::: info

The API version is retrieved from and is the same as the version of the
[genesis block](../guide/configure/genesis.md), which means that at least a
minimal subnet of four peers must be running, and the genesis block must already
be submitted at the time of the request.

:::

## Blocks Stream

- **Protocols**: `HTTP` upgraded to `WebSocket`
- **Encoding**: `SCALE`
- **Endpoint**: `/block/stream`

#### Handshake

Since the `/block/stream` endpoint handles continuous two-way data exchange, a
`WebSocket` handshake between the client and server must first be performed to
initiate communication with this endpoint.

#### Data Exchange

After establishing a `WebSocket` connection, the client must send a
[`BlockSubscriptionRequest`](/reference/data-model-schema#blocksubscriptionrequest)
request with the starting block number provided (i.e., the `height` value).
Then, upon sending the confirmation and
[`BlockMessage`](/reference/data-model-schema#blockmessage) messages, the server
starts streaming all of the blocks, beginning with the block specified with
`height` up to the most recent one, and then continues to stream new blocks as
they are added to the blockchain.

## Configuration / Retrieve

- **Protocol**: `HTTP`
- **Method**: `GET`
- **Encoding**: `JSON`
- **Endpoint**: `/configuration`

#### Responses

| Code | Response | Description                                                               |
| :--: | -------- | ------------------------------------------------------------------------- |
| 200  | OK       | Returns a subset of configuration parameters serialized into JSON format. |

**Example**:

```json
{
    "public_key": "ed0120A98BAFB0663CE08D75EBD506FEC38A84E576A7C9B0897693ED4B04FD9EF2D18D",
    "logger": {
        "level": "INFO",
        "filter": null
    },
    "network": {
        "block_gossip_size": 4,
        "block_gossip_period_ms": 10000,
        "transaction_gossip_size": 500,
        "transaction_gossip_period_ms": 1000
    },
    "queue": {
        "capacity": 65536
    }
}
```

## Configuration / Update

- **Protocol**: `HTTP`
- **Method**: `POST`
- **Encoding**: `JSON`
- **Endpoint**: `/configuration`

#### Requests

This endpoint expects a _subset_ of configuration parameters serialized into JSON
format.

Supported parameters:

- `logger.level`
- `logger.filter`

::: info

The list of all accepted values is currently unavailable and will be a part of
the configuration reference that is still
<abbr title="Work in Progress">WIP</abbr>.

Until then, to get assistance with the acceptable values and their definitions,
consult [Receive Support](/help/) for ways to contact us.

The progress on the configuration reference can be tracked in the following
GitHub issue:\
[iroha-2-docs > Issue #392: Tracking issue for Configuration Reference as per RFC](https://github.com/hyperledger-iroha/iroha-2-docs/issues/392).

:::

**Example**:

```json
{
  "logger": {
    "level": "DEBUG"
  }
}
```

#### Responses

| Code | Response | Description                                                                     |
| :--: | -------- | ------------------------------------------------------------------------------- |
| 202  | Accepted | The request to update the configuration is accepted and is due to be processed. |

## Events

- **Protocols**: `HTTP` upgraded to `WebSocket`
- **Encoding**: `SCALE`
- **Endpoint**: `/events`

### Transaction Events

The status of a transaction event can be one of the following:

- `Validating` — The transaction has been successfully submitted and is
  currently being validated by peers.
- `Committed` — The transaction has been successfully validated and is committed
  to the blockchain.
- `Rejected` — The transaction has been rejected by at least one peer and is
  **not** committed to the blockchain.

All transactions are designated with the `Validating` status upon creation,
which later proceeds to either `Committed` or `Rejected`. However, due to the
distributed nature of the network, some peers might receive events out of order
(e.g., `Committed` before `Validating`).

Some peers in the network may be offline for the validation round. If a client
connects to them while they are offline, the peers might not respond with the
`Validating` status. But when the offline peers come back online they will
automatically synchronize the blocks. These peers are then guaranteed to respond
with either `Committed` or `Rejected` status, depending on the information found
in the block.

#### Handshake

Since the `/events` endpoint handles continuous two-way data exchange, a
`WebSocket` handshake between the client and server must first be performed to
initiate communication with this endpoint.

#### Data Exchange

After establishing a `WebSocket` connection, the client must send an
[`EventSubscriptionRequest`](/reference/data-model-schema#eventsubscriptionrequest)
request, after which the server sends an
[`EventMessage`](/reference/data-model-schema#eventmessage) response.

## Health

- **Protocol**: `HTTP`
- **Method**: `GET`
- **Encoding**: `JSON`
- **Endpoint**: `/health`

#### Responses

| Code | Response      | Description                                                    |
| :--: | ------------- | -------------------------------------------------------------- |
| 200  | Health Status | Returns the current status of the peer submitting the request. |

**Example**:

```
Healthy
```

## Query

- **Protocol**: `HTTP`
- **Method**: `POST`
- **Encoding**: `SCALE`
- **Endpoint**: `/query`

#### Requests

This endpoint expects [`SignedQuery`](/reference/data-model-schema#signedquery)
as a request body.

#### Responses

- 200
  - [`QueryResponse`](/reference/data-model-schema#queryresponse)
  - Successful query request

| Code | Response                         | Body                                                            | Description                                                                |
| :--: | -------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 200  | Success                          | [`QueryResponse`](/reference/data-model-schema#queryresponse)   | Successful query request                                                   |
| 400  | Conversion Error                 | [`ValidationFail`](/reference/data-model-schema#validationfail) | Invalid asset query for the actual asset type                              |
| 400  | CursorMismatch/CursorDone Errors | [`ValidationFail`](/reference/data-model-schema#validationfail) | An invalid cursor was provided in the batch request                        |
| 400  | FetchSizeTooBig Error            | [`ValidationFail`](/reference/data-model-schema#validationfail) | Fetch size specified in the query request is too large                     |
| 400  | InvalidSingularParameters Error  | [`ValidationFail`](/reference/data-model-schema#validationfail) | Specified query parameters are not applicable to the (singular) query type |
| 400  | CapacityLimit Error              | [`ValidationFail`](/reference/data-model-schema#validationfail) | Reached the limit of parallel queries                                      |
| 401  | Signature Error                  | [`ValidationFail`](/reference/data-model-schema#validationfail) | The signature on the query is incorrect                                    |
| 403  | Permission Error                 | [`ValidationFail`](/reference/data-model-schema#validationfail) | The user does not have permission to execute this query                    |
| 404  | Find Error                       | [`ValidationFail`](/reference/data-model-schema#validationfail) | The queried object was not found                                           |

::: info

The `200 Success` response returns results that are ordered by `id`, which use
Rust's [PartialOrd](https://doc.rust-lang.org/std/cmp/trait.PartialOrd.html) and
[Ord](https://doc.rust-lang.org/std/cmp/trait.Ord.html) traits.

:::

::: tip

See [`QueryExecutionFail`](/reference/data-model-schema#queryexecutionfail) type
for details of the errors.

:::

### Account Not Found 404

The following table shows which error you will get depending on which
prerequisite object could not be found
[`FindError`](/reference/data-model-schema#finderror):

| Domain | Account | [`FindError`](/reference/data-model-schema#finderror)                     |
| :----: | :-----: | ------------------------------------------------------------------------- |
|   N    |    -    | [`FindError::Domain(DomainId)`](/reference/data-model-schema#finderror)   |
|   Y    |    N    | [`FindError::Account(AccountId)`](/reference/data-model-schema#finderror) |

### Asset Not Found 404

The following table shows which error you will get depending on which
prerequisite object could not be found
[`FindError`](/reference/data-model-schema#finderror):

| Domain | Account | Asset Definition | Asset | [`FindError`](/reference/data-model-schema#finderror)                                     |
| :----: | :-----: | :--------------: | :---: | ----------------------------------------------------------------------------------------- |
|   N    |    -    |        -         |   -   | [`FindError::Domain(DomainId)`](/reference/data-model-schema#finderror)                   |
|   Y    |    N    |        -         |   -   | [`FindError::Account(AccountId)`](/reference/data-model-schema#finderror)                 |
|   Y    |    -    |        N         |   -   | [`FindError::AssetDefinition(AssetDefinitionId)`](/reference/data-model-schema#finderror) |
|   Y    |    Y    |        Y         |   N   | [`FindError::Asset(AssetId)`](/reference/data-model-schema#finderror)                     |

## Schema <Badge text="feature: schema" type=tip />

::: info

This operation requires the Iroha 2 network to be established with the `schema`
feature enabled.

<!-- TODO: Link to a topic about Iroha features/flags; Issue: https://github.com/hyperledger-iroha/iroha-2-docs/issues/465 -->

:::

- **Protocol**: `HTTP`
- **Method**: `GET`
- **Encoding**: `JSON`
- **Endpoint**: `/schema`

#### Requests

A `GET` request to the endpoint.

#### Responses

| Code | Response | Description                                                                                                         |
| :--: | -------- | ------------------------------------------------------------------------------------------------------------------- |
| 200  | OK       | Returns the Rust data structures and types of the entire [Data Model Schema](data-model-schema.md) as JSON objects. |

## Telemetry / Metrics <Badge text="feature: telemetry" type=tip /> {#metrics}

::: info

This operation requires the Iroha 2 network to be established with the
`telemetry` feature enabled.

<!-- TODO: Link to a topic about Iroha features/flags; Issue: https://github.com/hyperledger-iroha/iroha-2-docs/issues/465 -->

:::

- **Protocol**: `HTTP`
- **Method**: `GET`
- **Encoding**: `JSON`
- **Endpoint**: `/metrics`

#### Responses

| Code | Response | Description                                         |
| :--: | -------- | --------------------------------------------------- |
| 200  | Metrics  | Returns a report on 8 out of 10 Prometheus metrics. |

**Example**:

::: details Example `200 Metrics` response

```bash
# HELP accounts User accounts registered at this time
# TYPE accounts gauge
accounts{domain="genesis"} 1
accounts{domain="wonderland"} 1
# HELP block_height Current block height
# TYPE block_height counter
block_height 1
# HELP connected_peers Total number of currently connected peers
# TYPE connected_peers gauge
connected_peers 0
# HELP domains Total number of domains
# TYPE domains gauge
domains 2
# HELP tx_amount average amount involved in a transaction on this peer
# TYPE tx_amount histogram
tx_amount_bucket{le="0.005"} 0
tx_amount_bucket{le="0.01"} 0
tx_amount_bucket{le="0.025"} 0
tx_amount_bucket{le="0.05"} 0
tx_amount_bucket{le="0.1"} 0
tx_amount_bucket{le="0.25"} 0
tx_amount_bucket{le="0.5"} 0
tx_amount_bucket{le="1"} 0
tx_amount_bucket{le="2.5"} 0
tx_amount_bucket{le="5"} 0
tx_amount_bucket{le="10"} 0
tx_amount_bucket{le="+Inf"} 2
tx_amount_sum 26
tx_amount_count 2
# HELP txs Transactions committed
# TYPE txs counter
txs{type="accepted"} 1
txs{type="rejected"} 0
txs{type="total"} 1
# HELP uptime_since_genesis_ms Network up-time, from creation of the genesis block
# TYPE uptime_since_genesis_ms gauge
uptime_since_genesis_ms 54572974
# HELP view_changes Number of view_changes in the current round
# TYPE view_changes gauge
view_changes 0
```

:::

::: info

To learn more about metrics, see [Metrics](../guide/advanced/metrics.md).

:::

## Telemetry / Peers <Badge text="feature: telemetry" type=tip />

- **Protocol**: `HTTP`
- **Method**: `GET`
- **Encoding**: `JSON`
- **Endpoint**: `/peers`

#### Requests

A `GET` request to the endpoint.

#### Responses

| Code | Response             |
| ---- | -------------------- |
| 200  | List of online peers |

**Example:**

```json
[
  {
    "address": "0.0.0.0:8081",
    "id": "ed0120B23E14F659B91736AAB980B6ADDCE4B1DB8A138AB0267E049C082A744471714E"
  }
]
```

## Telemetry / Status <Badge text="feature: telemetry" type=tip />

::: info

This operation requires the Iroha 2 network to be established with the
`telemetry` feature enabled.

<!-- TODO: Link to a topic about Iroha features/flags; Issue: https://github.com/hyperledger-iroha/iroha-2-docs/issues/465 -->

:::

- **Protocol**: `HTTP`
- **Method**: `GET`
- **Encoding**: `JSON` or `SCALE`
- **Endpoint**: `/status`

#### Requests

A `GET` request to the endpoint.

This endpoint also accepts the following:

- **Header**: Specifies the encoding of the retrieved data.\
  Can be set to one of the following:
  - `Accept: application/x-parity-scale` — the retrieved data is encoded with
    `SCALE`.
  - `Accept: application/json` — the retrieved data is encoded with `JSON`.

If no header is specified in the request, the `Accept: application/json` header
is used by default.

#### Responses

| Code | Response     | Description                                                                                |
| :--: | ------------ | ------------------------------------------------------------------------------------------ |
| 200  | Iroha Status | Returns the Iroha network status report encoded as specified in the header of the request. |

The response body has the following structure:

```rust
struct Status {
    /// Number of connected peers, except for the reporting peer itself
    peers: u64,
    /// Number of committed blocks
    blocks: u64,
    /// Number of accepted transactions
    txs_accepted: u64,
    /// Number of rejected transactions
    txs_rejected: u64,
    /// Uptime since genesis block creation
    uptime: Uptime,
    /// Number of view changes in the current round
    view_changes: u64,
    /// Number of the transactions in the queue
    queue_size: u64,
}

struct Uptime {
    secs: u64,
    nanos: u32
}
```

::: details Examples

The following examples represent the same data:

::: code-group

```json [JSON]
{
  "peers": 4,
  "blocks": 5,
  "txs_accepted": 31,
  "txs_rejected": 3,
  "uptime": {
    "secs": 5,
    "nanos": 937000000
  },
  "view_changes": 2,
  "queue_size": 18
}
```

```[SCALE]
10 14 7C 0C 14 40 7C D9 37 08 48
```

:::

::: warning JSON Precision Lost

Almost all fields in the `Status` structure are 64-bit integers, and they are
encoded in JSON as-is. Since native JSON's number type according to the
specification effectively is `f64`, the precision might be lost on
deserialization, for example, in
[JavaScript's `JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse).

For more details, see the related
[GitHub issue](https://github.com/hyperledger-iroha/iroha/issues/3964).

:::

::: tip Compact Form in SCALE

Fields with `u64` type are serialized in the
[Compact form](https://docs.substrate.io/reference/scale-codec/#fn-1).

:::

### Sub-routing

It is also possible to retrieve the data of a specific `struct` group or
variable within it by adding their path to the endpoint address. The sub-routed
values are only returned in the JSON format.

**Examples**:

::: code-group

```json [/status]
{
  "peers": 4,
  "blocks": 5,
  "txs_accepted": 31,
  "txs_rejected": 3,
  "uptime": {
    "secs": 5,
    "nanos": 937000000
  },
  "view_changes": 2,
  "queue_size": 18
}
```

```json [/status/peers]
4
```

```json [/status/uptime]
{
  "secs": 5,
  "nanos": 937000000
}
```

```json [/status/uptime/secs]
5
```

:::

## Transaction

- **Protocol**: `HTTP`
- **Method**: `POST`
- **Encoding**: `SCALE`
- **Endpoint**: `/transaction`

#### Requests

This endpoint expects the following data:

- **Body**:
  [`SignedTransaction`](/reference/data-model-schema#signedtransaction)

#### Responses

| Code | Response                                 | Description                                                                        |
| :--: | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| 200  | Transaction Accepted                     | Transaction has been accepted, but is not yet guaranteed to have passed consensus. |
| 400  | Transaction Rejected (Malformed)         | Transaction is rejected due to being malformed.                                    |
| 401  | Transaction Rejected (Improperly signed) | Transaction is rejected due to being improperly signed.                            |
