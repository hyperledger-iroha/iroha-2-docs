# Performance and Metrics

Iroha performance depends on the workload, validator topology, network
conditions, and consensus settings. A single TPS number is therefore only useful
when it is tied to a benchmark run with a fixed configuration.

For capacity planning, treat performance as an operating envelope:

- the network accepts the requested transaction rate
- commit latency stays inside the target budget
- transaction queues stay bounded
- consensus does not rely on repeated view changes or recovery paths

Use this page to estimate whether a deployment is in a high, medium, or low
performance state for a given node count, network latency threshold, and target
TPS.

## What to Measure

Start with the operator surfaces exposed by Torii:

```bash
export TORII=http://127.0.0.1:8180

curl -s "$TORII/status" | jq .
curl -s -H 'Accept: application/json' "$TORII/v1/sumeragi/status" | jq .
curl -s "$TORII/v1/sumeragi/phases" | jq .
curl -s "$TORII/v1/sumeragi/rbc" | jq .
curl -s "$TORII/v1/sumeragi/params" | jq .
curl -s "$TORII/metrics" > metrics.prom
```

You can try the same read-only pattern against public Taira:

```bash
TAIRA=https://taira.sora.org

curl -fsS "$TAIRA/status" \
  | jq '{blocks, txs_approved, txs_rejected, queue_size, peers}'

curl -fsS "$TAIRA/v1/time/status" \
  | jq '{healthy: .health.healthy, peers, samples_used, rtt_count: .rtt.count}'

curl -fsS "$TAIRA/metrics" \
  | grep -E '^(block_height|queue_size|sumeragi_tx_queue_depth|txs|view_changes)' \
  | head -n 20
```

Public Taira metrics are useful for learning the signal names. Do not use them
as production capacity numbers for your own deployment.

The same consensus snapshots are available through the CLI:

```bash
iroha --config ./localnet/client.toml --output-format text ops sumeragi status
iroha --config ./localnet/client.toml --output-format text ops sumeragi phases
iroha --config ./localnet/client.toml --output-format text ops sumeragi rbc status
iroha --config ./localnet/client.toml ops sumeragi params
iroha --config ./localnet/client.toml ops sumeragi collectors
```

Telemetry visibility depends on the configured profile. Use `extended` when you
need `/metrics`, and use `full` during test runs when you also need the detailed
Sumeragi operator routes.

```toml
telemetry_enabled = true
telemetry_profile = "full"
```

## Performance Bands

Use these bands for an observed run at target throughput `Y` TPS and latency
budget `L` milliseconds. Run the workload long enough to include warm-up,
steady state, and at least one period of expected peak load.

| Band | Conditions | Meaning |
| --- | --- | --- |
| High | Accepted throughput is at or above `Y`, p95 commit latency is below `0.8 * L`, queues remain below 10% of capacity, and view-change/recovery counters are flat | The deployment has headroom for the requested workload |
| Medium | Accepted throughput is close to `Y`, p95 commit latency is below `L`, queues are stable below 50% of capacity, and view changes are rare | The deployment works, but there is limited burst tolerance |
| Low | Accepted throughput is below `Y`, p95 commit latency exceeds `L`, queues grow during the run, or view-change/backpressure counters rise continuously | The requested workload exceeds at least one bottleneck |

The key rule is queue direction. If submitted TPS is greater than committed TPS
and the queue keeps growing, the deployment is overloaded even if short samples
look healthy.

## Node Count and Quorum

More validators improve fault tolerance but increase coordination, signature,
and network fanout costs. In the current Sumeragi implementation:

- validator count `n` derives the fault budget `f = floor((n - 1) / 3)`
- for `n >= 4`, commit quorum is `2f + 1`
- for `n <= 3`, all validators are required for commit
- observer peers sync blocks but do not vote, propose, or collect

| Validators | Fault budget | Commit quorum | Capacity note |
| --- | --- | --- | --- |
| 1 to 3 | 0 practical offline slack | all validators | Useful for development and small tests; any missing validator can stall commits |
| 4 | 1 | 3 | Common minimum for one-fault tolerance |
| 7 | 2 | 5 | More resilient, with more vote and propagation traffic |
| 10 | 3 | 7 | Higher coordination cost; network and collector tuning matter more |

When evaluating "X nodes", separate voting validators from observers. Adding
observers usually costs less than adding validators, but observers still consume
block gossip, block sync, disk, and network bandwidth.

## Factors That Influence Performance

### Workload Shape

The same TPS can be cheap or expensive depending on what each transaction does.
Record:

- number of instructions per transaction
- signature count and signing algorithms
- transaction byte size and decompressed payload size
- read/write ratio
- metadata size and asset operations
- smart contract, trigger, and IVM execution cost
- query load running against the same peers

Small transfer transactions are not a proxy for contract-heavy or metadata-heavy
workloads.

### Consensus Timing

Sumeragi timing is controlled by the effective Sumeragi parameters:

- `block_time_ms`
- `commit_time_ms`
- `min_finality_ms`
- `pacing_factor_bps`
- NPoS phase timeouts when NPoS mode is enabled

Inspect them with:

```bash
iroha --config ./localnet/client.toml ops sumeragi params
curl -s "$TORII/v1/sumeragi/params" | jq .
```

Lower timing targets can improve latency only while the network, storage, and
execution layers can keep up. Once view changes, missing-payload fetches, or
backpressure appear, lowering timers usually makes performance worse.

### Collector Fanout

Collector settings affect how quickly commit votes converge:

- `sumeragi.collectors.k` controls how many collectors assemble votes per height
- `sumeragi.collectors.redundant_send_r` controls additional vote fanout after a
  local timeout
- `sumeragi.collectors.parallel_topology_fanout` adds topology fanout alongside
  collectors

Increasing fanout can reduce tail latency in larger or less reliable networks,
but it also increases traffic. Compare the collector plan with latency and
backpressure metrics before changing these values:

```bash
iroha --config ./localnet/client.toml ops sumeragi collectors
```

### Network Conditions

Consensus performance is sensitive to:

- RTT between validators
- jitter and packet loss
- bandwidth for block payloads and RBC chunks
- asymmetric links between regions
- NAT, firewall, or relay behavior that delays peer connectivity

As a planning rule, set the latency budget high enough to cover several
validator round trips plus execution and disk commit time. If p95 network RTT is
already close to the desired p95 commit latency, the target is not realistic.

### Queues and Admission Limits

Admission and queue settings define how much burst pressure a peer can absorb:

- `queue.capacity`
- `queue.capacity_per_user`
- `queue.transaction_time_to_live_ms`
- genesis transaction limits such as max signatures, instructions, bytes, and
  decompressed bytes
- p2p queue caps and consensus ingress limits

High queue capacity can hide overload for a while, but it does not increase
sustainable throughput. A stable queue is healthy; a growing queue is a backlog.

### Hardware and Storage

Measure every validator, not only the leader:

- CPU saturation during validation, signature verification, and execution
- memory pressure from queues, snapshots, and active RBC sessions
- disk write latency for block storage and snapshots
- network transmit/receive saturation
- optional hardware acceleration settings when used by the workload

The slowest voting validator can determine the network's tail latency.

## Prometheus Signals

Metric names can vary by build profile and feature set. Inspect `/metrics` on
your node first, then build dashboards around the available series.

Common signals include:

| Signal | Prometheus examples | What to watch |
| --- | --- | --- |
| Accepted throughput | `sum(rate(txs{type="accepted"}[5m]))` | Should meet or exceed target TPS in steady state |
| Rejections | `sum(rate(txs{type="rejected"}[5m]))` | Should be explainable by the test plan |
| Commit latency | `histogram_quantile(0.95, sum(rate(commit_time_ms_bucket[5m])) by (le))` | Compare p95/p99 with the latency budget |
| Queue depth | `queue_size`, `sumeragi_tx_queue_depth` | Should stay bounded during peak load |
| Queue saturation | `sumeragi_tx_queue_saturated` | Sustained non-zero values mean overload |
| View changes | `view_changes`, `sumeragi_view_change_suggest_total`, `sumeragi_view_change_install_total` | Rising values indicate timing, topology, payload, or network trouble |
| Dropped messages | `dropped_messages`, `sumeragi_consensus_message_handling_total` | Drops during load usually explain latency spikes |
| RBC pressure | `sumeragi_rbc_store_pressure`, `sumeragi_rbc_backpressure_deferrals_total` | Non-zero pressure points to payload recovery or storage bottlenecks |
| Commit quorum | `sumeragi_commit_signatures_counted`, `sumeragi_commit_signatures_required` | Counted signatures should reach the required quorum quickly |

When a metric exists only in `/v1/sumeragi/status`, capture the JSON snapshot in
the same run artefacts as the Prometheus scrape.

## Estimation Workflow

1. Define the scenario:
   - validator count and observer count
   - consensus mode
   - target TPS
   - p95 and p99 commit-latency budgets
   - transaction mix
   - expected network RTT, jitter, and bandwidth
2. Record the effective configuration:

   ```bash
   iroha --config ./localnet/client.toml --output-format json ops sumeragi params \
     > artifacts/sumeragi-params.json
   curl -s "$TORII/v1/sumeragi/collectors" \
     > artifacts/sumeragi-collectors.json
   ```

3. Run the workload at the target TPS.
4. Capture status and metrics at the start, middle, and end of the run.
5. Classify the run with the performance-band table.
6. If the band is Medium or Low, change one factor at a time and repeat.

## Benchmark Report Template

Publish performance numbers only with enough context to reproduce them:

- Iroha commit, release, and feature flags
- validator and observer counts
- consensus mode and Sumeragi parameters
- collector `k`, redundant send `r`, and topology fanout
- telemetry profile
- hardware, storage, and OS details
- network RTT, jitter, loss, and bandwidth assumptions
- transaction mix and payload sizes
- offered TPS and run duration
- accepted/rejected TPS
- p50/p95/p99 commit latency
- queue depth and saturation
- view changes, dropped messages, RBC pressure, and missing-payload counters
- CPU, memory, disk, and network utilization per validator

Without these details, a TPS number should be treated as anecdotal.

## Related Pages

- [Chaos Testing with Izanami](./chaos-testing.md)
- [Torii endpoints](../../reference/torii-endpoints.md)
- [Operate Iroha 3 via CLI](../../get-started/operate-iroha-2-via-cli.md)
- [Peer configuration reference](../../reference/peer-config/params.md)
