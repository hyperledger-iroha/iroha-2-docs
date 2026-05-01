# Musubi Kotodama Packages

Musubi is the package manager for Kotodama source packages. It gives
developers a Cargo-like workflow for sharing composable Kotodama functions
while keeping package identity tied to SORA and Iroha namespaces instead of
a global first-come name table.

Use Musubi when you need to:

- publish reusable Kotodama source libraries
- pin exact transitive source dependencies in `Musubi.lock`
- reconstruct dependency source from verified SoraFS archive commitments
- connect a package namespace to dapp contract aliases in the same
  namespace
- inspect, publish, yank, or alias packages through the on-chain registry

## Package Names

Canonical package ids use:

```text
namespace/package
```

Exact release references use:

```text
namespace/package@version
```

There is no leading `@` before a namespace. The `@` separator is reserved
for the version suffix.

The namespace segment matches the suffix used by Kotodama dapp contract
aliases:

| Package id                | Related contract alias shape |
| ------------------------- | ---------------------------- |
| `universal/math`          | `router::universal`          |
| `dex.universal/swap-core` | `router::dex.universal`      |

Namespaces have either `<dataspace>` or `<domain>.<dataspace>` form. When a
package has a dapp link, Musubi checks that every linked contract alias
uses the same namespace suffix as the package.

## Manifest

A package starts with `Musubi.toml`:

```toml
[package]
namespace = "dex.universal"
name = "swap-core"
version = "0.1.0"

[dependencies.math]
package = "std.universal/math"
version = "^1.0.0"

[exports]
functions = ["quote"]

[dapp]
namespace = "dex.universal"
contracts = ["router::dex.universal"]
```

Dependencies may use exact versions, caret requirements, tilde
requirements, wildcards such as `1.*`, or comparator lists such as
`>=1.0.0,<2.0.0`.

`Musubi.lock` records the selected transitive graph from the on-chain
registry. Each locked node stores its canonical package ref, selected
requirement, SoraFS manifest digest, source archive hash, byte count, file
count, exported functions, deterministic source archive plan, and
dependency aliases. Short aliases are resolved before they enter the
lockfile.

## Local Workflow

From the upstream Iroha workspace root, run Musubi through Cargo:

```bash
cargo run -p musubi -- init --namespace dex.universal --name swap-core --dapp
cargo run -p musubi -- add std.universal/math --version '^1.0.0' --alias math
cargo run -p musubi -- install --config client.toml
cargo run -p musubi -- build src/lib.ko --manifest-out target/lib.contract.json
cargo run -p musubi -- pack \
  --car-out source.car \
  --sorafs-manifest-out manifest.norito \
  --source-plan-out source-plan.norito
```

Use `install --offline` to write an unresolved lockfile for exact-version
dependencies without querying a node. Use `install --locked` in CI to
reject a stale lockfile.

`build` links cached dependency sources by rewriting calls such as
`math::add()` to deterministic internal Kotodama function names. It rejects
calls to functions that the dependency did not export. Musubi v1 libraries
are function-only: dependency sources that contain state declarations,
triggers, kotoba blocks, constants, or other non-function contract items
are rejected.

## Fetching Source Archives

Musubi can fetch missing dependency sources while resolving or later
through the cache subcommands:

```bash
cargo run -p musubi -- install --config client.toml --fetch \
  --provider-payload math.payload

cargo run -p musubi -- cache import math --source-root ../math
cargo run -p musubi -- cache fetch math --provider-payload math.payload
```

Live gateway fetches use one or more SoraFS gateway provider specs:

```bash
cargo run -p musubi -- install --config client.toml --fetch \
  --gateway-provider 'name=hot-a,provider-id=1111111111111111111111111111111111111111111111111111111111111111,base-url=https://gw.example,stream-token=BASE64,package=math'
```

Provider payload files and gateway providers are mutually exclusive for one
fetch operation. If more than one locked package is missing, scope every
gateway provider with `package=<dependency-alias>`,
`package=<namespace/package@version>`, `package=<namespace/package>`, or
`manifest=<64-hex SoraFS manifest digest>`.

Gateway `base-url` and `privacy-url` values must use `https://` by default.
Local test gateways can use `http://localhost`, `http://127.0.0.1`, or
`http://[::1]` only with `--gateway-allow-insecure-localhost`. Stream
tokens are runtime credentials and are not written into `Musubi.lock`.

## Publishing

`pack` computes the deterministic BLAKE3-256 source archive hash plus the
source byte and file counts. When `--car-out`, `--sorafs-manifest-out`, or
`--source-plan-out` is supplied, it also builds the deterministic SoraFS
CAR payload, SoraFS manifest, and Musubi source archive plan from the same
source file set.

Use a dry run before publishing:

```bash
cargo run -p musubi -- publish --config client.toml --dry-run
```

Without `--dry-run`, `publish` writes default artifacts under
`.musubi/dist/<namespace>/<name>/<version>/`, optionally uploads the
manifest and payload through Torii's SoraFS storage-pin endpoint with
`--upload`, registers the generated SoraFS pin, and submits
`PublishMusubiRelease` through the configured Iroha client.

Published releases must include:

- a non-empty canonical source archive
- a deterministic source archive plan
- at least one exported Kotodama function
- dependency records that do not select yanked releases
- a dapp link, when present, whose contract aliases match the package
  namespace

## Registry Queries and Lifecycle

Search and inspect the registry with:

```bash
cargo run -p musubi -- search swap --config client.toml
cargo run -p musubi -- versions dex.universal/swap-core --config client.toml
cargo run -p musubi -- alias resolve swap --config client.toml
```

Yanking hides a release from new resolution, but keeps existing lockfiles
reproducible:

```bash
cargo run -p musubi -- yank dex.universal/swap-core@0.1.0 \
  --reason "bad archive" \
  --config client.toml \
  --dry-run
```

Musubi avoids global name squatting by making `namespace/package` the
canonical package name. Publishing into a namespace must be authorized by
the same ownership or delegated permission model used for that Kotodama
dapp namespace. Curated global short aliases are separate from package
ownership: `SetMusubiShortAlias` requires the `CanSetMusubiShortAlias`
permission, and the target package must already have at least one active
release.

## Iroha Surfaces

Musubi uses first-class Iroha instructions and queries:

| Surface                      | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `PublishMusubiRelease`       | Publish an immutable package release.              |
| `YankMusubiRelease`          | Mark an existing release as yanked.                |
| `SetMusubiShortAlias`        | Bind a curated global short alias to a package id. |
| `AssertMusubiReleaseExists`  | Require a concrete package version to exist.       |
| `FindMusubiReleaseByRef`     | Fetch a release by exact package reference.        |
| `FindMusubiPackageVersions`  | List versions for a package id.                    |
| `FindMusubiPackageReleases`  | List release summaries for a package id.           |
| `SearchMusubiPackages`       | Search package summaries by namespace and text.    |
| `FindMusubiShortAliasByName` | Resolve a curated short alias.                     |

Torii exposes the Musubi HTTP route family under `/v1/musubi/*`.
Agent-facing MCP tools are exposed as `iroha.musubi.*` aliases. See
[Torii endpoints](/reference/torii-endpoints.md) and
[query reference](/reference/queries.md) for the broader API map.
