# Events

Events are emitted when certain things happen within the blockchain, e.g. a
new account is created or a block is committed. There are different types
of events:

- pipeline events
- data events
- time events
- trigger execution events

## Pipeline Events

Pipeline events are emitted when transactions are submitted, executed, or
committed to a block. A pipeline event contains the following information:
the kind of entity that caused an event (transaction or block), its hash
and status. The status can be either `Validating` (validation in progress),
`Rejected`, or `Committed`. If an entity was rejected, the reason for the
rejection is provided.

## Data Events

Data events are emitted when there is a change related to one of the
following entities: peers, domains, accounts, asset definitions, assets,
triggers, roles, permission tokens, permission validators, or Iroha
configuration. These types of events are used in
[entity filters](./filters.md).

## Time Events

Time events are emitted when the world state view is ready to handle
[time triggers](./triggers.md#time-triggers).

## Trigger Execution Events

Trigger execution events are emitted when the
[`ExecuteTrigger`](./instructions.md#executetrigger) instruction is
executed
