# Security and Access

Security practice in Iroha should be based on narrow authority, controlled
key custody, explicit network exposure, and auditable changes.

## Key Custody

- Generate production keys with production-grade entropy and store private
  keys outside repositories, issue trackers, prompts, chat logs, and CI
  output.
- Use separate key material for clients, peers, genesis signing,
  validators, fee sponsors, and technical accounts.
- Rotate keys according to a written process and rehearse recovery before a
  live incident.
- Use hardware-backed or operating-system-backed storage for high-value
  signing keys when the deployment risk justifies it.

See
[Generating Cryptographic Keys](/guide/security/generating-cryptographic-keys.md)
and
[Storing Cryptographic Keys](/guide/security/storing-cryptographic-keys.md).

## Permissions

- Grant the smallest permission token or role that supports the workflow.
- Prefer dedicated technical accounts for services, triggers, agents, and
  automation. Avoid running long-lived automation through a personal
  operator account.
- Review permissions for peer management, metadata mutation, minting,
  burning, trigger registration, executor changes, and SORA/Nexus
  governance before production launch.
- Revoke temporary permissions after the maintenance window or migration
  that required them.

See [Permissions](/blockchain/permissions.md) and
[Permission Tokens](/reference/permissions.md).

## Network Exposure

- Restrict peer-to-peer, Torii, telemetry, and operator routes according to
  the environment. Public read access does not imply public write or
  operator access.
- Use VPNs, firewalls, reverse proxies, TLS termination, and rate limits
  where appropriate for the deployment.
- Keep basic-auth credentials, proxy tokens, and forwarded headers out of
  committed config.
- Test that unauthorized clients cannot reach restricted routes.

See [Virtual Private Networks](/guide/security/vpn.md) and
[Torii Endpoints](/reference/torii-endpoints.md).

## Fraud and Abuse Monitoring

- Monitor ledger events and operational signals for unexpected asset
  movement, permission grants, trigger changes, peer changes, and repeated
  rejected transactions.
- Preserve evidence with transaction hashes, block heights, event records,
  logs, and status snapshots.
- Route alerts to the security, operations, and business owners responsible
  for the affected assets or workflows.

See [Fraud Monitoring](/guide/security/fraud-monitoring.md).

## Agent and Automation Guardrails

- Start automation with read-only permissions and add write authority only
  after the workflow is reviewed.
- Require explicit human approval for live-network mutations unless the
  automation is a deliberately deployed production service.
- Do not expose private keys to agent prompts. Use local code that loads
  secrets from environment variables, keychains, hardware signers, or
  ignored config files.
- Log automation decisions in a way that supports audits without leaking
  secret material.
