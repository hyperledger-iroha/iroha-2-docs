# Sample Apps

These repositories show complete client applications built around Iroha. Use
them when you want to see SDK setup, account flows, signing, Torii calls, and UI
integration in a larger codebase than the minimal tutorials.

The sample apps are examples, not production wallet templates. Review their
dependency versions, network assumptions, and key-storage choices before
copying code into a real product.

## Available Apps

| App | Platform | What it demonstrates | Status |
| --- | --- | --- | --- |
| [Iroha Demo JavaScript](https://github.com/soramitsu/iroha-demo-javascript) | Desktop app with Electron, Vue 3, Pinia, and Vite | Direct Torii connectivity through `@iroha/iroha-js`, local transaction signing, wallet balances and history, send/receive QR flows, staking, governance, explorer, and live E2E checks | Most complete current sample |
| [Iroha Demo Android](https://github.com/soramitsu/iroha-demo-android) | Android point app | Native Android project structure for a point-transfer style mobile application | Older mobile demo; use the [Android, Kotlin, and Java SDK page](/guide/tutorials/kotlin-java.md) for current SDK setup |
| [Iroha Demo iOS](https://github.com/soramitsu/iroha-demo-ios) | iOS point app | Xcode/CocoaPods project structure for a point-transfer style mobile application | The repository README marks this demo as out of date with the latest Iroha |

## JavaScript Desktop Demo

Start with the JavaScript demo if you want a working reference for current
application flows. It is a desktop client that talks directly to Torii through
the in-repo JavaScript SDK, without a separate backend. The app includes:

- first-run account setup and key import or generation
- endpoint settings for SORA Nexus networks
- locally signed transfers submitted to Torii
- wallet balances, transaction history, and explorer views
- QR-based receive and send flows
- staking and governance screens
- live Electron E2E checks against configured Torii endpoints

The JavaScript demo requires Node.js 20+ and a Rust toolchain for the native
`iroha_js_host` module. Its README contains the current install, build, test,
and live E2E commands.

## Mobile Point Demos

The Android and iOS repositories are useful as historical examples of the
original point-app concept and mobile project layout. Treat them as reference
material for UI and project organization, then use the current SDK pages for
new application setup:

- [Android, Kotlin, and Java](/guide/tutorials/kotlin-java.md)
- [Swift and iOS](/guide/tutorials/swift.md)

For new mobile work, confirm the SDK version, Torii endpoint shape, account
format, and transaction format against the current upstream workspace before
porting code from either mobile demo.
