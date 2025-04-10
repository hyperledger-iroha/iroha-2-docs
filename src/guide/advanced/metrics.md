# Metrics

To conveniently and thoroughly monitor the performance of your instance of the Iroha network, we recommend using [`Prometheus`](https://prometheus.io/). Prometheus is a program that can monitor your Iroha peer over a separate socket and provide different kinds of performance metrics.

This data can help you find performance bottlenecks and optimise your Iroha configuration.

#### `/metrics` Endpoint

See [Reference > Torii Endpoints: Metrics](../../reference/torii-endpoints.md#metrics).

## How to use metrics

<!-- TODO: Update this subtopic as part of PR #397: https://github.com/hyperledger-iroha/iroha-2-docs/pull/397 -->

Work in Progress.

This topic will be updated as part of the new configuration reference.

The progress on the configuration reference can be tracked in the following GitHub issue:\
[iroha-2-docs > Issue #392: Tracking issue for Configuration Reference as per RFC](https://github.com/hyperledger-iroha/iroha-2-docs/issues/392).

After the above is configured, you can use the IP address set in the `"TORII_TELEMETRY_URL"` variable to access the metrics data from within a running Iroha instance.

<!-- FIXME: irrelevant information about configuration above -->

**Example**:

```bash
$ curl http://127.0.0.1:8180/metrics
```

This returns a result similar to the following:

```bash
# HELP accounts User accounts registered at this time
# TYPE accounts gauge
accounts{domain="garden_of_live_flowers"} 1
accounts{domain="genesis"} 1
accounts{domain="wonderland"} 2
# HELP block_height Current block height
# TYPE block_height counter
block_height 2
# HELP block_height_non_empty Current count of non-empty blocks
# TYPE block_height_non_empty counter
block_height_non_empty 1
# HELP commit_time_ms Average block commit time on this peer
# TYPE commit_time_ms histogram
commit_time_ms_bucket{le="100"} 2
commit_time_ms_bucket{le="400"} 2
commit_time_ms_bucket{le="1600"} 2
commit_time_ms_bucket{le="6400"} 2
commit_time_ms_bucket{le="25600"} 2
commit_time_ms_bucket{le="+Inf"} 2
commit_time_ms_sum 13
commit_time_ms_count 2
# HELP connected_peers Total number of currently connected peers
# TYPE connected_peers gauge
connected_peers 3
# HELP domains Total number of domains
# TYPE domains gauge
domains 3
# HELP dropped_messages Sumeragi dropped messages
# TYPE dropped_messages counter
dropped_messages 0
# HELP last_commit_time_ms Time (since block creation) it took for the latest block to be committed by this peer
# TYPE last_commit_time_ms gauge
last_commit_time_ms 13
# HELP queue_size Number of the transactions in the queue
# TYPE queue_size gauge
queue_size 0
# HELP tx_amount average amount involved in a transaction on this peer
# TYPE tx_amount histogram
tx_amount_bucket{le="-1000000000"} 0
tx_amount_bucket{le="-10000000"} 0
tx_amount_bucket{le="-100000"} 0
tx_amount_bucket{le="-1000"} 0
tx_amount_bucket{le="-10"} 0
tx_amount_bucket{le="0"} 0
tx_amount_bucket{le="10"} 0
tx_amount_bucket{le="1000"} 2
tx_amount_bucket{le="100000"} 2
tx_amount_bucket{le="10000000"} 2
tx_amount_bucket{le="1000000000"} 2
tx_amount_bucket{le="+Inf"} 2
tx_amount_sum 57
tx_amount_count 2
# HELP txs Transactions committed
# TYPE txs counter
txs{type="accepted"} 4
txs{type="rejected"} 0
txs{type="total"} 4
# HELP uptime_since_genesis_ms Network up-time, from creation of the genesis block
# TYPE uptime_since_genesis_ms gauge
uptime_since_genesis_ms 529270
# HELP view_changes Number of view changes in the current round
# TYPE view_changes gauge
view_changes 0

```
