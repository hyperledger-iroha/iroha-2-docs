# Anonymous Transactions

Anonymous transactions in Iroha are built from confidential asset
operations. Instead of writing public account-to-account transfers with
public amounts, a wallet moves value into a shielded ledger and then spends
opaque notes with zero-knowledge proofs.

The public ledger still records that a confidential operation happened. It
records commitments, nullifiers, proof hashes, and events, but it does not
record the note owner, recipient, or amount for shielded-to-shielded
movement. The normal transaction envelope may still reveal the submitting
account, so "anonymous" here means anonymous asset movement, not automatic
network-level or account-level anonymity.

## Building Blocks

| Concept            | Ledger representation                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Shielded note      | A private wallet record containing an asset, amount, owner data, and randomness.                                   |
| Commitment         | A 32-byte public value that commits to a note without revealing its fields.                                        |
| Nullifier          | A 32-byte public value derived when a note is spent. Iroha rejects repeated nullifiers to prevent double spending. |
| Merkle root        | A recent root of the asset's commitment tree. Proofs use it to show that spent notes exist.                        |
| Proof attachment   | A `ProofAttachment` containing proof bytes plus a verifying-key reference or inline verifying key.                 |
| Confidential event | A ledger event such as `ConfidentialEvent::Shielded`, `Transferred`, or `Unshielded`.                              |

The main instructions are:

- `RegisterZkAsset`: registers an asset as ZK-capable and binds transfer,
  shield, and unshield verifying keys.
- `Shield`: debits a public balance and appends a shielded note commitment.
- `ZkTransfer`: spends shielded notes into new shielded note commitments.
- `Unshield`: spends shielded notes and credits a public account balance.
- `ScheduleConfidentialPolicyTransition` and
  `CancelConfidentialPolicyTransition`: change an asset's confidential
  policy through governance.

An asset definition also carries an
[`AssetConfidentialPolicy`](/reference/data-model-schema.md).
The policy mode controls which flows are valid:

| Mode              | Meaning                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `TransparentOnly` | Only normal public balances and transfers are accepted.          |
| `Convertible`     | Users may move value between public balances and shielded notes. |
| `ShieldedOnly`    | Asset issuance and transfers must stay in the shielded ledger.   |

## How To Use Them

1. Enable confidential support on validator nodes. Validators must agree on
   the verifier backend, active verifying keys, Poseidon/Pedersen parameter
   IDs, and confidential rules version. Nodes reject peers or blocks with
   mismatched confidential feature digests.
2. Publish or register the verifying keys and parameter sets used by the
   circuits. Wallets and operators should refer to keys by
   `VerifyingKeyId`, for example `halo2/ipa:vk_transfer`.
3. Register the asset as ZK-capable with `RegisterZkAsset`, or stage a
   policy transition from `TransparentOnly` to `Convertible` or
   `ShieldedOnly`.
4. Shield public funds with `Shield`. The wallet creates a note commitment
   and encrypted payload for the recipient before it submits the
   transaction.
5. Transfer privately with `ZkTransfer`. The wallet builds a proof that it
   owns the input notes, that the input and output values balance, and that
   every spent note is anchored in a recent commitment tree.
6. Unshield only when the asset policy allows it. `Unshield` reveals the
   public amount and recipient account, spends the private note nullifier,
   and can create private change outputs.
7. Audit by reading confidential events, proof records, nullifier status,
   and anonymous escrow records through typed queries and Torii endpoints.

## CLI Examples

The ZK CLI commands are intended for operator and testing flows. Production
wallets should generate commitments, encrypted payloads, and proofs with a
wallet/prover library before submitting the resulting instructions.

Register a hybrid ZK-capable asset:

```bash
iroha app zk register-asset \
  --asset <asset-definition-id> \
  --allow-shield true \
  --allow-unshield true \
  --vk-transfer halo2/ipa:vk_transfer \
  --vk-unshield halo2/ipa:vk_unshield \
  --vk-shield halo2/ipa:vk_shield
```

Build a versioned encrypted payload envelope for the shielded note:

```bash
iroha app zk envelope \
  --ephemeral-pubkey 0101010101010101010101010101010101010101010101010101010101010101 \
  --nonce-hex 020202020202020202020202020202020202020202020202 \
  --ciphertext-b64 AQIDBA== \
  --print-json \
  --output note-envelope.bin
```

Shield public funds into the asset's shielded ledger:

```bash
iroha app zk shield \
  --asset <asset-definition-id> \
  --from <account-id> \
  --amount 1000 \
  --note-commitment ABABABABABABABABABABABABABABABABABABABABABABABABABABABABABABABAB \
  --enc-payload note-envelope.bin
```

Unshield with a proof attachment JSON:

```bash
cat > unshield-proof.json <<'JSON'
{
  "backend": "halo2/ipa",
  "proof_b64": "BASE64_PROOF_BYTES",
  "vk_ref": {
    "backend": "halo2/ipa",
    "name": "vk_unshield"
  }
}
JSON

iroha app zk unshield \
  --asset <asset-definition-id> \
  --to <account-id> \
  --amount 1000 \
  --inputs DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF \
  --proof-json unshield-proof.json
```

## SDK Example

The exact proof bytes come from the configured proof backend. The
transaction payload only needs the public inputs and the proof attachment:

```rust
use iroha_data_model::{
    isi::zk::{Unshield, ZkTransfer},
    prelude::{AccountId, AssetDefinitionId, InstructionBox},
    proof::{ProofAttachment, ProofBox, VerifyingKeyId},
};

fn transfer_instruction(
    asset: AssetDefinitionId,
    input_nullifier: [u8; 32],
    output_commitment: [u8; 32],
    anchor_root: [u8; 32],
    proof_bytes: Vec<u8>,
) -> InstructionBox {
    let backend = "halo2/ipa".into();
    let proof = ProofBox::new(backend, proof_bytes);
    let vk = VerifyingKeyId::new("halo2/ipa", "vk_transfer");
    let attachment = ProofAttachment::new_ref("halo2/ipa".into(), proof, vk);

    ZkTransfer::new(
        asset,
        vec![input_nullifier],
        vec![output_commitment],
        attachment,
        Some(anchor_root),
    )
    .into()
}

fn unshield_instruction(
    asset: AssetDefinitionId,
    recipient: AccountId,
    amount: u128,
    input_nullifier: [u8; 32],
    anchor_root: [u8; 32],
    proof_bytes: Vec<u8>,
) -> InstructionBox {
    let backend = "halo2/ipa".into();
    let proof = ProofBox::new(backend, proof_bytes);
    let vk = VerifyingKeyId::new("halo2/ipa", "vk_unshield");
    let attachment = ProofAttachment::new_ref("halo2/ipa".into(), proof, vk);

    Unshield::new(
        asset,
        recipient,
        amount,
        vec![input_nullifier],
        attachment,
        Some(anchor_root),
    )
    .into()
}
```

## Anonymous Asset Escrow

Anonymous asset escrow uses the same shielded transfer machinery for
escrowed value. The parties and escrow state are still recorded in the
escrow record, but the funding, release, cancellation, and resolution legs
use shielded nullifiers and output commitments.

The lifecycle is:

1. `OpenAnonymousAssetEscrow` spends shielded funding notes and creates one
   escrow commitment.
2. `AcceptAnonymousAssetEscrow` records the buyer.
3. `MarkAnonymousEscrowPaymentSent` records that the buyer sent payment
   off-chain.
4. `ReleaseAnonymousAssetEscrow` spends the escrow commitment to buyer
   output commitments.
5. `CancelAnonymousAssetEscrow` spends the escrow commitment back to seller
   output commitments when payment has not been marked.
6. `OpenAnonymousEscrowDispute` and `ResolveAnonymousEscrowDispute` handle
   disputed escrows with evidence hashes and a resolver-controlled split.

Use the anonymous escrow queries listed in
[Queries](/reference/queries.md#escrow-and-proof-records) to inspect escrow
records and statuses.

## Math

The notation below describes the confidential asset flow. Implementations
use the active circuit and parameter IDs from the asset policy and verifier
registry, so clients should treat commitments, nullifiers, and proof bytes
as opaque outputs of the wallet/prover.

A shielded note can be described as:

$$
n = (\mathsf{asset}, \mathsf{amount}, \mathsf{owner}, \rho)
$$

where `owner` is derived from the recipient's viewing or spend material and
`rho` is note randomness.

The note commitment is a hiding commitment:

$$
C = \mathsf{Commit}(\mathsf{asset}, \mathsf{amount}, \mathsf{owner}, \rho)
$$

For the current confidential transfer circuits, the public inputs include
note commitments, nullifiers, a Merkle root, an asset tag, and a chain tag.
The circuit enforces a commitment relation of this shape:

$$
C = H_c(\mathsf{amount}, \rho, \mathsf{owner\_tag}, \mathsf{asset\_tag})
$$

When a note is spent, the wallet derives a nullifier:

$$
N = H_n(\mathsf{spend\_key}, \rho, \mathsf{asset\_tag}, \mathsf{chain\_tag})
$$

`N` is public. It does not reveal the note, but it is stable for that note
and chain, so Iroha can reject a second spend with the same nullifier.

The commitment tree proves note existence. If a wallet spends commitment
`C_i`, the proof includes a private Merkle path from `C_i` to a recent
public root:

$$
\mathsf{MerkleRoot}(C_i, \mathsf{path}) = R
$$

For a shielded-to-shielded transfer, the proof also enforces value
conservation:

$$
\sum \mathsf{inputs} = \sum \mathsf{outputs}
$$

For an unshield, the public amount is included:

$$
\sum \mathsf{inputs} = \mathsf{public\_amount} + \sum \mathsf{private\_change}
$$

The submitted proof can be summarized as:

$$
\mathsf{Verify}(\mathsf{vk}, \mathsf{public\_inputs}, \pi) = \mathsf{true}
$$

where `public_inputs` are the commitments, nullifiers, root, asset tag,
chain tag, and any public unshield amount. The witness contains the note
amounts, randomness, spend material, and Merkle paths. Validators verify
the proof and then mutate ledger state by appending output commitments and
marking input nullifiers as spent.

## What Is Public

Anonymous transactions do not make every observable fact private. The
following data can still be public:

- the transaction hash, block height, and ordering
- the submitting transaction authority unless the application uses a
  private entrypoint or relayer pattern
- the asset definition being used
- nullifiers and output commitments
- proof hashes, verifying-key references, and optional envelope hashes
- public amount and recipient account for `Unshield`
- anonymous escrow seller, buyer, status, timestamps, and evidence hashes

Design applications so this public metadata does not reveal the business
relationship you are trying to protect.

## Related Reference

- [`AssetConfidentialPolicy`](/reference/data-model-schema.md)
- [`ConfidentialEvent`](/reference/data-model-schema.md)
- [`ProofAttachment`](/reference/data-model-schema.md)
- [`SignedTransaction.attachments`](/reference/data-model-schema.md)
- [Escrow and proof queries](/reference/queries.md#escrow-and-proof-records)
