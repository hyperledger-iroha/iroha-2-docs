# Event Trigger Example

This example describes the shape of an event trigger in the current Iroha
model without depending on older `account@domain` or `asset#domain` literals.

Suppose a network has:

- a canonical account controlled by Alice's key
- a canonical account controlled by the Mad Hatter's key
- an asset definition projected as `tea` under `wonderland.universal`
- a balance of that asset held by each account

The goal is to register a trigger that observes Alice's tea balance and
submits a transfer from the Mad Hatter account when the matching data event is
emitted.

## 1. Prepare accounts and assets

Register the participating accounts and the asset definition first. In
current Iroha, account IDs come from account controllers, while projected
domains use `domain.dataspace` form:

```text
domain: wonderland.universal
asset definition projection: tea in wonderland.universal
holder accounts: AccountId(controller=alice_key), AccountId(controller=mad_hatter_key)
```

The asset definition still has a canonical opaque address. Store or query that
address after registration and use it in the trigger action.

## 2. Choose the trigger authority

Set the trigger's technical account to a dedicated account when possible. A
dedicated account makes it clear which permissions are required for trigger
execution and avoids coupling the trigger to an operator's personal signing
key.

The technical account must already exist and must have permission to submit the
instructions in the trigger executable.

## 3. Define the executable

The executable is the instruction sequence the trigger submits when the event
filter matches. For this example, it contains one transfer:

```text
Transfer(
  source = AssetId(tea_definition, mad_hatter_account),
  value = Numeric(1),
  destination = AssetId(tea_definition, alice_account)
)
```

Use the SDK's current typed builders for the final transaction payload. Avoid
hard-coding old textual IDs in trigger code; parse or query canonical IDs
before building the executable.

## 4. Define the event filter

Use a data-event filter that narrows events to the object you care about:

```text
EventFilterBox::Data(
  DataEventFilter for asset changes involving
  AssetId(tea_definition, alice_account)
)
```

Keep filters as specific as practical. An `AcceptAll` filter is useful for
debugging, but it makes every matching event pay the cost of trigger
evaluation.

## 5. Register the trigger

Register the trigger with:

- a stable `TriggerId`
- the executable instruction sequence
- `Repeats::Indefinitely` or `Repeats::Exactly(n)`
- the technical account
- the event filter
- optional metadata

Trigger registration itself is a normal transaction, so the registering
account needs permission to register triggers. The technical account needs the
permissions required by the trigger executable.

## Execution order

When a block executes:

1. Normal transaction instructions run first.
2. Data events produced by those instructions are collected.
3. Triggers whose filters match those events are scheduled.
4. Trigger-produced effects are handled in the block execution pipeline without
   allowing unbounded recursive trigger execution.

If a trigger uses `Repeats::Exactly(n)`, register a new trigger when the count
is exhausted and the same behavior is needed again.
