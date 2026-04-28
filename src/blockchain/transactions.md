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
