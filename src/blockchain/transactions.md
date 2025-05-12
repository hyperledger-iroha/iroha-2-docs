# Transactions

A **transaction** is a collection of [instructions](./instructions.md). The
instructions within a transaction can be executed in a sequence or compiled
into a [WASM blob](./wasm.md).

All interactions in the blockchain are done via transactions.

All transactions, including rejected transactions, are stored in blocks.

Here is an example of creating a new transaction with the `Grant`
instruction. In this transaction, Mouse is granting Alice the specified
role (`role_id`). Check
[the full example](./permissions.md#register-a-new-role).

```rust
let grant_role = GrantBox::new(role_id, alice_id);
let grant_role_tx =
    Transaction::new(mouse_id, vec![grant_role.into()].into(), 100_000)
    .sign(mouse_key_pair)?;
```
