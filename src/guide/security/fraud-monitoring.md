# Fraud Monitoring

Fraud monitoring for an Iroha deployment is an operational control built around
ledger events, queries, permissions, and application context. Iroha records what
was submitted, accepted, rejected, and committed. Your monitoring system decides
which patterns are suspicious for your business process and routes those cases
to reviewers or automated response controls.

Treat fraud monitoring as a separate service rather than logic embedded in a
validator. The service should subscribe to ledger activity, enrich it with
off-chain risk context, persist evidence, and submit response transactions only
through accounts that have explicit permissions.

## Monitoring Model

A useful monitoring pipeline has four stages:

1. **Collect** ledger and operator signals from Torii event streams, queries,
   and metrics.
2. **Enrich** events with off-chain context such as customer status,
   counterparty lists, application session identifiers, expected limits, and
   case IDs.
3. **Detect** suspicious behavior with deterministic rules, reviewer queues, or
   risk scoring.
4. **Respond** by alerting operators, pausing application-side workflows,
   revoking unnecessary permissions, or submitting compensating transactions
   when your governance process allows it.

Keep policy decisions outside consensus unless every validator must replay the
same decision. Runtime validation should enforce permissions and transaction
validity. Fraud monitoring should explain risk, preserve evidence, and help
operators act quickly.

## Signals to Collect

Start with narrow subscriptions and add broader streams only for investigation:

| Signal | Source | Use |
| --- | --- | --- |
| Transaction status | Pipeline events | Detect repeated rejections, failed authorization attempts, and unusual submission patterns |
| Account lifecycle and metadata | Data events and account queries | Detect new accounts, alias changes, identity updates, and unexpected metadata edits |
| Asset balances and transfers | Asset data events and asset queries | Detect high-value movement, rapid fan-out, balance drains, and unusual counterparties |
| Roles and permissions | Role and permission queries, role data events | Detect privilege escalation, emergency grants, and stale high-risk access |
| Trigger and contract changes | Trigger, contract, and executor events | Detect new automation, changed execution paths, and suspicious upgrade activity |
| Configuration and peer changes | Configuration and peer events | Detect governance changes that affect validation, networking, or operator visibility |
| Operator health | `/metrics` and Sumeragi status routes | Separate suspicious user behavior from node overload, queue pressure, or network faults |

Use [event filters](/blockchain/filters.md) to avoid processing the entire event
stream when a rule only needs accounts, assets, roles, or configuration changes.
For periodic reconciliation, combine the stream with paginated
[queries](/blockchain/queries.md) so the monitor can recover after downtime.

## Detection Rules

Common rule families include:

| Rule family | Example condition | Typical response |
| --- | --- | --- |
| Velocity | An account transfers more than the expected amount or count within a short window | Alert reviewers and pause application-side withdrawals for that account |
| Fan-out | Funds move from one account to many newly seen accounts | Require manual approval before allowing additional transfers |
| Balance drain | A large share of an account balance leaves shortly after a key, alias, or metadata change | Escalate as possible account takeover |
| Privilege escalation | A high-risk permission or role is granted outside a change window | Alert operators and review the grant transaction |
| Rejection burst | One signer or client produces repeated rejected transactions | Check for credential abuse, integration errors, or probing |
| Automation change | A trigger, contract, or executor-related object changes unexpectedly | Pause dependent workflows until the change is reviewed |
| Governance-sensitive change | Peer, configuration, or runtime state changes occur without an approved ticket | Compare against the governance record and incident process |

Rules should be explicit about the evidence they require, the time window they
evaluate, the action they take, and the person or system that can close the
case. Thresholds that depend on customer risk, asset type, or jurisdiction
belong in your monitoring service configuration, not in ad hoc scripts.

## Response Controls

Design response actions before enabling alerts. A high-severity fraud case
should have a documented path from detection to containment:

- notify the security, operations, and business owners responsible for the
  affected domain or asset definition
- preserve the event cursor, block hash, transaction hash, authority, payload,
  and query snapshot used by the detection rule
- pause application-side actions that are outside the ledger, such as checkout,
  withdrawal, signing, bridge, or settlement workflows
- revoke roles or permissions that are no longer justified by the incident
  response plan
- submit follow-up ledger transactions only when the active governance policy
  and permission model allow them
- rotate keys when the evidence suggests signer compromise

Avoid giving the monitoring service broad write access. Use a dedicated
technical account with the smallest set of permissions required for the response
actions it is allowed to perform. Human approval should remain part of any
workflow that can move assets, change permissions, or alter validator-facing
configuration.

## Evidence and Retention

Store monitoring evidence in an append-only system that is separate from the
validator data directory. Each alert should include:

- event stream name and cursor
- block height or block hash when available
- transaction hash and authority
- affected account, domain, asset, role, trigger, or configuration ID
- raw event payload or a canonical hash of it
- query snapshots used to enrich the alert
- rule name, version, threshold, score, and reviewer decision

Do not store sensitive investigation notes as public ledger metadata unless the
network's data governance policy explicitly allows it. If you need to link an
off-chain case to on-chain state, prefer a case identifier, signed attestation,
or hash commitment that does not expose private details.

## Implementation Checklist

- Enable the telemetry profile needed for `/metrics` and operator routes.
- Subscribe to Torii event streams with narrow filters for the objects you
  monitor.
- Persist event cursors so the monitor can resume without gaps.
- Reconcile streams with paginated queries on a regular schedule.
- Keep risk thresholds and allow lists in version-controlled configuration.
- Test alert rules against historical blocks before enabling automated actions.
- Use dedicated technical accounts for response actions.
- Review role and permission grants on a recurring schedule.
- Include fraud-monitoring alerts in the incident response process.

## Related Pages

- [Events](/blockchain/events.md)
- [Filters](/blockchain/filters.md)
- [Queries](/blockchain/queries.md)
- [Permissions](/blockchain/permissions.md)
- [Performance and Metrics](/guide/advanced/metrics.md)
- [Torii endpoints](/reference/torii-endpoints.md)
- [Operational Security](/guide/security/operational-security.md)
