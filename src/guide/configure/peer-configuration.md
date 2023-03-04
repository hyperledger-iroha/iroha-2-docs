# Peer Configuration

The peer configuration file (`configs/peer/config.json`) determines how
your blockchain operates.

Here's an example of how peer configuration file looks like:

::: details Peer configuration example

<<< @/snippets/peer-config.json

:::

Some of the configuration options are required, while others are used for
fine-tuning. When you create a new peer, you are required to provide the
following:

- [Public and private keys for the peer](#iroha-keys) (`PUBLIC_KEY` and
  `PRIVATE_KEY`)
- [Iroha public addresses](#iroha-public-addresses) (`P2P_ADDR`, `API_URL`,
  `TELEMETRY_URL`)
- [Trusted peers](#trusted-peers) (`TRUSTED_PEERS`)
- [Public and private keys for the genesis account](#genesis)
  (`ACCOUNT_PUBLIC_KEY` and `ACCOUNT_PRIVATE_KEY`)

For the full list of configuration options, refer to
[Iroha Configuration Reference](https://github.com/hyperledger/iroha/blob/iroha2-dev/docs/source/references/config.md).

::: info

Configuration options have different underlying types and default values,
which are denoted in code as types wrapped in a single `Option<..>` or in a
double `Option<Option<..>>`. Refer to
[configuration types](./configuration-types.md) for details.

:::

## Generation

You can use `kagami` to generate the default peer configuration:

```bash
$ kagami config peer > peer-config.json
```

## Public and private keys

When you are configuring a new peer, you have to provide its public and
private keys: `PUBLIC_KEY` and `PRIVATE_KEY` configuration options. Refer
to [public key cryptography](keys.md) to learn the details.

## Trusted Peers

Iroha is a blockchain ledger. In order for it to work optimally and be
Byzantine-fault tolerant with the maximum number of faults allowed, it
needs to be started with a set number of peers: `4`, `7`, `10`, ... `3f+1`,
where `f` is the allowed number of faults.

So usually, when you want to start an Iroha deployment, you should already
know a number of peers that you can trust and join their blockchain. The
way it works in the examples is that you just specify in four `config.json`
files four peers with their public keys and API addresses.

Since Iroha has no automatic peer discovery, the only other way to make
peers known to each other is to use the `iroha_client_cli` to
[register new peers](peer-management.md#registering-peers)). This is not
too difficult with the provided client libraries. With Python's
[Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/), the
curated list of peers can be updated, registered, and un-registered on its
own.

The list of trusted peers is a part of `SUMERAGI` configuration. Here's an
example of `SUMERAGI_TRUSTED_PEERS` environment variable to configure
trusted peers:

```
'[{"address":"iroha0:1337", "public_key": "ed01201c61faf8fe94e253b93114240394f79a607b7fa55f9e5a41ebec74b88055768b"}, {"address":"iroha1:1338", "public_key": "ed0120cc25624d62896d3a0bfd8940f928dc2abf27cc57cefeb442aa96d9081aae58a1"}, {"address": "iroha2:1339", "public_key": "ed0120faca9e8aa83225cb4d16d67f27dd4f93fc30ffa11adc1f5c88fd5495ecc91020"}, {"address": "iroha3:1340", "public_key": "ed01208e351a70b6a603ed285d666b8d689b680865913ba03ce29fb7d13a166c4e7f1f"}]'
```

## Iroha Public Addresses

`TORII` is the module in charge of handling incoming and outgoing
connections.

Here we only cover the required configurations: `API_URL`, `P2P_ADDR`, and
`TELEMETRY_URL`. Check
[`TORII` configuration reference](https://github.com/hyperledger/iroha/blob/iroha2-dev/docs/source/references/config.md#torii)
for all available options.

### `API_URL`

The `API_URL` is the location to which the client(s) make their requests.
You can also use it to change some peer-specific configuration options.

Most of the time, the only reason to change the `API_URL` is to change the
port, in case `8080` is either closed, or if you want to randomise ports to
avoid certain kinds of attacks.

### `P2P_ADDR`

The `P2P_ADDR` is the internal address used for communication between
peers. This address should be included in the `TRUSTED_PEERS` section of
the configuration file.

### `TELEMETRY_URL`

The `TELEMETRY_URL` is used to specify the prometheus endpoint address.
It's set by adding `"TELEMETRY_URL": "127.0.0.1:8180"` to the `TORII`
section of the configuration file.

It's not meant to be human-readable. However, a `GET` request to the
`127.0.0.1:8180/status` will give you a JSON-encoded representation of the
top-level metrics, while a `GET` request to `127.0.0.1:8180/metrics` will
give you a (somewhat verbose) list of all available metrics gathered in
Iroha. You might want to change this if you're having trouble gathering
metrics using `prometheus`.

::: info

Learn how to [monitor Iroha performance](/guide/advanced/metrics.md) using
prometheus.

:::

## Genesis

When you configure a peer, you have to provide private and public keys for
the genesis account.

You can do this via the configuration file (`ACCOUNT_PUBLIC_KEY`,
`ACCOUNT_PRIVATE_KEY`) or environment variables
(`IROHA_GENESIS_ACCOUNT_PUBLIC_KEY`, `IROHA_GENESIS_ACCOUNT_PRIVATE_KEY`).

Read more about [genesis blocks](./genesis.md) and
[public key cryptography](./keys.md).

Aside from the public and private keys for the genesis account, which are
required configuration options, you can also fine-tune other genesis block
configurations, such as:

- `WAIT_FOR_PEERS_RETRY_COUNT_LIMIT`: the number of attempts to connect to
  peers before genesis block is submitted
- `WAIT_FOR_PEERS_RETRY_PERIOD_MS`: how long to wait before retrying a
  connection to peers
- `GENESIS_SUBMISSION_DELAY_MS`: the delay before the genesis block
  submission after the minimum number of peers were discovered.

You can find more details in
[`GENESIS` Iroha Configuration Reference](https://github.com/hyperledger/iroha/blob/iroha2-dev/docs/source/references/config.md#genesis).

## Logger

Let's cover the most useful `LOGGER` configurations, `MAX_LOG_LEVEL` and
`LOG_FILE_PATH`.

### `MAX_LOG_LEVEL`

The `MAX_LOG_LEVEL` is used to determine which messages are logged.

With `"MAX_LOG_LEVEL": "WARN"` you won't get any messages unless they are
either a warning or an error. Beside `WARN`, other available options are:

- `TRACE` (log every time you enter a function)
- `DEBUG` (use when you know something went wrong)
- `INFO` (the default)
- `WARN` (log everything that could be an error)
- `ERROR` (to silence any logging except for error messages)

### `LOG_FILE_PATH`

Another useful option is `"LOG_FILE_PATH": bunyan.json`. It creates (if it
didn't already exist) a file called `bunyan.json` that contains the message
log in a structured format.

This is extremely useful for two reasons. Firstly, you can use the `bunyan`
log viewer to filter information more precisely than Iroha would allow you
to do. Do you only want messages from a specific module or package? You can
do that with `bunyan`. Secondly, while copying logs is not too big of a
problem if your instance is just a small setup, for bigger setups the log
will be larger. Having it saved to a file makes much more sense in that
case.

::: info

You can also set `LOG_FILE_PATH` to `/dev/stdout` if you want to use
bunyan's logging facilities directly without saving the output.

:::

## Kura

_Kura_ is the persistent storage engine of Iroha (Japanese for
_warehouse_). The `BLOCK_STORE_PATH` specifies where the blocks are stored.
You can change it to a custom location if for some reason the default
location (`./storage`) is not available or desirable.

For more details, check
[`KURA` configuration reference](https://github.com/hyperledger/iroha/blob/iroha2-dev/docs/source/references/config.md#kura).
