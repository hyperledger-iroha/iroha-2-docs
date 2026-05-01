# Iroha Special Instructions

When we spoke about [how Iroha operates](/blockchain/iroha-explained), we
said that Iroha Special Instructions are the only way to modify the world
state. So, what kind of special instructions do we have? If you've read the
language-specific guides in this tutorial, you've already seen a couple of
instructions: `Register<Account>` and `Mint<Numeric>`.

Here is the full list of Iroha Special Instructions:

| Instruction                                               | Descriptions                                     |
| --------------------------------------------------------- | ------------------------------------------------ |
| [Register/Unregister](#un-register)                       | Give an ID to a new entity on the blockchain.    |
| [Mint/Burn](#mint-burn)                                   | Mint/burn numeric assets or trigger repetitions. |
| [SetKeyValue/RemoveKeyValue](#setkeyvalue-removekeyvalue) | Update blockchain object metadata.               |
| [SetParameter](#setparameter)                             | Set a chain-wide parameter.                      |
| [Grant/Revoke](#grant-revoke)                             | Give or remove permissions and roles.            |
| [Transfer](#transfer)                                     | Transfer ownership or asset value.               |
| [ExecuteTrigger](#executetrigger)                         | Execute triggers.                                |
| [Log/Custom/Upgrade](#other-instructions)                 | Log, extend, or upgrade runtime behavior.        |

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

| Instruction                                               | Objects                                                                                                 | Destination          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| [Register/Unregister](#un-register)                       | domains, accounts, asset definitions, NFTs, roles, triggers, peers                                      |                      |
| [Mint/Burn](#mint-burn)                                   | numeric assets, trigger repetitions                                                                     | accounts or triggers |
| [SetKeyValue/RemoveKeyValue](#setkeyvalue-removekeyvalue) | objects that have [metadata](./metadata.md): domains, accounts, asset definitions, NFTs, RWAs, triggers |                      |
| [SetParameter](#setparameter)                             | chain parameters                                                                                        |                      |
| [Grant/Revoke](#grant-revoke)                             | [roles, permission tokens](/blockchain/permissions.md)                                                  | accounts or roles    |
| [Transfer](#transfer)                                     | domains, asset definitions, numeric assets, NFTs                                                        | accounts             |
| [ExecuteTrigger](#executetrigger)                         | triggers                                                                                                |                      |
| [Log/Custom/Upgrade](#other-instructions)                 | logs, executor-specific payloads, executor upgrades                                                     |                      |

There is also another way of looking at ISI, in terms of the ledger object
they touch:

| Target           | Instructions                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Account          | register/unregister accounts, receive assets, update account metadata, grant/revoke permissions and roles    |
| Domain           | register/unregister domains, transfer domain ownership, update domain metadata                               |
| Asset definition | register/unregister definitions, transfer ownership, update metadata                                         |
| Asset            | mint/burn numeric quantity, transfer numeric quantity                                                        |
| NFT              | register/unregister NFTs, transfer ownership, update metadata                                                |
| RWA              | register lots, transfer quantity, hold/release, freeze/unfreeze, redeem, merge, update metadata and controls |
| Trigger          | register/unregister, mint/burn trigger repetitions, execute trigger, update trigger metadata                 |
| World            | register/unregister peers and roles, set parameters, upgrade the executor                                    |

## CLI Examples

The examples in this page assume you are running commands from the upstream
Iroha workspace against the default local client configuration:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml <command>
```

If you installed the `iroha` binary, use
`iroha --config ./defaults/client.toml` instead. Replace the placeholders
below with values from your network:

```bash
export ALICE="<ALICE_ACCOUNT_I105>"
export BOB="<BOB_ACCOUNT_I105>"
export ASSET_DEF="<ASSET_DEFINITION_BASE58>"
export PEER_KEY="<BLS_PUBLIC_KEY_MULTIHASH>"
export PEER_POP="<PROOF_OF_POSSESSION_HEX>"
```

When targeting the public Taira testnet, use a Taira client configuration.
Before running fee-paying examples, save the faucet helper from
[Get Testnet XOR on Taira](/get-started/sora-nexus-dataspaces.md#_4-get-testnet-xor-on-taira)
as `taira_faucet_claim.py`, then claim testnet XOR from the faucet:

```bash
export TAIRA_ACCOUNT_ID="<TAIRA_I105_ACCOUNT_ID>"
export TAIRA_FEE_ASSET="6TEAJqbb8oEPmLncoNiMRbLEK6tw"

curl -fsS https://taira.sora.org/v1/accounts/faucet/puzzle | jq .
python3 taira_faucet_claim.py "$TAIRA_ACCOUNT_ID"

iroha --config ./taira.client.toml ledger asset get \
  --definition "$TAIRA_FEE_ASSET" \
  --account "$TAIRA_ACCOUNT_ID"
```

After the faucet-funded asset is visible, attach the required gas asset
metadata to write transactions:

```bash
printf '{"gas_asset_id":"%s"}\n' "$TAIRA_FEE_ASSET" > taira.tx-metadata.json

cargo run --bin iroha -- \
  --config ./taira.client.toml \
  --metadata ./taira.tx-metadata.json \
  <command>
```

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

RWA lots are created through the dedicated `RegisterRwa` instruction. The
current code does not expose an `UnregisterRwa` instruction; use
`RedeemRwa` to retire represented quantity.

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

| Language              | Guide                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| CLI                   | Use the [Iroha CLI](/get-started/operate-iroha-2-via-cli.md) to register domains, accounts, and assets. |
| Rust                  | Use the [Rust tutorial](/guide/tutorials/rust.md).                                                      |
| Kotlin/Java           | Use the [Kotlin/Java tutorial](/guide/tutorials/kotlin-java.md).                                        |
| Python                | Use the [Python tutorial](/guide/tutorials/python.md).                                                  |
| JavaScript/TypeScript | Use the [JavaScript/TypeScript tutorial](/guide/tutorials/javascript.md).                               |

Register and unregister domains:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger domain register --id docs.universal

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger domain unregister --id docs.universal
```

Register and unregister accounts:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger account register --id "$BOB"

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger account unregister --id "$BOB"
```

Register and unregister asset definitions:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger asset definition register \
  --id "$ASSET_DEF" \
  --name docs_token \
  --alias docs_token#docs.universal \
  --scale 0

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger asset definition unregister --id "$ASSET_DEF"
```

Register and unregister NFTs. NFT registration reads its content JSON from
standard input:

```bash
printf '{"kind":"badge","level":"intro"}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger nft register --id 'badge$docs.universal'

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger nft unregister --id 'badge$docs.universal'
```

Register and unregister roles:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger role register --id operators

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger role unregister --id operators
```

Register and unregister triggers. Trigger registration needs either
compiled IVM bytecode or a serialized instruction list. This example builds
a `Log` instruction with the CLI and pipes it into trigger registration:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml -o \
  ledger transaction ping --log-level INFO --msg "hourly cleanup" |
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger trigger register --id hourly_cleanup \
  --instructions-stdin \
  --filter time \
  --time-start 5m \
  --time-period-ms 3600000

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger trigger unregister --id hourly_cleanup
```

Register and unregister peers. Generate the BLS key and PoP with `kagami`
if you do not already have them:

```bash
cargo run --bin kagami -- keys --algorithm bls_normal --pop --json

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger peer register --key "$PEER_KEY" --pop "$PEER_POP"

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger peer unregister --key "$PEER_KEY"
```

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

Mint and burn numeric assets:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger asset mint \
  --definition "$ASSET_DEF" \
  --account "$ALICE" \
  --quantity 100

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger asset burn \
  --definition "$ASSET_DEF" \
  --account "$ALICE" \
  --quantity 10
```

Mint and burn trigger repetitions:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger trigger mint --id hourly_cleanup --repetitions 5

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger trigger burn --id hourly_cleanup --repetitions 1
```

## Transfer

Transfers move ownership or value between accounts. Generic transfer
variants cover domains, asset definitions, numeric assets, and NFTs. RWA
quantity movement uses the dedicated `TransferRwa` and `ForceTransferRwa`
instructions described in [Real-World Assets](/blockchain/rwas.md).

To do this, an account have to be granted the
[permission to transfer assets](/reference/permissions.md). Refer to an
example on how to transfer assets with
[CLI](/get-started/operate-iroha-2-via-cli.md) or
[Rust](/guide/tutorials/rust.md).

Transfer numeric assets:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger asset transfer \
  --definition "$ASSET_DEF" \
  --account "$ALICE" \
  --to "$BOB" \
  --quantity 25
```

Transfer domain, asset-definition, and NFT ownership:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger domain transfer --id docs.universal --from "$ALICE" --to "$BOB"

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger asset definition transfer --id "$ASSET_DEF" --from "$ALICE" --to "$BOB"

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger nft transfer --id 'badge$docs.universal' --from "$ALICE" --to "$BOB"
```

## Grant/Revoke

Grant and revoke instructions are used for account
[permissions and roles](permissions.md).

`Grant` is used to permanently grant a user either a single permission, or
a group of permissions (a "role"). Granted roles and permissions can only
be removed via the `Revoke` instruction. As such, these instructions should
be used carefully.

Grant and revoke a role on an account:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger account role grant --id "$BOB" --role operators

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger account role revoke --id "$BOB" --role operators
```

Grant and revoke permission tokens. Permission commands read a permission
object from standard input:

```bash
printf '{"name":"CanSetParameters","payload":null}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger account permission grant --id "$BOB"

printf '{"name":"CanSetParameters","payload":null}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger account permission revoke --id "$BOB"
```

Grant and revoke permissions on a role:

```bash
printf '{"name":"CanRegisterDomain","payload":null}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger role permission grant --id operators

printf '{"name":"CanRegisterDomain","payload":null}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger role permission revoke --id operators
```

## `SetKeyValue`/`RemoveKeyValue`

These instructions update object [metadata](/blockchain/metadata.md). Use
`SetKeyValue` to insert or replace a metadata entry and `RemoveKeyValue` to
delete one.

Metadata `set` commands read the JSON value from standard input:

```bash
printf '"production"\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger domain meta set --id docs.universal --key environment

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger domain meta remove --id docs.universal --key environment
```

The same pattern is available for accounts, asset definitions, NFTs, RWAs,
and triggers:

```bash
printf '{"display_name":"Alice"}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger account meta set --id "$ALICE" --key profile

printf '{"issuer":"docs"}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger asset definition meta set --id "$ASSET_DEF" --key issuer

printf '{"color":"blue"}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger nft meta set --id 'badge$docs.universal' --key traits

printf '{"owner":"ops"}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger trigger meta set --id hourly_cleanup --key owner
```

## `SetParameter`

`SetParameter` changes chain-wide parameters exposed by the active data
model and executor.

Set a parameter by passing a single parameter JSON object on standard
input:

```bash
printf '{"Sumeragi":{"BlockTimeMs":1000}}\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger parameter set
```

## `ExecuteTrigger`

This instruction is used to execute [triggers](./triggers.md).

The CLI can register triggers and subscribe to trigger execution events
directly. It does not provide a typed `execute trigger` command, so to
submit a manual `ExecuteTrigger` instruction, generate a serialized
`InstructionBox` with an SDK or executor tool and pass the resulting JSON
array through `ledger transaction stdin`:

```bash
printf '["<BASE64_EXECUTE_TRIGGER_INSTRUCTION_BOX>"]\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger transaction stdin

cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger events trigger-execute --timeout 30s
```

## Other instructions

Iroha also exposes lower-level instructions for runtime and executor
integration:

- `Log`: emit a log entry during execution
- `CustomInstruction`: carry executor-specific JSON payloads
- `Upgrade`: activate an executor upgrade

Submit a `Log` instruction with the ping helper:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger transaction ping --log-level INFO --msg "hello from docs"
```

Submit a custom executor instruction as a serialized `InstructionBox`. The
payload shape is executor-specific, so generate the instruction with the
matching SDK or executor tooling:

```bash
printf '["<BASE64_CUSTOM_INSTRUCTION_BOX>"]\n' |
  cargo run --bin iroha -- --config ./defaults/client.toml \
  ledger transaction stdin
```

Upgrade the executor from a compiled IVM bytecode file:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml \
  ops executor upgrade --path ./target/ivm/executor.ivm
```
