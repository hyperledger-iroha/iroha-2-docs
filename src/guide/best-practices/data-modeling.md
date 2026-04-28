# Data Modeling

Ledger data should be modeled around ownership, transfer behavior,
permission boundaries, and query patterns. Choose the smallest on-chain
representation that can support auditability and deterministic execution.

## Domains and Accounts

- Use domains to represent administrative and policy boundaries. Keep
  domain names stable because they appear in account and asset identifiers.
- Avoid overloading a single account with unrelated responsibilities. Use
  separate accounts for users, services, triggers, operators, and fee
  sponsors.
- Use canonical account and domain identifiers in config and tests. Iroha
  names are case-sensitive after canonical parsing.
- Keep test and production identities visibly distinct in names, domains,
  and configuration file paths.

See [Domains](/blockchain/domains.md), [Accounts](/blockchain/accounts.md),
and [Naming](/reference/naming.md).

## Assets and NFTs

- Use numeric assets for fungible balances and transferable quantities.
- Use NFTs or domain-specific objects for uniquely owned records.
- Avoid encoding value-bearing state only in metadata. Assets and NFTs
  provide lifecycle events, transfer semantics, and permission checks that
  metadata does not.
- Define precision, supply policy, issuer responsibility, and burn/mint
  authority before exposing an asset to applications.

See [Assets](/blockchain/assets.md), [NFTs](/blockchain/nfts.md), and
[RWAs](/blockchain/rwas.md).

## Metadata

- Use metadata for compact attributes of ledger objects, such as labels,
  integration IDs, policy flags, hashes, URIs, or content-addressed
  references.
- Keep metadata keys stable and documented. Changing key names after
  clients depend on them creates a migration problem.
- Do not store large documents, logs, private user data, or high-churn
  application state directly in metadata.
- When metadata points to off-chain data, store a verifiable reference such
  as a content hash, URI, SoraFS path, manifest reference, or compact
  commitment.

See
[Metadata and Ledger Storage Choices](/guide/configure/metadata-and-store-assets.md)
and [Metadata](/blockchain/metadata.md).

## Permissions by Model

- Design roles around business operations, not around implementation
  conveniences. A role named after a job or service is easier to audit than
  a role named after a broad technical capability.
- Scope permission tokens to the smallest object that satisfies the
  workflow.
- Treat permissions for minting, burning, peer management, executor
  changes, trigger management, and metadata mutation as high-impact
  permissions.
- Add explicit revocation and rotation procedures for temporary
  permissions.

See [Permissions](/blockchain/permissions.md) and
[Permission Tokens](/reference/permissions.md).

## Query Shape

- Choose identifiers and metadata keys that support the queries your
  application will need most often.
- Paginate broad result sets and avoid user interfaces that require
  unrestricted ledger-wide scans for normal actions.
- Keep off-chain indexes reconstructible from ledger data and events
  whenever they are used for critical application behavior.
