# Assets

An Iroha asset is a numeric balance held by an account. Every concrete
balance points to an `AssetDefinition`, and the definition describes how
that asset can be named, minted, displayed, and partitioned.

## Asset Definition

An `AssetDefinition` contains:

- `id`: the canonical asset definition address
- `name`: a human-readable display name
- `description`: optional human-readable description
- `alias`: optional alias in `<name>#<domain>.<dataspace>` or
  `<name>#<dataspace>` form
- `spec`: numeric precision and constraints for balances
- `mintable`: the mintability policy
- `logo`: optional `SoraFS` URI
- `metadata`: arbitrary key-value metadata
- `balance_scope_policy`: whether balances are global or
  dataspace-restricted
- `owned_by`: the account that registered or owns the definition
- `total_quantity`: total issued quantity
- `confidential_policy`: policy for shielded asset operations

Asset definition IDs are canonical opaque addresses. When a definition is
constructed from a domain and a name, Iroha can keep that domain/name
projection for UX and queries, but the canonical text form is the generated
address.

## Asset Balance

An `Asset` contains:

- `id`: an `AssetId`, which combines the asset definition, holder account,
  and optional balance scope
- `value`: a `Numeric` balance

The holder account is canonical and domainless. The asset definition may be
projected under a dataspace-qualified domain, for example
`payments.universal`.

## Mintability

Asset definitions support these mintability modes:

| Mode         | Meaning                                                           |
| ------------ | ----------------------------------------------------------------- |
| `Infinitely` | Elastic supply. The asset can be minted and burned repeatedly.    |
| `Once`       | Fixed-supply token. It can be minted once and then burned.        |
| `Not`        | Fixed-supply token that can be burned but not minted again.       |
| `Limited(n)` | Minting is allowed for a limited number of additional operations. |

Use `Infinitely` for normal elastic assets and `Once` or `Limited(n)` for
fixed-supply or bounded-supply assets. Do not use `Not` as an initial
policy unless the asset supply is already established.

## Balance Scope

The `balance_scope_policy` controls how balances are bucketed:

- `Global`: one balance bucket per account and asset definition
- `DataspaceRestricted`: balances are partitioned by dataspace context

Dataspace-restricted balances are useful when the same asset definition is
used across multiple Nexus dataspaces but balances must remain isolated.

## Try It on Taira

These read-only calls show real asset definitions on the public Taira testnet:

```bash
TAIRA_ROOT=https://taira.sora.org

curl -fsS "$TAIRA_ROOT/v1/assets/definitions?limit=10" \
  | jq -r '.items[] | [.id, .name, .mintable, .total_quantity] | @tsv'
```

Find the current Taira XOR fee asset definition:

```bash
curl -fsS "$TAIRA_ROOT/v1/assets/definitions?limit=100" \
  | jq '.items[]
    | select(.name == "XOR")
    | {id, name, total_quantity, mintable, confidential_policy: .confidential_policy.mode}'
```

Look for definitions that carry metadata:

```bash
curl -fsS "$TAIRA_ROOT/v1/assets/definitions?limit=100" \
  | jq '.items[]
    | select((.metadata | length) > 0)
    | {id, name, metadata}'
```

All three examples are reads. To mint, burn, or transfer assets on Taira, use a
faucet-funded account and the guarded flow in
[Connect to SORA Nexus Dataspaces](/get-started/sora-nexus-dataspaces.md).

For a fee-paying Taira asset example, save the faucet helper from
[Get Testnet XOR on Taira](/get-started/sora-nexus-dataspaces.md#_4-get-testnet-xor-on-taira)
as `taira_faucet_claim.py`, then claim the faucet asset first and use it as the
transaction gas asset:

```bash
export TAIRA_ACCOUNT_ID='<TAIRA_I105_ACCOUNT_ID>'
export TAIRA_FEE_ASSET=6TEAJqbb8oEPmLncoNiMRbLEK6tw

python3 taira_faucet_claim.py "$TAIRA_ACCOUNT_ID"
printf '{"gas_asset_id":"%s"}\n' "$TAIRA_FEE_ASSET" > taira.tx-metadata.json
```

Then include `--metadata ./taira.tx-metadata.json` on `ledger asset mint`,
`ledger asset burn`, and `ledger asset transfer` commands.

## Instructions

Assets can be registered, minted, burned, and transferred with Iroha
Special Instructions:

- [`Register` and `Unregister`](/blockchain/instructions.md#un-register)
- [`Mint` and `Burn`](/blockchain/instructions.md#mint-burn)
- [`Transfer`](/blockchain/instructions.md#transfer)
- [`SetKeyValue` and `RemoveKeyValue`](/blockchain/instructions.md#setkeyvalue-removekeyvalue)

See also:

- [CLI guide](/get-started/operate-iroha-2-via-cli.md)
- [Rust tutorial](/guide/tutorials/rust.md)
- [Python tutorial](/guide/tutorials/python.md)
- [JavaScript/TypeScript tutorial](/guide/tutorials/javascript.md)
- [Data model](/blockchain/data-model.md)
- [NFTs](/blockchain/nfts.md)
