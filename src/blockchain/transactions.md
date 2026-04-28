# Transactions

A **transaction** is a signed request to execute work on the blockchain.
The executable payload can be an ordered sequence of
[instructions](./instructions.md), a contract call, IVM bytecode, or a
proved IVM execution. See [Smart Contracts](./wasm.md) for the current
contract execution model.

All interactions in the blockchain are done via transactions.

All transactions, including rejected transactions, are stored in blocks.

For privacy-preserving asset movement, see
[Anonymous Transactions](./anonymous-transactions.md). Anonymous
transactions use shielded asset notes, commitments, nullifiers, and
zero-knowledge proofs instead of public account-to-account balance changes.

For proof evidence over selected transparent execution effects, see
[FastPQ](./fastpq.md). FastPQ consumes execution witnesses after normal
transaction execution and builds deterministic proof batches for supported
state transitions.

## Try It on Taira

Use the explorer routes to inspect recent public Taira blocks and transaction
statuses without a signing account:

```bash
curl -fsS 'https://taira.sora.org/v1/explorer/blocks?page=1&per_page=3' \
  | jq '{pagination, blocks: [.items[] | {height, hash, transactions_total, transactions_rejected}]}'

curl -fsS 'https://taira.sora.org/v1/explorer/transactions?page=1&per_page=5' \
  | jq '{pagination, txs: [.items[] | {hash, block, status, executable}]}'
```

To follow a transaction your app submitted earlier, copy the `hash` from the
list and inspect the explorer detail route:

```bash
TX_HASH='<transaction-hash>'

curl -fsS "https://taira.sora.org/v1/explorer/transactions/$TX_HASH" \
  | jq '{hash, block, status, authority, executable}'
```

This is still read-only. Submitting a transaction requires a signed Norito
envelope, correct chain ID, fee metadata, and a faucet-funded Taira account.

For fee-paying examples on Taira, save the faucet helper from
[Get Testnet XOR on Taira](/get-started/sora-nexus-dataspaces.md#_4-get-testnet-xor-on-taira)
as `taira_faucet_claim.py`, then fund the signer through the public faucet
first:

```bash
export TAIRA_ACCOUNT_ID='<TAIRA_I105_ACCOUNT_ID>'
export TAIRA_FEE_ASSET=6TEAJqbb8oEPmLncoNiMRbLEK6tw

curl -fsS https://taira.sora.org/v1/accounts/faucet/puzzle | jq .
python3 taira_faucet_claim.py "$TAIRA_ACCOUNT_ID"

iroha --config ./taira.client.toml ledger asset get \
  --definition "$TAIRA_FEE_ASSET" \
  --account "$TAIRA_ACCOUNT_ID"
```

If the faucet puzzle or claim route returns `502`, wait and retry before
debugging the transaction itself.

Then attach the Taira fee asset metadata when submitting the transaction:

```bash
printf '{"gas_asset_id":"%s"}\n' "$TAIRA_FEE_ASSET" > taira.tx-metadata.json

iroha --config ./taira.client.toml \
  --metadata ./taira.tx-metadata.json \
  ledger transaction ping --msg "faucet-funded taira transaction"
```

## Offline Transactions

Iroha has two offline transaction workflows:

- **Offline signing** creates a normal signed transaction while the signing
  device is disconnected. The transaction is not processed until an online
  client submits the signed envelope to Torii, so it still needs the
  correct chain ID, authority, permissions, fees, and transaction lifetime.
- **Offline V2 notes** support offline value transfer through ledger-backed
  bearer notes. Online transactions reserve value into escrow, later audit
  or redeem offline payment tokens, and enforce replay protection when the
  token reaches the ledger.

Offline V2 is the maintained offline payment surface. Torii exposes
`GET /v1/offline/v2/readiness` for feature discovery; legacy offline
allowance, reserve, revocation, transfer-history, and cash HTTP routes are
not published. Offline V2 note issuance, audit, and redemption are
submitted as normal transaction instructions:

Check the public Taira readiness flags:

```bash
curl -fsS https://taira.sora.org/v1/offline/v2/readiness \
  | jq '{offline_note_v2, offline_one_use_keys, offline_recursive_note_proof, offline_sync_optional}'
```

| Instruction           | Purpose                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `IssueOfflineNoteV2`  | Reserve an online asset amount into offline escrow and record a note commitment bound to a one-use key certificate. |
| `AuditOfflineNoteV2`  | Optionally record an offline payment token, its consumed nullifiers, output commitments, and recursive proof.       |
| `RedeemOfflineNoteV2` | Verify the final offline note proof, consume replay keys and nullifiers, and credit the recipient from escrow.      |

The typical flow is:

1. Check Offline V2 readiness on the target Torii endpoint.
2. Enable offline support for the asset and configure or derive its offline
   escrow account.
3. Register an active Offline V2 recursive verifier key and grant
   `CanManageOfflineEscrow` to the account that issues notes.
4. Submit `IssueOfflineNoteV2`. The ledger debits the note owner's asset,
   credits escrow, records replay keys, and emits
   `OfflineNoteEvent::NoteIssued`.
5. Exchange the offline payment token outside the ledger. Wallets carry the
   one-use key certificate, nullifiers, output commitments, and recursive
   proof through their chosen transport, such as QR or a local hand-off.
6. Submit `AuditOfflineNoteV2` when operators or wallets want an online
   audit record before final redemption. Audit is optional for offline
   finality.
7. Submit `RedeemOfflineNoteV2` when the recipient comes online. Validators
   check the verifier key, proof binding, issued claim, amount, recipient,
   and nullifier uniqueness before crediting the recipient.

Replay protection is enforced when audit or redemption reaches the ledger.
Validators reject duplicate note issues, duplicate issued key certificates,
duplicate nullifiers, already redeemed issued claims, and conflicting audit
tokens. Until a token is audited or redeemed, the ledger cannot observe an
offline conflict, so wallet and operator policies should limit value,
expiry, accepted issuers, and reconciliation windows.

Here is an example of creating a new transaction with the `Grant`
instruction. In this transaction, Mouse is granting Alice the specified
role (`role_id`). Check
[the full example](./permissions.md#register-a-new-role).

```rust
let grant_role = Grant::account_role(role_id, alice_id);
let grant_role_tx = TransactionBuilder::new(chain_id, mouse_id)
    .with_instructions([grant_role])
    .sign(mouse_private_key);
```
