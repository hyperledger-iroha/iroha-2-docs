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

## Try It on Taira

List the domains currently visible on the public Taira testnet:

```bash
curl -fsS 'https://taira.sora.org/v1/domains?limit=20' \
  | jq -r '.items[].id'
```

Map the public lane catalog back to dataspace aliases:

```bash
curl -fsS https://taira.sora.org/status \
  | jq -r '.teu_lane_commit[]
    | [.lane_id, .alias, .dataspace_alias, .visibility, .block_height, .finality_lag_slots]
    | @tsv'
```

Use the first command when an app needs to check whether a domain exists. Use
the lane catalog when you need to confirm whether a dataspace is public,
restricted, or lagging behind the core lane.

Domain registration is a fee-paying write. Before trying it on Taira, save the
faucet helper from
[Get Testnet XOR on Taira](/get-started/sora-nexus-dataspaces.md#_4-get-testnet-xor-on-taira)
as `taira_faucet_claim.py`, fund the signer through the public faucet, and
attach fee metadata:

```bash
export TAIRA_ACCOUNT_ID='<TAIRA_I105_ACCOUNT_ID>'
export TAIRA_FEE_ASSET=6TEAJqbb8oEPmLncoNiMRbLEK6tw

python3 taira_faucet_claim.py "$TAIRA_ACCOUNT_ID"
printf '{"gas_asset_id":"%s"}\n' "$TAIRA_FEE_ASSET" > taira.tx-metadata.json

iroha --config ./taira.client.toml \
  --metadata ./taira.tx-metadata.json \
  ledger domain register --id docs-example.universal
```

Use a unique domain name for repeated testnet runs.

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
