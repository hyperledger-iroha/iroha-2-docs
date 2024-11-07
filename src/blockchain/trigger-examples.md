# Event Triggers by Example

Now that we've gotten the theory out of the way, we want to sit down with
the Mad Hatter, the March Hare, and the Dormouse and see if we can spin.
Let's start with an event trigger that shows the basics.

## 1. Register accounts

We have `mad_hatter@wonderland`, `dormouse@wonderland`,
`march_hare@wonderland` all of which share the fixed-point asset of
`tea#wonderland`. The Mad Hatter has the tea pot, while the rest have a
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

## 2. Register a trigger

We want a smart contract that transfers some `tea` from
`mad_hatter@wonderland` to `alice@wonderland` when her tea reduces by a
single cup.

For that we need to register a trigger. The boilerplate is straightforward:

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

## 3. Define an event filter

The event filter is where we need to spend some time and think. So far
we've seen the `Pipeline` variety of filters. This time around, the filter
is a `Data` kind. This type of filter is a tuple with a single variant,
which is a `FilterOpt` of an `EntityFilter`:

- `FilterOpt` stands for Optional Filter. It can either `AcceptAll` or
  accept `BySome` of another `Filter`.
- An `EntityFilter` is a filter that matches `ByAccount` in our case, but
  can match by many other means. It wraps an `AccountFilter`, which matches
  various events produced on accounts.

What we want to do is create an event filter for when `alice@wonderland`
drinks some of her tea, or, in other words, reduces the `tea` asset by any
amount. To do this with the current API, we need to work bottom up.

An `IdFilter` is a filter that `.matches(event) == true` if and only if the
identities are exactly the same. Everything that has an `Id` has a
corresponding `IdFilter`.

::: info

An `IdFilter` is a parametric structure, an `IdFilter` that works on
`Peer`s has the type `IdFilter<PeerId>` and is not the same type as an
`IdFilter` that works with `AccountId`; `IdFilter<AccountId`.

:::

Now if we wanted a filter that will `match` whenever `tea` gets reduced,
either through a `Transfer` or a `Burn` instruction, we need an
`AssetFilter`. It needs to look at what the `Id` of the asset is, hence
`IdFilter<AssetDefinitionId>` and `ByRemoved`.

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

## 4. Create a `Trigger` instance

After this somewhat laborious filter combination, we can create an `Action`

```rust
let action = Action {
    executable, repeats, technical_account, filter, metadata
}
```

Which allows us to create an instance of a `Trigger`.

```rust
let trigger = Trigger::new(id, action);
```

## 5. Create a transaction

Finally, in order to get said trigger onto the blockchain, we create a
transaction with the following single instruction:

```rust
Instruction::Register(RegisterBox::new(IdentifiableBox::Trigger(Box::new(trigger))));
```

## How it works

The technical details of the created transaction are summarised as follows:

- The (normal) instructions that either got submitted from WASM or directly
  from the client get executed. If there were any triggers that should have
  been registered, they get registered.
- Using the total set of events that got generated during the execution of
  instructions, the triggers (including some that got registered just this
  round) get executed.
- The events produced in the previous step get scheduled for execution in
  the next block.

::: info

The reason why the events caused by the execution of triggers get processed
in the next block is that we don't want two triggers to inadvertently cause
an infinite loop of instruction execution and break consensus.

:::

Now each time Alice drinks some tea, the Mad Hatter pours in a whole new
cup. The keen eyed among you will have noticed that the amount that Alice
drinks is irrelevant to how much tea will be transferred. Alice may take a
tiny sip and still be poured a whole new cup's worth.

::: info

We intend to address this issue in the future so that an emitted event also
has an attached `Value`. We also intend to provide more event filter types.
For example, we will have filters that match when the asset:

- Decreases by any amount (current behaviour)
- Decreases by more than (or exactly) the specific amount in one
  instruction
- Decreases to below a certain threshold

<!-- Check: a reference about future releases or work in progress -->

Only the first type of event filter is implemented now, and the other two
can be emulated using a WASM smart contract as the `Executable`.

:::

::: details Why not WASM

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

<!-- Check: a reference about future releases or work in progress -->

This is all a work in progress. Our code is in flux. We need time to play
around with a particular implementation to optimise it.

:::
