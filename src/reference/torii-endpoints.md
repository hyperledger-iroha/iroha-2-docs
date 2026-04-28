# Torii Endpoints

Torii is the HTTP, SSE, and WebSocket gateway for current Iroha deployments.
In the Iroha 3 track it serves both ledger-facing APIs and a broad set of
operator endpoints.

The important protocol change from older docs is simple:

- the canonical binary format is **Norito**
- many endpoints also support JSON when you send `Accept: application/json`
- metrics are exposed in Prometheus format

## Common Endpoints

| Endpoint | Format | Purpose |
| --- | --- | --- |
| `POST /transaction` | Norito | Submit a signed transaction |
| `POST /query` | Norito | Submit a signed query |
| `GET /events` | WebSocket | Subscribe to event streams |
| `GET /block/stream` | WebSocket | Stream committed blocks |
| `GET /peers` | JSON | Peer list exposed by Torii |
| `GET /health` | JSON | Lightweight liveness endpoint |
| `GET /api_version` | JSON | Default API version |
| `GET /status` | JSON | High-level status summary for operators |
| `GET /metrics` | Prometheus | Prometheus scrape endpoint |
| `GET /schema` | JSON | Data-model schema snapshot served by the node |
| `GET /openapi` or `GET /openapi.json` | JSON | OpenAPI document for the active Torii HTTP routes |
| `GET /v1/parameters` | JSON | Node parameter snapshot |
| `GET /v1/node/capabilities` | JSON | Node capability and data-model metadata |
| `GET /v1/api/versions` | JSON | Supported Torii API versions |
| `GET /v1/events/sse` | SSE | Event stream for long-lived clients |
| `GET /v1/time/now` | JSON | Node wall-clock snapshot |
| `GET /v1/time/status` | JSON | Time synchronization status |

`/openapi` is the authoritative endpoint list for a running node. The exact
surface depends on build features and runtime configuration, so generated
clients should prefer the live OpenAPI document over a hand-copied route list.

## Consensus and Runtime Endpoints

| Endpoint | Format | Purpose |
| --- | --- | --- |
| `GET /v1/sumeragi/commit-certificates` | JSON | Recent commit certificate summaries |
| `GET /v1/sumeragi/validator-sets` | JSON | Validator set history |
| `GET /v1/sumeragi/validator-sets/{height}` | JSON | Validator set at a block height |
| `GET /v1/sumeragi/status` | Norito or JSON | Detailed consensus status snapshot |
| `GET /v1/sumeragi/status/sse` | SSE | Continuous consensus status stream |
| `GET /v1/sumeragi/leader` | JSON | Current leader information |
| `GET /v1/sumeragi/qc` | Norito or JSON | Latest quorum-certificate summary |
| `GET /v1/sumeragi/checkpoints` | JSON | Consensus checkpoint summary |
| `GET /v1/sumeragi/consensus-keys` | JSON | Active consensus keys |
| `GET /v1/sumeragi/bls_keys` | JSON | Active BLS consensus keys |
| `GET /v1/sumeragi/phases` | JSON | Latest per-phase latency sample |
| `GET /v1/sumeragi/rbc` | JSON | RBC session and throughput metrics |
| `GET /v1/sumeragi/rbc/sessions` | JSON | Active RBC session snapshot |
| `GET /v1/sumeragi/pacemaker` | JSON | Pacemaker status |
| `GET /v1/sumeragi/params` | JSON | Current on-chain Sumeragi parameters |
| `GET /v1/sumeragi/collectors` | JSON | Deterministic collector plan snapshot |
| `GET /v1/sumeragi/key-lifecycle` | JSON | Consensus key lifecycle status |
| `GET /v1/sumeragi/telemetry` | JSON | Consensus telemetry snapshot |
| `GET /v1/sumeragi/evidence` | JSON | Evidence records, optionally filtered by query string |
| `GET /v1/sumeragi/evidence/count` | JSON | Evidence record count |
| `POST /v1/sumeragi/evidence/submit` | JSON | Submit consensus evidence |
| `GET /v1/sumeragi/commit_qc/{hash}` | Norito or JSON | Commit QC record for a block hash |
| `GET /v1/runtime/abi/active` | JSON | Active runtime ABI descriptor |
| `GET /v1/runtime/abi/hash` | JSON | Active runtime ABI hash |
| `GET /v1/runtime/metrics` | JSON | Runtime metrics snapshot |
| `GET /v1/runtime/upgrades` | JSON | Runtime upgrade list |
| `POST /v1/runtime/upgrades/propose` | JSON | Propose a runtime upgrade |
| `POST /v1/runtime/upgrades/activate/{id}` | JSON | Activate a proposed runtime upgrade |
| `POST /v1/runtime/upgrades/cancel/{id}` | JSON | Cancel a proposed runtime upgrade |

## App and SORA Route Families

When Torii is built with the app-facing feature set, it exposes additional JSON
families for explorers, SORA services, bridge flows, proofs, and storage. These
families are not all enabled on every network profile.

| Route family | Purpose |
| --- | --- |
| `/v1/accounts/*`, `/v1/domains/*`, `/v1/assets/*` | JSON reads, query helpers, onboarding helpers, and portfolio or holder views |
| `/v1/nfts/*`, `/v1/rwas/*`, `/v1/confidential/*` | NFT, real-world asset, and confidential asset views |
| `/v1/aliases/*`, `/v1/assets/aliases/*`, `/v1/sns/*`, `/v1/identifiers/*` | Name, alias, and identifier resolution |
| `/v1/explorer/*` | Explorer-oriented account, asset, block, transaction, instruction, metric, and stream views |
| `/v1/transactions/*`, `/v1/pipeline/*`, `/v1/iso20022/*` | Transaction history, pipeline recovery or status, and ISO 20022 helpers |
| `/v1/contracts/*` | Contract code, deploy, bundle, call, view, event, activity, rollup, and state routes |
| `/v1/multisig/*`, `/v1/controls/*` | Multisig proposals, approvals, and transfer-control helpers |
| `/v1/bridge/*`, `/v1/ledger/*`, `/v1/proofs/*` | Finality, state proof, block proof, proof retention, and proof query routes |
| `/v1/da/*` | Data-availability ingest, manifests, proof policies, commitments, and pin intents |
| `/v1/zk/*` | ZK roots, proof verification, IVM proving, vote tallying, verification keys, proof records, and attachments |
| `/v1/gov/*`, `/v1/ministry/*` | Governance proposals, ballots, council state, protected namespaces, agenda proposals, enactment, and finalization |
| `/v1/nexus/*`, `/v1/sccp/*` | Nexus lane, dataspace, and cross-chain proof helpers |
| `/v1/musubi/*` | Musubi package registry reads and instruction builders |
| `/v1/subscriptions/*` | Subscription plans, subscription lifecycle, usage, and charging helpers |
| `/v1/sorafs/*`, `/sorafs/*`, `/.well-known/sorafs/*` | SoraFS provider discovery, capacity proofs, pinning, storage fetches, and public content serving |
| `/v1/soracloud/*`, `/v1/soradns/*`, `/soradns/*`, `/api/*` | SoraCloud service lifecycle, private compute/model flows, public discovery, and hosted app routing |
| `/v1/connect/*`, `/v1/vpn/*` | Iroha Connect sessions, WebSocket transport, VPN sessions, profiles, and receipts |
| `/v1/app-api/*`, `/v1/api/*`, `/v1/content/*` | App API bindings and bundle/CID-backed content routing |
| `/v1/operator/*`, `/v1/mcp` | Operator authentication and native MCP JSON-RPC bridge |
| `/v1/offline/*`, `/v1/repo/*`, `/v1/space-directory/*`, `/v1/ram-lfe/*` | Offline readiness, repository agreements, dataspace manifests, and RAM LFE helpers |
| `/v1/kaigi/*`, `/v1/webhooks/*`, `/v1/notify/*`, `/v1/telemetry/*` | Collaboration, webhook, push notification, and live telemetry integrations |

## Status and Metrics

The status and metrics endpoints are the first things to wire into dashboards:

- `/status` exposes top-level peer, block, queue, and consensus fields
- `/metrics` exposes Prometheus counters, gauges, and histograms

On Nexus-enabled nodes, status output also includes lane and data-space-aware
sections. When `nexus.enabled = false`, those sections are omitted.

## JSON vs. Norito

Several operator endpoints return Norito by default. When the endpoint supports
JSON, send:

```http
Accept: application/json
```

This is especially useful for:

- `/v1/sumeragi/status`
- `/v1/sumeragi/qc`
- `/v1/sumeragi/commit_qc/{hash}`

## Telemetry Profiles

Endpoint visibility depends on telemetry settings. The upstream docs describe
five profile levels:

| Profile | `/status` | `/metrics` | Developer routes |
| --- | --- | --- | --- |
| `disabled` | no | no | no |
| `operator` | yes | no | no |
| `extended` | yes | yes | no |
| `developer` | yes | no | yes |
| `full` | yes | yes | yes |

## CLI Shortcuts

The `iroha` CLI already wraps many of these endpoints:

```bash
iroha --config ./defaults/client.toml --output-format text ops sumeragi status
iroha --config ./defaults/client.toml --output-format text ops sumeragi phases
iroha --config ./defaults/client.toml ops sumeragi params
iroha --config ./defaults/client.toml ops sumeragi collectors
```

## Upstream References

- [README.md API and Observability](https://github.com/hyperledger-iroha/iroha/blob/main/README.md)
- [docs/source/telemetry.md](https://github.com/hyperledger-iroha/iroha/blob/main/docs/source/telemetry.md)
