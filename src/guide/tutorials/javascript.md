# JavaScript and TypeScript

The current JavaScript SDK is published as `@iroha/iroha-js`. It is the
Node.js-first SDK for Torii, Norito builders, signing, pagination, Connect
previews, and offline-envelope workflows.

## Install

```bash
npm install @iroha/iroha-js
npm run build:native
```

The native build wraps `cargo build -p iroha_js_host` and records the
platform-specific checksum used at SDK startup. Run it after installing the
Rust toolchain from the upstream workspace. The package is ESM-only; from
CommonJS, use dynamic `import()`.

## Working from Source

When using the workspace checkout directly:

```bash
cd javascript/iroha_js
npm install
npm run build:native
npm run build:dist
```

Set `IROHA_JS_NATIVE_DIR` only for tests that need to point at an alternate
`native/` directory. Normal applications should use the packaged native build.

## Quickstart

```js
import { ToriiClient } from "@iroha/iroha-js/torii";
import { generateKeyPair } from "@iroha/iroha-js/crypto";

const torii = new ToriiClient("http://127.0.0.1:8080", {
  authToken: "dev-token",
});

const keys = generateKeyPair();
console.log(keys.publicKey);
```

Useful subpath imports:

```js
import { ToriiClient } from "@iroha/iroha-js/torii";
import { noritoEncodeInstruction } from "@iroha/iroha-js/norito";
import { generateKeyPair } from "@iroha/iroha-js/crypto";
import { buildOfflineEnvelope } from "@iroha/iroha-js/offline";
```

For browser-only Connect bootstrap, use `@iroha/iroha-js/connect-browser`
instead of importing the Node-first `ToriiClient` surface.

## Current Coverage

The SDK focuses on:

- Torii HTTP and WebSocket helpers
- Norito transaction and instruction builders
- Ed25519 signing and key generation
- pagination and retry helpers
- Connect browser bootstrap helpers
- offline envelope tooling

## Upstream References

- `javascript/iroha_js/README.md`
- `javascript/iroha_js/package.json`
