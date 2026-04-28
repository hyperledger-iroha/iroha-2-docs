<script setup>
import { withBase } from 'vitepress'
</script>

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

## Sumeragi

Sumeragi is Iroha's Byzantine-fault-tolerant consensus engine. It takes
transactions from the queue, has validator peers agree on the same ordered
block, and finalizes that block only after enough validators have
reproduced the same result and signed the commit certificate.

<img :src="withBase('/sumeragi-round-dataflow.svg')" alt="Sumeragi proposal-to-commit data flow" />

### Proposal and commit path

Sumeragi runs the ledger forward one block height at a time. At each height,
one validator acts as proposer for the current view. The proposer drains
eligible transactions from the queue, builds a candidate block, and announces
the proposal to the active validator set.

The same Sumeragi pipeline is used in both permissioned and Nominated
Proof-of-Stake (NPoS) deployments:

1. A validator proposes a block from queued transactions.
2. Validators validate the proposal by executing the transactions against
   the same world state.
3. Validators exchange votes and quorum certificates for the current height
   and view.
4. Once the commit quorum is reached, peers commit the block and update
   their world state.

Validators sign only data they can reproduce locally. Before voting, a
validator checks that the proposal belongs to the expected chain, height, and
view; that transaction signatures and limits are valid; that lane routing and
executor validation are deterministic; and that executing the payload produces
the expected state transition. If the local result differs, the validator
rejects the proposal instead of voting for it.

Votes are small signed consensus messages. They refer to the proposed block,
the height, the view, and the validator identity. Collectors aggregate those
votes into a quorum certificate or commit certificate. The certificate is the
durable proof that enough validators observed the same result for the same
block.

### Quorum, collectors, and observers

The voting validator count `n` defines the Byzantine fault budget. For
networks with at least four validators, the budget is `f = floor((n - 1) / 3)`
and the commit quorum is `2f + 1`. For one to three validators, all validators
are required for commit, which is useful for development but has no practical
offline slack.

Collectors are a fanout optimization. Instead of every validator sending every
vote to every other validator, Sumeragi can select one or more collectors for a
height. The collectors assemble votes, publish quorum progress, and reduce the
amount of duplicate vote traffic. The effective collector settings are exposed
through `ops sumeragi collectors` and `/v1/sumeragi/collectors`.

Observer peers can synchronize committed blocks, but they do not propose,
vote, collect votes, or count toward the commit quorum. Use observers when a
deployment needs local query capacity, indexing, monitoring, or regional block
replication without increasing the number of voting validators.

### View changes and recovery

A view is Sumeragi's attempt to finalize one height with a particular proposer
and timing plan. If proposal, payload, vote, or commit progress stalls, the
pacemaker can move the height to a later view. A view change does not rewrite a
committed block. It changes how validators try to finish the uncommitted
height, carrying forward the highest known quorum or commit evidence so peers
do not finalize conflicting blocks.

Payload recovery is separate from the finality decision. A peer might receive
a quorum or commit certificate before it has the full block payload. In that
case, the peer uses reliable broadcast (RBC) or block sync to recover the
payload, verifies it against the advertised hashes, and only then applies the
block to the world state and Kura.

### Consensus modes

The selected mode controls how the validator set is formed and operated. It
is declared in genesis through [`consensus_mode`](/reference/genesis.md)
and in peer configuration through `sumeragi.consensus_mode`. Treat it as
network-wide state: validators need the same signed genesis, topology,
trusted peer data, and effective Sumeragi parameters.

<img :src="withBase('/sumeragi-mode-dataflow.svg')" alt="Sumeragi consensus mode data flow" />

| Mode         | Best fit                                                                               | Validator set                                                                                                      | Operational focus                                                                                          |
| ------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Permissioned | Private, consortium, and operator-managed networks                                     | Validators come from the trusted peer topology agreed by the deployment                                            | Keep all validators on the same signed genesis, trusted peers, peer keys, and Sumeragi parameters          |
| NPoS         | Public or Nexus-oriented networks where validation follows nomination and stake policy | Validators are selected by the NPoS profile, usually across epochs, and require BLS keys plus Proofs-of-Possession | Keep stake snapshots, epoch parameters, validator PoPs, and NPoS phase timeouts aligned across the network |

::: tip Permissioned mode

Use permissioned mode when the validator roster is an explicit operational
choice. This is the usual starting point for self-hosted Iroha networks
because membership changes are deliberate governance or administrator
actions. The important operational rule is that every validator must run with
the same view of genesis, trusted peers, BLS Proofs-of-Possession, and
Sumeragi parameters. A single peer with a different topology or signed genesis
can prevent the network from committing.

:::

::: tip NPoS mode

Use NPoS mode when the deployment profile expects validator participation
to be driven by nomination and stake state. Public SORA Nexus deployments
use NPoS, and their generated profiles include the BLS validator
identities, Proofs-of-Possession, epoch settings, and Sumeragi NPoS
parameters needed at startup. Epoch changes can replace the active validator
set at defined heights, so operators need to monitor both consensus health and
the stake or nomination state that feeds the next roster.

:::

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

## Reliable broadcast (RBC)

Reliable broadcast (RBC) is Sumeragi's payload dissemination and recovery
path. It helps validators and observers obtain the block body that belongs
to a proposal or commit certificate, especially when a `BlockCreated`
message, block-sync update, or direct payload transfer is delayed or lost.

RBC works at the payload level. The proposer announces an RBC session for a
block height, view, and payload hash, then sends payload chunks across the
commit topology. Peers track chunk receipt, validate the recovered payload
against the advertised hash, and exchange `READY` and `DELIVER` signals
once enough validators have observed the same payload. Sessions are bounded
by TTL, chunk, fanout, pending-stash, and persisted-store limits so
recovery traffic cannot grow without limit.

RBC is not a separate consensus decision and it does not replace the commit
certificate. A block still finalizes only when the peer has a valid commit
certificate and the matching payload locally. When data availability is
enabled, RBC contributes availability evidence and payload recovery, but
commit progress is driven by the commit certificate plus local payload. If
the certificate arrives before the payload, the peer can recover the
payload through RBC or block sync and then commit.

Operationally, RBC is useful for diagnosing missing-payload and
data-availability bottlenecks:

- `iroha --output-format text ops sumeragi rbc status` shows aggregate RBC
  session and throughput counters.
- `iroha --output-format text ops sumeragi rbc sessions` lists active
  sessions, including chunk progress, readiness, delivery state, and
  lane/dataspace backlog.
- `GET /v1/sumeragi/rbc` and `GET /v1/sumeragi/rbc/sessions` expose the
  same data over Torii; see
  [Torii endpoints](/reference/torii-endpoints.md).
- Prometheus signals such as `sumeragi_rbc_store_pressure`,
  `sumeragi_rbc_backpressure_deferrals_total`, and per-lane or
  per-dataspace RBC backlog gauges help separate network loss, chunk
  recovery, and storage pressure; see
  [Performance and metrics](/guide/advanced/metrics.md).

Kura uses the derived lane configuration for storage layout. Each lane
receives deterministic storage names such as `blocks/lane_000_core` and
`merge_ledger/lane_000_core_merge.log`; lane lifecycle changes can
provision, retire, or relabel those segments without changing the global
block order.

[^1]:
    For prospective wizards, the
    [Iroha 2 Whitepaper](https://github.com/hyperledger-iroha/iroha/blob/i23-features/docs/source/iroha_2_whitepaper.md)
    is a good start.
