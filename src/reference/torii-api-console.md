---
aside: false
pageClass: torii-api-console-page
---

# Torii API Console

Use the live OpenAPI document from a running Torii endpoint to inspect routes,
send test requests, copy curl commands, and generate client code.

<ToriiApiConsole />

## Requirements

- The Torii endpoint must expose `/openapi.json`.
- Browser testing requires CORS to allow this docs origin.
- The browser must be able to reach the endpoint directly.
- Code generation requires Node.js, pnpm, and a Java runtime for OpenAPI
  Generator.

The console defaults to `https://taira.sora.org`. Local development usually
works with `http://127.0.0.1:8080` when you run Torii on your machine.

## Try Taira First

Before generating a client, check that the public OpenAPI document is reachable
from your machine:

```bash
curl -fsS https://taira.sora.org/openapi.json -o /tmp/taira-openapi.json
jq '{title: .info.title, version: .info.version, paths: (.paths | length)}' \
  /tmp/taira-openapi.json
```

Then paste `https://taira.sora.org/openapi.json` into the console and try a
read-only route such as `GET /status`, `GET /v1/domains`, or
`GET /v1/assets/definitions`. Save signed transaction and private-key flows for
an SDK or CLI client that loads secrets from your runtime environment.

## Generated Clients

The generator command uses the same live OpenAPI document that the console
loads. This is useful for JSON operator, explorer, app, and telemetry routes.

For signed ledger transactions, signed queries, and Norito-native payloads,
prefer the official Iroha SDKs. OpenAPI clients do not assemble signatures,
manage account keys, or encode Norito transaction bodies for you.

To inspect every generator supported by OpenAPI Generator, run:

```bash
pnpm dlx @openapitools/openapi-generator-cli list
```
