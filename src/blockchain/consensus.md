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
consensus, and you would eventually produce a block using only good™
peers.

As a natural consequence, if any changes to the world state are made
without the use of ISI, the good™ peers cannot know of them. They won't be
able to reproduce the hash of the world state, and thus consensus will
fail. The same thing happens if the peers have different instructions.

## Multilane consensus

Iroha's multilane consensus path is implemented through Nexus lane and
dataspace configuration. It does not start a separate consensus instance
for each lane. Sumeragi still finalizes one ordered block stream; lanes
describe how transactions are routed, scheduled, accounted for, and stored
inside that stream.

The runtime configuration builds three pieces of lane state:

- `lane_catalog`: the configured lanes, each with a numeric `LaneId`,
  alias, dataspace, visibility, storage profile, proof scheme, and
  metadata.
- `dataspace_catalog`: the configured dataspaces, each with a numeric
  `DataSpaceId` and a fault-tolerance value used for relay committee
  sizing.
- `routing_policy`: the default lane/dataspace pair and ordered routing
  rules that can match accounts or instruction paths.

When a transaction enters the queue, the lane router resolves it to a
`RoutingDecision { lane_id, dataspace_id }`. In single-lane mode this is
always lane `0` and the universal dataspace. In Nexus mode, the configured
router applies dataspace-scoped rules, settlement routing, account rules,
explicit routing rules, and finally the default route. The resolved lane
and dataspace must exist in their catalogs, and the lane must be bound to
the resolved dataspace; otherwise the transaction is rejected before it is
queued.

The queue keeps this routing decision with the transaction hash so that
later stages do not have to infer it again. Proposal construction then uses
the lane metadata in two ways:

- It interleaves transactions by lane so one lane does not dominate the
  block just because its transactions were queued first.
- It applies per-lane transaction execution unit (TEU) limits. Transactions
  that would exceed a lane's configured capacity are deferred and requeued,
  except that the first overweight transaction for a lane can be admitted
  to avoid livelock.

During reliable broadcast, Sumeragi aggregates the proposed payload by lane
and dataspace. The recorded totals include transaction count, broadcast
chunks, payload bytes, and TEU. After commit, those totals become the lane
and dataspace commitment snapshots exposed through Sumeragi status. If a
block contains lane settlement receipts, block processing also creates lane
settlement commitments and relay envelopes that bind the block header,
commit certificate, data-availability commitment hash, settlement proof,
and lane payload size.

Kura uses the derived lane configuration for storage layout. Each lane
receives deterministic storage names such as `blocks/lane_000_core` and
`merge_ledger/lane_000_core_merge.log`; lane lifecycle changes can
provision, retire, or relabel those segments without changing the global
block order.

[^1]:
    For prospective wizards, the
    [Iroha 2 Whitepaper](https://github.com/hyperledger-iroha/iroha/blob/main/docs/source/iroha_2_whitepaper.md)
    is a good start.
