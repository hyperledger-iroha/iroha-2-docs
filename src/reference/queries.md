# Queries

In the following section we mirror the module structure of
the queries and present to you what they do. You can learn 

::: info

The results of queries can be [sorted](/blockchain/queries#sorting), [paginated](/blockchain/queries#pagination)
and [filtered](/blockchain/queries#filters) peer-side all at once.

:::

## Conventions

::: details Expand to learn about the conventions used in the descriptions below

1. In the **Details** section of each query, we use _gets_, _returns_, _searches_ with the following precise meanings:

   |       Notation       |                                                                                Meaning                                                                                 |
   | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | _gets_               | The query already has the data readily available and the data is trivial. Use these queries at will.                                                                   |
   | _returns_ or _finds_ | The query has the data readily available, just as with _gets_, but the data is not trivial. You can still use these queries, but be mindful of the performance impact. |
   | _searches_           | For this query, the data must be actively collected and neither the return type nor the collection process is cheap. Use with great care.                              |

2. The queries are provided with just one data type as input, and parameterised by the type of the output.
3. For the `FindZByXAndY` queries, their descriptions have a **Parameters** and a **Returns** section. The parameters can either be single or multiple types, while the output is almost always either one type, or a `Vec<Type>` kind of construction:

   |         Notation         |                                                                                                                     Meaning                                                                                                                     |
   | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Parameters**: `(X, Y)` | In Rust source code, you need to construct the query as `let query = FindZByXAndY::new(x: X, y: Y);`, where `x` and `y` are variables of type `X` and `Y` respectively. In the reference below we provide you with information about each type. |
   | **Returns**: `Vec<Z>`    | The return value is a collection of more than one element of type `Z`. Depending on the SDK implementation this can be a type native to the language (e.g. JavaScript) or a thin wrapper around the Rust Vec structure.                         |

:::

## Role

An optional feature. By default, it is present on all Iroha 2 deployments
when they're compiled in the private blockchain configuration.

You can learn more about roles in a
[dedicated section](/blockchain/permissions.md#permission-groups-roles).

### `FindAllRoles`

- **Returns**: `Vec<Roles>`

- **Details**: Returns all roles registered as _global_ (as opposed to
  _domain-scoped_) in the blockchain.

  <WarningFatQuery />

### `FindAllRoleIds`

- **Returns**: `Vec<Roles>`

- **Details**: Returns IDs of all the roles registered as _global_ (as
  opposed to _domain-scoped_) in the blockchain.

  Note that it does not return its values, which contain permission tokens,
  only IDs.

### `FindRoleByRoleId`

- **Parameters**: `RoleId`

- **Returns**: `Vec<Roles>`

- **Details**: Returns the role that has the provided role ID.

  For example, given the name of the role `admin`, it will return all of
  the `admin`-level permission tokens.

### `FindRolesByAccountId`

- **Parameters**: `AccountId`

- **Returns**: `Vec<RoleId>`

- **Details**: Returns all of the role IDs that are attached to the given
  account.

  Note that unlike [`FindAllRoles`](#findallroles), it does not return the
  roles themselves.

## Permission

A semi-optional feature. You have permissions in both public and private
blockchains but the use cases are different:

- In a public blockchain, most accounts have the same common-sense
  permissions.
- In a private blockchain, most accounts are assumed not to be able to do
  anything outside of their own account or domain unless explicitly granted
  said permission.

We talk about permissions in more detail in a
[dedicated chapter](/blockchain/permissions.md).

### `FindAllPermissionTokenDefinitions`

- **Returns**: `Vec<PermissionTokenDefinition>`

- **Details**: Finds all registered permission token definitions.

### `FindPermissionTokensByAccountId`

- **Parameters**: `AccountId`

- **Returns**: `Vec<PermissionToken>`

- **Details**: Returns all of the permission tokens granted to the
  specified account.

## Account

Most queries in Iroha pertain to accounts. At the moment this is the most
diverse set of queries.

### `FindAllAccounts`

- **Returns**: `Vec<Account>`

- **Details**: Finds all accounts registered globally in the blockchain.

  <WarningFatQuery />

### `FindAccountById`

- **Parameters**: `AccountId`

- **Returns**: `Account`

- **Details**: Returns the full account information corresponding to the
  given `AccountId`.

### `FindAccountKeyValueByIdAndKey`

- **Parameters**: `(AccountId, Name)`

- **Returns**: `Value`

- **Details**: Returns the value keyed by the provided `Name` for the given
  account.

  This is done by querying the [`metadata`](/blockchain/metadata.md)
  attached to the given account.

### `FindAccountsByName`

- **Parameters**: `Name`

- **Returns**: `Vec<Account>`

- **Details**: Returns all of the accounts that have the given `Name`.

  This is particularly useful if you remember the name of the account, but
  do not, for example, recall the domain name in which it was registered.

### `FindAccountsByDomainId`

- **Parameters**: `DomainId`

- **Returns**: `Vec<Account>`

- **Details**: Returns all accounts that belong to a specific domain.

  Note that this returns the full accounts and not the `AccountId`
  collection.

  <WarningFatQuery />

### `FindAccountsWithAsset`

- **Parameters**: `AccountId`

- **Returns**: `Vec<Account>`

- **Details**: Returns all accounts that have the given asset.

## Asset

Assets include simple numbers, but also a special type of key-to-value map
that is used as a secure data storage for privileged information.

### `FindAllAssets`

- **Returns**: `Vec<Asset>`

- **Details**: Returns all known assets by value.

  <WarningFatQuery />

  ::: info

  You should note that this is not the same as `AssetDefinition`. If you
  have one asset called e.g. `tea#wonderland` that belongs to every account
  on the blockchain, you will receive the aggregated value across all
  accounts, but not the information such as the type of the asset.

  :::

### `FindAllAssetDefinitions`

- **Returns**: `Vec<AssetDefinition>`

- **Details**: Returns all known asset definitions by value.

  <WarningFatQuery />

  ::: tip

  To reduce the load on the network, we store the definition of an asset
  separate from its instances. So if you want to know if an asset is
  mintable or what type is stored in it, you need to query the asset
  definition, rather than the asset itself.

  :::

### `FindAssetById`

- **Parameters**: `AssetId`

- **Returns**: `Asset`

- **Details**: Returns the aggregated data about the asset usage across the
  network.

### `FindAssetsByName`

- **Parameters**: `Name`

- **Returns**: `Vec<Asset>`

- **Details**: Searches the network for all assets that match the given
  name.

### `FindAssetsByAccountId`

- **Parameters**: `AccountId`

- **Returns**: `Vec<Asset>`

- **Details**: Returns all of the assets that belong to a given account.

### `FindAssetsByAssetDefinitionId`

- **Parameters**: `AssetDefinitionId`

- **Returns**: `Vec<Asset>`

- **Details**: Searches for all of the assets that have the given
  definition ID.

<WarningFatQuery />

### `FindAssetsByDomainId`

- **Parameters**: `DomainId`

- **Returns**: `Vec<Asset>`

- **Details**: Returns all assets that are registered in the given domain.

<WarningFatQuery />

### `FindAssetsByDomainIdAndAssetDefinitionId`

- **Parameters**: `(DomainId, AssetDefinitionId)`

- **Returns**: `Vec<Asset>`

- **Details**: Searches the domain for assets that have the given
  definition ID.

### `FindAssetQuantityById`

- **Parameters**: `AssetId`

- **Returns**: `NumericValue`

- **Details**: Returns the asset quantity.

  Note that this query assumes that the asset given by the identifier is of
  type `AssetValue::Quantity`.

  ::: warning

  This query can fail.

  :::

### `FindAssetKeyValueByIdAndKey`

- **Parameters**: `(AssetId, Name)`

- **Returns**: `Value`

- **Details**: Gets the value keyed by the given name in the
  [metadata](/blockchain/metadata.md) of the asset corresponding to
  the given identifier.

### `FindAssetDefinitionKeyValueByIdAndKey`

- **Parameters**: `(AssetDefinitionId, Name)`

- **Returns**: `Value`

- **Details**: Gets the value keyed by the given name in the
  [metadata](/blockchain/metadata.md) of the asset definition
  corresponding to the given identifier.

### `FindTotalAssetQuantityByAssetDefinitionId`

- **Parameters**: `AssetDefinitionId`

- **Returns**: `NumericValue`

- **Details**: Finds the total asset quantity for the given asset
  definition. For the `Store` asset value, finds the sum of asset
  quantities through all accounts that hold the specified asset.

## Block

### `FindAllBlocks`

- **Returns**: `Vec<VersionedCommittedBlock>`
- **Details**: Returns all blocks in the blockchain.

### `FindAllBlockHeaders`

- **Returns**: `Vec<BlockHeader>`
- **Details**: Returns all block headers for blocks in the blockchain.

### `FindBlockHeaderByHash`

- **Parameters**: `Hash`
- **Returns**: `BlockHeader`
- **Details**: Gets the block header that matches the hash that was
  provided.

## Domain

The domain is the basic unit of organisation in an Iroha blockchain.
Accounts and assets must be registered inside a domain, triggers are
usually scoped by domain, and most queries have the domain as a possible
input.

### `FindAllDomains`

- **Returns**: `Vec<Domain>`

- **Details**: Returns all of the known registered domains.

  ::: warning

  This query returns the full contents of the world state view as of
  execution. This query should be used sparingly and for debugging purposes
  only.

  :::

### `FindDomainById`

- **Parameters**: `DomainId`

- **Returns**: `Domain`

- **Details**: Gets the domain corresponding to the given identifier.

  <WarningFatQuery />

### `FindDomainKeyValueByIdAndKey`

- **Parameters**: `(DomainId, Name)`

- **Returns**: `Value`

- **Details**: Returns the value keyed by the given name in the domain
  corresponding to the given identifier.

## Peer

A peer is the basic unit of storage and validation. In common parlance we
may conflate the node and the peer binary running on the node, but in this
case we specifically mean the peer binary as a server with its specific
configuration.

### `FindAllPeers`

- **Returns**: `Vec<Peer>`

- **Details**: Returns all known peers identified by their key and
  accompanied by the address of the API endpoint of each.

### `FindAllParameters`

- **Returns**: `Vec<Parameter>`

  ```rust
  pub enum Parameter {
      /// Maximum amount of Faulty Peers in the system.
      MaximumFaultyPeersAmount(u32),
      /// Maximum time for a leader to create a block.
      BlockTime(u128),
      /// Maximum time for a proxy tail to send commit message.
      CommitTime(u128),
      /// Time to wait for a transaction Receipt.
      TransactionReceiptTime(u128),
  }
  ```

- **Details**: Returns the parameters used by all peers in the network.

  This is useful for debugging if any of the peers are incorrectly
  configured and causing view changes.

## Transaction

It is often necessary to query the state of specific transactions,
especially for use in blockchain explorers and for user-facing
applications.

### `FindTransactionsByAccountId`

- **Parameters**: `AccountId`

- **Returns**: `Vec<TransactionValue>`

  ```rust
  pub enum TransactionValue {
      /// Committed transaction
      Transaction(Box<VersionedSignedTransaction>),
      /// Rejected transaction with reason of rejection
      RejectedTransaction(Box<VersionedRejectedTransaction>),
  }
  ```

- **Details**: Returns the full set of transactions that an account has
  submitted throughout the existence of the blockchain.

  <WarningFatQuery />

### `FindTransactionByHash`

- **Parameters**: `Hash`

- **Returns**: `TransactionValue`

- **Details**: Returns the transaction by hash.

## Trigger

Iroha is an event-driven architecture. Every modification of the world
state emits a corresponding event that can be captured by appropriate event
listeners called filters.

::: info

Note that Iroha shut downs all listeners on panic.

:::

### `FindAllActiveTriggerIds`

- **Returns**: `Vec<TriggerId>`

- **Details**: Finds all currently active triggers, that is, triggers that
  have not expired at the time of the query.

<WarningFatQuery />

### `FindTriggerById`

- **Parameters**: `TriggerId`

- **Returns**: `Trigger`

- **Details**: Finds the trigger with the given ID.

### `FindTriggerKeyValueByIdAndKey`

- **Parameters**: `(TriggerId, Name)`

- **Returns**: `Trigger`

- **Details**: Finds the value corresponding to the key in the
  [metadata](/blockchain/metadata.md) of the trigger with the given
  ID.

### `FindTriggersByDomainId`

- **Parameters**: `DomainId`

- **Returns**: `Vec<Trigger>`

- **Details**: Finds all domain triggers for the given domain ID.
