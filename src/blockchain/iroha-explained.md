# Iroha Explained

To understand how Iroha operates, let's draw parallels between a blockchain
and a computer. If the blockchain is the computer, then in this metaphor of
ours the client binary (for example: [`iroha`](/get-started/operate-iroha-2-via-cli.md))
is the keyboard, the blockchain is the hard drive, and the Iroha peer
software is the processor. Like a processor, Iroha accepts portable
instructions that modify what's written to the blockchain, allow certain
users to use the network, and lock others out.

Any operation that is run on-chain is written in terms of
[Iroha Special Instructions (ISI)](/blockchain/instructions.md), and
there is no other way of modifying the world state.

Each interaction with the blockchain is done via a _transaction_. A
transaction is a collection of _instructions_, which are either glued
together in sequence or compiled into what we affectionately call a
[WASM](/blockchain/wasm.md) blob. You need these instructions to
register an account, remove an account, add X amount of Y currency, and so
on.

To read the information encoded in the blocks of a blockchain (the current
world state), you use [queries](/blockchain/queries.md). Queries are
submitted like instructions, but they're not tracked and recorded in
blocks, so they're much more lightweight. If you use queries as part of
complicated logic (e.g. inside WASM), they have a non-negligible impact on
the size of the blocks. Queries that are only used to get information leave
no trace in the blockchain.