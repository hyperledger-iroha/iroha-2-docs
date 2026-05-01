# SDK Tutorials

These pages summarize the current Iroha 3 client entry points shipped from the
main workspace. The SDK surface is evolving quickly, so this section focuses on
the canonical package names, installation paths, and minimal starting points
from the upstream repository.

## Recommended Order

1. [Install Iroha 3](/get-started/install-iroha-2.md)
2. [Launch Iroha 3](/get-started/launch-iroha-2.md)
3. Pick an SDK:
   - [Rust](/guide/tutorials/rust.md)
   - [Python](/guide/tutorials/python.md)
   - [JavaScript / TypeScript](/guide/tutorials/javascript.md)
   - [Android, Kotlin, and Java](/guide/tutorials/kotlin-java.md)
   - [Swift and iOS](/guide/tutorials/swift.md)
4. Review the [sample apps](/guide/tutorials/sample-apps.md) when you want a
   complete client application reference.
5. Use [Embed Kaigi](/guide/tutorials/kaigi.md) when you want to add
   wallet-backed audio/video meetings to your own app.
6. Use [Musubi packages](/guide/tutorials/musubi.md) when you need reusable
   Kotodama source libraries with pinned on-chain registry dependencies.

## Sample Apps

We maintain sample applications for JavaScript desktop, Android, and iOS client
flows. The JavaScript demo is the most complete external reference. Swift/iOS
examples exist in the upstream workspace under `examples/ios/`, but their
checked-in project manifests are currently out of sync with the package API and
dependency layout. The external mobile point demos are useful mostly for layout
and historical context.

- [Sample apps overview](/guide/tutorials/sample-apps.md)
- [Embed Kaigi in a JavaScript app](/guide/tutorials/kaigi.md)

## Source of Truth

All SDK pages here are derived from the current upstream workspace:

- `crates/iroha`
- `python/iroha_python`
- `javascript/iroha_js`
- `java/iroha_android`
- `IrohaSwift`
- `crates/musubi`

When in doubt, prefer the README and package metadata in those directories over
older Iroha 2-era examples.
