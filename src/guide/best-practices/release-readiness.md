# Release Readiness

Before promoting an Iroha application or network change, prove the behavior
in the smallest environment that can expose the relevant risk, then move
through shared testnet and production gates deliberately.

## Localnet Gate

- Launch a disposable local network with the same Iroha track and the
  closest practical validator count.
- Run unit tests for transaction builders, query parsing, rejection
  handling, and config loading.
- Exercise the smallest successful read and write paths through the same
  SDK or CLI shape the application will use later.
- Capture expected transaction hashes, statuses, events, and state reads in
  test artifacts.

See [Launch Iroha 3](/get-started/launch-iroha-2.md) and
[SDK Tutorials](/guide/tutorials/).

## Shared Testnet Gate

- Use Taira or another shared testnet for endpoint behavior, fees, account
  funding, latency, and operational rehearsals.
- Keep live testnet writes opt-in so ordinary test runs do not depend on
  network availability or spend testnet funds.
- Verify signer funding, fee asset metadata, authority permissions, and
  expected state before submitting each live test transaction.
- Wait for a terminal status, then verify the resulting state with a
  read-only query.

See
[Build on SORA 3: Taira and Minamoto](/get-started/sora-nexus-dataspaces.md).

## Mainnet or Production Gate

- Use separate production signers, funding, domains, and config paths. Do
  not promote testnet keys or faucet assumptions.
- Confirm SDK, CLI, peer, and network compatibility with the
  [Compatibility Matrix](/reference/compatibility-matrix.md).
- Review permissions, fee sponsorship, rate limits, monitoring, backup
  status, and rollback criteria before the release window.
- Require a written transaction or migration plan for high-impact writes.

## Rollback and Recovery

- Define which changes can be rolled back by code deploy, which require an
  on-chain transaction, and which cannot be undone directly.
- For on-chain data changes, prepare compensating transactions or migration
  scripts before the first production write.
- For network changes, keep the previous binary, config bundle, signed
  genesis, and operational runbook available during the release.
- Set a decision point for aborting the rollout based on objective signals
  such as rejection rate, queue growth, latency, or peer health.

## Final Checklist

- Configuration is environment-specific and does not contain test-only
  secrets.
- Transaction retry behavior is idempotent or explicitly bounded.
- The application can distinguish rejection, expiry, timeout, and endpoint
  availability failures.
- Monitoring covers throughput, latency, queue depth, rejections, view
  changes, and relevant business events.
- Operators have runbooks for expected failure modes.
- Security review covered key custody, permissions, network exposure, and
  automation authority.
