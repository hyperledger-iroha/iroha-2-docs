# Client Configuration

Let's look at the client configuration options.

::: details Client configuration template

<<< @/snippets/client-cli-config-template.toml

:::

## Generation

You can use `kagami` to generate the default client configuration:

```bash
$ kagami config client > client-config.json
```

## Public and Private Keys

The `defaults/client.toml` client configuration file should contain the user's `domain` and a pair of their cryptographic keys: `public_key` and `private_key`.

For details on cryptographic keys, see [Public Key Cryptography](../security/public-key-cryptography.md).

## User account

The `ACCOUNT_ID` should be self-explanatory. The only thing you need to worry about is that the account must already
exist in the blockchain. In other words, the account you provide here should already be
[registered](/blockchain/instructions.md#un-register).

::: info Note

Iroha is **case-sensitive**, meaning that _Alice_@wonderland is different from _alice_@wonderland. It should go without
saying that _alice@wonderland_ is not the same as _alice@looking_glass_ either, since these accounts belong to different
domains, `wonderland` and `looking_glass`.

:::

## Basic Authentication Credentials

The idea of basic authentication credentials is to provide the access control using a web server with a reverse proxy
like [Nginx](https://www.nginx.com/) while these credentials are ignored by the Iroha peers.

The login and password will be filled by the client and used for the
[`Authorization`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) HTTP
[header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers).

Use this style of configuration to provide the basic authentication credentials (login and password):

```json
  "BASIC_AUTH": {
    "web_login": "mad_hatter",
    "password": "ilovetea"
  },
```

## Iroha Public Addresses

`TORII` is the module in charge of handling incoming and outgoing connections. For client configuration, you can set up
two addresses: `TORII_API_URL` and `TORII_TELEMETRY_URL`.

### `TORII_API_URL`

First, the `TORII_API_URL` is the same as
[`torii.address` in the peer configuration](/reference/config/params#param-torii-address). This is the module
responsible for handling incoming and outgoing connections. You should also add the prefix `http://` or (_preferably_)
`https://` to the address. For example:

```json
{
  "TORII_API_URL": "http://127.0.0.1:8080"
}
```

## Transaction Limits

You can specify the transaction limits that each transaction must adhere to: the maximum number of instructions and the
maximum size of a WASM blob (in bytes). For example:

```json
{
  "max_instruction_number": 4096,
  "max_wasm_size_bytes": 4194304
}
```

## Transaction TTL and Timeout

Configure the time-to-live (TTL) for transactions and the timeout to wait for the status. Both values have to be
provided in milliseconds. For example:

```json
"TRANSACTION_TIME_TO_LIVE_MS": 100000,
"TRANSACTION_STATUS_TIMEOUT_MS": 15000,
```

## Transaction Nonce

If you set `ADD_TRANSACTION_NONCE` to `true`, Iroha will create different hashes for transactions that occur repeatedly
and simultaneously.
