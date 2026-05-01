# Public and Private Blockchains

Iroha can run in a variety of configurations. As the administrator of your
own network, you decide which executor and permission policy determine
whether a transaction is accepted.

The common profiles are _private_ permissioned networks and more open
_public_ networks. Both are configured through genesis state and executor
policy, not through separate node binaries.

Below we outline the major differences in these two use cases.

## Permissions

In a _public_ blockchain, most accounts have the same set of permissions.
In a _private_ blockchain, most accounts are assumed not to be able to do
anything outside the authority granted to them unless explicitly granted
the relevant permission.

::: info

Refer to the
[dedicated section on permissions](/blockchain/permissions.md) for
more details.

:::

## Peers

In a _public_ blockchain, peer admission is part of chain policy. For a
_private_ blockchain, deployments usually pin the trusted peer set in
configuration and genesis.

::: info

Refer to [peer management](peer-management.md) for more details.

:::

## Registering accounts

Depending on how you decide to set up your
[genesis block (`genesis.json`)](genesis.md), the process for registering
an account might go one of two ways. To understand why, let's talk about
permission first.

The selected executor defines which permission checks apply. You can grant
the default [permission tokens](/blockchain/permissions.md) in genesis to
shape a private, administrator-managed network or a more open network.
Once those permissions are active, the process of registering accounts is
different.

When it comes to registering accounts, public and private blockchain have
the following differences:

- In a _public_ blockchain, anyone should be able to register an
  account[^1]. So, in theory, all that you need is a suitable client, a way
  to generate a private key for a supported algorithm, and permission
  policy that accepts the registration.

- In a _private_ blockchain, you can have _any_ process for setting up an
  account: it could be that the registering instruction has to be submitted
  by a specific account, or by a smart contract that asks for other
  details. It could be that in a private blockchain registering new
  accounts is only possible on specific dates, or limited by a non-mintable
  (finite) token.

- In a _typical_ private blockchain, i.e. a blockchain without any unique
  processes for registering accounts, you need an account to register
  another account.

The default permission validators cover the typical private blockchain
use case.

::: info

Public and private modes are policy profiles rather than separate node
binaries. Review the executor and genesis permissions you ship before
running an open network.

:::

Refer to the section on
[instructions](/blockchain/instructions.md#un-register) for more
details about `Register<Account>` instructions.

[^1]:
    Current account IDs are canonical and derive from the account
    controller. The docs still use "register an account" when describing
    the `Register<Account>` instruction.
