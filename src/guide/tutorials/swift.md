# Swift and iOS

The Apple-platform SDK in the upstream workspace is `IrohaSwift`. It targets
Iroha 2-era flows and the current Iroha 3 / Sora Nexus Torii surfaces.

## Swift Package Manager

Add the package in Xcode or in `Package.swift`:

```swift
dependencies: [
    .package(
        url: "https://github.com/hyperledger/iroha-swift",
        branch: "main"
    )
],
targets: [
    .target(
        name: "YourApp",
        dependencies: [
            .product(name: "IrohaSwift", package: "iroha-swift")
        ]
    )
]
```

When working inside the monorepo, use the local path dependency instead.

`IrohaSwift` requires the native `dist/NoritoBridge.xcframework`. SwiftPM and
the CocoaPods lint flow fail fast when that bridge is missing.

## Quickstart

```swift
import IrohaSwift

let torii = ToriiClient(baseURL: URL(string: "http://127.0.0.1:8080")!)
let sdk = IrohaSDK(baseURL: torii.baseURL)
let keypair = try Keypair.generate()

print(keypair.publicKey)
```

## Current Coverage

The Swift SDK already includes:

- Torii HTTP helpers
- Norito envelope encoding
- Ed25519 and ML-DSA signing helpers
- offline allowance helpers
- runtime capability and event helpers
- subscription and explorer helpers
- Connect, pending-transaction, and Norito RPC helpers

## Upstream References

- `IrohaSwift/README.md`
- `IrohaSwift/Package.swift`
- `docs/connect_swift_ios.md`
