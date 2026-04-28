# Real-World Assets

Real-world assets (RWAs) model off-chain assets whose ownership or control
is tracked on-chain. In Iroha, an RWA is a registered ledger lot with a
generated identifier, an owner account, a quantity, business metadata,
provenance, and optional lifecycle controls.

RWAs are different from numeric asset balances:

- a numeric asset is a fungible balance held by an account
- an NFT is a unique on-chain record with one owner
- an RWA is a lot that can carry business metadata, quantity, holds,
  freezes, redemption state, provenance, and controller policy

Use RWAs when the ledger needs to represent a specific off-chain lot
instead of only a fungible balance.

## RWA Lot

An RWA lot contains:

- `id`: the generated canonical RWA identifier, displayed as
  `<hash>$<domain>`
- `owned_by`: the account that currently owns the lot
- `quantity`: the outstanding quantity represented by the lot
- `spec`: quantity specification, such as decimal scale
- `primary_reference`: the main off-chain receipt, certificate, invoice, or
  registry reference
- `status`: optional business status text
- `metadata`: compact JSON fields used for business context and indexing
- `parents`: source lots used to derive this lot
- `controls`: controller accounts, controller roles, and enabled controller
  operations
- `is_frozen` and `held_quantity`: lifecycle state enforced by the runtime

Keep the on-chain payload compact. Store large legal documents, inspection
reports, and audit bundles outside the WSV, then put a digest, URI, SoraFS
path, or manifest reference in RWA metadata.

## Identifiers

`RegisterRwa` does not accept a caller-chosen `id`, and it does not accept
an `owner` field. The transaction authority becomes the initial `owned_by`
account, and the runtime generates the `RwaId` in the target domain.

The textual form of an RWA ID is:

```text
<generated-hash>$<domain>
```

For example:

```text
0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef$commodities.universal
```

Applications should store their business identifier in `primary_reference`
or `metadata`, then discover the generated `RwaId` from
`RwaEvent::Created`, `FindRwas`, `/v1/rwas`, or the explorer route set
after the transaction commits.

## Lifecycle

Common RWA workflows include:

| Operation                                  | Implemented behavior                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `RegisterRwa`                              | Create a generated-ID lot in a domain; the transaction authority becomes `owned_by`.                                       |
| `TransferRwa`                              | Move quantity to another account. A full transfer can change `owned_by`; a partial transfer creates a generated child lot. |
| `HoldRwa`                                  | Reserve quantity. Requires a configured controller and `hold_enabled`.                                                     |
| `ReleaseRwa`                               | Remove held quantity. Requires a configured controller and `hold_enabled`.                                                 |
| `FreezeRwa`                                | Block ordinary owner operations. Requires a configured controller and `freeze_enabled`.                                    |
| `UnfreezeRwa`                              | Re-enable ordinary owner operations. Requires a configured controller and `freeze_enabled`.                                |
| `RedeemRwa`                                | Retire quantity. Requires the owner or a controller and `redeem_enabled`.                                                  |
| `MergeRwas`                                | Combine quantities from parent lots with the same domain and spec into a generated child lot.                              |
| `ForceTransferRwa`                         | Move quantity through a controller flow. Requires a configured controller and `force_transfer_enabled`.                    |
| `SetRwaControls`                           | Replace the lot control policy. Requires the owner or a controller.                                                        |
| `SetKeyValue<Rwa>` / `RemoveKeyValue<Rwa>` | Update lot metadata. Requires the owner or a controller; frozen lots require a controller.                                 |

There is no `UnregisterRwa` instruction in the current code. Retire an
off-chain lot with `RedeemRwa` when the represented quantity is delivered,
consumed, settled, or otherwise removed from circulation.

## Metadata and Controls

Use metadata for compact facts that help applications identify and verify
the lot:

- asset class, issuer, custodian, or registry reference
- warehouse, vault, ISIN, invoice, or certificate identifiers
- content hashes for attestations and legal documents
- SoraFS paths or manifest references for larger evidence bundles
- maturity, jurisdiction, or compliance tags used by off-chain services

The implemented `RwaControlPolicy` has these fields:

```json
{
  "controller_accounts": [],
  "controller_roles": [],
  "freeze_enabled": true,
  "hold_enabled": true,
  "force_transfer_enabled": false,
  "redeem_enabled": true
}
```

Controller accounts and roles are allowed to perform only the controller
operations enabled by the corresponding boolean flag. The current control
payload is not an allow-list transfer policy and does not contain nested
`transfers` rules.

## Queries, Events, and APIs

Use [`FindRwas`](/reference/queries.md#assets-nfts-and-rwas) to list
registered RWA lots. Applications that need live updates can subscribe to
[`Rwa` data events](/blockchain/filters.md#data-event-filters) for created,
owner-changed, split, merged, redeemed, frozen, unfrozen, held, released,
force-transferred, controls-changed, and metadata events.

Torii exposes chain-state routes such as `/v1/rwas` and `/v1/rwas/query`,
plus explorer routes such as `/v1/explorer/rwas` and
`/v1/explorer/rwas/{rwa_id}` when that route family is enabled. Generated
clients should prefer the live
[`/openapi`](/reference/torii-endpoints.md#common-endpoints) document for
the exact response shape exposed by a node.

### Try It on Taira

Check whether public Taira currently has registered RWA lots:

```bash
curl -fsS 'https://taira.sora.org/v1/rwas?limit=5' \
  | jq '{total, rwa_ids: [.items[].id]}'
```

List the RWA routes exposed by the live Taira OpenAPI document:

```bash
curl -fsS https://taira.sora.org/openapi.json \
  | jq -r '.paths | keys[] | select(startswith("/v1/rwas") or startswith("/v1/explorer/rwas"))'
```

Empty `items` output is expected when no public lots have been registered yet.
Registration, transfer, hold, freeze, and redemption are signed transactions.

## Try It

The examples below use the Python SDK surfaces from
[Shared Setup](/guide/tutorials/python.md#shared-setup). Replace the
account IDs, private keys, and generated lot IDs with values from your own
network before submitting a transaction.

### Discover RWA API Routes

This read-only example asks a running Torii node which app-facing RWA
routes are enabled:

```python
from iroha_python import create_torii_client

client = create_torii_client("https://taira.sora.org")
openapi = client.request_json("GET", "/openapi", expected_status=(200,))

rwa_paths = sorted(
    path for path in openapi.get("paths", {}) if path.startswith("/v1/rwas")
)

for path in rwa_paths:
    print(path)
```

If the list is empty, the node may still support RWA instructions and
queries through other Torii APIs, but it is not exposing the optional JSON
route family.

### Register a Warehouse Receipt

Use a draft when one business action should become one signed transaction.
The business receipt number goes in `primary_reference`; the ledger ID is
generated after the transaction commits.

```python
from iroha_python import TransactionConfig, TransactionDraft

config = TransactionConfig(
    chain_id=CHAIN_ID,
    authority=alice,
    metadata={**TX_METADATA, "source": "rwa-docs"},
)

draft = TransactionDraft(config)
draft.register_rwa(
    {
        "domain": "commodities.universal",
        "quantity": "100",
        "spec": {"scale": 0},
        "primary_reference": "warehouse-receipt-001",
        "status": "active",
        "metadata": {
            "asset_class": "commodity",
            "commodity": "copper",
            "warehouse": "DXB-01",
            "inspection_report": "sorafs://reports/copper-001.json",
        },
        "parents": [],
        "controls": {
            "controller_accounts": [alice],
            "controller_roles": [],
            "freeze_enabled": True,
            "hold_enabled": True,
            "force_transfer_enabled": False,
            "redeem_enabled": True,
        },
    }
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

After the transaction commits, list generated RWA IDs. Chain-state routes
expose the canonical IDs; use events or explorer detail routes when you
need to match an ID back to `primary_reference` or metadata:

```python
page = client.list_rwas_typed(limit=20, offset=0)

for lot in page.items:
    print(lot.id)
```

Explorer-enabled nodes can also return richer projections:

```python
page = client.list_explorer_rwas_typed(domain="commodities.universal")

for lot in page.items:
    print(lot.id, lot.primary_reference, lot.owned_by, lot.quantity)
```

### Transfer With a Temporary Hold

Use the generated RWA ID returned by the chain. This example assumes
`alice` is the owner and is also configured as a controller with
`hold_enabled`.

```python
warehouse_lot_id = (
    "0123456789abcdef0123456789abcdef"
    "0123456789abcdef0123456789abcdef$commodities.universal"
)

draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)

draft.transfer_rwa(warehouse_lot_id, quantity="10", destination=bob)
draft.hold_rwa(warehouse_lot_id, quantity="5")

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

Release the hold when the off-chain process is complete:

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.release_rwa(warehouse_lot_id, quantity="5")

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

### Add Controls and Audit Metadata

Controls and metadata are separate. Use controls for controller policy, and
metadata for facts that applications or auditors need to display:

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)

draft.set_rwa_controls(
    warehouse_lot_id,
    {
        "controller_accounts": [alice],
        "controller_roles": [],
        "freeze_enabled": True,
        "hold_enabled": True,
        "force_transfer_enabled": True,
        "redeem_enabled": True,
    },
)
draft.set_rwa_key_value(warehouse_lot_id, "auditor", "alice")
draft.set_rwa_key_value(
    warehouse_lot_id,
    "proof_hash",
    "sha256:2b1c7a4e...",
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

### Redeem or Retire Quantity

Redeem quantity when the represented off-chain asset has been delivered,
consumed, retired, or otherwise removed from circulation. The lot must have
`redeem_enabled`, and the signer must be the owner or a controller.

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.redeem_rwa(warehouse_lot_id, quantity="1")

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

### Freeze During Compliance Review

Freeze a lot when an off-chain review must block ordinary owner operations.
The signer must be a controller and the lot must have `freeze_enabled`.

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.freeze_rwa(warehouse_lot_id)
draft.set_rwa_key_value(
    warehouse_lot_id,
    "review",
    {
        "status": "frozen",
        "reason": "custodian inventory check",
        "case_id": "OPS-2026-0042",
    },
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

Unfreeze it when the review passes:

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.unfreeze_rwa(warehouse_lot_id)
draft.set_rwa_key_value(
    warehouse_lot_id,
    "review",
    {"status": "cleared", "case_id": "OPS-2026-0042"},
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

### Invoice Receivable

Represent an invoice as an RWA lot by storing the invoice number in
`primary_reference` and metadata. After registration, use the generated ID
for transfer and redemption.

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.register_rwa(
    {
        "domain": "receivables.universal",
        "quantity": "50000",
        "spec": {"scale": 2},
        "primary_reference": "INV-2026-0007",
        "status": "issued",
        "metadata": {
            "asset_class": "invoice",
            "currency": "USD",
            "debtor": "example-buyer",
            "due_date": "2026-06-30",
            "document_hash": "sha256:4df4c8...",
        },
        "parents": [],
        "controls": {
            "controller_accounts": [alice],
            "controller_roles": [],
            "freeze_enabled": True,
            "hold_enabled": False,
            "force_transfer_enabled": False,
            "redeem_enabled": True,
        },
    }
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

When the receivable is financed or paid, use the generated invoice lot ID:

```python
invoice_lot_id = (
    "fedcba9876543210fedcba9876543210"
    "fedcba9876543210fedcba9876543210$receivables.universal"
)

draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.transfer_rwa(invoice_lot_id, quantity="50000", destination=bob)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

Redeem the represented amount after off-chain settlement:

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=bob, metadata=TX_METADATA)
)
draft.redeem_rwa(invoice_lot_id, quantity="50000")

envelope = draft.sign_with_keypair(bob_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

### Carbon Credit Retirement

Use redemption to retire credits after they are claimed. The metadata
points to the off-chain certificate or registry proof:

```python
carbon_lot_id = (
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa$carbon.universal"
)

draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.redeem_rwa(carbon_lot_id, quantity="250")
draft.set_rwa_key_value(
    carbon_lot_id,
    "retirement_certificate",
    "sorafs://certificates/carbon-credit-2026-001-retired.json",
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

### Merge Two Lots

Merge lots when two off-chain positions are consolidated. The parents must
be in the same domain and use the same quantity spec. The runtime generates
the child lot ID.

```python
warehouse_lot_id_2 = (
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb$commodities.universal"
)

draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.merge_rwas(
    {
        "parents": [
            {"rwa": warehouse_lot_id, "quantity": "40"},
            {"rwa": warehouse_lot_id_2, "quantity": "60"},
        ],
        "primary_reference": "warehouse-receipt-003",
        "status": "merged",
        "metadata": {
            "asset_class": "commodity",
            "commodity": "copper",
            "warehouse": "DXB-01",
            "merge_reason": "same custodian and quality grade",
        },
    }
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

For the full Python transaction example, see
[Real-World Assets](/guide/tutorials/python.md#real-world-assets).

## Related Docs

- [Assets](/blockchain/assets.md)
- [Metadata](/blockchain/metadata.md)
- [Iroha Special Instructions](/blockchain/instructions.md)
- [Queries](/reference/queries.md#assets-nfts-and-rwas)
- [Torii endpoints](/reference/torii-endpoints.md#app-and-sora-route-families)
