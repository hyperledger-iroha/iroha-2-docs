# Expressions, Conditionals, Logic

All [Iroha Special Instructions](./instructions.md) operate on expressions.
Each expression has an `EvaluatesTo`, which is used in instruction
execution. While you could specify the account name directly, you could
also specify the account ID via some mathematical or string operation. You
can check if an account is registered on the blockchain too.

Using expressions that implement `EvaluatesTo<bool>`, you can set up
conditional logic and execute more sophisticated operations on-chain. For
example, you can submit a `Mint` instruction only if a specific account is
registered.

Recall that you can combine this with queries, and as such can program the
blockchain to do some amazing stuff. This is what we refer to as _smart
contracts_, the defining feature of the advanced usage of blockchain
technology.
