# Queries

Iroha queries read ledger state without mutating it. The current data model
exposes two broad query shapes:

- **singular queries**, which return one object or one value
- **iterable queries**, which return a stream or collection and can be combined
  with filtering, sorting, projection, and pagination where the query type
  supports it

Use SDK typed builders or the CLI instead of constructing query envelopes by
hand. The names below are the current query types exposed by
`iroha_data_model::query`.

## Runtime and Configuration

| Query | Purpose |
| --- | --- |
| `FindAbiVersion` | Return the executor ABI version. |
| `FindExecutorDataModel` | Return the executor data-model description. |
| `FindParameters` | Return on-chain executor configuration parameters. |

## Accounts and Permissions

| Query | Purpose |
| --- | --- |
| `FindAccountById` | Find one account by canonical account ID. |
| `FindAccountByAlias` | Resolve an account alias to an account. |
| `FindAccounts` | List registered accounts. |
| `FindAccountIds` | List registered account IDs. |
| `FindAccountsWithAsset` | List accounts that hold a given asset definition. |
| `FindAliasesByAccountId` | List aliases bound to an account. |
| `FindAccountRecoveryPolicyByAlias` | Find the recovery policy for an alias. |
| `FindAccountRecoveryRequestByAlias` | Find the recovery request for an alias. |
| `FindRoles` | List roles. |
| `FindRoleIds` | List role IDs. |
| `FindRolesByAccountId` | List roles granted to an account. |
| `FindPermissionsByAccountId` | List permissions granted to an account. |

## Domains and Peers

| Query | Purpose |
| --- | --- |
| `FindDomainById` | Find one domain by `DomainId`. |
| `FindDomains` | List registered domains. |
| `FindDomainsByAccountId` | List domains owned by an account. |
| `FindDomainEndorsements` | List domain endorsement records. |
| `FindDomainEndorsementPolicy` | Return the domain endorsement policy. |
| `FindDomainCommittee` | Return the domain committee. |
| `FindPeers` | List trusted peers known to the ledger. |

## Assets, NFTs, and RWAs

| Query | Purpose |
| --- | --- |
| `FindAssets` | List asset balances. |
| `FindAssetsDefinitions` | List asset definitions. |
| `FindAssetsByAccountId` | List assets held by an account. |
| `FindAssetById` | Find one asset balance by `AssetId`. |
| `FindAssetDefinitionById` | Find one asset definition by ID. |
| `FindNfts` | List NFTs. |
| `FindNftsByAccountId` | List NFTs owned by an account. |
| `FindRwas` | List registered real-world-asset lots. |

## Escrow and Proof Records

| Query | Purpose |
| --- | --- |
| `FindAssetEscrows` | List asset escrow records. |
| `FindAssetEscrowById` | Find one asset escrow by ID. |
| `FindAssetEscrowsBySeller` | List asset escrows by seller. |
| `FindAssetEscrowsByBuyer` | List asset escrows by buyer. |
| `FindAssetEscrowsByStatus` | List asset escrows by status. |
| `FindAnonymousAssetEscrows` | List anonymous asset escrow records. |
| `FindAnonymousAssetEscrowById` | Find one anonymous asset escrow by ID. |
| `FindAnonymousAssetEscrowsBySeller` | List anonymous escrows by seller. |
| `FindAnonymousAssetEscrowsByBuyer` | List anonymous escrows by buyer. |
| `FindAnonymousAssetEscrowsByStatus` | List anonymous escrows by status. |
| `FindProofRecordById` | Find one proof record by ID. |
| `FindProofRecords` | List proof records. |
| `FindProofRecordsByBackend` | List proof records for a proof backend. |
| `FindProofRecordsByStatus` | List proof records by status. |

## Nexus, Data Availability, and Packages

| Query | Purpose |
| --- | --- |
| `FindRepoAgreements` | List repository agreements stored on-chain. |
| `FindTwitterBindingByHash` | Resolve a Twitter binding by hash. |
| `FindDaPinIntentByTicket` | Find a data-availability pin intent by ticket. |
| `FindDaPinIntentByManifest` | Find a pin intent by manifest reference. |
| `FindDaPinIntentByAlias` | Find a pin intent by alias. |
| `FindDaPinIntentByLaneEpochSequence` | Find a pin intent by lane, epoch, and sequence. |
| `FindLaneRelayEnvelopeByRef` | Find a verified lane-relay envelope. |
| `FindSorafsProviderOwner` | Resolve the owner of a SoraFS provider. |
| `FindDataspaceNameOwnerById` | Resolve a dataspace-name owner. |
| `FindMusubiReleaseByRef` | Find a Musubi release by reference. |
| `FindMusubiPackageVersions` | List versions for a Musubi package. |
| `FindMusubiPackageReleases` | List releases for a Musubi package. |
| `FindMusubiShortAliasByName` | Resolve a Musubi short alias. |

## Triggers, Contracts, Transactions, and Blocks

| Query | Purpose |
| --- | --- |
| `FindActiveTriggerIds` | List active trigger IDs. |
| `FindTriggers` | List triggers. |
| `FindTriggerById` | Find one trigger by ID. |
| `FindContractManifestByCodeHash` | Find a smart-contract manifest by code hash. |
| `FindTransactions` | List committed transactions. |
| `FindBlocks` | List blocks. |
| `FindBlockHeaders` | List block headers. |

## Filtering and Pagination

Iterable queries can expose predicate and selector support. Use query-specific
typed filters from the SDK so the filter input matches the query output type.
For large result sets, use query parameters such as cursor and limit instead
of fetching every row at once.
