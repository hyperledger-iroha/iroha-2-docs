# Iroha Special Instructions

When we spoke about [how Iroha operates](/blockchain/iroha-explained), we
said that Iroha Special Instructions are the only way to modify the world
state. So, what kind of special instructions do we have? If you've read the
language-specific guides in this tutorial, you've already seen a couple of
instructions: `Register<Account>` and `Mint<Numeric>`.

Here is the full list of Iroha Special Instructions:

| Instruction                                               | Descriptions                                      |
| --------------------------------------------------------- | ------------------------------------------------- |
| [Register/Unregister](#un-register)                       | Give an ID to a new entity on the blockchain.     |
| [Mint/Burn](#mint-burn)                                   | Mint/burn numeric assets or trigger repetitions.  |
| [SetKeyValue/RemoveKeyValue](#setkeyvalue-removekeyvalue) | Update blockchain object metadata.                |
| [SetParameter](#setparameter)                             | Set a chain-wide parameter.                       |
| [Grant/Revoke](#grant-revoke)                             | Give or remove permissions and roles.             |
| [Transfer](#transfer)                                     | Transfer ownership or asset value.                |
| [ExecuteTrigger](#executetrigger)                         | Execute triggers.                                 |
| [Log/Custom/Upgrade](#other-instructions)                 | Log, extend, or upgrade runtime behavior.         |

Let's start with a summary of Iroha Special Instructions; what objects each
instruction can be called for and what instructions are available for each
object.

## Summary

For each instruction, there is a list of objects on which this instruction
can be run on. For example, transfer variants cover ownable ledger objects
and numeric assets, while minting covers numeric assets and trigger
repetitions.

Some instructions require a destination to be specified. For example, if
you transfer assets, you always need to specify to which account you are
transferring them. On the other hand, when you are registering something,
all you need is the object that you want to register.

| Instruction                                               | Objects                                                                                                               | Destination |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------- |
| [Register/Unregister](#un-register)                       | domains, accounts, asset definitions, NFTs, roles, triggers, peers                                                    |             |
| [Mint/Burn](#mint-burn)                                   | numeric assets, trigger repetitions                                                                                   | accounts or triggers |
| [SetKeyValue/RemoveKeyValue](#setkeyvalue-removekeyvalue) | objects that have [metadata](./metadata.md): domains, accounts, asset definitions, NFTs, triggers                     |             |
| [SetParameter](#setparameter)                             | chain parameters                                                                                                      |             |
| [Grant/Revoke](#grant-revoke)                             | [roles, permission tokens](/blockchain/permissions.md)                                                                | accounts or roles |
| [Transfer](#transfer)                                     | domains, asset definitions, numeric assets, NFTs                                                                      | accounts    |
| [ExecuteTrigger](#executetrigger)                         | triggers                                                                                                              |             |
| [Log/Custom/Upgrade](#other-instructions)                 | logs, executor-specific payloads, executor upgrades                                                                   |             |

There is also another way of looking at ISI, in terms of the ledger object
they touch:

| Target  | Instructions                                                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account | register/unregister accounts, receive assets, update account metadata, grant/revoke permissions and roles                                                                   |
| Domain  | register/unregister domains, transfer domain ownership, update domain metadata                                                                                              |
| Asset definition | register/unregister definitions, transfer ownership, update metadata                                                                                                |
| Asset   | mint/burn numeric quantity, transfer numeric quantity                                                                                                                       |
| NFT     | register/unregister NFTs, transfer ownership, update metadata                                                                                                               |
| Trigger | register/unregister, mint/burn trigger repetitions, execute trigger, update trigger metadata                                                                                |
| World   | register/unregister peers and roles, set parameters, upgrade the executor                                                                                                   |

## (Un)Register

Registering and unregistering are the instructions used to give an ID to a
new entity on the blockchain.

Everything that can be registered is both `Registrable` and `Identifiable`,
but not everything that's `Identifiable` is `Registrable`. Most things are
registered directly, but in some cases the representation in the blockchain
has considerably more data. For security and performance reasons, we use
builders for such data structures (e.g. `NewAccount`), and peer
registration has a dedicated proof-of-possession instruction. As a rule,
everything that can be registered can also be unregistered, but that is not
a hard and fast rule.

You can register domains, accounts, asset definitions, NFTs, peers, roles,
and triggers. Peer registration uses `RegisterPeerWithPop`, which carries a
proof of possession for the peer key. Check our
[naming conventions](/reference/naming.md) to learn about the restrictions
put on entity names.

::: info

Note that depending on how you decide to set up your
[genesis block](/guide/configure/genesis.md) in `genesis.json`
(specifically, whether or not you include registration of permission
tokens), the process for registering an account can be very different. In
general, we can summarise it like this:

- In a _public_ blockchain, anyone should be able to register an account.
- In a _private_ blockchain, there can be a unique process for registering
  accounts. In a _typical_ private blockchain, i.e. a blockchain without
  any unique processes for registering accounts, you need an account to
  register another account.

We discuss these differences in great detail when we
[compare private and public blockchains](/guide/configure/modes.md).

:::

::: info

Registering a peer is currently the only way of adding peers that were not
part of the original trusted peer set to the network.

:::

Refer to one of the language-specific guides to walk you through the
process of registering objects in a blockchain:

| Language              | Guide                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CLI                   | Use the [Iroha CLI](/get-started/operate-iroha-2-via-cli.md) to register domains, accounts, and assets.                      |
| Rust                  | Use the [Rust tutorial](/guide/tutorials/rust.md).                      |
| Kotlin/Java           | Use the [Kotlin/Java tutorial](/guide/tutorials/kotlin-java.md). |
| Python                | Use the [Python tutorial](/guide/tutorials/python.md).                |
| JavaScript/TypeScript | Use the [JavaScript/TypeScript tutorial](/guide/tutorials/javascript.md).    |

## Mint/Burn

Minting and burning can refer to numeric assets and triggers with a limited
number of repetitions. Some assets can be declared as non-mintable, meaning
that they can be minted only once after registration.

Assets are minted to a specific account, usually the one that registered
the asset in the first place. Asset quantities are non-negative, so you can
never have `$-1.0` of an asset or burn a negative amount and get a mint.

Refer to one of the language-specific guides to walk you through the
process of minting assets in a blockchain:

- [CLI](/get-started/operate-iroha-2-via-cli.md)
- [Rust](/guide/tutorials/rust.md)
- [Kotlin/Java](/guide/tutorials/kotlin-java.md)
- [Python](/guide/tutorials/python.md)
- [JavaScript/TypeScript](/guide/tutorials/javascript.md)

Here are examples of burning assets:

- [CLI](/get-started/operate-iroha-2-via-cli.md)
- [Rust](/guide/tutorials/rust.md)

## Transfer

Transfers move ownership or value between accounts. Current transfer
variants cover domains, asset definitions, numeric assets, and NFTs.

To do this, an account have to be granted the
[permission to transfer assets](/reference/permissions.md).
Refer to an example on how to
transfer assets with [CLI](/get-started/operate-iroha-2-via-cli.md) or [Rust](/guide/tutorials/rust.md).

## Grant/Revoke

Grant and revoke instructions are used for account
[permissions and roles](permissions.md).

`Grant` is used to permanently grant a user either a single permission, or
a group of permissions (a "role"). Granted roles and permissions can only
be removed via the `Revoke` instruction. As such, these instructions should
be used carefully.

## `SetKeyValue`/`RemoveKeyValue`

These instructions update object [metadata](/blockchain/metadata.md). Use
`SetKeyValue` to insert or replace a metadata entry and `RemoveKeyValue` to
delete one.

## `SetParameter`

`SetParameter` changes chain-wide parameters exposed by the active data
model and executor.

## `ExecuteTrigger`

This instruction is used to execute [triggers](./triggers.md).

## Other instructions

Iroha also exposes lower-level instructions for runtime and executor
integration:

- `Log`: emit a log entry during execution
- `CustomInstruction`: carry executor-specific JSON payloads
- `Upgrade`: activate an executor upgrade
