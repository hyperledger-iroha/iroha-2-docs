# Rust Guide

## 1. Iroha 2 Client Setup

In this part we shall cover the process of using the Iroha 2 Rust
libraries. Instead of providing the complete basics, we shall assume
knowledge of the most widely used concepts, explain what's unusual about
Iroha 2 specifically, and provide a step-by-step guide to creating your own
Rust client for it.

We assume that you know how to create a new package and have basic
understanding of the fundamental Rust code; `async` functions, `enum`
types, traits and borrowing/ownership, as well as the libraries that we
use: `serde`, `tokio`, `tracing`, etc.

::: tip

If you don't feel comfortable with any of the above, we recommend
consulting [the Rust book](https://doc.rust-lang.org/stable/book/) and
[docs.rs](https://docs.rs/).

:::

Iroha 2 makes extensive use of
[workspaces](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html).
Currently, there are two workspaces, the one that contains the WASM support
library and the one that contains the core support libraries, which go in a
domain-first order. What that means is that instead of having a global
_constants_ crate, we have a crate for the blockchain data model
(`iroha_data_model`), a crate with cryptographic primitives
(`iroha_crypto`), and so on. These, _individually_, have a module for
constants.

If you add `iroha_client` to the other two crates, you get the minimum
number of dependencies to start your own client, similar to
`iroha` binary.

Once the initial `v2.0.0` release is complete, we plan to create a package
on [crates.io](https://crates.io/) with all the documentation. In the
meantime, you could use the local copy that you've just created in the
[previous step](/get-started/install-iroha-2) as a local installation in your client's
`Cargo.toml`:

```toml
[dependencies]
iroha_client = { version = "=2.0.0-pre-rc.13", path = "~/Git/iroha/client" }
iroha_data_model = { version = "=2.0.0-pre-rc.13", path = "~/Git/iroha/data_model" }
iroha_crypto = { version = "=2.0.0-pre-rc.13", path = "~/Git/iroha/crypto" }
iroha_config = { version = "=2.0.0-pre-rc.13", path = "~/Git/iroha/config" }
```

The added benefit of using a local copy is that you have access to the
minimal BFT network in the form of `docker-compose.yml`, which allows you
to experiment. The drawbacks are mitigated by the fact that Rust links
statically by default, so we recommend you experiment with the local set up
first.

::: info

You could also make use of our `test_network` crate, which is available via
[GitHub](https://github.com/hyperledger-iroha/iroha/tree/main/crates/iroha_test_network)
but not via crates.io.

:::

You would also benefit from having immediate access to the example
configurations in the `~/Git/iroha/configs` folder.

So let's copy the example client configuration somewhere useful:

```bash
$ cp -vfr ~/Git/iroha/configs/client/config.json example/config.json
```

We recommend looking through it to familiarise yourself with the key pieces
of information that every Iroha 2 client needs. Specifically, each client
operates on behalf of a pre-existing account. These accounts are identified
by a _name@domain_name_ ID and can only be accessed provided that you know
their specific key.

## 2. Configuring Iroha 2

Your application written in Rust needs to instantiate a client. The client
typically needs specific configuration options, which you could either
generate or load from the provided `config.json`. Let's do that now:

<<< @/snippets/tutorial-snippets.rs#rust_config_crates

<<< @/snippets/tutorial-snippets.rs#rust_config_load

Using said configuration, instantiate a client:

<<< @/snippets/tutorial-snippets.rs#rust_client_create

Note that it used to be necessary to create a mutable client. Sending and
receiving messages affects the client's internal state, but now that state
is hidden behind interior mutable smart pointers.

Of course, depending on your application, you might want to de-serialise
your `ClientConfiguration` structure from a different location. Perhaps,
you might want to build the configuration in place using the command-line
arguments, or perhaps, you're using the [XDG specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-0.6.html) to store the file
persistently in a different location. For this purpose, it's useful to try
and construct an instance of `ClientConfiguration`:

```rust
use iroha_core::prelude::*;
use iroha_data_model::prelude::*;

let kp = KeyPair::new(
    PublicKey::from_str(
        r#"ed01207233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0"#,
    )?,
    PrivateKey::from_hex(
        Algorithm::Ed25519,
        "9ac47abf59b356e0bd7dcbbbb4dec080e302156a48ca907e47cb6aea1d32719e7233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0"
            .into(),
    )?
)?;

let (public_key, private_key) = kp.clone().into();
let account_id: AccountId = "alice@wonderland".parse()?;

let config = ClientConfiguration {
    public_key,
    private_key,
    account_id,
    torii_api_url: SmallStr::from_string(iroha_config::torii::uri::DEFAULT_API_URL.to_owned()),
    ..ClientConfiguration::default()
};
```

::: info

Note that the keys in
[client configuration](/guide/configure/client-configuration.md) are given
in [multi-hash format](https://github.com/multiformats/multihash). If you
are experiencing issues parsing the keys in this format,
[check the troubleshooting section](/help/configuration-issues#multihash-format-of-private-and-public-keys).

:::

## 3. Registering a Domain

Registering a domain is a relatively easy operation. Most of the
boilerplate code has to do with setting up the Iroha 2 client and
deserialising its configuration.

<<< @/snippets/tutorial-snippets.rs#domain_register_example_crates

To register a domain, you need the domain name:

<<< @/snippets/tutorial-snippets.rs#domain_register_example_create_domain

Which we convert into an instruction:

<<< @/snippets/tutorial-snippets.rs#domain_register_example_create_isi

Note that we use `RegisterBox` and `IdentifiableBox`. Despite what your
instincts as a Rust developer might suggest, we're not actually using any
kind of dynamic dispatch. There's no `dyn` anywhere, and `RegisterBox`
isn't an alias for `Box<dyn Register>`.

A `RegisterBox` is a specialised `enum` that uses static dispatch to
achieve what looks like dynamic dispatch, without any heap allocation. If
you want to add more types to `RegisterBox` you must either open an issue
on GitHub, or do that by yourself on a local fork of Iroha.

The instruction is then batched into a transaction:

<<< @/snippets/tutorial-snippets.rs#domain_register_example_prepare_tx

Which is then submitted into the pipeline:

<<< @/snippets/tutorial-snippets.rs#domain_register_example_submit_tx

Note the question mark here. This will return an `Err` variant if there's
something immediately and obviously wrong with the transaction: for
example, if it couldn't submit the transaction to the peer (e.g. there's no
connection), or if the transaction got rejected with an error. The cost is
that the `submit_transaction` function is synchronous.

We could have also done the following:

```rust
iroha_client
    .submit_with_metadata(create_looking_glass, UnlimitedMetadata::default())?;
```

or

```rust
iroha_client.submit(create_looking_glass)?;
```

The latter style is just syntactic sugar. Every submission comes in the
form of a transaction that has metadata.

While the latter is a convenient shorthand that we shall use frequently, we
strongly advise using explicit construction in production code.

::: info

It is likely that we shall replace most if not all instances of `submit` in
our code base with explicit transactions.

<!-- Check: a reference about future releases or work in progress -->

:::

## 4. Registering an Account

Registering an account is a bit more involved than registering a domain.
With a domain, the only concern is the domain name. However, with an
account, there are a few more things to worry about.

First of all, we need to create an `AccountId`. Note that we can only
register an account to an existing domain. The best UX design practices
dictate that you should check if the requested domain exists _now_, and if
it doesn't, suggest a fix to the user. After that, we can create a new
account named _white_rabbit_.

<<< @/snippets/tutorial-snippets.rs#account_definition_comparison

Second, you should provide the account with a public key. It is tempting to
generate both it and the private key at this time, but it isn't the
brightest idea. Remember, that _the white_rabbit_ trusts _you,
alice@wonderland_, to create an account for them in the domain
\_looking_glass, **but doesn't want you to have access to that account
after creation**.

If you gave _white_rabbit_ a key that you generated yourself, how would
they know if you don't have a copy of their private key? Instead, the best
way is to **ask** _white_rabbit_ to generate a new key-pair, and give you
the public half of it:

```rust
let key: PublicKey = get_key_from_white_rabbit();
```

Only then do we build an instruction from it:

```rust
let create_account =
    RegisterBox::new(IdentifiableBox::from(NewAccount::with_signatory(id, key)));
```

Which is then **wrapped in a transaction** and **submitted to the peer** as
[in the previous section](#_3-registering-a-domain).

## 5. Registering and minting assets

Iroha has been built with few
[underlying assumptions](/blockchain/assets.md) about what the assets need
to be in terms of their value type and characteristics (fungible or
non-fungible, mintable or non-mintable).

To register an asset, we first construct an
`iroha_data_model::asset::DefinitionId` like so:

<<< @/snippets/tutorial-snippets.rs#register_asset_create_asset

::: info

Note that we use `#` symbol to separate the name of the asset from the
domain to which it belongs. This is intentional. This reflects the rule
that there can be many `alice`s in many domains, with only one `alice` per
domain, and there can be an asset that is also named `alice`, but there can
be only one, regardless of type.

:::

Then construct an instruction:

<<< @/snippets/tutorial-snippets.rs#register_asset_init_submit

This creates an asset `time` that can only be minted once and has the type
`fixed`. `AssetDefinition::fixed` just like its other cousins (`quantity`
and `big_quantity`) returns a builder of an `AssetDefinition`.

This asset is `mintable_once`, which means that the next time we mint it,
we have to specify the entire amount that is going to exist for the rest of
the existence of the blockchain.

<<< @/snippets/tutorial-snippets.rs#register_asset_mint_submit

Now imagine that the `white_rabbit@looking_glass` was not very keen and
didn't notice that he wanted `123.4_f64` as the amount of time. Now white
rabbit notices the problem and thinks "oh dear, not a lot of time has
passed, perhaps I can give myself some more", and submits another mint
request with `111.06_f64` instead of the original `12.34_f64`. But, alas,
no such luck. The white rabbit cannot mint more time and is thus
perpetually late.

Roses, by contrast, are already registered in the network during the
genesis round, and belong to _alice@wonderland_. Moreover, when they were
registered, we didn't add the restriction, so we can mint them again and
again as _alice_:

<<< @/snippets/tutorial-snippets.rs#mint_asset_mint

Then submit the instruction as usual:

<<< @/snippets/tutorial-snippets.rs#mint_asset_submit_tx

::: info

Our assets are strongly typed. As such, when you create a `MintBox`, you
need to check that the asset has the correct underlying type. If you don't
know the type, query it. This is also why we specifically annotate
numerical literals with their type.

Contrary to what you might think, this restriction isn't just for pedantry.
Implicit conversion errors are the bane of all programmers, if you got the
_AssetValueType_ incorrect, _how do you know that it was the only mistake
in that transaction?_

:::

## 6. Transferring assets

Transferring assets is a bit more involved than minting them. First, you
need to know the account ID of the account that you're transferring from
and the account ID of the account that you're transferring to.

```rust
let from_account_id: AccountId = "alice@wonderland".parse().unwrap();
let to_id: AccountId = "bob@wonderland".parse().unwrap();
```

You also need to know the asset ID of the asset that you're transferring:

```rust
let asset_definition_id: AssetDefinitionId = "time#looking_glass".parse().unwrap();
let from_asset_id = AssetId::new(asset_definition_id, from_account_id);
```

Then you need to specify the amount that you're transferring:

```rust
let amount = 1 as u32;
let value: Value = amount.into();
```

Then you can create a transfer instruction and submit it:

```rust
let from_id_box = IdBox::AssetId(from_asset_id);
let to_id_box = IdBox::AccountId(to_id);
let transfer_expr = TransferExpr::new(from_id_box, value, to_id_box);
client.submit(transfer_expr);
```

## 7. Burning assets

Burning assets is quite similar to minting. First, you create the burn
instruction indicating which asset to burn and its quantity.

<<< @/snippets/tutorial-snippets.rs#burn_asset_burn

Then submit this instruction:

```rust
iroha_client.submit(burn_roses)?;
```

## 8. Visualising outputs

Finally, we should talk about visualising data. The Rust API is currently
the most complete in terms of available queries and instructions. After
all, this is the language in which Iroha 2 was built.

We shall, however, leave most of the aforementioned advanced features down
the rabbit hole, up to the reader's own devices to discover. This document
can easily get out of sync with the state of the API features. By contrast,
the online documentation is always up to date. Plus a short tutorial
wouldn't be able to do all these features justice. Instead, we shall retain
parity with other language tutorials and introduce you to pipeline filters.

There are two possible event filters: `PipelineEventFilter` and
`DataEventFilter`, we shall focus on the former. This filter sieves events
pertaining to the process of submitting a transaction, executing a
transaction, and committing it to a block.

First, let's build a filter:

```rust
use iroha_data_model::prelude::*;

let filter = FilterBox::Pipeline(PipelineEventFilter::identity());
```

Then, we start listening for events in an infinite loop:

```rust
for event in iroha_client.listen_for_events(filter)? {
    match event {
        Ok(event) => println!("Success: {:#?}", event),
        Err(err) => println!("Sadness:( {:#?}",  err),
    }
};
```

Needless to say, an synchronous infinite blocking loop is bad UX for
anything but a command-line program, but for illustration purposes, this
would create a nice printout, just like in `iroha` binary.
