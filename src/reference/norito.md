# Norito

Norito is Iroha's canonical serialization layer. It is the byte format used
when peers, SDKs, CLI tools, Torii, Kura, and generated artifacts need to agree
on exactly the same payload.

Use Norito when the data is part of consensus, signing, hashing, persistence,
or cross-SDK interoperability. Use JSON when an endpoint explicitly offers a
human-readable projection for operators, dashboards, or quick debugging.

## Where Norito Appears

| Surface | How Norito is used |
| --- | --- |
| Transactions and queries | Signed transaction and query payloads submitted through Torii are encoded as Norito. |
| Genesis | `kagami genesis sign` produces a signed `.nrt` block that peers load at startup. |
| Torii typed responses | Endpoints that support typed binary responses use `Accept: application/x-norito`. |
| SDKs | Rust, Python, JavaScript, Kotlin/Java, Swift, and Android clients use Norito builders or bindings instead of hand-assembled bytes. |
| Kura storage | Block payloads, recovery sidecars, rosters, and commit markers are stored as Norito-framed data. |
| Manifests | Nexus, data availability, SoraFS, streaming, and app-facing manifests use Norito when the manifest must be signed or hashed. |
| Streaming | Norito Streaming uses Norito manifests, segment headers, control frames, and conformance fixtures. |

Norito is not a smart-contract language. It is the deterministic envelope and
codec that carries transactions, contract calls, manifests, and typed API
payloads.

## Payload Model

Every on-wire or on-disk Norito payload is framed by a header followed by the
encoded payload bytes. Headerless, or bare, payloads are reserved for internal
hashing, benchmarks, and helper APIs that immediately wrap the result in a
header before transport.

| Header field | Size | Purpose |
| --- | ---: | --- |
| Magic | 4 bytes | ASCII `NRT0`, used to reject non-Norito data early. |
| Major | 1 byte | Format major version. Current payloads use `0`. |
| Minor | 1 byte | Fixed v1 decode hint. Current payloads use `0x00`; layout choices live in flags. |
| Schema hash | 16 bytes | Type identity used by typed decoders to reject unexpected payloads. |
| Compression | 1 byte | `0 = None`, `1 = Zstd`. Unknown values are rejected. |
| Payload length | 8 bytes | Uncompressed payload length as little-endian `u64`. |
| CRC64 | 8 bytes | CRC64-XZ checksum of the uncompressed payload. |
| Flags | 1 byte | Layout flags for compact lengths, packed sequences, and packed structs. |

The header is 40 bytes. Decoders validate the magic, version, supported flag
mask, payload length, checksum, and schema hash before reconstructing the
typed value.

## Layout Flags

Norito stores layout choices in the final header byte. The default v1 helpers
emit `COMPACT_LEN` (`0x02`) for compact per-value length prefixes. Legacy
fixed-width length prefixes remain readable when callers explicitly encode
with `flags = 0x00`.

| Flag | Hex | Status | Effect |
| --- | ---: | --- | --- |
| `PACKED_SEQ` | `0x01` | Supported | Encodes variable-sized collections with an offset table plus a contiguous data block. |
| `COMPACT_LEN` | `0x02` | Default | Uses canonical unsigned varints for per-value length prefixes. |
| `PACKED_STRUCT` | `0x04` | Supported | Encodes derive-generated structs as packed field payloads. |
| `VARINT_OFFSETS` | `0x08` | Reserved | Rejected in v1; packed-sequence offsets are fixed-width `u64`. |
| `COMPACT_SEQ_LEN` | `0x10` | Reserved | Rejected in v1; top-level sequence length headers are fixed-width `u64`. |
| `FIELD_BITSET` | `0x20` | Supported with requirements | Adds a bitset for packed structs so only fields that need explicit sizes carry size prefixes. Requires `PACKED_STRUCT` and `COMPACT_LEN`. |

The flags are explicit. Decoders do not infer layout from payload shape,
version minor, or heuristics. Unknown or invalid combinations are rejected so
that all peers interpret a payload the same way.

## Encoding Rules

Norito uses deterministic layouts for the common data shapes that appear in
the Iroha data model:

- Strings are `[len][utf8-bytes]`; `len` follows `COMPACT_LEN` when enabled.
- Per-value lengths use compact varints when `COMPACT_LEN` is set, otherwise
  fixed 8-byte little-endian `u64`.
- Sequence length headers are fixed 8-byte little-endian `u64` in v1.
- `Vec<u8>` is encoded as `[len_u64][raw-bytes]` instead of one length per byte.
- Packed sequences use `(len + 1)` monotonic `u64` offsets followed by the
  concatenated element payloads.
- Maps encode entry counts with fixed `u64` and use deterministic key order.
  `HashMap` entries are sorted by key before encoding; `BTreeMap` uses its
  natural order.
- `BigInt` uses little-endian two's-complement bytes with a `u32` byte length
  and a 512-bit cap.
- `Numeric` is encoded as `(mantissa, scale)`, where the mantissa stores the
  integer value and scale stores the number of fractional digits.

These rules matter for signatures and hashes. Two SDKs that build the same
logical transaction must produce the same canonical bytes.

## Schema Hashes

Typed Norito payloads carry a 16-byte schema hash in the header. The default
hash is derived from the fully qualified type name. Builds that enable
structural schema hashing derive the hash from the canonical schema instead.

Typed decoders reject schema mismatches. This protects clients from accidentally
decoding a valid Norito frame as the wrong type and is the usual failure mode
when an SDK fixture bundle drifts from the node data model.

## Compression and Acceleration

Norito supports explicit and adaptive compression without changing the logical
payload:

| Feature | Purpose |
| --- | --- |
| `to_bytes` | Encode an uncompressed header-framed payload. |
| `to_compressed_bytes` | Encode with Zstd and record the compression tag in the header. |
| `to_bytes_auto` | Apply deterministic heuristics to decide whether compression is worthwhile. |
| CRC64 acceleration | Uses portable CRC64-XZ everywhere, with CLMUL on x86_64 or PMULL on aarch64 when available. |
| GPU CRC64 and compression | Optional Metal or CUDA helpers may accelerate large payloads, then fall back to CPU paths. |

Hardware acceleration never changes the decoded content. CRC and JSON
accelerators must match portable output bit-for-bit. Zstd frame bytes may
differ between CPU and GPU encoders, but the decoded payload and Norito header
metadata remain deterministic for validation.

## JSON Support

Norito includes a native JSON stack for endpoints and tooling that need JSON
without leaving the Norito type system.

| JSON feature | Use case |
| --- | --- |
| `norito::json::{to_json, from_json}` | Deterministic typed JSON encode/decode. |
| Pretty and writer helpers | CLI output, fixtures, and streaming `std::io` integration. |
| DOM values | Programmatic manipulation through Norito's JSON value model. |
| Fast typed JSON | Structural-tape based decode/encode for hot DTO paths. |
| Zero-copy reader | Token scanning that borrows strings from the input where possible. |
| Stage-1 accelerators | Optional AVX2, NEON, Metal, or CUDA structural indexing with scalar fallback. |

Iroha code should prefer `norito::json` helpers for typed API payloads. Adding
plain `serde_json` to production paths risks diverging from the schema and
field-handling behavior expected by SDKs and Torii extractors.

## Derive Support

Rust data types generally use derive macros rather than manual codec code.
The derive layer can generate Norito binary codecs, schemas, and JSON helpers.

Common field attributes are:

| Attribute | Effect |
| --- | --- |
| `#[norito(rename = "other")]` | Uses a stable serialized name for schema and JSON compatibility. |
| `#[norito(skip)]` | Omits the field and fills it from `Default` while decoding. |
| `#[norito(default)]` | Uses `Default` when a decoded payload does not carry the field. |
| `#[norito(skip_serializing_if = "...")]` | Omits fields from JSON when the predicate matches, while preserving deterministic decoding defaults. |

Derives also expose encoded-length hints and exact-length calculations where
possible. Encoders use those hints to reserve buffers and avoid extra copies.

## Crate Feature Families

When building Iroha or SDK bindings from source, Norito features select which
helpers and accelerators are available:

| Feature family | What it enables |
| --- | --- |
| `derive` | Re-exported procedural macros for binary, schema, and JSON derives. |
| `compression` | Zstd support for header-framed payloads. |
| `packed-seq` | Packed collection layouts using offset tables. |
| `packed-struct` | Packed derive-generated struct layouts. |
| `compact-len` | Varint per-value length prefixes. |
| `columnar` | Experimental Norito Column Blocks for scan-heavy paths. |
| `strict-safe` | Converts decode panics in fallible paths into structured errors. |
| `simd-accel` | CPU acceleration where available, with deterministic fallback. |
| `json` | Native JSON parser, writer, DOM, typed derives, and fast paths. |
| `json-std-io` | Reader and writer helpers layered on the JSON stack. |
| `metal-stage1`, `cuda-stage1` | Optional GPU JSON structural-index backends. |
| `metal-stage2` | Optional Metal metadata classification for the JSON structural tape. |
| `metal-crc64`, `cuda-crc64` | Optional GPU CRC64 helpers for large payloads. |
| `gpu-compression` | Optional Metal or CUDA Zstd acceleration for large payloads. |
| `stage1-validate` | Debug validation that compares accelerated JSON structural indexes against scalar output. |

Feature availability can differ between SDKs and release profiles. The wire
format remains governed by the header and schema, not by local build flags.

## Torii and Norito RPC

Torii exposes JSON for many operator routes, but typed binary routes use
Norito. The media type for current typed Norito HTTP bodies is
`application/x-norito`.

Use these headers when an endpoint accepts or returns typed Norito:

```http
Content-Type: application/x-norito
Accept: application/x-norito
```

For clients that can fall back to JSON during rollout, prefer an explicit
Accept list:

```http
Accept: application/x-norito, application/json
```

Decode failures are surfaced as typed Torii errors and counted by telemetry.
Common reasons include invalid magic, unsupported version, unsupported feature
flag, checksum mismatch, malformed UTF-8, invalid enum tag, and schema mismatch.

Norito RPC rollout is usually staged behind transport configuration. Operator
dashboards should track request latency, failures, active connections,
response bytes, and `torii_norito_decode_failures_total` separately from JSON
traffic.

## Norito Streaming

Norito Streaming extends the same deterministic approach to media and realtime
transport surfaces. Its key pieces are:

| Streaming feature | Purpose |
| --- | --- |
| Manifests | Declare segment commitments, privacy routes, capabilities, codec profile, encryption suite, and content key metadata. |
| Segment headers | Bind segment number, duration, chunk count, timing, entropy mode, audio summary, and Merkle roots. |
| Chunk commitments | Let viewers and relays verify payload chunks against the manifest before serving or decoding. |
| Control frames | Carry manifest announcements, feedback, key updates, and capability negotiation. |
| HPKE key updates | Rotate transport secrets using the negotiated suite and monotonically increasing counters. |
| Capability negotiation | Intersects supported feature bits, datagram limits, feedback cadence, and privacy requirements. |
| FEC and feedback | Uses deterministic receiver reports and parity decisions for lossy realtime paths. |
| Conformance vectors | Cross-language fixtures prove SDKs decode the same manifests, segments, and entropy streams. |

Streaming-specific codecs and entropy profiles are separate from the core
Norito transaction/query format, but their manifests and control data still use
Norito so routing, billing, replay, and audit evidence stay reproducible.

## Operational Guidance

- Prefer SDK builders and generated bindings over hand-crafted Norito bytes.
- Treat schema mismatch as a version or fixture problem, not as a transient
  network failure.
- Keep `.nrt`, `.norito`, and manifest artifacts with the release or incident
  bundle that produced them.
- Use JSON projections for dashboards and manual inspection, but keep Norito as
  the source of truth for signed, hashed, or persisted data.
- When adding a new typed Torii endpoint, document whether it accepts JSON,
  Norito, or both, and expose the supported content types in `/openapi`.
- When enabling accelerators, run parity tests against scalar output before
  rollout. Accelerator failures should fall back cleanly rather than changing
  payload semantics.

## Related Pages

- [Torii endpoints](/reference/torii-endpoints.md)
- [Genesis reference](/reference/genesis.md)
- [Data model schema](/reference/data-model-schema.md)
- [JavaScript / TypeScript SDK](/guide/tutorials/javascript.md)
- [Python SDK](/guide/tutorials/python.md)
- [Swift and iOS SDK](/guide/tutorials/swift.md)

## Upstream References

- [Norito format specification](https://github.com/hyperledger-iroha/iroha/blob/main/norito.md)
- [Norito crate README](https://github.com/hyperledger-iroha/iroha/blob/main/crates/norito/README.md)
- [Norito streaming design notes](https://github.com/hyperledger-iroha/iroha/blob/main/docs/source/norito_streaming.md)
