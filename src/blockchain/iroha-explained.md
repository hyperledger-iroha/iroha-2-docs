# Iroha Explained

Iroha 3 is the Nexus-oriented track of the Hyperledger Iroha workspace. It
shares the same core components as Iroha 2 but adds the Nexus execution model
for data spaces and multi-lane routing.

## Core Building Blocks

- **`irohad`** runs peers
- **Torii** is the client and operator gateway
- **Sumeragi** handles consensus
- **Norito** is the canonical binary format
- **IVM** runs portable smart contracts and bytecode
- **Kagami** prepares keys, genesis, profiles, and localnets

## Execution Model

Every change to world state still happens through transactions. Transactions
carry instructions or IVM bytecode, and Torii is the main way clients submit
them or observe their effects.

What changes in Iroha 3 is the deployment shape:

- Nexus-aware configurations can define multiple lanes
- data spaces isolate workloads while staying part of the same ledger model
- routing policy decides which lane and dataspace handle a class of work

## What Operators Notice First

Compared with the older single-lane documentation set, operators will notice
these changes most quickly:

- richer status and telemetry endpoints
- explicit genesis `consensus_mode` and PoP-aware topology
- SORA Nexus profiles under `defaults/nexus/`
- more CLI coverage for consensus and operator diagnostics

## Read Next

- [Launch Iroha 3](/get-started/launch-iroha-2.md)
- [Genesis reference](/reference/genesis.md)
- [Torii endpoints](/reference/torii-endpoints.md)
