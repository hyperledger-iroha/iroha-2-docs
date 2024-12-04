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

**Example**:

```bash
$ curl http://127.0.0.1:8180/metrics
```

This returns a result similar to the following:

```bash
# HELP blocks_height Total number of blocks in chain
# TYPE blocks_height gauge
blocks_height 135543
# HELP peers_number Total number peers to send transactions and request proposals
# TYPE peers_number gauge
peers_number 7
# HELP number_of_domains Total number of domains in WSV
# TYPE number_of_domains gauge
number_of_domains 14
# HELP total_number_of_transactions Total number of transactions in blockchain
# TYPE total_number_of_transactions gauge
total_number_of_transactions 216499
# HELP number_of_signatures_in_last_block Number of signatures in last block
# TYPE number_of_signatures_in_last_block gauge
number_of_signatures_in_last_block 5
```
