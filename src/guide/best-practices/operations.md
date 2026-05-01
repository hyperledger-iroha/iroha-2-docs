# Operations

Operational readiness means that the network can be observed, changed,
backed up, and recovered without relying on improvised access to validator
hosts.

## Observability

- Enable telemetry profiles intentionally. Use `extended` when `/metrics`
  is needed and `full` during test runs that need detailed Sumeragi
  operator routes.
- Dashboard accepted throughput, rejected throughput, commit latency, queue
  depth, queue saturation, view changes, dropped consensus messages, and
  storage pressure.
- Keep status snapshots, metrics scrapes, logs, and deployment
  configuration in the same incident or benchmark artifact set.
- Alert on sustained queue growth, unexpected rejection spikes, stalled
  block height, view-change churn, and peer health changes.

See [Performance and Metrics](/guide/advanced/metrics.md).

## Runbooks

- Write runbooks for peer restart, Torii degradation, key compromise,
  permission mistakes, fee sponsor depletion, stuck queues, and network
  partition symptoms.
- Include exact read-only checks before write operations, especially for
  peer registration, permission grants, and parameter changes.
- Keep emergency contacts and escalation rules outside the docs repo if
  they include private operational data.
- Review runbooks after every incident, rehearsal, or major upgrade.

See [Operational Security](/guide/security/operational-security.md).

## Backups and Recovery

- Back up peer storage according to the recovery point required by the
  deployment. Validate restores on non-production hosts.
- Keep signed genesis, release metadata, peer config, and key custody
  records recoverable even if a validator host is unavailable.
- Document whether a recovery procedure rebuilds from genesis, restores
  from a snapshot, or replaces a failed peer with a new identity.
- Never test restore procedures for the first time during a production
  incident.

## Change Management

- Treat on-chain configuration changes as transactions that require review,
  preflight reads, authorization, and post-change verification.
- Roll out peer binary upgrades with a compatibility plan and a rollback
  decision point.
- Avoid changing peer topology, consensus timing, and application workload
  in the same maintenance window unless the migration plan requires it.
- Record the transaction hashes and block heights for operational changes.

See [Hot Reload](/guide/advanced/hot-reload.md) and
[Compatibility Matrix](/reference/compatibility-matrix.md).

## Capacity Reviews

- Re-run load checks when validator count, hardware, network placement,
  workload mix, or consensus parameters change.
- Measure warm-up, steady state, and expected peak load rather than relying
  on a short best-case throughput sample.
- Compare accepted throughput with committed throughput and queue depth. If
  submitted TPS exceeds committed TPS and queues grow, the network is past
  its sustainable envelope.
