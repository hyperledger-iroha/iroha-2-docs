# Chaos Testing with Izanami

Izanami is the chaosnet orchestrator in the upstream Iroha workspace. It
starts a disposable local Iroha cluster, submits a configurable workload,
and injects faults into selected peers so operators can check whether the
network keeps making progress under controlled failure.

Use Izanami for pre-production resilience checks, regression reproduction,
and consensus tuning. Do not point it at a production network: the tool is
designed to own the peers it starts, including peer restarts, storage
wipes, artificial packet loss, and local CPU or disk pressure.

## Prerequisites

Run Izanami from the
[`i23-features` branch of the Iroha repository](https://github.com/hyperledger-iroha/iroha/tree/i23-features),
not from this documentation repository:

```bash
git clone --branch i23-features https://github.com/hyperledger-iroha/iroha.git
cd iroha
cargo build -p izanami
```

The binary must be explicitly allowed to create and manipulate networked
peers. Pass `--allow-net` for every non-TUI run, or enable `allow_net` in
the TUI.

```bash
cargo run -p izanami -- --allow-net --peers 4 --faulty 1 --duration 120s
```

For an interactive run configuration:

```bash
cargo run -p izanami -- --tui --allow-net
```

Izanami persists TUI and CLI settings under the user config directory, so
review the displayed settings before reusing a previous profile.

## Baseline Run

Start with one reproducible baseline before adding severe faults:

```bash
cargo run -p izanami -- \
  --allow-net \
  --peers 4 \
  --faulty 1 \
  --duration 5m \
  --target-blocks 100 \
  --progress-interval 15s \
  --progress-timeout 120s \
  --latency-p95-threshold 2s \
  --tps 15 \
  --max-inflight 32 \
  --submitters 1 \
  --seed 42
```

This run succeeds only if the cluster reaches the requested block target,
keeps making progress within the timeout, and stays under the optional p95
block interval threshold.

Record the command, seed, Iroha commit, peer count, faulty-peer count,
workload profile, target TPS, and latency threshold with the logs. Without
these values, another operator cannot replay the same failure pattern.

## Workload Profiles

Izanami has two workload profiles:

| Profile  | Use it for                                         | Notes                                  |
| -------- | -------------------------------------------------- | -------------------------------------- |
| `stable` | Long soak runs and reproducible performance checks | Favors execution-safe recipes          |
| `chaos`  | Failure-path coverage                              | Includes intentionally invalid recipes |

Use the stable profile first:

```bash
cargo run -p izanami -- --allow-net --workload-profile stable --seed 42
```

Switch to the chaos profile when the baseline is already understood:

```bash
cargo run -p izanami -- --allow-net --workload-profile chaos --seed 42
```

Contract deployment recipes are disabled in stable runs unless explicitly
allowed:

```bash
cargo run -p izanami -- \
  --allow-net \
  --workload-profile stable \
  --allow-contract-deploy-in-stable
```

Use `--nexus` when the run should use the embedded SORA Nexus defaults from
the upstream workspace.

## Fault Controls

When `--faulty` is greater than zero, at least one fault scenario must be
enabled. Fault toggles default to enabled, and boolean flags can be
disabled with `=false`.

| Fault                    | CLI flag                                   | What it exercises                          |
| ------------------------ | ------------------------------------------ | ------------------------------------------ |
| Crash and restart        | `--fault-enable-crash-restart`             | Peer process loss and recovery             |
| Wipe storage and restart | `--fault-enable-wipe-storage`              | Recovery from missing local state          |
| Invalid transaction spam | `--fault-enable-spam-invalid-transactions` | Admission and rejection paths              |
| Network latency          | `--fault-enable-network-latency`           | Slow gossip and delayed consensus messages |
| Network partition        | `--fault-enable-network-partition`         | Temporary trusted-peer isolation           |
| P2P packet loss          | `--fault-enable-network-packet-loss`       | Dropped application-frame traffic          |
| CPU stress               | `--fault-enable-cpu-stress`                | Local validation and scheduling pressure   |
| Disk saturation          | `--fault-enable-disk-saturation`           | Local storage pressure                     |

For a packet-loss-only run:

```bash
cargo run -p izanami -- \
  --allow-net \
  --peers 20 \
  --faulty 5 \
  --duration 800s \
  --fault-window-start 133s \
  --fault-window-end 266s \
  --tps 200 \
  --submitters 20 \
  --max-inflight 512 \
  --fault-enable-crash-restart=false \
  --fault-enable-wipe-storage=false \
  --fault-enable-spam-invalid-transactions=false \
  --fault-enable-network-latency=false \
  --fault-enable-network-partition=false \
  --fault-enable-network-packet-loss=true \
  --fault-enable-cpu-stress=false \
  --fault-enable-disk-saturation=false \
  --fault-network-packet-loss-percent 75 \
  --seed 42
```

Use `--fault-window-start` and `--fault-window-end` to keep a controlled
steady-state period before and after the injected failure. This makes it
easier to distinguish startup noise from the effect of the fault.

## Scenario Shapes

The upstream Izanami catalog maps common blockchain communication-failure
shapes to CLI profiles. You can model them with the same flags:

| Scenario              | Typical shape                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Targeted load         | `--faulty 0`, high `--tps`, one submitter, high `--max-inflight`                                                         |
| Transient failure     | Enable crash/restart only inside a bounded fault window                                                                  |
| Packet loss           | Enable packet loss only, usually with the default 75% loss rate                                                          |
| Stopping and recovery | Use a large faulty-peer population with crash/restart                                                                    |
| Leader isolation      | Use exactly one faulty peer with only network-partition or packet-loss faults; Izanami follows Sumeragi leader telemetry |

Keep one variable fixed at a time. If you change peer count, workload
profile, fault window, and TPS in the same run, the result is difficult to
interpret.

## What to Watch

During the run, watch the same signals used for performance validation:

- block-height progress across every running peer
- submitted, accepted, rejected, and timed-out transactions
- queue depth, queue saturation, and endpoint backpressure
- view changes, recovery paths, missing blocks, and missing quorum
  certificates
- RBC backlog, pending sessions, and dropped or delayed consensus traffic
- CPU, memory, disk, and network saturation on the host running the peers

For validation-latency analysis, enable main-loop debug logs:

```bash
RUST_LOG=iroha_core::sumeragi::main_loop=debug \
  cargo run -p izanami -- --allow-net --seed 42
```

Each block should emit `block validation timings` with `stateless_ms`,
`execution_ms`, and `total_ms`. Compare those timings with p95 block
intervals, view-change counters, and queue pressure before changing
consensus timers.

## Interpreting Results

Treat a run as healthy when all selected peers continue to commit blocks,
backlog does not grow without bound, and faults stop causing new recovery
activity after the configured window ends.

Treat a run as a failure when:

- block progress stalls longer than `--progress-timeout`
- peer heights diverge and do not reconverge
- p95 latency exceeds `--latency-p95-threshold`
- queues grow for the rest of the run after a fault window closes
- rejected or timed-out transactions are not explained by the selected
  workload
- peer restart, storage wipe, or packet-loss recovery requires manual
  cleanup

After a failure, rerun with the same seed and one fewer fault type. This
keeps the workload and timing reproducible while narrowing the failure
surface.

## Related Pages

- [Performance and Metrics](./metrics.md)
- [Running Iroha on Bare Metal](./running-iroha-on-bare-metal.md)
- [Torii endpoints](../../reference/torii-endpoints.md)
