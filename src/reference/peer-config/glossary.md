# Glossary

This page contains the definitions and brief explanations of data types and topics shared across
multiple configuration parameters.

## Numeric Types

TODO Explain the limitations of different numeric types, like `u8` and `u64`.

## Type: Duration

Duration is specified as a human-readable string:

```toml
value1 = "1sec"
value2 = "1hour 12min 5s"
value3 = "2years 2min 12us"
value4 = "550ms"
```

The duration string is a concatenation of time spans. Each time span is an
integer number and a suffix. Supported suffixes:

- `nsec`, `ns` &mdash; nanoseconds
- `usec`, `us` &mdash; microseconds
- `msec`, `ms` &mdash; milliseconds
- `seconds`, `second`, `sec`, `s`
- `minutes`, `minute`, `min`, `m`
- `hours`, `hour`, `hr`, `h`
- `days`, `day`, `d`
- `weeks`, `week`, `w`
- `months`, `month`, `M` &mdash; defined as $30.44$ days
- `years`, `year`, `y` &mdash; defined as $365.25$ days

TODO: put link to
[`humantime` crate](https://docs.rs/humantime/latest/humantime/fn.parse_duration.html)?
It is an implementation detail.

## Type: Multi-hash


To configure Multihash types in Iroha 2, you specify the cryptographic hash function used for digital signatures or data integrity verification. Iroha 2 supports a limited set of hash functions, identified by unique byte codes as defined in the [official multicodec table](https://github.com/multiformats/multicodec/blob/master/table.csv).

Supported Digest Functions:

- `Ed25519Pub` (code: `0xed`) - Ed25519 public key
- `Secp256k1Pub` (code: `0xe7`) - Secp256k1 public key
- `Bls12381G1Pub` (code: `0xea`) - BLS12-381 G1 public key
- `Bls12381G2Pub` (code: `0xeb`) - BLS12-381 G2 public key

Below is an example of how to specify these multihashes in your TOML configuration:

```toml
# Ed25519 public key hash
ed25519_pub = "0xed...<hash value>"

# Secp256k1 public key hash
secp256k1_pub = "0xe7...<hash value>"

# BLS12-381 G1 public key hash
bls12381_g1_pub = "0xea...<hash value>"

# BLS12-381 G2 public key hash
bls12381_g2_pub = "0xeb...<hash value>"
```

In these examples, replace `<hash value>` with the actual hash output encoded in hexadecimal. The code before the hash value corresponds to the hash function used, as per the Iroha 2 supported options.

For further details on Multihash and its implementation, please refer to the [Multihash specification](https://multiformats.io/multihash/) and the [Multicodec Table](https://github.com/multiformats/multicodec/blob/master/table.csv) for a comprehensive list of hash function codes.


## Type: Bytes Amount

Bytes amount is specified as a human-readable string:

```toml
# 42 bytes
value1 = "42B"

# 1 kilobyte = 1000 bytes
value2 = "1KB"

# 1 kilobyte (binary format) = 1024 bytes
value3 = "1KiB"

# Sum of multiple
value4 = "1GB 5MB"
```

Iroha can parse sizes in bytes, kilobytes (`K`), megabytes (`M`), gigabytes (`G`), terabytes (`T`),
and petabytes (`P`).

The format of suffixes:

- **`{size}iB`:** Binary size
- **`{size}B`:** Decimal size

TODO: haven't found a rust lib for that. There is a Python one
([`humanfriendly`](https://humanfriendly.readthedocs.io/en/latest/api.html?highlight=parse_size#humanfriendly.parse_size))
I used for reference.

TODO: [article explains kb, kB, KiB difference](https://web.archive.org/web/20150324153922/https://pacoup.com/2009/05/26/kb-kb-kib-whats-up-with-that/).
Consider it for the format.

## Type: Private Key

TODO explain private key

```toml
private_key = { algorithm = "ed25519", payload = "" }
```

## Type: Socket Address

To specify a socket address in the configuration, use the format `host:port`, where `host` is either a hostname or an IP address, and `port` is the numeric port number the application should connect to or listen on.

- **Hostname example**: `localhost:8080`
- **IP address example**: `192.168.1.100:8080`

**Hostname**: Can be a local hostname (`localhost` for the local machine) or a remote server's domain name (e.g., `example.com`).

**IP address**: Use IPv4 (e.g., `192.168.1.100`) or IPv6 (enclosed in square brackets, e.g., `[2001:db8::1]`) formats.

**Port**: A numeric value typically ranging from `1` to `65535`, where ports below `1024` are reserved for well-known services and require root privileges on Unix-like systems.

**Example in TOML:**

```toml
address = "localhost:8080"
```

For more information on socket addresses and networking, refer to the [IANA Service Name and Transport Protocol Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml) or the [RFC 3986](https://tools.ietf.org/html/rfc3986) specification.

## Paths Resolution

There are numerous parameters in the configuration that specify file paths. These paths might be relative. If they are specified in the config file, they are resolved relative to the config file location. If a path is specified via a Environment Variable, it is resolved relative to the <abbr title="Current Working Directory">CWD</abbr>.

For example, we run Iroha from `/home/alice` directory, using a config file at `/home/alice/projects/iroha.toml`:

```shell
iroha --config ./projects/iroha.toml
```

In `iroha.toml`, we specify [`kura.store_dir`](params#param-kura-store-dir):

```toml
[kura]
store_dir = "./storage"
```

This path will be resolved as `/home/alice/projects/storage`.

On the other hand, if we pass it via env:

```shell
KURA_STORE_DIR=./env-storage iroha --config ./projects/iroha.toml
```

Then it will be set to `/home/alice/env-storage`.
