# Consensus

Each time you send a transaction to Iroha, it gets put into a queue. When
it's time to produce a new block, the queue is emptied, and the consensus
process begins. This process is equal parts common sense and black
magic[^1].

The mundane aspect is that a special set of peers needs to take the
transaction queue and reproduce the same world state. If the world state
cannot be reproduced for some reason or another, none of the transactions
get committed to a block.

The consensus starts over from scratch by choosing a different special set
of peers. This is where the black magic comes in. There is a number of
things that are fine-tuned: the number of peers in the voting process, the
way in which subsequent voting peers are chosen, and the way in which the
peers communicate that consensus has failed. Because this changes the view
of the world, the process is called a _view change_. The exact reason for
why the view was changed is encoded in the _view change proof_, but
decoding that information is an advanced topic that we won't cover here.

The reasoning behind this algorithm is simple: if someone had some evil
peers and connected them to the existing network, if they tried to fake
data, some good™ peers would not get the same (evil™) world state. If
that's the case, the evil™ peers would not be allowed to participate in
consensus, and you would eventually produce a block using only good™ peers.

As a natural consequence, if any changes to the world state are made
without the use of ISI, the good™ peers cannot know of them. They won't be
able to reproduce the hash of the world state, and thus consensus will
fail. The same thing happens if the peers have different instructions.

[^1]:
    For prospective wizards, the
    [Iroha 2 Whitepaper](https://github.com/hyperledger-iroha/iroha/blob/main/docs/source/iroha_2_whitepaper.md)
    is a good start.
