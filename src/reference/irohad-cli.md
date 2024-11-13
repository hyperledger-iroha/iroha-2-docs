# `irohad` CLI

TODO

## `--config`  {#arg-config}

- **Type:** File Path
- **Alias:** `-c`

Path to the [configuration](/reference/peer-config/index.md) file.

```shell
irohad --config path/to/iroha.toml
```

::: tip

Paths parameters in the config file are resolved relative to its own
location. See how
[paths resolution](/reference/peer-config/glossary#paths-resolution) works.

:::

## `--trace-config` {#arg-trace-config}

Enables trace logs of configuration reading and parsing.  Might be useful for configuration troubleshooting.

- **Type:** flag

```shell
irohad --trace-config
```

## `--terminal-colors` {#arg-terminal-colors}

- **Type:** Boolean, either `--terminal-colors=false` or
  `--terminal-colors=true`
- **Default:** Auto-detect
- **ENV:** `TERMINAL_COLORS`

Whether to enable ANSI-colored output or not.

By default, Iroha determines whether the terminal supports colored output
or not.

To explicitly disable colours:

```shell 
iroha --terminal-colors=false

# or via env

set TERMINAL_COLORS=false
iroha
```
