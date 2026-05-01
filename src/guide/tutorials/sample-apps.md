# Sample Apps

These repositories show complete client applications built around Iroha.
Use them when you want to see SDK setup, account flows, signing, Torii
calls, and UI integration in a larger codebase than the minimal tutorials.

The sample apps are examples, not production wallet templates. Review their
dependency versions, network assumptions, and key-storage choices before
copying code into a real product.

## Available Apps

| App                                                                                                                             | Platform                                          | What it demonstrates                                                                                                                                                                   | Status                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Iroha Demo JavaScript](https://github.com/soramitsu/iroha-demo-javascript)                                                     | Desktop app with Electron, Vue 3, Pinia, and Vite | Direct Torii connectivity through `@iroha/iroha-js`, local transaction signing, wallet balances and history, send/receive QR flows, staking, governance, explorer, and live E2E checks | Most complete current sample                                                                                                                                                    |
| [Iroha Demo Android](https://github.com/soramitsu/iroha-demo-android)                                                           | Android point app                                 | Native Android project structure for a point-transfer style mobile application                                                                                                         | Older mobile demo; use the [Android, Kotlin, and Java SDK page](/guide/tutorials/kotlin-java.md) for current SDK setup                                                          |
| [`examples/ios/ConnectMinimalApp`](https://github.com/hyperledger-iroha/iroha/tree/i23-features/examples/ios/ConnectMinimalApp) | SwiftPM executable                                | `NoritoNativeBridge` availability check, `ConnectSession` event stream intent, and diagnostics export intent                                                                           | Iroha repository harness, but currently out of sync: the package path resolves to `examples/IrohaSwift`, and source references Connect helpers absent from `IrohaSwift/Sources` |
| [`examples/ios/NoritoDemo`](https://github.com/hyperledger-iroha/iroha/tree/i23-features/examples/ios/NoritoDemo)               | SwiftUI iOS template                              | XcodeGen template with conditional `NoritoBridge` linkage and Iroha Connect UI code                                                                                                    | Iroha repository template, but the project manifest does not declare the `IrohaSwift` package dependency imported by the sources                                                |
| [`examples/ios/NoritoDemoXcode`](https://github.com/hyperledger-iroha/iroha/tree/i23-features/examples/ios/NoritoDemoXcode)     | SwiftUI Xcode project                             | Generated Xcode project with Swift sources importing `IrohaSwift` and conditionally using `NoritoBridgeKit`                                                                            | Iroha repository demo, but the checked-in Xcode project does not declare the `IrohaSwift` package dependency imported by the sources                                            |
| [Iroha Demo iOS](https://github.com/soramitsu/iroha-demo-ios)                                                                   | iOS point app                                     | Xcode/CocoaPods project structure for a point-transfer style mobile application                                                                                                        | Historical external demo; use the in-tree Swift examples and [Swift and iOS SDK page](/guide/tutorials/swift.md) for current setup                                              |

## JavaScript Desktop Demo

Start with the JavaScript demo if you want a working reference for current
application flows. It is a desktop client that talks directly to Torii
through the in-repo JavaScript SDK, without a separate backend. The app
includes:

- first-run account setup and key import or generation
- endpoint settings for SORA Nexus networks
- locally signed transfers submitted to Torii
- wallet balances, transaction history, and explorer views
- QR-based receive and send flows
- staking and governance screens
- live Electron E2E checks against configured Torii endpoints

The JavaScript demo requires Node.js 20+ and a Rust toolchain for the
native `iroha_js_host` module. Its README contains the current install,
build, test, and live E2E commands.

## Mobile Samples

The external Android and iOS point-app repositories are historical examples
of the original point-app concept and mobile project layout. Swift/iOS
sample code also exists in the
[Iroha repository's `examples/ios/` directory](https://github.com/hyperledger-iroha/iroha/tree/i23-features/examples/ios),
but its checked-in project manifests are currently out of sync with the
package API and dependency layout. The current Android SDK lives under
`java/iroha_android/`.

Use the SDK pages for new application setup:

- [Android, Kotlin, and Java](/guide/tutorials/kotlin-java.md)
- [Swift and iOS](/guide/tutorials/swift.md)

For new mobile work, confirm the SDK version, Torii endpoint shape, account
format, and transaction format against the current
[Iroha `i23-features` branch](https://github.com/hyperledger-iroha/iroha/tree/i23-features)
before porting code from either external mobile demo.
