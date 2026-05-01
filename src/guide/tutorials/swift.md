# Swift and iOS

The Swift SDK shipped by the upstream workspace is the `IrohaSwift` Swift
package under `IrohaSwift/`. Its package manifest defines one library product,
`IrohaSwift`, and targets iOS 15+ and macOS 12+ with Swift tools 5.9.

The package depends on the native `NoritoBridge` binary target. Package
resolution validates `../dist/NoritoBridge.xcframework` before building, and
transaction or Connect crypto paths throw bridge-unavailable errors when the
native symbols are not loaded.

## Swift Package Manager

When developing against a checked-out workspace, point SwiftPM at the local
`IrohaSwift/` package directory. The package identity used by
`Package.swift` is `IrohaSwift`:

```swift
dependencies: [
    .package(name: "IrohaSwift", path: "/path/to/iroha/IrohaSwift")
],
targets: [
    .target(
        name: "YourApp",
        dependencies: [
            .product(name: "IrohaSwift", package: "IrohaSwift")
        ]
    )
]
```

Adjust the path for your app. Do not copy the current
`examples/ios/ConnectMinimalApp` path as-is; that manifest resolves
`../../IrohaSwift` to `examples/IrohaSwift`.

Before resolving the package, make sure the bridge exists at the workspace root:

```bash
cd /path/to/iroha
make bridge-xcframework
```

This produces `dist/NoritoBridge.xcframework`; `IrohaSwift/Package.swift`
references it as `../dist/NoritoBridge.xcframework`.

## CocoaPods

The codebase also contains `IrohaSwift/IrohaSwift.podspec`. It declares the
`IrohaSwift` pod, Swift 5.9, and iOS 15. The podspec pulls Swift sources from
the main repository; the native bridge still has to be present and linked for
transaction encoding, non-Ed25519 signing, and Connect crypto.

## Quickstart

```swift
import Foundation
import IrohaSwift

let torii = ToriiClient(baseURL: URL(string: "http://127.0.0.1:8080")!)
let sdk = IrohaSDK(toriiClient: torii)

let keypair = try Keypair.generate()
let accountId = try keypair.accountId()

if #available(iOS 15.0, macOS 12.0, *) {
    let balances = try await torii.getAssets(accountId: accountId)
    print("balances:", balances)
}
```

## Try Taira Read-Only

Start with a plain HTTP probe to confirm the device or simulator can reach the
public Taira endpoint:

```swift
import Foundation

if #available(iOS 15.0, macOS 12.0, *) {
    let url = URL(string: "https://taira.sora.org/status")!
    let (data, response) = try await URLSession.shared.data(from: url)

    if let http = response as? HTTPURLResponse {
        print("status:", http.statusCode)
    }
    print(String(decoding: data, as: UTF8.self))
}
```

Use the same `URLSession` check for
`https://taira.sora.org/v1/assets/definitions?limit=5` while you are building
UI and retry behavior. Switch to `IrohaSDK` submit helpers only after the
app loads signer material from secure storage and the account is funded on
Taira.

To build and submit a transaction, use the `IrohaSDK` helpers. These call the
native bridge-backed transaction encoder:

```swift
let transfer = TransferRequest(
    chainId: "00000000-0000-0000-0000-000000000000",
    authority: accountId,
    assetDefinitionId: "66owaQmAQMuHxPzxUN3bqZ6FJfDa",
    quantity: "1",
    destination: accountId,
    description: "demo"
)

if #available(iOS 15.0, macOS 12.0, *) {
    let status = try await sdk.submitAndWait(
        transfer: transfer,
        keypair: keypair
    )
    print(status.content.status.kind)
}
```

`TransferRequest`, `MintRequest`, `BurnRequest`, `ShieldRequest`, and
`UnshieldRequest` validate canonical account IDs and canonical unprefixed
Base58 asset-definition IDs before signing.

## Signing

`Keypair` is the Ed25519 convenience API. For other algorithms, construct an
`IrohaSDK` with `defaultSigningAlgorithm` and use `generateSigningKey()` or
`signingKey(fromSeed:)`:

```swift
let pqSdk = IrohaSDK(
    baseURL: torii.baseURL,
    defaultSigningAlgorithm: .mlDsa
)
let signingKey = try pqSdk.generateSigningKey()
```

The `SigningAlgorithm` enum currently includes Ed25519, secp256k1, BLS normal
and small variants, ML-DSA, GOST R 34.10-2012 parameter sets, and SM2. Native
bridge support is required outside the Ed25519 convenience path.

## Connect

The Connect client is implemented in Swift source, with crypto and frame codecs
backed by `NoritoBridge`:

```swift
let sessionID = Data(repeating: 0, count: 32) // replace with the session bytes
let sid = "<session-id-from-/v1/connect/session>"
let request = try ConnectClient.makeWebSocketRequest(
    baseURL: URL(string: "https://node.example")!,
    sid: sid,
    role: .app,
    token: "<token>"
)

let client = ConnectClient(request: request)
await client.start()

let session = ConnectSession(sessionID: sessionID, client: client)
let keyPair = try ConnectCrypto.generateKeyPair()
```

`ConnectSession` handles open and close controls, encrypted envelope reads,
direction keys, flow control, event streams, balance streams, and diagnostics
journals.

## Current Coverage

The Swift source currently includes:

- `ToriiClient` HTTP helpers for accounts, assets, aliases, explorer pages,
  RWA, contracts, multisig, governance, subscriptions, data availability,
  confidential assets, node/runtime status, health, metrics, and SSE streams
- `IrohaSDK` transaction builders and submit/poll helpers for transfer, mint,
  burn, shield, unshield, ZK transfer, ZK asset registration, metadata,
  identifier claims, multisig registration, and governance instructions
- pending transaction queue support through `PendingTransactionQueue` and
  `FilePendingTransactionQueue`
- account-address and I105 helpers through `AccountAddress` and `AccountId`
- Ed25519, secp256k1, ML-DSA, BLS, GOST, and SM2 signing surfaces, with native
  bridge support where required
- Connect WebSocket, frame, crypto, session, queue, replay, and diagnostics
  helpers
- Offline V2 note, receipt, QR stream, and transaction models
- SoraFS, data-availability, and proof-attachment helpers

## In-Tree Samples

The upstream workspace contains Swift/iOS example directories under
`examples/ios/`, but the project manifests are not a reliable source of current
setup instructions:

- `examples/ios/ConnectMinimalApp` is a SwiftPM executable harness, but its
  package manifest currently resolves `../../IrohaSwift` to
  `examples/IrohaSwift`, and its source references Connect helpers that are not
  present in `IrohaSwift/Sources`.
- `examples/ios/NoritoDemo` and `examples/ios/NoritoDemoXcode` contain SwiftUI
  code that imports `IrohaSwift` and conditionally uses `NoritoBridgeKit`, but
  their checked-in project manifests do not declare the `IrohaSwift` package
  dependency.

Use `IrohaSwift/Sources/IrohaSwift` and `IrohaSwift/Tests/IrohaSwiftTests` as
the current API references until those sample manifests are brought back in sync.

## Source References

- `IrohaSwift/Package.swift`
- `IrohaSwift/IrohaSwift.podspec`
- `IrohaSwift/Sources/IrohaSwift/ToriiClient.swift`
- `IrohaSwift/Sources/IrohaSwift/TxBuilder.swift`
- `IrohaSwift/Sources/IrohaSwift/TransactionEncoder.swift`
- `IrohaSwift/Sources/IrohaSwift/ConnectClient.swift`
- `IrohaSwift/Sources/IrohaSwift/ConnectSession.swift`
- `examples/ios/ConnectMinimalApp/Package.swift`
