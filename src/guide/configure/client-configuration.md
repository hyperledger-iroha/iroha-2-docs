# Client Configuration

Iroha CLI and SDK clients use TOML configuration. The repository ships the
current default at `defaults/client.toml`; generated local networks also write a
matching `client.toml` into their output directory.

::: details Client configuration template

<<< @/snippets/client.template.toml

:::

## Core Fields

At minimum, a client configuration identifies the chain, Torii endpoint, and
signing account:

```toml
chain = "00000000-0000-0000-0000-000000000000"
torii_url = "http://127.0.0.1:8080"

[account]
domain = "wonderland.universal"
public_key = "ed0120..."
private_key = "802620..."
```

- `chain` selects the chain to which submitted transactions belong.
- `torii_url` points at the peer Torii HTTP API.
- `[account].domain` is used by CLI shortcuts and address-selector encoding;
  the canonical `AccountId` itself is domainless.
- `[account].public_key` and `[account].private_key` sign transactions.

The account must already exist on-chain. For the default local network this is
handled by the bundled genesis manifest.

::: info Case sensitivity

Iroha names are case-sensitive after canonical parsing. For example,
`wonderland.universal`, `Wonderland.universal`, and
`looking_glass.universal` are distinct domain literals.

:::

## Basic Authentication

The optional `[basic_auth]` section adds an HTTP `Authorization` header to
client requests. Iroha peers do not interpret these credentials directly; use
them when Torii is behind a reverse proxy such as Nginx.

```toml
[basic_auth]
web_login = "mad_hatter"
password = "ilovetea"
```

## Transaction Settings

Transaction behavior is configured with the `[transaction]` section:

```toml
[transaction]
time_to_live_ms = 100000
status_timeout_ms = 15000
nonce = false
```

- `time_to_live_ms` is the transaction lifetime in milliseconds.
- `status_timeout_ms` controls how long the client waits for transaction
  status.
- `nonce = true` asks the client to include a nonce so repeated transactions
  produce different hashes.

## Connect Queue Settings

Current Iroha clients can also use the optional `[connect]` section for local
queue state:

```toml
[connect]
queue_root = "./queue"
```

Use this when a workflow needs durable client-side queue storage.

## Generating Configurations

For disposable local networks, prefer Kagami because it writes configs, genesis,
scripts, and a README that match the selected Iroha 2 or Iroha 3 profile:

```bash
cargo run --bin kagami -- localnet --build-line iroha3 --peers 4 --out-dir ./localnet
```

Use the generated `./localnet/client.toml` with the CLI:

```bash
cargo run --bin iroha -- --config ./localnet/client.toml ledger domain list all
```
