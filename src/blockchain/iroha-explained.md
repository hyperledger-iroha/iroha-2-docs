# Iroha Explained

Iroha 3 is the Nexus-oriented track of the Hyperledger Iroha workspace. It
shares the same core components as Iroha 2 but adds the Nexus execution
model for data spaces and multi-lane routing.

## Core Building Blocks

- **`irohad`** runs peers
- **Torii** is the client and operator gateway
- **Sumeragi** handles consensus
- **Norito** is the [canonical binary format](/reference/norito.md)
- **IVM** runs portable smart contracts and bytecode
- **Kagami** prepares keys, genesis, profiles, and localnets
- **SORA Nexus service planes** add Soracloud, Inrou, SoraNet, SoraFS, and
  SoraDNS for app hosting, privacy transport, storage, and naming

## Execution Model

Every change to world state still happens through transactions.
Transactions carry instructions or IVM bytecode, and Torii is the main way
clients submit them or observe their effects.

What changes in Iroha 3 is the deployment shape:

- Nexus-aware configurations can define multiple lanes
- data spaces isolate workloads while staying part of the same ledger model
- routing policy decides which lane and dataspace handle a class of work

## Multi-Dataspace Architecture

A dataspace is a routing and namespace boundary, not a separate blockchain.
The runtime still has one `World`, one transaction model, and one consensus
pipeline. Nexus adds catalogs that tell the node how to partition work
across lanes and how to name the dataspaces those lanes serve.

At runtime, a dataspace is represented by a numeric `DataSpaceId` and
catalog metadata. `DataSpaceId::UNIVERSAL` is reserved as `0`; the default
catalog contains the `universal` dataspace. Each configured dataspace has:

- a unique numeric ID
- a unique alias such as `universal`, `governance`, or `zk`
- an optional description for operator surfaces
- a non-zero `fault_tolerance` value used to size relay committees

Lanes are the execution and storage routes bound to those dataspaces. A
lane entry carries a `LaneId`, the `DataSpaceId` it serves, an alias,
visibility (`public` or `restricted`), storage profile (`full_replica`,
`commitment_only`, or `split_replica`), proof scheme, and optional
governance, settlement, and scheduler metadata. The runtime derives
per-lane storage geometry from this catalog, including Kura segment names
and deterministic key prefixes.

The routing path is:

1. Configuration builds a validated `DataSpaceCatalog`, `LaneCatalog`, and
   `LaneRoutingPolicy`. Multiple lanes, multiple dataspaces, or non-default
   routing require `nexus.enabled = true`.
2. The transaction queue asks the active lane router for a
   `RoutingDecision` containing a lane ID and dataspace ID.
3. Explicit routing rules can match by authority/account or by instruction
   label. Without a matching rule, the router can derive the dataspace from
   domain IDs, asset-definition projections, dataspace-scoped permissions,
   settlement legs, or the authority's bound account scope.
4. The resolved route is checked against both catalogs. Unknown lanes,
   unknown dataspaces, and lane/dataspace mismatches are deterministic
   routing errors. If a transaction writes to two different dataspace
   targets, it is rejected as a conflicting route; cross-dataspace DVP/PVP
   settlement is routed through the universal coordinator lane.
5. Sumeragi and telemetry keep the assignment visible as lane and dataspace
   activity, backlog, and commitment snapshots.

This is why object identifiers matter. Domains include the dataspace alias
in their ID, for example `payments.universal`, so domain-scoped writes can
be routed. Accounts remain canonical and domainless, so the same account
can be bound into different application scopes without changing its
`AccountId`. Asset definitions can carry a domain/dataspace projection,
which lets asset operations inherit the correct dataspace route.

Without Nexus overrides, the node uses a single lane and the `universal`
dataspace. The bundled SORA profile replaces that with a three-lane
catalog: `core` for the universal public lane, `governance` for governance
traffic, and `zk` for zero-knowledge attachment and contract-deployment
traffic.

Those three defaults exist to separate workload classes:

| Dataspace    | Lane         | Why it exists                                                                                                                                       |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `universal`  | `core`       | Reserved default dataspace (`DataSpaceId::UNIVERSAL == 0`) for ordinary public ledger traffic and fallback routing.                                 |
| `governance` | `governance` | Restricted lane for governance and parliament traffic, so control-plane activity is not mixed with general application writes.                      |
| `zk`         | `zk`         | Restricted lane for zero-knowledge proofs, attachments, and contract deployment routing, keeping proof-heavy workflows separate from normal writes. |

Only `universal` is the reserved baseline. `governance` and `zk` are SORA
profile choices encoded in the bundled catalog and routing policy;
operators can define a different catalog when they need different dataspace
boundaries.

## What Operators Notice First

Compared with the older single-lane documentation set, operators will
notice these changes most quickly:

- richer status and telemetry endpoints
- explicit genesis `consensus_mode` and PoP-aware topology
- SORA Nexus profiles under `defaults/nexus/`
- more CLI coverage for consensus and operator diagnostics

## Read Next

- [SORA Nexus services](/blockchain/sora-nexus-services.md)
- [Launch Iroha 3](/get-started/launch-iroha-2.md)
- [World, WSV, and Kura storage](/blockchain/world.md)
- [Genesis reference](/reference/genesis.md)
- [Torii endpoints](/reference/torii-endpoints.md)
