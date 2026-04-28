# Troubleshooting Integration Issues

This section offers troubleshooting tips for issues with Iroha 2 and Iroha 3
integration. If the issue you are experiencing is not described here,
contact us via [Telegram](https://t.me/hyperledgeriroha).

## Client cannot connect

Check that the client config points to the peer's Torii address:

```toml
torii_url = "http://127.0.0.1:8080/"
```

For CLI checks, pass the same file explicitly:

```bash
cargo run --bin iroha -- --config ./localnet/client.toml ledger domain list all
```

If the peer runs in Docker or Kubernetes, use the host or service address that
is reachable from the client process. `127.0.0.1` inside a container is not
the host machine.

## Transactions are rejected

Most transaction failures are caused by identity or authorization mismatch:

- the account public key in the client config does not match the private key
  used for signing
- the account is not registered in genesis or by a prior transaction
- the account lacks the permission token or role required by the runtime
  validator
- object IDs use old Iroha 2-era forms instead of current canonical forms
  such as `domain.dataspace`

Use `--output-format text` while debugging CLI commands so errors are easier
to read:

```bash
cargo run --bin iroha -- --config ./localnet/client.toml --output-format text ledger transaction ping --msg "hello"
```

## Queries return empty results

Empty query results do not always mean the query failed. Check:

- the transaction that should create the object was committed
- the queried domain, asset definition, or account ID is canonical
- pagination or filters are not excluding the expected row
- the client is connected to the intended network, not another localnet

For domain checks, start with the broadest query:

```bash
cargo run --bin iroha -- --config ./localnet/client.toml ledger domain list all
```

## Event or block streams stop early

Block and event stream examples rely on Torii streaming endpoints. Verify the
peer is still running, then test with a timeout:

```bash
cargo run --bin iroha -- --config ./localnet/client.toml ledger blocks 1 --timeout 30s
cargo run --bin iroha -- --config ./localnet/client.toml ledger events block
```

For HTTP integrations, compare your endpoint paths with the current
[Torii endpoint reference](/reference/torii-endpoints.md).
