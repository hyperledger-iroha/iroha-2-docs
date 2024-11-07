# Public and Private Blockchains

Iroha can be ran in a variety of configurations. As the administrator of
your own network, you can use different permission sets to decide what
criteria must be met in order for some transaction to be accepted.

We provide two major sets of permissions: called a _private_ and _public_
permission sets. These need to be added into the `genesis.json` before you
start an Iroha peer.

Below we outline the major differences in these two use cases.

## Permissions

In a _public_ blockchain, most accounts have the same set of permissions.
In a _private_ blockchain, most accounts are assumed not to be able to do
anything outside of their own account or domain unless explicitly granted
said permission.

::: info

Refer to the
[dedicated section on permissions](/blockchain/permissions.md) for
more details.

:::

## Peers

Any peer can join a _public_ blockchain. For a _private_ blockchain,
automatic discovery of peers is turned off.

::: info

Refer to [peer management](peer-management.md) for more details.

:::

## Registering accounts

Depending on how you decide to set up your
[genesis block (`genesis.json`)](genesis.md), the process for registering
an account might go one of two ways. To understand why, let's talk about
permission first.

By default, Iroha allows **all** instructions to go through, until a
permission validator that can restrict instruction execution has been
registered. You can add permission validators to your genesis block by
registering built-in [permission tokens](/blockchain/permissions.md)
that we thought would be useful for `private` and `public` blockchain
use-cases. However, in that case, the process of registering accounts is
different.

When it comes to registering accounts, public and private blockchain have
the following differences:

- In a _public_ blockchain, anyone should be able to register an
  account[^1]. So, in theory, all that you need is a suitable client, a way
  to generate a private key of a suitable type (`ED25519`), and that's it.

- In a _private_ blockchain, you can have _any_ process for setting up an
  account: it could be that the registering instruction has to be submitted
  by a specific account, or by a smart contract that asks for other
  details. It could be that in a private blockchain registering new
  accounts is only possible on specific dates, or limited by a non-mintable
  (finite) token.

- In a _typical_ private blockchain, i.e. a blockchain without any unique
  processes for registering accounts, you need an account to register
  another account.

Built-in permission validators for private blockchains cover the `_typical_
private blockchain use-case.

::: info

<!-- Check: a reference about future releases or work in progress -->

As of writing, the set of public blockchain permissions is incomplete, and
as such Iroha source code needs to be modified to run it in the _public_
mode.

:::

Refer to the section on
[instructions](/blockchain/instructions.md#un-register) for more
details about `Register<Account>` instructions.

[^1]:
    In fact, once we have finished with our key-centric address scheme for
    accounts, you don't register an account as much as claim it.
