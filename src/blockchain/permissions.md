# Permissions

Accounts need permission tokens for various actions on a blockchain, e.g.
to mint or burn assets.

There is a difference between a public and a private blockchain in terms of
permissions granted to users. In a public blockchain, most accounts have
the same set of permissions. In a private blockchain, most accounts are
assumed not to be able to do anything outside the authority granted to them
unless explicitly granted the relevant permission.

Having a permission to do something means having a `PermissionToken` to do
so. There are two ways for users to receive permission tokens: they can be
granted directly or as a part of a [`Role`](#permission-groups-roles) (a
set of permission tokens). Permissions are granted via `Grant` special
instruction. Permission tokens and roles do not expire, they can only be
removed using `Revoke` instruction.

## Permission Tokens

Permission tokens are typed objects defined by the active executor. Some
tokens are global, such as `CanManagePeers`, and others are scoped to a
specific ledger object, such as an account, asset, asset definition, domain,
NFT, role, or trigger.

Here are some examples of parameters used for various permission tokens:

- A token that grants permission to modify metadata for a specific account
  carries an `account` field:

  ```json
  {
    "account": "<AccountId>"
  }
  ```

- A token that grants permission to transfer assets for a specific asset
  definition carries an `asset_definition` field:

  ```json
  {
    "asset_definition": "<AssetDefinitionId>"
  }
  ```

- A global token such as `CanManagePeers` has no fields:

  ```json
  {}
  ```

### Pre-configured Permission Tokens

You can find the list of pre-configured permission tokens in the [Reference](/reference/permissions) chapter.

## Permission Groups (Roles)

A set of permissions is called a **role**. Similarly to permission tokens,
roles can be granted using the `Grant` instruction and revoked using the
`Revoke` instruction.

Before granting a role to an account, the role should be registered first.

Roles are useful when several accounts should receive the same permission
set. Register the role once, grant permissions to the role, and then grant or
revoke the role for individual accounts.

### Register a new role

Let's register a new role that, when granted, will allow another account
access to the [metadata](/blockchain/metadata.md) in Mouse's account:

```rust
let role_id = RoleId::from_str("ACCESS_TO_MOUSE_METADATA")?;
let role = iroha_data_model::role::Role::new(role_id.clone(), mouse_id.clone())
    .add_permission(CanModifyAccountMetadata {
        account: mouse_id.clone(),
    });
let register_role = Register::role(role);
```

### Grant a role

After the role is registered, Mouse can grant it to Alice:

```rust
let grant_role = Grant::account_role(role_id, alice_id);
let grant_role_tx = TransactionBuilder::new(chain_id, mouse_id)
    .with_instructions([grant_role])
    .sign(mouse_private_key);
```

## Permission Validators

Permissions exist so that only accounts with the required permission token
can perform a protected action. The default executor checks permissions
during instruction, query, and expression execution.

The default validator surface is grouped by ledger area:

- peer management
- domains and accounts
- assets, NFTs, and escrows
- triggers
- roles and permissions
- executor/runtime, proofs, bridges, and SORA/Nexus modules

The exact token list is source-backed in the
[Permission Tokens reference](/reference/permissions.md).

### Runtime Validators

Permission checks are enforced by the active executor. The default
executor provides the built-in permission validators and token definitions,
and a network can change policy by upgrading the executor it uses.

Validators return a **validation verdict**. A validator can allow an
operation, deny it with a reason, or skip it if the operation is outside of
that validator's scope. The selected judge combines those verdicts to
decide whether the instruction, query, or expression may proceed.

## Supported Queries

Permission tokens and roles can be queried.

Queries for roles:

- [`FindRoles`](/reference/queries.md#accounts-and-permissions)
- [`FindRoleIds`](/reference/queries.md#accounts-and-permissions)
- [`FindRolesByAccountId`](/reference/queries.md#accounts-and-permissions)

Queries for permission tokens:

- [`FindPermissionsByAccountId`](/reference/queries.md#accounts-and-permissions)
