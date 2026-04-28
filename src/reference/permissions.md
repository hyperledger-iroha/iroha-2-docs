# Permission Tokens

This page lists the default permission-token types exposed by the current
Iroha executor data model. For the conceptual guide to roles and permissions,
see [Permissions](/blockchain/permissions.md).

Permission checks are enforced by the active runtime validator. The token type
names below describe the standard policy surface, but a network can customize
runtime validation by upgrading the executor.

## Default Tokens

| Permission token | Category | Operation |
| --- | --- | --- |
| `CanManagePeers` | Peer | Register, unregister, or otherwise manage peers. |
| `CanManageLaneRelayEmergency` | Peer | Manage emergency lane-relay controls. |
| `CanRegisterDomain` | Domain | Register a domain. |
| `CanUnregisterDomain` | Domain | Unregister a domain. |
| `CanModifyDomainMetadata` | Domain | Modify domain metadata. |
| `CanRegisterAccount` | Account | Register an account. |
| `CanUnregisterAccount` | Account | Unregister an account. |
| `CanModifyAccountMetadata` | Account | Modify account metadata. |
| `CanUnregisterAssetDefinition` | Asset definition | Unregister an asset definition. |
| `CanModifyAssetDefinitionMetadata` | Asset definition | Modify asset-definition metadata. |
| `CanMintAssetWithDefinition` | Asset | Mint assets for a specific definition. |
| `CanBurnAssetWithDefinition` | Asset | Burn assets for a specific definition. |
| `CanTransferAssetWithDefinition` | Asset | Transfer assets for a specific definition. |
| `CanMintAsset` | Asset | Mint a specific asset balance. |
| `CanBurnAsset` | Asset | Burn a specific asset balance. |
| `CanTransferAsset` | Asset | Transfer a specific asset balance. |
| `CanRegisterNft` | NFT | Register an NFT. |
| `CanUnregisterNft` | NFT | Unregister an NFT. |
| `CanTransferNft` | NFT | Transfer an NFT. |
| `CanModifyNftMetadata` | NFT | Modify NFT metadata. |
| `CanSetParameters` | Parameters | Set on-chain configuration parameters. |
| `CanManageRoles` | Roles | Register, unregister, grant, or revoke roles. |
| `CanRegisterTrigger` | Trigger | Register a trigger. |
| `CanExecuteTrigger` | Trigger | Execute a trigger. |
| `CanUnregisterTrigger` | Trigger | Unregister a trigger. |
| `CanModifyTrigger` | Trigger | Modify trigger configuration. |
| `CanModifyTriggerMetadata` | Trigger | Modify trigger metadata. |
| `CanUpgradeExecutor` | Executor | Upgrade the runtime executor. |
| `CanRegisterSmartContractCode` | Smart contract | Register smart contract code. |
| `CanUseFeeSponsor` | Nexus | Charge Nexus fees to a specified sponsor account. |

## Ownership

Owner-sensitive permission tokens must reference the canonical object IDs used
by the current data model. For example, account permissions refer to canonical
domainless account IDs, domain permissions refer to `domain.dataspace` domain
IDs, and asset permissions refer to canonical asset definition or asset IDs.

When a transaction fails with an authorization error, verify both sides:

- the account signing the transaction is the expected canonical account
- the permission token or role was granted for the exact object ID used in the
  instruction
