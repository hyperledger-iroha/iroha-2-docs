# Filters

Filters narrow event streams and trigger conditions. The current top-level
event filter is `EventFilterBox`, which can match these event families:

- `Pipeline`
- `Data`
- `Time`
- `ExecuteTrigger`
- `TriggerCompleted`

Use the narrowest filter that matches the workflow. Broad filters such as
`DataEventFilter::Any` are useful for diagnostics, but they make every event
pay the cost of trigger or subscriber matching.

## Data Event Filters

`DataEventFilter` matches ledger data events. Its current variants include:

| Variant | Event family |
| --- | --- |
| `Any` | Any data event |
| `Peer` | Peer lifecycle events |
| `Domain` | Domain lifecycle and metadata events |
| `Account` | Account lifecycle, metadata, alias, and identity events |
| `Asset` | Asset balance and metadata events |
| `AssetDefinition` | Asset definition lifecycle, policy, and metadata events |
| `Nft` | NFT lifecycle and metadata events |
| `Rwa` | Real-world-asset lifecycle events |
| `Trigger` | Trigger lifecycle and metadata events |
| `Role` | Role lifecycle events |
| `Configuration` | On-chain configuration events |
| `Executor` | Runtime executor events |
| `Proof` | Proof verification lifecycle events |
| `Confidential` | Confidential asset events |
| `VerifyingKey` | Verifying-key registry events |
| `RuntimeUpgrade` | Runtime upgrade events |
| `Soradns` | Resolver directory governance events |
| `Sorafs` | SoraFS gateway compliance events |
| `SpaceDirectory` | Space Directory manifest lifecycle events |
| `Escrow` | Native asset escrow lifecycle events |
| `Offline` | Offline settlement events |
| `Oracle` | Oracle feed events |
| `Social` | Viral incentive events |
| `Bridge` | Bridge events |
| `Governance` | Governance events when the governance feature is enabled |

Most concrete filters also allow an optional ID matcher and an event-set mask.
For example, an asset filter can match one asset or one class of asset events,
while a trigger filter can match a trigger ID and a trigger event set.

## Pipeline Filters

Pipeline filters match processing events such as block, transaction, merge,
and witness events. Use them for operational subscriptions, block-processing
dashboards, and triggers that react to pipeline state rather than ledger data
objects.

## Trigger Filters

Triggers store their condition as an `EventFilterBox`. A trigger action also
stores:

- an executable
- a repetition policy
- an authority account
- an optional time-trigger retry policy
- metadata

The trigger authority must have the permissions required by the executable.
Prefer dedicated technical accounts for long-lived triggers.

## Query Filters

Query filters are separate from event filters. Iterable queries can expose
predicate and selector support. Use query-specific typed filters from the SDK
so the filter input matches the query output type.

See also:

- [Events](/blockchain/events.md)
- [Triggers](/blockchain/triggers.md)
- [Queries](/blockchain/queries.md)
- [Query reference](/reference/queries.md)
