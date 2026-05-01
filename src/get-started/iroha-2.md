# Iroha 3 vs. Iroha 2

The current workspace ships two deployment tracks from the same codebase:

- **Iroha 2** for self-hosted permissioned and consortium networks
- **Iroha 3 / SORA Nexus** for the Nexus-oriented global deployment track

Iroha 3 is not a separate rewrite. It reuses the same core crates, the same
Iroha Virtual Machine, the same Torii transport layer, and the same Norito
codec.

## What Stays the Same

- `irohad`, `iroha`, and `kagami` remain the primary operator tools
- smart contracts still target IVM
- Torii remains the main API surface
- Sumeragi remains the consensus engine
- Norito remains the canonical wire format

## What Changes in Iroha 3

| Area | Iroha 2 | Iroha 3 |
| --- | --- | --- |
| Deployment model | Standalone self-hosted networks | Nexus-oriented deployment track with SORA-specific profiles |
| Execution layout | Single-lane worldview | Multi-lane execution with Nexus data spaces |
| Routing | One network surface | Lane and data-space aware routing policies |
| Consensus profile | Permissioned by default | Permissioned or NPoS depending on the dataspace and profile |
| Operator config | Generic defaults | Additional Nexus, SoraFS, streaming, and lane catalog settings |
| Genesis workflow | Standard manifest and signed block | Same workflow, plus explicit `consensus_mode`, topology PoPs, and Nexus-oriented profiles |

## Migration Guidance

If you already know Iroha 2, the main operational differences in Iroha 3 are:

- you should expect more configuration around Nexus lanes and data spaces
- public SORA Nexus deployments use the `--sora` profile path
- genesis manifests now carry more explicit consensus and crypto metadata
- telemetry and Torii reference pages matter more during rollout because
  operator status endpoints are part of the day-to-day workflow

The shared codebase means many concepts stay familiar, but the deployment shape
changes from "run your own isolated network" to "run the Nexus-oriented track
with lane-aware configuration and tooling."

## Read Next

- [Launch Iroha 3](/get-started/launch-iroha-2.md)
- [Genesis reference](/reference/genesis.md)
- [Iroha 3 architecture overview](/blockchain/iroha-explained.md)
