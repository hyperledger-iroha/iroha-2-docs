# Permissions

This section provides details about pre-configured permission tokens in Iroha 2. For more general information on permission tokens and permission groups (roles), refer to the [Permissions](/blockchain/permissions) chapter in Guide.

## Permission Tokens

The following permission tokens are pre-configured in Iroha 2:

| Permission Token                        | Category         | Operation                                                          |
|-----------------------------------------|------------------|--------------------------------------------------------------------|
| [`CanUnregisterDomain`]                 | Domain           | Allows to unregister a domain                                      |
| [`CanSetKeyValueInDomain`]              | Domain           | Allows to add domain's metadata key value                          |
| [`CanRemoveKeyValueInDomain`]           | Domain           | Allows to remove domain's metadata key value                       |
| [`CanUnregisterAccount`]                | Account          | Allows to unregister an account                                    |
| [`CanMintUserPublicKeys`]               | Account          | Allows to add a public key to an account                           |
| [`CanBurnUserPublicKeys`]               | Account          | Allows to remove a public key from an account                      |
| [`CanMintUserSignatureCheckConditions`] | Account          | Allows to set check conditions for a signature                     |
| [`CanSetKeyValueInUserAccount`]         | Account          | Allows to add user's metadata key value                            |
| [`CanRemoveKeyValueInUserAccount`]      | Account          | Allows to remove user's metadata key value                         |
| [`CanRegisterAssetsWithDefinition`]     | Asset            | Allows to register a new asset with this definition                |
| [`CanUnregisterAssetsWithDefinition`]   | Asset            | Allows to unregister a new asset with this definition              |
| [`CanUnregisterUserAsset`]              | Asset            | Allows to remove asset from a user                                 |
| [`CanMintAssetsWithDefinition`]         | Asset            | Allows to mint quantity of assets with this definition             |
| [`CanBurnAssetsWithDefinition`]         | Asset            | Allows to burn quantity of assets with this definition             |
| [`CanTransferAssetsWithDefinition`]     | Asset            | Allows to transfer quantity of assets with this definition         |
| [`CanBurnUserAsset`]                    | Asset            | Allows to burn user's asset quantity                               |
| [`CanTransferUserAsset`]                | Asset            | Allows to transfer user's asset quantity                           |
| [`CanSetKeyValueInUserAsset`]           | Asset            | Allows to set key value to user's asset metadata                   |
| [`CanRemoveKeyValueInUserAsset`]        | Asset            | Allows to remove key value from user's asset metadata              |
| [`CanSetKeyValueInAssetDefinition`]     | Asset Definition | Allows to add key value to metadata for this asset definition      |
| [`CanRemoveKeyValueInAssetDefinition`]  | Asset Definition | Allows to remove key value from metadata for this asset definition |
| [`CanUnregisterAssetDefinition`]        | Asset Definition | Allows to unregister this asset definition                         |

::: info

The way permissions work in Iroha 2 is subject to change.
Only an owner of the subject can grant permissions for the subject.

By default, all assets and accounts defined in the genesis block configuration file are created by `genesis@genesis` account. 
This means that `alice@wonderland` is not the owner of `rose#wonderland` and cannot grant permission for `rose#wonderland`.

To avoid this you can:
1. Edit the `genesis.json` file to only include the creation of  `alice@wonderland`, and then redeploy Iroha 2.
2. Create a subject (e.g., an asset definition) on behalf of `alice@wonderland`, and then give another account the permission to manage this subject.

:::

### `General example`

With this example, the owner-account can give permission for its subject to another account.
The example is based on the following pre-conditions:
    The subject is created by the owner-account
    The recipient account is created

```rust
// Define the asset definition owner
let asset_definition_owner = AccountId::from_str("alice@wonderland").unwrap();
// Define the asset definition id which was created by the owner
let asset_definition_id = AssetDefinitionId::from_str("coolAsset#wonderland").unwrap();
// Define the account which we want to give the permission
let recipient_account = AccountId::from_str("actor@wonderland").unwrap();
// Create a token that we chose. And define its structure according to `iroha_executor\smart_contract\executor\src\default.rs`
let can_mint_asset_with_definition_token = PermissionToken::new(
"CanMintAssetsWithDefinition".parse().unwrap(),
&json!({ "asset_definition_id": asset_definition_id }),
);
// Create a permission expression (Grant\Revoke)
let permission_expression = GrantExpr::new(can_mint_asset_with_definition_token, recipients_account);
// Submit the transaction with the permission expression
iroha_client.submit_blocking(permission_expression).unwrap();
```