# Permissions

Accounts need permission tokens for various actions on a blockchain, e.g.
to mint or burn assets.

There is a difference between a public and a private blockchain in terms of
permissions granted to users. In a public blockchain, most accounts have
the same set of permissions. In a private blockchain, most accounts are
assumed not to be able to do anything outside of their own account or
domain unless explicitly granted said permission.

Having a permission to do something means having a `PermissionToken` to do
so. There are two ways for users to receive permission tokens: they can be
granted directly or as a part of a [`Role`](#permission-groups-roles) (a
set of permission tokens). Permissions are granted via `Grant` special
instruction. Permission tokens and roles do not expire, they can only be
removed using `Revoke` instruction.

## Permission Tokens

Permission token definitions have parameters. When a new permission token
is registered, the names of the parameters and their types are checked
against their names and types in the token definition. The token
registration fails if there are too few parameters, if the parameter types
don't match the definition, or parameters with unrecognised names.

Here are some examples of parameters used for various permission tokens:

- A token that grants permission to change the values associated to keys in
  a `Store` asset needs the `asset_definition_id` parameter of type `Id`:

  ```json
    "params": {
       "asset_definition_id": "Id"
  }
  ```

- By contrast, the permission token that grants the permission to set keys
  to values in user _metadata_ needs the `account_id` parameter of type
  `Id`:

  ```json
  "params": {
    "account_id": "Id"
  }
  ```

- The permission token that grants the permission to transfer assets only a
  fixed number of times per some time period, needs these two parameters:

  ```json
  "params": {
    "count": "U32",
    "period": "U128"
  }
  ```

  Where the `period` is specified as a standard Duration since the UNIX
  epoch in milliseconds (more details about
  [time in Rust](https://doc.rust-lang.org/std/time/struct.SystemTime.html)).

### Pre-configured Permission Tokens

You can find the list of pre-configured permission tokens in the [Reference](/reference/permissions) chapter.

## Permission Groups (Roles)

A set of permissions is called a **role**. Similarly to permission tokens,
roles can be granted using the `Grant` instruction and revoked using the
`Revoke` instruction.

Before granting a role to an account, the role should be registered first.

<!-- TODO: add more info about roles -->

### Register a new role

Let's register a new role that, when granted, will allow another account
access to the [metadata](/blockchain/metadata.md) in Mouse's account:

```rust
let role_id = RoleId::from_str("ACCESS_TO_MOUSE_METADATA")?;
let role = iroha_data_model::role::Role::new(role_id)
    .add_permission(CanSetKeyValueInUserMetadata::new(mouse_id))
    .add_permission(CanRemoveKeyValueInUserMetadata::new(mouse_id));
let register_role = RegisterBox::new(role);
```

### Grant a role

After the role is registered, Mouse can grant it to Alice:

```rust
let grant_role = GrantBox::new(role_id, alice_id);
let grant_role_tx =
    Transaction::new(mouse_id, vec![grant_role.into()].into(), 100_000)
    .sign(mouse_key_pair)?;
```

## Permission Validators

Permissions exist so that only those accounts that have a required
permission token to perform a certain action could do so.

The `Judge` trait is used to check permissions. The `Judge` decides whether
a certain operation (instruction, query, or expression) could be performed
based on the verdicts of multiple validators.

Each validator returns one of the following verdicts: `Deny` (with the
exact reason to deny an operation), `Skip` (if an operation is not
supported or has no meaning in a given context), or `Allow`.

There are several implementations of the `Judge` trait in Iroha 2, such as:

| Judge                        | Description                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AtLeastOneAllow`            | The judge that succeeds only if there is at least one `Allow` verdict. The execution is stopped once there is a first `Allow` verdict.                                               |
| `NoDenies`                   | The judge that succeeds only if there is no `Deny` verdict. All validators are checked.                                                                                              |
| `NoDeniesAndAtLeastOneAllow` | The judge that succeeds only if there is no `Deny` verdict and at least one `Allow` verdict. The execution is stopped once there is a `Deny` verdict or all validators were checked. |
| `AllowAll`                   | For tests and simple cases. All operations are allowed to be executed for all possible values.                                                                                       |
| `DenyAll`                    | For tests and simple cases. All operations are disallowed to be executed for all possible for all possible values.                                                                   |

You can also build a custom permission validator by combining multiple
validators, all of which should be of the same type (for checking
instructions, queries, or expressions).

### Runtime Validators

Currently Iroha 2 has only built-in validators. In the future, built-in
validators will be completely replaced with **runtime validators** that use
WASM.

The **chain** of runtime validators is used to validate operations that
require permissions. It works similarly to the
[`Chain of responsibility`](https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern).

All runtime validators return **validation verdict**. By default, all
operations are considered **valid** unless proven otherwise. Validators
check whether or not an operation is not allowed: each validator either
allows an operation and passes it to the following validator, or denies the
operation. The validation stops at the first `Deny` verdict.

## Supported Queries

Permission tokens and roles can be queried.

Queries for roles:

- [`FindAllRoles`](/reference/queries.md#findallroles)
- [`FindAllRoleIds`](/reference/queries.md#findallroleids)
- [`FindRoleByRoleId`](/reference/queries.md#findrolebyroleid)
- [`FindRolesByAccountId`](/reference/queries.md#findrolesbyaccountid)

Queries for permission tokens:

- [`FindAllPermissionTokenDefinitions`](/reference/queries.md#findallpermissiontokendefinitions)
- [`FindPermissionTokensByAccountId`](/reference/queries.md#findpermissiontokensbyaccountid)
