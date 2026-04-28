# Metadata and Ledger Storage Choices

Older Iroha documentation described a separate `Store` asset type for arbitrary
key-value data. The current data model does not use that asset type. Use the
following options instead.

## Metadata

Use [metadata](/blockchain/metadata.md) for small JSON fields that belong to a
ledger object:

- display names and labels
- integration IDs
- small policy flags
- hashes, URIs, CIDs, or SoraFS paths that point to larger payloads

Metadata is part of world state and is returned with the object that owns it.
Keep keys stable, values compact, and permissions explicit. Do not store large
documents, logs, or high-churn application state directly in metadata.

## Numeric Assets and NFTs

Use assets when the state is value-bearing:

- numeric assets for fungible balances
- NFTs for uniquely owned records
- RWA and other domain-specific objects when the active data model exposes them

Assets and NFTs have their own IDs, lifecycle events, transfer behavior, and
permission checks. They are better than metadata when ownership, scarcity,
or transfer history matters.

## Off-Chain Data

Use off-chain storage for large or mutable payloads. Store only a stable
reference on-chain, such as:

- a content hash
- a URI
- a SoraFS path or manifest reference
- a compact commitment used by an application proof

This keeps the WSV small while still allowing applications to verify that the
off-chain payload matches the on-chain reference.

## Choosing a Location

Use this rule of thumb:

- If it is a compact attribute of a ledger object, use metadata.
- If it is value-bearing or transferable, model it as an asset, NFT, or
  domain-specific object.
- If it is large, high-churn, or application-private, store it outside the WSV
  and put a verifiable reference on-chain.

For metadata permissions, see [Permission Tokens](/reference/permissions.md).
