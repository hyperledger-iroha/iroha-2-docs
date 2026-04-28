# Data Model

Iroha stores ledger state in the `World`. The current model keeps the same
high-level entities as Iroha 2 while changing several identifiers for Iroha 3
and Nexus flows:

- domains are dataspace-qualified, for example `payments.universal`
- accounts are canonical and domainless; the account ID is derived from the
  account controller
- asset definitions can keep a domain/name projection, but their canonical
  textual address is an opaque Base58 identifier
- assets are balances held by accounts for a specific asset definition

```mermaid
classDiagram

class World
class Domain {
  id: DomainId
  logo: Option<SorafsUri>
  metadata: Metadata
  owned_by: AccountId
}
class Account {
  id: AccountId
  metadata: Metadata
  label: Option<AccountAlias>
  uaid: Option<UniversalAccountId>
  opaque_ids: Vec<OpaqueAccountId>
}
class AccountController {
  key
  multisig policy
}
class AssetDefinition {
  id: AssetDefinitionId
  spec
  mintable
  metadata
}
class Asset {
  id: AssetId
  value
}

World *-- Domain : registers
World *-- Account : registers
World *-- AssetDefinition : registers
World *-- Asset : stores balances
Account --> AccountController : authorized by
Domain --> Account : owned_by
AssetDefinition --> Domain : optional projection
Asset --> AssetDefinition : definition
Asset --> Account : held by
```

## Example

In an Iroha 3 network, `wonderland.universal` is a domain inside the
`universal` dataspace. `alice` and `rabbit` are not encoded as
`alice@wonderland`; they are canonical accounts controlled by their keys or
policies. A projected asset definition can still be constructed from a domain
and name such as `rose` in `wonderland.universal`, while the canonical asset
definition address used on the wire is the generated Base58 address.

```mermaid
classDiagram

class domain_wonderland {
  id = "wonderland.universal"
}
class account_alice {
  id = "AccountId(controller=alice_key)"
  label = "alice"
}
class account_rabbit {
  id = "AccountId(controller=rabbit_key)"
  label = "rabbit"
}
class asset_rose {
  name projection = "rose"
  domain projection = "wonderland.universal"
}

domain_wonderland --> account_alice : owned_by
asset_rose --> domain_wonderland : projected under
account_alice --> asset_rose : holds balance
account_rabbit --> asset_rose : may receive balance
```

## Related docs

| Topic | Where to go |
| --- | --- |
| Domains | [Domains](/blockchain/domains.md) |
| Accounts | [Accounts](/blockchain/accounts.md) |
| Assets | [Assets](/blockchain/assets.md) |
| Metadata | [Metadata](/blockchain/metadata.md) |
| Registration and transfer instructions | [Instructions](/blockchain/instructions.md) |
| Runtime permissions | [Permissions](/blockchain/permissions.md) |
