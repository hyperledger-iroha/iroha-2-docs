# Triggers

Triggers bind an event filter to an executable action. When an event matches
the trigger's filter, Iroha evaluates the trigger action as part of block
execution.

## Structure

A registered `Trigger` contains:

- `id`: a `TriggerId` wrapping a `Name`
- `action`: the executable, authority, filter, repetition policy, retry policy,
  and metadata

The action contains:

- `executable`: `Instructions`, `ContractCall`, `Ivm`, or `IvmProved`
- `repeats`: `Indefinitely` or `Exactly(n)`
- `authority`: the account that invokes the executable
- `filter`: an `EventFilterBox`
- `retry_policy`: optional retry behavior for scheduled time triggers
- `metadata`: arbitrary trigger metadata

## Event Filters

Trigger conditions use the same event-filter model as subscriptions. The
top-level event filter can match:

- pipeline events
- data events
- time events
- trigger execution events
- trigger completion events

Prefer the narrowest filter that matches the workflow. Broad filters are useful
for diagnostics, but they increase work during block execution.

See [Filters](/blockchain/filters.md) for the current filter families.

## Time Triggers

Time triggers use a time event filter. When the world state view reaches a
matching time condition, Iroha executes the trigger action under the trigger
authority. Time triggers are the trigger kind that can use the retry policy
described below.

## Repetition

`Repeats::Indefinitely` keeps a trigger active until it is unregistered.

`Repeats::Exactly(n)` allows the trigger to fire a fixed number of times. When
the count is exhausted, register a new trigger if the same behavior is needed
again.

## Authority and Permissions

The trigger authority is the account used to invoke the executable. Use a
dedicated technical account for long-lived triggers so the required permissions
are explicit and isolated from an operator's personal account.

The authority needs the permissions required by the executable instructions or
contract call. The account registering the trigger also needs permission to
register triggers under the active runtime validator.

## Retry Policy

Time triggers can opt into a retry policy. A retry policy sets:

- `max_retries`: how many retry attempts are allowed after an initial failed
  firing
- `retry_after_ms`: how long Iroha waits before a retry becomes eligible

When the retry budget is exhausted, the trigger is unregistered.

## Queries

Use the current trigger queries to inspect trigger state:

- [`FindTriggers`](/reference/queries.md#triggers-contracts-transactions-and-blocks)
- [`FindActiveTriggerIds`](/reference/queries.md#triggers-contracts-transactions-and-blocks)
- [`FindTriggerById`](/reference/queries.md#triggers-contracts-transactions-and-blocks)

See also:

- [Event trigger example](/blockchain/trigger-examples.md)
- [Events](/blockchain/events.md)
- [Instructions](/blockchain/instructions.md)
- [Permissions](/blockchain/permissions.md)
