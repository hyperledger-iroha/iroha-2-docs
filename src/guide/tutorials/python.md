# Python

The Python SDK in the upstream workspace is `iroha-python`. It targets the
current Torii and Norito surfaces. Treat it as a fast-moving preview SDK and
pin the package version or source revision used by your integration.

The read-only examples below were checked against public Taira at
`https://taira.sora.org`. Mutating examples are transaction templates: they
require a real Taira authority, private key, gas metadata, and any operator
tokens required by the target route before they can be submitted.

Use the examples in this order:

| Stage | Run against public Taira? | What you need |
| --- | --- | --- |
| Read-only client calls | Yes | Python package plus network access |
| Local signing and instruction builders | No network call until `submit()` | Native extension and your key material |
| Mutating transactions and service calls | Only with your own funded account | Authority account, private key, chain ID, fee metadata, fee asset balance, and route tokens |
| Connect frame codecs, crypto, and GPU helpers | Local only | Native extension; GPU helpers also need a CUDA-capable backend |

## Install

The package metadata name is `iroha-python`. Do not assume an unpinned PyPI
install matches the live Taira network. Install a wheel or source checkout that
was built from the same upstream revision your integration targets:

```bash
python -m pip install /path/to/iroha_python-*.whl
```

If your project consumes the upstream workspace directly, install the Python
dependencies and build the native extension before running examples that use
`Instruction`, `TransactionDraft`, signing, crypto, SoraFS native helpers, GPU
helpers, or Connect frame codecs. Use the build command from the upstream
`python/iroha_python/README.md`, then verify that the native exports load:

```bash
cd python/iroha_python
python - <<'PY'
from iroha_python import Instruction, generate_ed25519_keypair

print(Instruction)
print(generate_ed25519_keypair().public_key.hex())
PY
```

If `create_torii_client` imports but `Instruction` or
`generate_ed25519_keypair` fails, the pure Python package is available but the
native extension is not.

## Quickstart

Start with public, read-only Taira endpoints:

```python
from iroha_python import (
    create_torii_client,
)

client = create_torii_client("https://taira.sora.org")

status = client.request_json("GET", "/status", expected_status=(200,))
accounts = client.list_accounts_typed(limit=5)

print(status["build"]["version"])
for account in accounts.items:
    print(account.id)
```

## Shared Setup

Use this setup for the mutating templates. Replace every placeholder with a
Taira authority, private key, token, and asset/account IDs from your deployment
before submitting.

`authority` is the account that signs the transaction. `private_key` must match
that account, `CHAIN_ID` must match the target network, and `TX_METADATA` must
include the fee fields expected by the network. The placeholders below are
intentionally invalid so they are not submitted by accident.

```python
from iroha_python import (
    Ed25519KeyPair,
    Instruction,
    TransactionConfig,
    TransactionDraft,
    create_torii_client,
)

TORII_URL = "https://taira.sora.org"
CHAIN_ID = "taira"
AUTH_TOKEN = None

alice_pair = Ed25519KeyPair.from_private_key(bytes.fromhex("<alice-private-key-hex>"))
bob_pair = Ed25519KeyPair.from_private_key(bytes.fromhex("<bob-private-key-hex>"))

alice = "<alice-account-id>"
bob = "<bob-account-id>"

ROSE_DEFINITION = "rose#wonderland"
ROSE_ASSET = "<rose-asset-id>"
BADGE_NFT = "badge$wonderland"

TX_METADATA = {
    # Public Taira fee asset. Use the configured XOR asset on your network.
    "gas_asset_id": "6TEAJqbb8oEPmLncoNiMRbLEK6tw",
}

client = create_torii_client(TORII_URL, auth_token=AUTH_TOKEN)


def submit(*instructions):
    return client.build_and_submit_transaction(
        chain_id=CHAIN_ID,
        authority=alice,
        private_key=alice_pair.private_key,
        instructions=list(instructions),
        metadata=TX_METADATA,
        wait=True,
    )
```

`Instruction.*` calls only construct instruction payloads. `submit()` is the
point where the SDK signs the transaction, sends it to Torii, and waits for a
status.

## Fees and Gas

Write transactions need fee metadata and a funded fee asset balance. On Taira,
the fee asset is funded by the public faucet and the transaction metadata must
include `gas_asset_id`. On Minamoto, fees are paid with real XOR and the asset
ID comes from that network's configuration.

Fee metadata belongs on the transaction, not on individual instructions. The
`submit()` helper above attaches `TX_METADATA` to every transaction it builds:

```python
TX_METADATA = {
    "gas_asset_id": "6TEAJqbb8oEPmLncoNiMRbLEK6tw",
}

envelope, status = client.build_and_submit_transaction(
    chain_id=CHAIN_ID,
    authority=alice,
    private_key=alice_pair.private_key,
    instructions=[Instruction.register_domain("wonderland")],
    metadata=TX_METADATA,
    wait=True,
)
```

Before sending writes, make sure the authority account owns enough of the fee
asset. The exact faucet and asset ID are network-specific; this is the Taira
shape:

```python
FEE_ASSET_DEFINITION = "6TEAJqbb8oEPmLncoNiMRbLEK6tw"
FEE_ASSET_ID = "<fee-asset-id-from-faucet-response>"
TX_METADATA = {"gas_asset_id": FEE_ASSET_DEFINITION}

fee_assets = client.list_account_assets_typed(
    alice,
    limit=10,
    asset_id=FEE_ASSET_ID,
)
if not fee_assets.items:
    raise RuntimeError("fund the authority account with the Taira fee asset first")
```

The faucet returns the concrete `asset_id` to use for the balance check. The
`gas_asset_id` metadata field uses the fee asset definition ID.

Keep application metadata separate from fee metadata by merging the mappings
when you build a transaction:

```python
APP_METADATA = {"source": "python-docs"}
metadata = {**TX_METADATA, **APP_METADATA}

draft = TransactionDraft(
    TransactionConfig(
        chain_id=CHAIN_ID,
        authority=alice,
        metadata=metadata,
    )
)
```

If you omit fee metadata, use the wrong fee asset, or sign with an unfunded
account, a real network should reject the transaction even if the instruction
payload is otherwise valid.

## Taira-Checked Read-Only Calls

These calls returned successfully against public Taira:

```python
client = create_torii_client("https://taira.sora.org")

status = client.request_json("GET", "/status", expected_status=(200,))
parameters = client.request_json("GET", "/v1/parameters", expected_status=(200,))

accounts = client.list_accounts_typed(limit=1)
domains = client.list_domains_typed(limit=1)
definitions = client.query_asset_definitions_typed(limit=1)

time_now = client.get_time_now_typed()
time_status = client.get_time_status_typed()
sumeragi = client.get_sumeragi_status_typed()
connect = client.get_connect_status_typed()

print(status["build"]["version"])
print(parameters["sumeragi"]["block_time_ms"])
print(accounts.total, domains.total, definitions.total)
print(time_now.now_ms, len(time_status.samples), sumeragi.leader_index)
print(connect.enabled, connect.sessions_active)
```

Routes such as `/v1/status`, public peer inventory, Sumeragi RBC sampling, node
admin snapshots, and Connect app registry administration were not publicly
available on Taira during the check. Use `request_json("GET", "/status")` for
the public node status payload on Taira.

## Instruction Builders

The SDK exposes typed builders for the most common instruction families and a
JSON escape hatch for variants that are not first-class Python methods yet.
The following snippets are mutating transaction templates and were not
submitted to public Taira without a signing account.

Prefer typed helpers when they exist: they normalize Python values and fail
early on invalid shapes. Use `Instruction.from_json` only when you need an
instruction variant that does not have a Python helper yet.

| Instruction family | Python surface |
| --- | --- |
| Register | `register_domain`, `register_account`, `register_asset_definition_numeric`, `register_rwa`, `register_time_trigger`, `register_precommit_trigger` |
| Unregister | `unregister_trigger`; use `Instruction.from_json` for other variants |
| Mint/Burn | `mint_asset_numeric`, `burn_asset_numeric`, `mint_trigger_repetitions`, `burn_trigger_repetitions` |
| Transfer | `transfer_asset_numeric`, `transfer_domain`, `transfer_asset_definition`, `transfer_nft`, `transfer_rwa`, `force_transfer_rwa` |
| Metadata and controls | `set_account_key_value`, `remove_account_key_value`, `set_rwa_controls`, `set_rwa_key_value`, `remove_rwa_key_value` |
| RWA lifecycle | `merge_rwas`, `redeem_rwa`, `freeze_rwa`, `unfreeze_rwa`, `hold_rwa`, `release_rwa` |
| ExecuteTrigger | `execute_trigger` |
| Repo/settlement extensions | `repo_initiate`, `repo_unwind`, `repo_margin_call`, `settlement_dvp`, `settlement_pvp` |
| Grant/Revoke, SetParameter, Log, Custom, Upgrade, and less common register/unregister variants | `Instruction.from_json` or `TransactionBuilder.add_instruction_json` with canonical `InstructionBox` JSON |

### Register Domains, Accounts, and Assets

Registration examples assume the signer has permission to create objects in
the target domain. On a shared network such as Taira, use a domain and account
namespace assigned to you.

```python
submit(
    Instruction.register_domain("wonderland", {"environment": "dev"}),
    Instruction.register_account(alice, {"display_name": "Alice"}),
    Instruction.register_account(bob, {"display_name": "Bob"}),
    Instruction.register_asset_definition_numeric(
        ROSE_DEFINITION,
        owner=alice,
        scale=2,
        mintable="Infinitely",
        confidential_policy="TransparentOnly",
        metadata={"symbol": "ROS"},
    ),
)
```

`mintable` accepts `Infinitely`, `Once`, `Not`, or `Limited(n)` values accepted
by the data model. Omit `scale` for an unconstrained numeric asset.

### Mint, Burn, and Transfer Assets

These calls use an existing asset ID. Register the asset definition first, then
build the concrete asset ID for the account that owns the asset.

```python
submit(Instruction.mint_asset_numeric(ROSE_ASSET, "100.00"))
submit(Instruction.transfer_asset_numeric(ROSE_ASSET, "25.50", bob))
submit(Instruction.burn_asset_numeric(ROSE_ASSET, "10.00"))
```

### Transfer Ownership

Ownership transfers change who controls the domain, asset definition, or NFT.
Use the current owner as the transaction authority.

```python
submit(Instruction.transfer_domain(alice, "wonderland", bob))
submit(Instruction.transfer_asset_definition(alice, ROSE_DEFINITION, bob))
submit(Instruction.transfer_nft(alice, BADGE_NFT, bob))
```

### Set and Remove Metadata

Metadata values must be JSON-serializable. When you use `TransactionDraft`, the
authority in `TransactionConfig` becomes the default target account.

```python
submit(
    Instruction.set_account_key_value(
        alice,
        "profile",
        {"display_name": "Alice", "tier": "operator"},
    )
)

submit(Instruction.remove_account_key_value(alice, "profile"))
```

The high-level draft helper targets the transaction authority by default:

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)
draft.set_account_key_value("nickname", "Queen Alice")
draft.remove_account_key_value("nickname")
```

### Real-World Assets

RWA helpers use JSON-serializable payloads for asset-specific controls and
metadata:

```python
draft = TransactionDraft(
    TransactionConfig(chain_id=CHAIN_ID, authority=alice, metadata=TX_METADATA)
)

draft.register_rwa(
    {
        "id": "warehouse-receipt-001#wonderland",
        "owner": alice,
        "quantity": "100",
        "metadata": {"commodity": "copper", "warehouse": "DXB-01"},
    }
)
draft.transfer_rwa(
    "warehouse-receipt-001#wonderland",
    quantity="10",
    destination=bob,
)
draft.hold_rwa("warehouse-receipt-001#wonderland", quantity="5")
draft.release_rwa("warehouse-receipt-001#wonderland", quantity="5")
draft.freeze_rwa("warehouse-receipt-001#wonderland")
draft.unfreeze_rwa("warehouse-receipt-001#wonderland")
draft.redeem_rwa("warehouse-receipt-001#wonderland", quantity="1")
draft.set_rwa_key_value("warehouse-receipt-001#wonderland", "auditor", "alice")
draft.remove_rwa_key_value("warehouse-receipt-001#wonderland", "auditor")
draft.set_rwa_controls(
    "warehouse-receipt-001#wonderland",
    {"transfers": {"allow_list": [alice, bob]}},
)
draft.merge_rwas(
    {
        "sources": [
            "warehouse-receipt-001#wonderland",
            "warehouse-receipt-002#wonderland",
        ],
        "destination": "warehouse-receipt-003#wonderland",
    }
)
draft.force_transfer_rwa(
    "warehouse-receipt-001#wonderland",
    quantity="1",
    destination=bob,
)
```

### Triggers

Use trigger registration helpers when the executable is another instruction
sequence:

```python
reward = Instruction.mint_asset_numeric(ROSE_ASSET, "1")

register_hourly = Instruction.register_time_trigger(
    "hourly_reward",
    alice,
    [reward],
    start_ms=1_800_000_000_000,
    period_ms=3_600_000,
    repeats=24,
    metadata={"purpose": "docs"},
)
submit(register_hourly)

register_precommit = Instruction.register_precommit_trigger(
    "precommit_reward",
    alice,
    [reward],
    repeats=10,
    metadata={"purpose": "pipeline test"},
)
submit(register_precommit)

submit(Instruction.execute_trigger("hourly_reward", args={"reason": "manual"}))
submit(Instruction.mint_trigger_repetitions("hourly_reward", 5))
submit(Instruction.burn_trigger_repetitions("hourly_reward", 1))
submit(Instruction.unregister_trigger("hourly_reward"))
```

Torii also exposes REST helpers for trigger inventory:

```python
registered = client.list_triggers_typed(limit=20)
for trigger in registered.items:
    print(trigger.id, trigger.authority)

details = client.get_trigger_typed("precommit_reward")
```

Trigger inventory calls only read or inspect trigger records. Registration,
execution, repetition changes, and unregistering are mutating operations.

### Repo and Settlement Instructions

Repo and bilateral-settlement helpers append domain-specific instruction
variants without hand-crafting Norito payloads:

```python
from iroha_python import (
    RepoCashLeg,
    RepoCollateralLeg,
    RepoGovernance,
    SettlementAtomicity,
    SettlementExecutionOrder,
    SettlementLeg,
    SettlementPlan,
)

config = TransactionConfig(
    chain_id=CHAIN_ID,
    authority=alice,
    ttl_ms=120_000,
    metadata=TX_METADATA,
)
draft = TransactionDraft(config)

cash = RepoCashLeg(asset_definition_id="usd#wonderland", quantity="1000")
collateral = RepoCollateralLeg(
    asset_definition_id="bond#wonderland",
    quantity="1050",
    metadata={"isin": "ABC123"},
)
governance = RepoGovernance(haircut_bps=1500, margin_frequency_secs=86_400)

draft.repo_initiate(
    agreement_id="daily_repo",
    initiator=alice,
    counterparty=bob,
    cash_leg=cash,
    collateral_leg=collateral,
    rate_bps=250,
    maturity_timestamp_ms=1_704_000_000_000,
    governance=governance,
)
draft.repo_margin_call("daily_repo")
draft.repo_unwind(
    agreement_id="daily_repo",
    initiator=alice,
    counterparty=bob,
    cash_leg=cash,
    collateral_leg=collateral,
    settlement_timestamp_ms=1_704_086_400_000,
)

delivery = SettlementLeg(
    asset_definition_id="bond#wonderland",
    quantity="10",
    from_account=alice,
    to_account=bob,
    metadata={"isin": "ABC123"},
)
payment = SettlementLeg(
    asset_definition_id="usd#wonderland",
    quantity="1000",
    from_account=bob,
    to_account=alice,
)
plan = SettlementPlan(
    order=SettlementExecutionOrder.PAYMENT_THEN_DELIVERY,
    atomicity=SettlementAtomicity.ALL_OR_NOTHING,
)

draft.settlement_dvp(
    settlement_id="trade_dvp",
    delivery_leg=delivery,
    payment_leg=payment,
    plan=plan,
    metadata={"desk": "rates"},
)
draft.settlement_pvp(
    settlement_id="trade_pvp",
    primary_leg=payment,
    counter_leg=delivery,
)

envelope = draft.sign_with_keypair(alice_pair)
client.submit_transaction_envelope_and_wait(envelope)
```

### JSON Escape Hatch

When a Python helper is not available yet, feed canonical data-model
`InstructionBox` JSON into `Instruction.from_json` or directly into
`TransactionBuilder.add_instruction_json`. This is the recommended path for
`Grant`, `Revoke`, `SetParameter`, `Log`, `Custom`, `Upgrade`, peer/role/NFT
registration, and non-trigger unregister variants until those helpers are
typed.

```python
from iroha_python import Instruction, TransactionBuilder

# Copy this payload from Rust/CLI tooling or from a pinned data-model schema.
instruction_box_json = """
{
  "<InstructionVariant>": {
    "...": "..."
  }
}
"""

instruction = Instruction.from_json(instruction_box_json)
submit(instruction)

builder = TransactionBuilder(CHAIN_ID, alice)
builder.set_metadata(TX_METADATA)
builder.add_instruction_json(instruction_box_json)
envelope = builder.sign(alice_pair.private_key)
client.submit_transaction_envelope_and_wait(envelope)
```

For generated or opaque instructions, round-trip through JSON before storing
fixtures:

```python
payload = Instruction.mint_asset_numeric(ROSE_ASSET, "1").to_json()
same_instruction = Instruction.from_json(payload)
print(same_instruction.as_dict())
```

## Transaction Workflows

Use `TransactionDraft` for applications that build multiple instructions before
signing. A draft lets you keep transaction-level settings such as `ttl_ms`,
`nonce`, and metadata in one place, then sign once:

```python
config = TransactionConfig(
    chain_id=CHAIN_ID,
    authority=alice,
    ttl_ms=120_000,
    nonce=1,
    metadata={**TX_METADATA, "source": "python-docs"},
)

draft = TransactionDraft(config)
draft.register_domain("wonderland", metadata={"owner": "docs"})
draft.register_account(bob, metadata={"role": "user"})
draft.register_asset_definition_numeric(
    ROSE_DEFINITION,
    owner=alice,
    scale=2,
    mintable="Infinitely",
)
draft.mint_asset_numeric(ROSE_ASSET, "100")
draft.transfer_asset_numeric(ROSE_ASSET, "25", destination=bob)

envelope = draft.sign_with_keypair(alice_pair)
receipt = client.submit_transaction_envelope(envelope)
status = client.wait_for_transaction_status(envelope.hash_hex(), timeout=30)
print(receipt, status)
```

Export a deterministic manifest for review, auditing, or wallet handoff:

```python
import json
from pathlib import Path

manifest = draft.to_manifest_dict(include_creation_time=True)
print(json.dumps(manifest, indent=2))

Path("transaction_manifest.json").write_text(
    draft.to_manifest_json(indent=2, include_creation_time=True),
    encoding="utf-8",
)
```

Attach a lane privacy proof before signing when the target lane requires it:

```python
draft.add_lane_privacy_merkle_proof(
    commitment_id=7,
    leaf=bytes.fromhex("aa" * 32),
    leaf_index=3,
    audit_path=[bytes.fromhex("bb" * 32), None, bytes.fromhex("cc" * 32)],
    proof_backend="halo2/ipa",
    proof_bytes=b"...proof bytes...",
    verifying_key_bytes=b"...verifying key bytes...",
)
envelope = draft.sign_with_keypair(alice_pair)
```

## Queries

Typed query helpers return dataclasses instead of raw JSON dictionaries. They
are the easiest way to start because the SDK parses pagination and common
record fields for you:

```python
accounts = client.list_accounts_typed(limit=25, sort="id")
for account in accounts.items:
    print(account.id, account.metadata)

domains = client.list_domains_typed(limit=10)
definitions = client.query_asset_definitions_typed(limit=10)
print(domains.total, definitions.total)
```

Use the generic request helpers when a Torii endpoint does not yet have a typed
wrapper:

```python
payload = client.request_json("GET", "/v1/parameters", expected_status=(200,))
metrics = client.get_metrics(as_text=True)
```

Account inventory helpers require an account identifier accepted by the SDK's
normalizer. Use canonical I105 account IDs or on-chain aliases; if a block
explorer or raw endpoint returns an ID that the SDK rejects, resolve it to a
canonical account ID before calling these helpers:

```python
assets = client.list_account_assets_typed(alice, limit=10)
transactions = client.query_account_transactions_typed(alice, limit=5)
permissions = client.list_account_permissions_typed(alice, limit=20)

print(len(assets.items), len(transactions.items), len(permissions.items))
```

## Events

Streaming helpers decode JSON payloads by default. Pass `with_metadata=True`
when you need the SSE event name, id, retry hint, and raw payload. Pair streams
with `EventCursor` to persist the latest event id. These examples wait for live
events, so run them against a node where the corresponding event stream is
enabled and active.

```python
from iroha_python import DataEventFilter, EventCursor

proof_filter = DataEventFilter.proof(
    backend="halo2/ipa",
    proof_hash_hex="deadbeef" * 8,
)

cursor = EventCursor()
for event in client.stream_events(
    filter=proof_filter,
    cursor=cursor,
    resume=True,
    with_metadata=True,
):
    print(event.id, event.event, event.data)
    break

for event in client.stream_trigger_events(trigger_id="hourly_reward", resume=True):
    print(event)
    break

for tx_event in client.stream_pipeline_transactions(status="Queued"):
    print(tx_event)
    break
```

## Keys and Addresses

The SDK exposes local signing helpers for every signature algorithm compiled
into the native extension. These helpers do not call Taira, but they do require
the native extension:

```python
from iroha_python import (
    ED25519_ALGORITHM,
    derive_confidential_keyset_from_hex,
    derive_keypair_from_seed,
    hash_blake2b_32,
    verify,
)
from iroha_python.address import AccountAddress

ed_pair = derive_keypair_from_seed(b"alice", ED25519_ALGORITHM)
signature = ed_pair.sign(b"payload")
assert verify(ED25519_ALGORITHM, ed_pair.public_key, b"payload", signature)

address = AccountAddress.from_account(domain="wonderland", public_key=ed_pair.public_key)
print(address.canonical_hex())
print(address.to_i105(0x02F1))

confidential = derive_confidential_keyset_from_hex("01" * 32)
print(confidential.as_hex())
print(hash_blake2b_32(b"payload").hex())
```

Use `supported_crypto_algorithms()` to see what your wheel supports. The
generic helpers use canonical algorithm labels and work for Ed25519,
secp256k1, ML-DSA, GOST, BLS, and SM2 when those algorithms are compiled in:

```python
from iroha_python import (
    CryptoKeyPair,
    derive_keypair_from_seed,
    load_keypair,
    parse_private_key_multihash,
    parse_public_key_multihash,
    private_key_multihash,
    public_key_multihash,
    sign,
    supported_crypto_algorithms,
    verify,
)

message = b"iroha multi-algorithm signing"

for algorithm in supported_crypto_algorithms():
    keypair = derive_keypair_from_seed(f"docs:{algorithm}".encode(), algorithm)
    signature = keypair.sign(message)

    assert keypair.verify(message, signature)
    assert verify(algorithm, keypair.public_key, message, signature)

    loaded = load_keypair(keypair.private_key, algorithm)
    assert loaded.public_key == keypair.public_key
    assert sign(algorithm, loaded.private_key, message) != b""

    public_multihash = public_key_multihash(
        algorithm,
        keypair.public_key,
        prefixed=True,
    )
    private_multihash = private_key_multihash(
        algorithm,
        keypair.private_key,
        prefixed=True,
    )

    public_algorithm, public_key = parse_public_key_multihash(public_multihash)
    private_algorithm, private_key = parse_private_key_multihash(private_multihash)
    restored = CryptoKeyPair.from_private_key_multihash(private_multihash)

    assert public_algorithm == algorithm
    assert public_key == keypair.public_key
    assert private_algorithm == algorithm
    assert private_key == keypair.private_key
    assert restored == keypair
```

### Chinese SM Cryptography

The Python SDK exposes both generic SM2 helpers and SM2-specific convenience
helpers. Use the node capability advert to pick the SM2 distinguishing
identifier expected by the target network:

```python
from iroha_python import (
    SM2_ALGORITHM,
    SM2_DEFAULT_DISTINGUISHED_ID,
    derive_keypair_from_seed,
    derive_sm2_keypair_from_seed,
    sign,
    sign_sm2,
    verify,
    verify_sm2,
)

capabilities = client.get_node_capabilities_typed()
sm = capabilities.crypto.sm if capabilities.crypto else None
distid = sm.sm2_distid_default if sm else SM2_DEFAULT_DISTINGUISHED_ID

pair = derive_sm2_keypair_from_seed(bytes.fromhex("11" * 32), distid=distid)
message = b"iroha-sm2-example"
signature = pair.sign(message)

assert pair.verify(message, signature)
assert verify_sm2(pair.public_key, message, signature, distid=distid)
assert sign_sm2(pair.private_key, message, distid=distid) != b""

generic_pair = derive_keypair_from_seed(bytes.fromhex("22" * 32), SM2_ALGORITHM)
generic_signature = sign(SM2_ALGORITHM, generic_pair.private_key, message)
assert verify(SM2_ALGORITHM, generic_pair.public_key, message, generic_signature)

print(pair.public_key_sec1_hex)
print(pair.public_key_multihash)
```

`crypto.sm.enabled` tells you whether the node accepts SM-family algorithms in
its current policy. The same advert includes the SM hash policy and acceleration
status, which is useful when deciding whether to enable SM2-specific flows:

```python
capabilities = client.get_node_capabilities_typed()

if capabilities.crypto and capabilities.crypto.sm.enabled:
    sm = capabilities.crypto.sm
    print(sm.default_hash)
    print(sm.allowed_signing)
    print(sm.acceleration.policy)
else:
    print("SM crypto is not enabled by this node")
```

Public Taira exposed the SM capability advert during the check, but SM signing
was disabled there. Its advertised signing algorithms were `ed25519`,
`secp256k1`, and `bls_normal`, so do not submit SM2-signed transactions to that
deployment unless the capability payload changes.

### GOST and Post-Quantum Keys

Use the generic crypto API for GOST R 34.10-2012 parameter sets and ML-DSA
(`ml-dsa`) post-quantum signatures. The same key-pair object handles signing,
verification, and multihash export:

```python
from iroha_python import (
    GOST_3410_2012_256_PARAMSET_A_ALGORITHM,
    GOST_3410_2012_256_PARAMSET_B_ALGORITHM,
    GOST_3410_2012_256_PARAMSET_C_ALGORITHM,
    GOST_3410_2012_512_PARAMSET_A_ALGORITHM,
    GOST_3410_2012_512_PARAMSET_B_ALGORITHM,
    ML_DSA_ALGORITHM,
    derive_keypair_from_seed,
    verify,
)
from iroha_python.address import AccountAddress

CHAIN_DISCRIMINANT = 0x02F1
message = b"iroha gost and post-quantum example"

GOST_ADDRESS_ALIASES = {
    GOST_3410_2012_256_PARAMSET_A_ALGORITHM: "gost-256-a",
    GOST_3410_2012_256_PARAMSET_B_ALGORITHM: "gost-256-b",
    GOST_3410_2012_256_PARAMSET_C_ALGORITHM: "gost-256-c",
    GOST_3410_2012_512_PARAMSET_A_ALGORITHM: "gost-512-a",
    GOST_3410_2012_512_PARAMSET_B_ALGORITHM: "gost-512-b",
}

for crypto_algorithm, address_algorithm in GOST_ADDRESS_ALIASES.items():
    keypair = derive_keypair_from_seed(
        f"docs:{crypto_algorithm}".encode(),
        crypto_algorithm,
    )
    signature = keypair.sign(message)

    assert verify(crypto_algorithm, keypair.public_key, message, signature)

    address = AccountAddress.from_account(
        domain="wonderland",
        public_key=keypair.public_key,
        # Account addresses use compact curve aliases for GOST parameter sets.
        algorithm=address_algorithm,
    )
    print(crypto_algorithm)
    print(address.canonical_hex())
    print(address.to_i105(CHAIN_DISCRIMINANT))
    print(keypair.prefixed_public_key_multihash)

mldsa_keypair = derive_keypair_from_seed(b"docs:ml-dsa", ML_DSA_ALGORITHM)
mldsa_signature = mldsa_keypair.sign(message)
assert verify(ML_DSA_ALGORITHM, mldsa_keypair.public_key, message, mldsa_signature)
post_quantum_address = AccountAddress.from_account(
    domain="wonderland",
    public_key=mldsa_keypair.public_key,
    algorithm="ml-dsa",
)
print(post_quantum_address.canonical_hex())
print(post_quantum_address.to_i105(CHAIN_DISCRIMINANT))
print(mldsa_keypair.prefixed_public_key_multihash)
```

Gate GOST and post-quantum flows on the node's advertised signing algorithms.
Use the raw capability payload for forward-compatible algorithm names:

```python
capabilities = client.request_json(
    "GET",
    "/v1/node/capabilities",
    expected_status=(200,),
)
crypto = capabilities.get("crypto", {})
sm = crypto.get("sm", {})
allowed = set(sm.get("allowed_signing", []))

GOST_ALGORITHMS = {
    "gost3410-2012-256-paramset-a",
    "gost3410-2012-256-paramset-b",
    "gost3410-2012-256-paramset-c",
    "gost3410-2012-512-paramset-a",
    "gost3410-2012-512-paramset-b",
}

supports_gost = bool(allowed & GOST_ALGORITHMS)
supports_post_quantum = "ml-dsa" in allowed
supports_sm2 = "sm2" in allowed and bool(sm.get("enabled", False))

print(supports_gost, supports_post_quantum, supports_sm2)
```

If a node does not advertise the algorithm you need, use the key only for local
or offline workflows. Do not submit transactions signed with that algorithm to
that node. During the public Taira check, GOST and ML-DSA were available as SDK
crypto helpers in the upstream Python library but were not advertised by the
node for transaction signing.

## Config-Aware Client Creation

Use `resolve_torii_client_config` when your application reads node settings
from a file but still needs environment- or test-specific overrides:

```python
import json
from iroha_python import create_torii_client, resolve_torii_client_config

with open("iroha_config.json", "r", encoding="utf-8") as handle:
    raw_config = json.load(handle)

resolved = resolve_torii_client_config(
    config=raw_config,
    overrides={"timeout_ms": 2_000, "max_retries": 5},
)

client = create_torii_client(
    raw_config.get("torii", {}).get("address", TORII_URL),
    resolved_config=resolved,
)
```

## Offline Allowances

Offline allowance endpoints issue and register wallet certificates. If the
certificate is already signed, call `register_offline_allowance` or
`renew_offline_allowance` directly instead of the top-up helpers. These are
mutating wallet-service calls and require a signing account.

```python
draft_certificate = {
    "controller": alice,
    "allowance": {
        "asset": "usd#wonderland",
        "amount": "10",
        "commitment": [1, 2],
    },
    "spend_public_key": "ed0120deadbeef",
    "attestation_report": [3, 4],
    "issued_at_ms": 100,
    "expires_at_ms": 200,
    "policy": {"max_balance": "10", "max_tx_value": "5", "expires_at_ms": 200},
    "metadata": {},
}

top_up = client.top_up_offline_allowance(
    certificate=draft_certificate,
    authority=alice,
    private_key=alice_pair.private_key_hex,
)
print(top_up.registration.certificate_id_hex)

renewed = client.top_up_offline_allowance_renewal(
    certificate_id_hex=top_up.registration.certificate_id_hex,
    certificate=draft_certificate,
    authority=alice,
    private_key=alice_pair.private_key_hex,
)
print(renewed.registration.certificate_id_hex)
```

## Subscriptions

Subscription helpers are also mutating service calls. Use IDs and assets that
exist on the network you target.

```python
usage_plan = {
    "provider": alice,
    "billing": {
        "cadence": {
            "kind": "monthly_calendar",
            "detail": {"anchor_day": 1, "anchor_time_ms": 0},
        },
        "bill_for": {"period": "previous_period", "value": None},
        "retry_backoff_ms": 86_400_000,
        "max_failures": 3,
        "grace_ms": 604_800_000,
    },
    "pricing": {
        "kind": "usage",
        "detail": {
            "unit_price": "0.024",
            "unit_key": "compute_ms",
            "asset_definition": "usd#wonderland",
        },
    },
}

client.create_subscription_plan(
    authority=alice,
    private_key=alice_pair.private_key_hex,
    plan_id="compute#wonderland",
    plan=usage_plan,
)
client.create_subscription(
    authority=bob,
    private_key=bob_pair.private_key_hex,
    subscription_id="sub-001",
    plan_id="compute#wonderland",
)
client.record_subscription_usage(
    "sub-001",
    authority=alice,
    private_key=alice_pair.private_key_hex,
    unit_key="compute_ms",
    delta="3600000",
)
client.charge_subscription_now(
    "sub-001",
    authority=alice,
    private_key=alice_pair.private_key_hex,
)
```

## Connect

Build and parse Connect URIs, and read the public Connect status exposed by
Taira:

```python
from iroha_python.connect import ConnectUri, build_connect_uri, parse_connect_uri

uri = build_connect_uri(
    ConnectUri(
        sid="base64url-session-id",
        chain_id="taira",
        node="taira.sora.org",
    )
)
parsed = parse_connect_uri(uri)
status = client.get_connect_status_typed()

assert parsed.chain_id == "taira"
print(status.enabled, status.sessions_active)
```

Frame codecs, session key derivation, and session creation require the native
extension and an enabled Connect session route:

```python
from iroha_python import (
    ConnectControlClose,
    ConnectControlOpen,
    ConnectDirection,
    ConnectFrame,
    ConnectPermissions,
    decode_connect_frame,
    encode_connect_frame,
    generate_connect_keypair,
)

connect_pair = generate_connect_keypair()
info = client.create_connect_session_info(
    {"role": "app", "sid": connect_pair.public_key.hex()}
)
print(info.app_uri, info.wallet_token, info.expires_at)

frame = ConnectFrame(
    sid=bytes.fromhex("01" * 32),
    direction=ConnectDirection.APP_TO_WALLET,
    sequence=1,
    control=ConnectControlOpen(
        app_public_key=connect_pair.public_key,
        chain_id=CHAIN_ID,
        permissions=ConnectPermissions(methods=["SIGN_REQUEST_TX"], events=[]),
    ),
)
payload = encode_connect_frame(frame)
assert decode_connect_frame(payload) == frame

client.send_connect_control_frame(
    "base64url-session-id",
    ConnectControlClose(role="App", code=4100, reason="finished", retryable=False),
)
```

Encrypt post-approval messages with a stateful session:

```python
from iroha_python import (
    ConnectDirection,
    ConnectSession,
    ConnectSessionKeys,
    ConnectSignRequestRawPayload,
)

keys = ConnectSessionKeys.derive(
    local_private_key=bytes.fromhex("11" * 32),
    peer_public_key=bytes.fromhex("22" * 32),
    sid=bytes.fromhex("33" * 32),
)
session = ConnectSession(
    sid=bytes.fromhex("33" * 32),
    keys=keys,
)
encrypted = session.encrypt_app_to_wallet(
    ConnectSignRequestRawPayload(domain_tag="SIGN", payload=b"hash")
)
state = session.snapshot_state().to_dict()
print(encrypted.sequence, state)
```

## Governance, Runtime, and Admin Surfaces

These read-only calls returned successfully against public Taira:

```python
client = create_torii_client("https://taira.sora.org")

protected = client.get_protected_namespaces()
referendum = client.get_governance_referendum_typed("ref-1")
tally = client.get_governance_tally_typed("ref-1")
locks = client.get_governance_locks_typed("ref-1")
unlock_stats = client.get_governance_unlock_stats_typed()

print(protected, referendum.found)
print(tally.approve, list(locks.locks), unlock_stats.expired_locks_now)

abi = client.get_runtime_abi_active_typed()
abi_hash = client.get_runtime_abi_hash_typed()
runtime_metrics = client.get_runtime_metrics_typed()
upgrades = client.list_runtime_upgrades_typed()
capabilities = client.get_node_capabilities_typed()

print(abi, abi_hash, runtime_metrics)
print(upgrades.total, capabilities.abi_version)
```

Runtime upgrade helpers accept the manifest shape used by the runtime upgrade
API. They are operator actions, so use them only against a node where your
account and token are authorized:

```python
admin = create_torii_client(
    TORII_URL,
    auth_token="admin-token",
    api_token="torii-token",
)

upgrade = admin.propose_runtime_upgrade(
    {
        "name": "Refresh runtime provenance",
        "description": "Schedules a no-ABI-change runtime rollout.",
        "abi_version": 1,
        "abi_hash": "00" * 32,
        "added_syscalls": [],
        "added_pointer_types": [],
        "start_height": 1_500_000,
        "end_height": 1_500_256,
    }
)
print(upgrade["tx_instructions"])

admin.activate_runtime_upgrade("deadbeef" * 4)
admin.cancel_runtime_upgrade("feedface" * 4)
```

## Status, Consensus, and Network Telemetry

```python
status = client.request_json("GET", "/status", expected_status=(200,))
print(status["blocks"], status["txs_approved"])

sumeragi = client.get_sumeragi_status_typed()
print(sumeragi.highest_qc.height, sumeragi.tx_queue.saturated)

time_now = client.get_time_now_typed()
time_status = client.get_time_status_typed()
for sample in time_status.samples:
    print(sample.peer, sample.last_offset_ms, sample.last_rtt_ms)
print(time_now.now_ms)
```

## SoraFS, UAID, and Kaigi Helpers

These helpers are available when the target node exposes the corresponding
Nexus/SORA endpoints. Treat empty lists as a valid response: public Taira may
have the route enabled without data for the sample manifest or UAID.

```python
por_status = client.get_sorafs_por_status(manifest_hex="ab" * 32, status="verified")
print(len(por_status))

uaid = "aabb" * 16
bindings = client.get_uaid_bindings_typed(uaid)
manifests = client.list_space_directory_manifests_typed(
    uaid,
    dataspace=11,
    status="active",
)
print(len(bindings.dataspaces), len(manifests.manifests))

health = client.get_kaigi_relays_health_typed()
print(health.healthy_total, health.failovers_total)
```

## Norito RPC and GPU Helpers

Use `NoritoRpcClient` when you already have Norito bytes and need to call a
binary Torii endpoint. The example requires a signed envelope from a previous
transaction template:

```python
from iroha_python import NoritoRpcClient, NoritoRpcConfig

with NoritoRpcClient(NoritoRpcConfig(TORII_URL, timeout=5.0)) as rpc:
    response_bytes = rpc.call("/v1/transaction", envelope.signed_transaction_versioned)
    print(len(response_bytes))
```

CUDA helpers return `None` when the backend is not available, so applications
can fall back to scalar implementations:

```python
from iroha_python import bn254_add_cuda, cuda_available, poseidon2_cuda

if cuda_available():
    print(poseidon2_cuda(1, 2))
    print(bn254_add_cuda((1, 0, 0, 0), (2, 0, 0, 0)))
```

## Current Coverage

The Python SDK already includes helpers for:

- Torii submission, status, query, and admin flows
- typed instruction builders for common ISI and domain-specific extensions
- transaction drafts, manifests, signing, and offline envelope workflows
- streaming events, filters, and resumable cursors
- offline allowances and subscriptions
- account address, all-algorithm signing helpers, multihash round trips, SM2,
  GOST, ML-DSA, BLS, and confidential key handling
- Connect URIs, sessions, frames, encryption helpers, and registry admin
- governance, runtime upgrade, Sumeragi, node-admin, SoraFS, UAID, and Kaigi
  endpoint wrappers where the node exposes those features

## Upstream References

- `python/iroha_python/README.md`
- `python/iroha_python/DESIGN.md`
- `python/iroha_python/src/iroha_python`

Those files track the current Python surface more accurately than the older
Iroha 2-era examples that used the `iroha2` package name.
