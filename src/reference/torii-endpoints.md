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
| `GET /status` | JSON | High-level status summary for operators |
| `GET /metrics` | Prometheus | Prometheus scrape endpoint |
| `GET /v1/events/sse` | SSE | Event stream for long-lived clients |
| `GET /v1/sumeragi/status` | Norito or JSON | Detailed consensus status snapshot |
| `GET /v1/sumeragi/phases` | JSON | Latest per-phase latency sample |
| `GET /v1/sumeragi/rbc` | JSON | RBC session and throughput metrics |
| `GET /v1/sumeragi/rbc/sessions` | JSON | Active RBC session snapshot |
| `GET /v1/sumeragi/params` | JSON | Current on-chain Sumeragi parameters |
| `GET /v1/sumeragi/collectors` | JSON | Deterministic collector plan snapshot |
| `GET /v1/sumeragi/commit_qc/{hash}` | Norito or JSON | Commit QC record for a block hash |

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
