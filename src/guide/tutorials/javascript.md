# JavaScript and TypeScript

The current JavaScript SDK is published as `@iroha/iroha-js`. It is an
experimental Node.js-first SDK for Torii, Norito, signing, and offline
envelope workflows.

## Install

```bash
npm install @iroha/iroha-js
```

The package is ESM-only. From CommonJS, use dynamic `import()`.

## Working from Source

When using the workspace checkout directly:

```bash
cd javascript/iroha_js
npm install
npm run build:native
npm run build:dist
```

The native module is optional. If it is unavailable, the SDK falls back to the
pure JavaScript path.

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

## Current Coverage

The preview SDK focuses on:

- Torii HTTP helpers
- Norito encode and decode helpers
- Ed25519 signing and key generation
- offline envelope tooling

## Upstream References

- `javascript/iroha_js/README.md`
- `javascript/iroha_js/package.json`
