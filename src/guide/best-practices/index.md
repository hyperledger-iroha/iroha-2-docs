# Best Practices

This section collects production-oriented guidance for Iroha applications
and networks. It is organized by the decision you need to make, not by the
feature that happens to implement it.

Use it as a checklist before a shared testnet rehearsal, a production
launch, or a major client release.

## Categories

| Category                                                | Focus                                                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [Application Development](./application-development.md) | Client configuration, transaction submission, retries, events, queries, and agent-assisted development |
| [Data Modeling](./data-modeling.md)                     | Domains, accounts, assets, NFTs, metadata, off-chain data, and naming conventions                      |
| [Network Deployment](./network-deployment.md)           | Genesis, topology, peer keys, Torii exposure, consensus settings, and environment separation           |
| [Operations](./operations.md)                           | Observability, runbooks, backups, change management, capacity checks, and incident handling            |
| [Security and Access](./security-and-access.md)         | Secret handling, permissions, technical accounts, network access, and audit trails                     |
| [Release Readiness](./release-readiness.md)             | Localnet, Taira, Minamoto, compatibility checks, live-network safeguards, and rollback planning        |

## Cross-Cutting Rules

- Keep local development, shared testnet, and production configuration
  separate.
- Treat genesis, peer topology, executor policy, and key material as
  controlled deployment artifacts.
- Model durable ledger state intentionally. Do not use metadata as a
  dumping ground for large, private, or high-churn data.
- Submit transactions through idempotent workflows that can handle
  rejection, expiry, retries, and delayed status.
- Prefer narrow permissions, dedicated technical accounts, and explicit
  operational runbooks over broad administrator access.
- Prove behavior on a disposable local network first, then rehearse on
  Taira or another shared testnet before any mainnet operation.

## Related References

- [Configuration and Management](/guide/configure/overview.md)
- [Security](/guide/security/)
- [Performance and Metrics](/guide/advanced/metrics.md)
- [Compatibility Matrix](/reference/compatibility-matrix.md)
- [Torii Endpoints](/reference/torii-endpoints.md)
- [Permission Tokens](/reference/permissions.md)
