# NFTs

An Iroha NFT is a unique ledger object with one owner. Use NFTs when a
record needs its own identity, metadata, lifecycle events, and ownership
transfer semantics, but does not need a numeric balance.

Unlike a numeric [asset](/blockchain/assets.md), an NFT does not have
precision, mintability, or per-account quantities. The NFT exists as one
registered object, and ownership is tracked directly on that object.

## Structure

A registered `Nft` contains:

- `id`: an `NftId`
- `content`: metadata that describes the NFT
- `owned_by`: the account that owns the NFT

The `content` field is a `Metadata` map. Keep it compact: store descriptive
fields, stable references, hashes, URIs, or SoraFS paths there. Store large
documents, media, or high-churn application state off-chain and keep only a
verifiable reference on the NFT.

## Try It on Taira

Check whether the public Taira testnet currently has NFT records:

```bash
curl -fsS 'https://taira.sora.org/v1/nfts?limit=5' \
  | jq '{total, nft_ids: [.items[].id]}'
```

Check the live OpenAPI document for NFT routes exposed by the node:

```bash
curl -fsS https://taira.sora.org/openapi.json \
  | jq -r '.paths | keys[] | select(startswith("/v1/nfts") or startswith("/v1/explorer/nfts"))'
```

An empty `items` array is a valid response on a public testnet. It means there
are no NFTs in the current page, not that NFT instructions are unavailable.

## NFT IDs

`NftId` uses this text form:

```text
name$domain
name$domain.dataspace
```

For example, `badge$docs.universal` identifies the `badge` NFT in the
`docs.universal` domain. If the dataspace is omitted, the current parser
uses the `universal` dataspace, so `badge$docs` resolves to
`badge$docs.universal`.

Use stable names for NFT IDs. The ID is the object identity used by
instructions, queries, permissions, event filters, and application
references.

## Lifecycle

NFT lifecycle operations use Iroha Special Instructions:

- [`Register`](/blockchain/instructions.md#un-register) creates the NFT
  with initial `content`.
- [`Unregister`](/blockchain/instructions.md#un-register) removes the NFT.
- [`Transfer`](/blockchain/instructions.md#transfer) changes `owned_by`.
- [`SetKeyValue` and `RemoveKeyValue`](/blockchain/instructions.md#setkeyvalue-removekeyvalue)
  update NFT metadata.

## Try It Locally

These examples assume you have launched a local network and have the
generated client configuration from the
[CLI guide](/get-started/operate-iroha-2-via-cli.md):

```bash
export IROHA_CONFIG=./localnet/client.toml
export NFT_DOMAIN=nft_demo.universal
export NFT_ID='badge_intro$nft_demo.universal'
```

Register a domain for the example. If it already exists, skip this command
or choose a different `NFT_DOMAIN`.

```bash
cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger domain register --id "$NFT_DOMAIN"
```

Register an NFT. Registration reads the initial content JSON from standard
input:

```bash
printf '{"kind":"badge","level":"intro","issuer":"docs"}\n' |
  cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft register --id "$NFT_ID"
```

Inspect the NFT directly and then list all NFTs with full entries:

```bash
cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft get --id "$NFT_ID"

cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft list all --verbose
```

Add a metadata key and read the NFT again:

```bash
printf '{"color":"blue","rarity":"tutorial"}\n' |
  cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft meta set --id "$NFT_ID" --key traits

cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft get --id "$NFT_ID"
```

Remove the metadata key:

```bash
cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft meta remove --id "$NFT_ID" --key traits
```

Optionally transfer the NFT. Use `ledger nft get` to read the current owner
from `owned_by`, and use `ledger account list all` to find a destination
account ID.

```bash
cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger account list all

export CURRENT_OWNER='<account-id-from-owned_by>'
export NEW_OWNER='<destination-account-id>'

cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft transfer --id "$NFT_ID" --from "$CURRENT_OWNER" --to "$NEW_OWNER"
```

Clean up when you are done. If you transferred the NFT, run this command
with the current owner's account configuration or transfer the NFT back
first.

```bash
cargo run --bin iroha -- --config "$IROHA_CONFIG" \
  ledger nft unregister --id "$NFT_ID"
```

## Queries and Events

Use [`FindNfts`](/reference/queries.md#assets-nfts-and-rwas) to list NFTs
and [`FindNftsByAccountId`](/reference/queries.md#assets-nfts-and-rwas) to
list NFTs owned by an account.

NFT registration, deletion, transfer, and metadata updates emit NFT data
events. Use the `Nft` data event filter when subscribing to ledger changes
or building triggers that react to NFT lifecycle events.

## Permissions

The default permission surface includes NFT-specific tokens:

- `CanRegisterNft`
- `CanUnregisterNft`
- `CanTransferNft`
- `CanModifyNftMetadata`

Permission checks are enforced by the active runtime validator, so a
network can customize authorization by upgrading the executor. See
[Permission Tokens](/reference/permissions.md) for the current default
token list.

## Choosing NFTs

Use an NFT for records where uniqueness and ownership matter:

- certificates, badges, licenses, and attestations
- membership or access records
- identity-bound or account-owned application records
- references to off-chain media, documents, or manifests

Use a numeric asset for fungible balances, and use plain
[metadata](/blockchain/metadata.md) when the data is only a compact
attribute of an existing ledger object.

See also:

- [Assets](/blockchain/assets.md)
- [Metadata](/blockchain/metadata.md)
- [Instructions](/blockchain/instructions.md)
- [Queries](/blockchain/queries.md)
