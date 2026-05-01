# Torii Endpoints

Torii is the HTTP, SSE, and WebSocket gateway for current Iroha deployments.
In the Iroha 3 track it serves both ledger-facing APIs and a broad set of
operator endpoints.

The important protocol change from older docs is simple:

- the canonical binary format is **Norito**
- many endpoints also support JSON when you send `Accept: application/json`
- metrics are exposed in Prometheus format

For format details, content negotiation, layout flags, schema hashes, and
Norito RPC guidance, see the [Norito reference](/reference/norito.md).

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
Use the [Torii API console](/reference/torii-api-console.md) to load that live
document, test JSON routes, copy curl requests, and generate client code from
the current schema.

## Try Live Taira Routes

The public Taira testnet exposes the same Torii JSON surface that application
clients use for read-only exploration. These commands do not require keys:

```bash
TAIRA_ROOT=https://taira.sora.org

curl -fsS "$TAIRA_ROOT/status" \
  | jq '{blocks, txs_approved, txs_rejected, queue_size, peers}'

curl -fsS "$TAIRA_ROOT/openapi.json" \
  | jq -r '.paths | keys[]' \
  | grep '^/v1/' \
  | head -n 20

curl -fsS "$TAIRA_ROOT/v1/node/capabilities" \
  | jq '{abi_version, data_model_version, query: .query.aggregate.supported_resources}'
```

Try resource reads against the current world state:

```bash
curl -fsS "$TAIRA_ROOT/v1/domains?limit=5" \
  | jq -r '.items[].id'

curl -fsS "$TAIRA_ROOT/v1/assets/definitions?limit=5" \
  | jq -r '.items[] | [.id, .name, .total_quantity] | @tsv'
```

If a public testnet route returns `502`, times out, or reports a saturated
queue, treat it as an endpoint availability issue and retry later before
debugging your client code.

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
| `/v1/offline/*`, `/v1/repo/*`, `/v1/space-directory/*`, `/v1/ram-lfe/*` | Offline readiness, repository agreements, dataspace manifests, and [RAM-LFE helpers](/blockchain/ram-lfe.md#torii-routes) |
| `/v1/kaigi/*`, `/v1/webhooks/*`, `/v1/notify/*`, `/v1/telemetry/*` | Collaboration, webhook, push notification, and live telemetry integrations |

## ISO 20022 Bridge

Torii exposes the ISO 20022 bridge under `/v1/iso20022/*` when the app-facing
API and bridge runtime are enabled. The bridge is intentionally scoped: it is
not a general-purpose ISO 20022 clearing gateway, but a supported subset for
turning selected payment messages into signed Iroha transfers and for tracking
their ledger status.

### Torii Ingestion Endpoints

| ISO 20022 message | Endpoint | Purpose |
| --- | --- | --- |
| `pacs.008.001.08` (`pacs.008`) | `POST /v1/iso20022/pacs008` | Submit an FI-to-FI customer credit transfer and build the matching Iroha asset transfer |
| `pacs.009.001.10` (`pacs.009`) | `POST /v1/iso20022/pacs009` | Submit an FI-to-FI credit transfer used for PvP or securities-related cash funding |
| `pacs.002`-style status | `GET /v1/iso20022/status/{msg_id}` | Read the bridge state for a submitted message, including the derived `pacs002_code`, transaction hash, rejection detail, and resolved ledger context |

`pacs.008` submissions must provide the message ID, interbank settlement
amount, currency, settlement date, debtor and creditor IBANs, and debtor and
creditor BICs. When reference data is configured, the bridge also checks the
BIC, IBAN, and ISO 4217 currency crosswalks before the generated transaction
enters the pipeline.

`pacs.009` submissions must provide the business message ID, message definition
ID, creation time, interbank settlement amount, currency, settlement date,
instructing and instructed agent BICs, and debtor and creditor IBANs. If the
message includes `Purp`, the bridge currently accepts securities-purpose funding
only: `Purp=SECU`.

Both ingestion endpoints accept XML ISO envelopes or the flat field format used
by the bridge tests. Optional `SplmtryData` fields can pin the target Iroha
ledger, source and target account IDs or addresses, and asset definition ID.
The response is `202 Accepted` with `message_id`, `transaction_hash`, `status`,
`pacs002_code`, and the resolved ledger/account/asset context.

### Parser and Mapping Support

The IVM ISO helper also validates and materializes additional message families
used by bridge tests, settlement mapping, or downstream reconciliation. These
messages do not have standalone Torii ingestion endpoints unless listed above.

| Message family | Current support |
| --- | --- |
| `head.001` | Business application header validation for ISO envelopes, including `BizMsgIdr`, `MsgDefIdr`, creation time, and optional sender/receiver BIC fields |
| `pacs.002` | Payment status report parsing and status-code vocabulary used by `GET /v1/iso20022/status/{msg_id}` |
| `pacs.004` | Payment return parsing for return/unwind flows |
| `pacs.007`, `pacs.028`, `pacs.029` | Payment reversal, status request, and resolution/status scaffolding for investigation flows |
| `pain.001`, `pain.002` | Customer payment initiation and payment status report validation scaffolding |
| `camt.052`, `camt.053`, `camt.054`, `camt.056` | Account report, statement, notification, and cancellation-request validation scaffolding |
| `sese.023`, `sese.025` | Securities settlement instruction and confirmation mapping for DvP/PvP flows |
| `colr.007` | Collateral substitution confirmation mapping |

Settlement choreography may refer to related market messages such as
`sese.024`, `sese.030`, `sese.031`, `colr.010`, `colr.011`, `colr.012`, or
`camt.029`. Treat those as integration-level workflow references until a Torii
endpoint or IVM schema is added for the specific message.

## Kaigi Sessions

Kaigi provides paid, real-time audio/video rooms on SORA Nexus. Use it when
an application needs ledger-backed session creation, roster changes, relay
manifests, encrypted signaling, and usage metering instead of keeping all
conferencing state off-chain.

The ledger-facing lifecycle is:

- `CreateKaigi`: create a call under a domain and store its policy,
  schedule, metadata, and optional relay manifest.
- `JoinKaigi` and `LeaveKaigi`: update the call roster. In private mode,
  participants use commitments, nullifiers, and roster proofs instead of
  exposing participant account IDs directly.
- `RecordKaigiUsage`: append metered duration and gas totals.
- `EndKaigi`: close the session and record the final timestamp.

Torii exposes relay telemetry under `/v1/kaigi/relays`,
`/v1/kaigi/relays/{relay_id}`, `/v1/kaigi/relays/health`, and
`/v1/kaigi/relays/events` when the app API and telemetry features are enabled.
Session state is reflected through Kaigi domain events such as
`KaigiRosterSummary`, `KaigiRelayManifestUpdated`,
`KaigiRelayHealthUpdated`, and `KaigiUsageSummary`.

### CLI Smoke Test

Start with the `iroha kaigi` CLI when you want to verify that a Torii endpoint
accepts Kaigi transactions before connecting a UI. The quickstart command
creates a temporary room against the active Torii endpoint and prints a summary
with the call identifier, join command, and SoraNet spool hint:

```bash
iroha kaigi quickstart --auto-join-host --summary-out kaigi-summary.json
```

For scripted flows, manage the room lifecycle explicitly:

```bash
iroha kaigi create \
  --domain streaming \
  --call-name daily \
  --host <i105-account-id> \
  --privacy-mode transparent \
  --room-policy authenticated

iroha kaigi join --domain streaming --call-name daily --participant <i105-account-id>
iroha kaigi leave --domain streaming --call-name daily --participant <i105-account-id>

iroha kaigi record-usage \
  --domain streaming \
  --call-name daily \
  --duration-ms 120000 \
  --billed-gas 1500

iroha kaigi end --domain streaming --call-name daily
```

Use `--room-policy public` for rooms that relays may expose without viewer
tickets, or `--room-policy authenticated` when exits must require viewer
authentication. Use `--privacy-mode zk-roster-v1` only after the network has
the Kaigi roster and usage verifying keys configured; otherwise joins, leaves,
and private usage records fail during deterministic verification.

### Testing With the JavaScript Demo

Use the
[soramitsu/iroha-demo-javascript](https://github.com/soramitsu/iroha-demo-javascript)
desktop demo for an end-to-end wallet test. The demo is an Electron and Vue
application that talks directly to Torii through the local `@iroha/iroha-js`
binding and includes a `/kaigi` route for browser-native one-to-one media.

Use the demo with
[`@iroha/iroha-js`](https://github.com/hyperledger-iroha/iroha/tree/i23-features/javascript/iroha_js)
from the Iroha `i23-features` branch:

```bash
git clone https://github.com/soramitsu/iroha-demo-javascript.git
cd iroha-demo-javascript
npm install
npm run dev
```

Use Node.js 20 or newer and a Rust toolchain so the native `iroha_js_host`
module can build. If you rebuild or update the SDK manually, refresh the
native binding:

```bash
(cd node_modules/@iroha/iroha-js && npm run build:native)
```

For a controlled test, point the demo at a Kaigi-capable Torii endpoint:

1. Start an Iroha node with the SORA/Kaigi app-facing APIs enabled, or use a
   public endpoint that exposes the Kaigi surfaces you need.
2. Check basic reachability with `/health`, then check the live route surface
   with `/openapi` or `/openapi.json`. Some deployments also expose
   `/v1/health`, but `/health` is the portable liveness check.
3. For TAIRA, verify the relay telemetry routes before trying a live meeting:

   ```bash
   TAIRA=https://taira.sora.org
   curl -fsS "$TAIRA/health"
   curl -fsS "$TAIRA/v1/kaigi/relays"
   curl -fsS "$TAIRA/v1/kaigi/relays/health"
   ```

   These checks prove that Torii and Kaigi relay telemetry are reachable. They
   do not create a meeting; `CreateKaigi` and `JoinKaigi` still need funded
   wallets and signed transaction submission.
4. Open the demo, go to **Settings**, set the Torii URL, and let the app load
   the chain ID and network prefix from the endpoint.
5. Create or restore two local wallets in the demo. Use separate app windows,
   profiles, or machines so the host and guest have separate wallet state.

To test the Kaigi UI:

1. In the host window, open **Kaigi**, choose **Start meeting**, set a title,
   and choose **Private invite** or **Transparent invite**.
2. Select **Turn on camera and mic** so WebRTC has local media.
3. Select **Create meeting link**. A live wallet submits `CreateKaigi`; the
   app then shows an `iroha://kaigi/join?call=...&secret=...` invite and a
   `#/kaigi?...` fallback route.
4. Keep the host window open and share the invite with the guest.
5. In the guest window, open the invite or paste it in **Join meeting**, turn
   on local media, and select **Join meeting**. A live wallet fetches the
   encrypted host offer from Torii and submits `JoinKaigi` with encrypted
   answer metadata.
6. The host should auto-apply the first answer by streaming or polling Kaigi
   call signals. Both windows should show connected media and updated
   connection details.
7. End the session from the host, or use the CLI `iroha kaigi end` command for
   the same call ID.

Private Kaigi needs shielded XOR to pay the private entrypoint fee. If the
demo reports that private Kaigi needs shielded XOR, use the in-app
self-shield prompt and retry the create or join action. If proof generation,
private funding, or live signaling is unavailable, the demo can fall back to a
transparent/manual flow. In that case, open **Advanced signaling**, copy the
raw offer or answer packet, and paste it into the other window.

For automated checks in the demo repo, run:

```bash
npm test -- tests/kaigiView.spec.ts tests/preloadKaigiBridge.spec.ts
npm run e2e:ui
npm run verify
```

The focused Vitest suites cover Kaigi meeting-link creation, compact invite
loading, private create/join/end bridge calls, self-shield prompts, manual
fallbacks, and answer polling. The UI smoke test includes the `/kaigi` route
on desktop and mobile-sized viewports. Live media between two wallets still
needs a manual two-window test because browser camera/microphone permissions
and peer media streams are environment-specific.

For sample integration code, see
[Embed Kaigi in a JavaScript App](/guide/tutorials/kaigi.md).

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

When an endpoint accepts or returns typed Norito directly, use
`application/x-norito` as the content type or preferred `Accept` value. See
[Norito](/reference/norito.md#torii-and-norito-rpc) for the transport details.

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
iroha --config ./localnet/client.toml --output-format text ops sumeragi status
iroha --config ./localnet/client.toml --output-format text ops sumeragi phases
iroha --config ./localnet/client.toml ops sumeragi params
iroha --config ./localnet/client.toml ops sumeragi collectors
```

## Upstream References

- [README.md API and Observability](https://github.com/hyperledger-iroha/iroha/blob/i23-features/README.md)
- [docs/source/telemetry.md](https://github.com/hyperledger-iroha/iroha/blob/i23-features/docs/source/telemetry.md)
- [ISO 20022 bridge implementation](https://github.com/hyperledger-iroha/iroha/blob/i23-features/crates/iroha_torii/src/iso20022_bridge.rs)
- [Settlement ISO mapping](https://github.com/hyperledger-iroha/iroha/blob/i23-features/docs/portal/docs/finance/settlement-iso-mapping.md)
