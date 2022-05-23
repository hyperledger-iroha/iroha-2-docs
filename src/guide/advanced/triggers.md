# Triggers

The basic premise is that certain things can emit events: it could be a
change of the state of some entity, e.g. an account, and/or a domain (you
can't modify an account without changing the domain that it belongs to, but
you can change the domain without touching any of its accounts), but it
could also be the block being committed, some point in time being crossed,
or even a direct signal emitted by executing a special ISI. All of these
are events that triggers can be attached to.

A trigger is a fairly basic entity that can be registered. Just like with
Accounts, you submit a `RegisterBox::Trigger`, which contains the necessary
information. This information is a single account ID, which should ideally
be a brand new account that you register in the same transaction (but for
now it doesn't matter); an executable, which itself is either a
`Vec<Instruction>` or a WASM blob; and an `EventFilter`, something which
combs through (at this point all) events and returns `true` when it finds
an event that you like to start the execution.

The documentation on the `EventFilter` types is under construction, as we
are likely to make major changes to that particular architecture. For now,
suffice it to say that you can look at the source code in
`iroha_data_model` and see a few particularly interesting applications.

## Triggers in More Detail

<!-- We should probably have a Queen of Hearts here, as we have a lot of `execute`, `trigger` and `block` -->

### Supported ISI

- `Register<Trigger>`: Create a trigger object, and subscribe it to global
  events.

- `Unregister<Trigger>`: Remove a trigger from the World State View and
  stop passing it events.

- `Mint<Trigger, u32>`: For triggers that repeat a set number of times,
  increase the number of times that the trigger gets executed. Can be done
  from inside the executable of the trigger.

- `Burn<Trigger, u32>`: For triggers that repeat a set number of times,
  decrease the number of times that the trigger gets executed.

::: Tip

If the number provided is greater than the remaining number of repetitions,
the instruction will fail to execute, and the transaction that it's part of
will, be rejected.

:::

### Supported queries

None yet.

## The Anatomy of a Trigger

A trigger has the following rough form:

```rust
struct Trigger {
  id: TriggerId,
  action: Action,
  metadata: Metadata,
}
```

Where the `TriggerId` is a simple wrapper around a single `Name`, i.e.
string with no white-space and no reserved characters (`@`, `#`). In the
future, we shall add scoped triggers, and the Id will be expanded to be
either a global trigger, or a trigger with a domain name. This is what
determines the scope of the trigger.

`Metadata` is the same kind of `Metadata` that can be attached to accounts,
domains, assets and even transactions.

An `Action` is the heart of the trigger.

```rust
struct Action {
  executable: Executable,
  repeats: Repeats,
  technical_account: AccountId,
  filter: EventFilter
}
```

Here the executable is either a `Vec<Instruction>` or a WASM binary. The
`Repeats` is a universal enumeration of all possible repetition schemes.

```rust
enum Repeats {
  Indefinitely,
  Exactly(u32),
}
```

A technical account is the account that would (in theory) be responsible
for the execution environment and be the authority for `Instruction`
execution. You can (for now) leave this to be the account that registered
the trigger, that is, if you followed the tutorial, `alice@wonderland`.
However, later on we will show you why you'd want to create a brand new
account for those purposes.

A filter is what determines the _kind_ of trigger that you're dealing with.
All triggers respond to events, but the precise type of event that
activates a trigger depends on which `EventFilter` was used.

The reason why we chose this architecture is simple; front end code has an
abundance of event filters, and so, your knowledge of filters is
transferable to writing smartcontracts.

## How Triggers Work

Once we're done with triggers, you will have the following basic types:

- Event triggers
- Timed triggers
- By-call triggers
- Block-based triggers

Each of these shall be covered in its own right, and some information shall
be provided on how to use each of them in detail. Both this tutorial and
triggers themselves are under construction; some triggers don't exist yet,
while the API of others will change drastically in the following release.
We shall do our best to describe all of what we can, with as much detail as
we can, and clearly signpost which parts of this tutorial will be made
obsolete in the next release.

### Event Triggers

As we have said previously, all triggers are, in a sense, event triggers.
However, this category includes the largest variety of triggers: an account
got registered, an asset got transferred, the Queen of Hearts decided to
burn all of her assets. These types of events account for the vast majority
of triggers in Ethereum, and were the first to be implemented. As of today
we only support un-scoped system-wide triggers with no permission
validation. Work is ongoing to make the triggers more safe and reliable,
but the process is time-consuming and work-intensive.

::: info

Be mindful of the limitations. Currently triggers don't check for
permissions, so they can do things your account wouldn't be allowed to.
Since the triggers are not scoped, every trigger processes _every_ event,
and the amount of work grows quadratically.

:::

Each such trigger can be set to repeat either `Indefinitely` or
`Exactly(n)` times, where `n` is a 32-bit integer. Once the number of
repetitions reaches zero, the trigger is gone. That means that if your
trigger got repeated exactly `n` times, you can't `Mint` new repetitions,
you have to `Register` it again, with the same name.

TODO: test if reaches zero needs to re-register.

### Timed Triggers

They are the same as event triggers, but they behave slightly™ differently.
Instead of processing all the events generated by normal transactions, all
timed triggers process one event: the block formation event. Specifically,
the filters are only interested in the timestamp provided in that event,
but not the block height, and not the current time.

When going through consensus, all peers must agree on which triggers got
executed. Timed triggers can't use real time, because you can easily create
a situation when they would never agree: just make sure that the
`Repeats::Indefinitely` trigger has a period that's smaller than the time
it takes to pass consensus. It's really that simple. So instead of using
the actual current time at each peer, we use the time when the block got
started plus a small offset. All triggers before that point in time get
executed. All triggers that would have executed after that time wait until
the next block.

The reason why we add this offset has to do with Iroha being _best effort_.
Imagine if we didn't have the offset... Normally, triggers would be set to
nice round numbers; e.g. `12:00`, `12:05`, `11:55`, etc. (as opposed to
e.g. `11:59`). However, the consensus can start at any point in time and
could last a while. Suppose that the block started to form at `11:56` and
consensus finished at `12:03` (which is optimistically quick). If your
trigger was supposed to run at `11:55` you'd be happy, since your trigger
got executed just 1 minute late. If yours was supposed to run at `12:05`,
it will get run in the next block, but if you're the author, and you're
looking at the time stamp of `12:03` it makes sense, your trigger wasn't
supposed to run yet. For the trigger scheduled for `12:00` the situation is
different. You look at the clock, you see `12:03` which is when the
blockchain explorer shows you the block data committed, but you don't see
your trigger. It was supposed to run, but didn't.

So, the offset is meant to anticipate when the block would get added to the
chain, so that people who were just 4 minutes early don't have to be
potentially several hours late. Because more triggers get executed sooner,
your throughput is also infinitesimally smaller. We could also say "you
should aim to execute your trigger slightly earlier than consensus starts",
but people writing smartcontracts already have too much to worry about.

### Pre-commit Triggers

This is a variant of timed triggers that gets run before transactions get
committed. In reality it triggers in the next block, by leaving a special
event, but it is effectively a delayed pre-commit that can track the
behaviour of transactions in the pipeline.

::: info

These triggers are not meant for restricting the execution of transactions.
If you want to stop your users from transferring more than X amount of Y to
user Z, you really want a _permission_. While you could hack the pre-commit
triggers to emulate the desired behaviour, this is neither economical in
terms of gas fees, nor computation.

Until Iroha 2 supports WASM-based _permissions validators_, however, your
only choice are pre-commit triggers.

:::

### Block-based Triggers

Same as timed triggers, but instead of only being interested in the
time-stamp, this trigger is interested in the block height. While the
mechanism for the triggers is similar, the use cases are different.

### By-call Triggers

These triggers only get executed once the `CallTrigger(trigger_name)`
instruction is executed. They can be useful if you want to achieve dynamic
linkage between different smartcontract modules. Space is precious, so you
want to use as little of it as you can. Thus, you follow the UNIX design
philosophy, and instead of creating one large smartcontract, you create
many smaller ones, and re-use as much logic as you can.

::: info

Of course, this is a rather exotic use case, so it shall be implemented
last

:::

## Event Triggers by Example

Now that we've gotten the theory out of the way, we want to sit down with
the Mad Hatter, the March Hare, and the Dormouse and see if we can spin.

Let's start with an event trigger that shows the basics.

We have `mad_hatter@wonderland`, `dormouse@wonderland`,
`march_hare@wonderland` all of which share the (fixed-point) asset of
`tea#wonderland`. The Mad hatter has the tea pot, while the rest have a
single cup of tea. When `alice@wonderland` had arrived, she got a nice cup
of tea as well.

The way we get them in Rust code looks like this:

```rust
let tea = AssetDefinitionId::new("tea", "wonderland")?;
let mad_hatter = AccountId::new("mad_hatter", "wonderland")?;
let dormouse = AccountId::new("dormouse", "wonderland")?;
let march_hare = AccountId::new("march_hare", "wonderland")?;
vec![
  RegisterBox::new(IdentifiableBox::from(NewAccount::new(mad_hatter.clone()))),
  RegisterBox::new(IdentifiableBox::from(NewAccount::new(march_hare.clone()))),
  RegisterBox::new(IdentifiableBox::from(NewAccount::new(dormouse.clone()))),
  RegisterBox::new(IdentifiableBox::from(AssetDefinition::new_fixed(tea.clone()))),
  MintBox::new(Value::Fixed(100.0_f64.try_into()?), IdBox::AssetId(AssetId::new(tea.clone(), mad_hatter.clone())))
  MintBox::new(Value::Fixed(1.0_f64.try_into()?), IdBox::AssetId(AssetId::new(tea.clone(), march_hare.clone())))
  MintBox::new(Value::Fixed(1.0_f64.try_into()?), IdBox::AssetId(AssetId::new(tea.clone(), dormouse.clone())))
  MintBox::new(Value::Fixed(1.0_f64.try_into()?), IdBox::AssetId(AssetId::new(tea.clone(), alice.clone())))
]
```

We want a smartcontract that transfers some `tea` from
`mad_hatter@wonderland` to `alice@wonderland` when her tea reduces by a
single cup.

For that we need to register a trigger. The boilerplate is straightforward

```rust
let id = TriggerId::new(Name::new("refresh_tea"));

let metadata = Metadata::new();

let executable = vec![
    TransferBox::new(
      IdBox::AssetId(AssetId::new(tea.clone(), mad_hatter.clone())),
      Value::Fixed(1_f64.try_into()?),
      IdBox::AssetId(AssetId::new(alice.clone(), mad_hatter.clone())),
    )
];

let repeats = Repeats::Indefinitely;

let technical_account = mad_hatter.clone();

let filter = _ // ...
```

The event filter is where we need to spend some time and think. So far
we've seen the `Pipeline` variety of filters. This time around, the filter
is a `Data` kind, which is itself a tuple with a single variant, which is a
`FilterOpt` of an `EntityFilter`.

`FilterOpt` stands for Optional Filter. It can either `AcceptAll`, or
accept `BySome` of another `Filter`. An `EntityFilter` is a filter that
matches `ByAccount` in our case, but can match by many other means. It
wraps an `AccountFilter`, which matches on various events produced on
accounts. We need to listen for an event that occurs when Alice's asset is
reduced: so we need `AccountEventFilter::ByAsset`. That itself is an
`AssetEventFilter`. It should filter `ByRemoved` (but not `ByDeleted`).
**It should be noted that the names are subject to change, as they are
confusing.**

This gets us nowhere and is a big problem in our current API, that we're
trying to solve. Instead we should work bottom up.

To learn the ropes of `EventFilters` start simple. An `IdFilter` is a
filter that `.matches(event) == true`, if and only if the identities are
exactly the same. Everything that has an `Id` has a corresponding
`IdFilter`. However, an `IdFilter` is a parametric structure, an `IdFilter`
that works on `Peer`s has the type `IdFilter<PeerId>` and is not the same
type as an `IdFilter` that works with `AccountId`; `IdFilter<AccountId`.
We've already talked about `FilterOpt`.

Now if we wanted a filter that will `match` whenever `tea` gets reduced,
either through a `Transfer` or a `Burn` instruction, we need an
`AssetFilter`. It needs to look at both what the `Id` of the asset is,
hence `IdFilter<AssetDefinitionId>` and `ByRemoved`.

```rust
use FilterOpt::{BySome, AcceptAll};

let asset_filter = AssetFilter::new(BySome(IdFilter(tea.clone())), BySome(AssetEventFilter::ByRemoved));
```

So far so good?

Next, we want a filter that looks for changes in an asset for an account.
Specifically:

```rust
let account_filter = AccountFilter::new(BySome(IdFilter(alice.clone())), BySome(asset_filter));
```

Now, because of the way that `parity_scale_codec` works, we need to wrap
this in various boxes.

```rust
let filter = EventFilter::Data(BySome(EntityFilter::ByAccount(account_filter)));
```

After this somewhat laborious filter combination, we can create an `Action`

```rust
let action = Action {
    executable, repeats, technical_account, filter
}
```

Which allows us to create an instance of a `Trigger`.

```rust
let trigger = Trigger {
    id, action, metadata
}
```

Finally, in order to get said trigger onto the blockchain, we create a
transaction with the following single instruction.

```rust
Instruction::Register(RegisterBox::new(IdentifiableBox::Trigger(Box::new(trigger))));
```

## How it works

The technical details are summarised as follows:

- The (normal) instructions that either got submitted from WASM or directly
  from the client get executed. If there were any triggers that should have
  been registered, they get registered now.
- Using the total set of events that got generated during the execution of
  instructions, the triggers (including some that got registered just this
  round) get executed.
- The events produced in the previous step get scheduled for execution in
  the next block.

::: info

The reason why the events caused by the execution of triggers get processed
in the next block is simple. We don't want two triggers to inadvertently
cause an infinite loop of instruction execution, and break consensus.

:::

Now each time Alice drinks some tea, the Mad Hatter will pour in a whole
new cup. The keen eyed among you will have noticed that the amount that
Alice drinks is irrelevant to how much tea will be transferred. Alice may
well take a tiny sip and be poured a whole new cup's worth.

We intend to address this issue in the future, when the event that gets
emitted also has an attached Value. We also intend to provide more event
filter types. For example, we will have filters that match when the asset:

1. Decreases by any amount (current behaviour).
2. Decreases by more than (or exactly) the specific amount in one
   instruction.
3. Decreases to below a certain threshold.

Only the first type of event filter is implemented now, and the other two
can be emulated using a WASM smartcontract as the `Executable`.

### Why not WASM

The above observation can be generalised. WASM can do any logic that a
Turing complete machine could, using the data available via queries. So in
theory for event-based triggers, you could create an `AcceptAll` event
filter and do all of the processing using the key-value store as persistent
storage, and then, determining if you want to execute using
easy-to-understand Rust code, and not our admittedly cumbersome,
`EventFilters`.

We don't want that. WASM takes up significantly more space, and takes
longer to execute compared to plain ISI, which are slower than
`EventFilters`. We want you to want to use the `EventFilters` because they
would make the process much more efficient, and we are working tirelessly
to make the experience of using event filters much less gruelling.

However, as was mentioned previously on several occasions, implementing a
feature properly takes time and effort. Ergonomics must be balanced against
safety and reliability, so we cannot just make things easier to use. We
want them to retain many of the advantages of strong typing.

::: info

This is all a work in progress. Our code is in flux. We need time to play
around with a particular implementation to optimise it.

:::
