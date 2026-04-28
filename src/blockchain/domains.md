# Domains

Domains are named namespaces registered in the `World`. In the current Iroha
3 data model a domain is qualified by its parent dataspace, so the canonical
identifier is:

```text
domain.dataspace
```

For example, `payments.universal` names the `payments` domain inside the
`universal` dataspace.

## Structure

A registered `Domain` contains:

- `id`: the dataspace-qualified `DomainId`
- `logo`: an optional `SoraFS` URI for a domain logo
- `metadata`: arbitrary key-value metadata
- `owned_by`: the account that owns the domain, normally the account that
  registered it

The transaction payload used to create a domain is `NewDomain`. It carries
the `id`, optional `logo`, and initial `metadata`. The runtime fills
`owned_by` from the authority that registers the domain.

## Registration

Domains are registered and unregistered with the generic
[`Register` and `Unregister`](/blockchain/instructions.md#un-register)
instructions. With the CLI:

```bash
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain register --id payments.universal
cargo run --bin iroha -- --config ./defaults/client.toml ledger domain list all
```

Registering a domain requires the appropriate domain-management permission
under the active runtime validator. Domain metadata can be updated with
[`SetKeyValue` and `RemoveKeyValue`](/blockchain/instructions.md#setkeyvalue-removekeyvalue)
when the authority has permission to modify that domain.

## Relationship to other entities

Domains group ledger objects and provide a namespace for domain-scoped data.
Asset definitions use domain-qualified identifiers, and queries can list
domains or find objects scoped to a domain. Accounts themselves are
domainless in the current data model, but accounts can own domains and hold
assets whose definitions live under domains.

See also:

- [World](/blockchain/world.md)
- [Assets](/blockchain/assets.md)
- [Metadata](/blockchain/metadata.md)
- [Naming rules](/reference/naming.md)
