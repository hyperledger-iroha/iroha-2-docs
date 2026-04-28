# Accounts

An account is an authority that can sign transactions and own ledger state.
In the current Iroha 3 data model, `AccountId` is canonical and domainless:
it is derived from the account controller rather than from an `account@domain`
string.

## Structure

A registered `Account` contains:

- `id`: the canonical `AccountId`
- `metadata`: arbitrary account metadata
- `label`: an optional stable alias
- `uaid`: an optional Universal Account ID used by Nexus flows
- `opaque_ids`: opaque identifiers bound to the account's UAID

The transaction payload used to create an account is `NewAccount`. It carries
the same identity, metadata, label, UAID, and opaque ID fields used by the
registered account.

## Account controllers

The controller defines how the account authorizes actions. The default client
flow uses an Ed25519 key pair, but the data model also supports richer
controllers such as multisignature policy controllers.

Client configuration stores the signing authority separately from peer
configuration:

```toml
[account]
public_key = "ed0120..."
private_key = { digest_function = "ed25519", payload = "..." }
```

See [client configuration](/guide/configure/client-configuration.md) and
[key generation](/guide/security/generating-cryptographic-keys.md) for the
current key formats.

## Registration and permissions

Accounts are registered and unregistered with the generic
[`Register` and `Unregister`](/blockchain/instructions.md#un-register)
instructions. The active runtime validator decides who can create accounts
and which permission tokens or roles are required.

After registration, an account can:

- sign transactions
- hold assets
- own domains
- receive roles and permission tokens
- store metadata
- participate in alias, rekey, recovery, and Nexus identity flows when those
  features are enabled

## Troubleshooting identity issues

If a transaction is rejected unexpectedly, check that:

- the client public key matches the private key used for signing
- the account was registered in genesis or by a committed transaction
- the authority has the permissions required by the instruction
- scripts are not using old `account@domain` literals where a canonical
  account address is required

See also:

- [Permissions](/blockchain/permissions.md)
- [Metadata](/blockchain/metadata.md)
- [Client configuration](/guide/configure/client-configuration.md)
- [SORA Nexus dataspaces](/get-started/sora-nexus-dataspaces.md)
