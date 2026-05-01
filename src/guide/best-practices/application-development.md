# Application Development

Iroha applications should make transaction behavior explicit, keep signing
state contained, and use queries and events in ways that are easy to
observe in production.

## Client Setup

- Store client configuration outside application source code. Load the
  chain ID, Torii URL, signing account, and transaction settings from
  environment-specific config.
- Keep `client.toml` files separate for localnet, Taira, Minamoto, and
  private networks. A copied testnet signer should never become a mainnet
  signer.
- Set transaction lifetimes and status timeouts deliberately. A very short
  lifetime can expire under normal network jitter, while a very long one
  can make duplicate submissions harder to reason about.
- Use `nonce = true` only when repeated transactions should have distinct
  hashes. For idempotent business operations, store and reuse an
  application request ID so retries are traceable.

See [Client Configuration](/guide/configure/client-configuration.md) for
the current TOML fields.

## Transactions

- Build transactions from typed SDK instructions where possible instead of
  raw JSON or string-assembled payloads.
- Preflight important writes with read-only queries: account existence,
  asset balances, permission state, fee asset availability, and target
  object state.
- Record the transaction hash, authority account, instruction summary, and
  expected state change before submitting.
- Treat `Rejected`, `Expired`, and timeout outcomes differently. A timeout
  means the client did not observe a final status; it does not prove that
  the network ignored the transaction.
- After a successful write, verify the resulting state with a query or
  event checkpoint that matches the business operation.

For transaction mechanics, see [Transactions](/blockchain/transactions.md).

## Queries and Events

- Use queries for current state and event streams for change notifications.
  Avoid replacing event handling with repeated broad queries.
- Paginate broad iterable queries such as account, asset, and block
  listings.
- Prefer narrow filters for subscriptions and triggers. Broad filters are
  useful for diagnostics but can add unnecessary execution and client-side
  processing.
- Keep read-only smoke checks separate from signed transaction tests so
  endpoint availability is easier to diagnose.

See [Queries](/blockchain/queries.md), [Events](/blockchain/events.md), and
[Filters](/blockchain/filters.md).

## Agent-Assisted Development

- Let agents inspect docs, SDK code, and read-only network state before
  asking them to write transaction code.
- Keep live-network tests opt-in behind an environment flag such as
  `TAIRA_LIVE=1`.
- Do not paste private keys, account recovery material, API tokens, or
  forwarded auth headers into prompts.
- Require a transaction plan before any agent submits a live testnet
  transaction. The plan should name the network, authority, instructions,
  fee asset, preflight reads, expected result, and retry behavior.

For the Taira MCP workflow, see
[Build on SORA 3: Taira and Minamoto](/get-started/sora-nexus-dataspaces.md#taira-mcp-for-agents).

## SDK Hygiene

- Pin SDK and binary versions together using the
  [Compatibility Matrix](/reference/compatibility-matrix.md).
- Keep generated client code, snippets, and examples synchronized with the
  upstream workspace rather than copying older Iroha 2 examples forward.
- Add unit tests for transaction-building code and integration tests for
  the smallest read and write paths your application depends on.
