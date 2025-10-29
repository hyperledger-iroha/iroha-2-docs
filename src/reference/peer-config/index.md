# Configuring Iroha

Local peer configuration is set via Environment and/or TOML files. Note that this is different from On-Chain
Configuration set via `SetParameter` instruction (TODO refer to ISI reference).

Use [`--config`](../irohad-cli#arg-config) CLI argument to specify the path to the configuration file.

## Template

For a detailed description of each parameter, please refer to the [Parameters](./params.md) reference.

::: details `peer.template.toml`

<<< @/snippets/peer.template.toml

:::

## Composing configuration files

TOML configuration files has an additional `extends` field, pointing to other TOML file(s). It could be a single path or
multiple paths:Example format:

::: code-group

```toml [Single]
extends = "single-path.toml"
```

```toml [Multiple]
extends = ["file1.toml", "file2.toml"]
```

:::

Iroha will recursively read all files specified in `extends` and compose them into layers, where latter ones overwrite
previous ones on a parameter level. For example, if reading `config.toml`:

::: code-group

```toml [config.toml]
extends = ["a.toml", "b.toml"]

[torii]
address = "0.0.0.0:8080"
```

```toml [a.toml]
chain_id = "whatever"
```

```toml [b.toml]
[torii]
address = "localhost:4000"
max_content_len = 2048
```

:::

The resulting configuration will be `chain_id` from `a.toml`, `max_content_len` from `b.toml`, and `torii.address` from
`config.toml` (overwrites `b.toml`).

## Troubleshooting

Pass [`--trace-config`](../irohad-cli#arg-trace-config) CLI flag to see a trace of how configuration is read and parsed.
