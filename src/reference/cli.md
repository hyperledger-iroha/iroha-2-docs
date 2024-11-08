# Command Line Interface (CLI)

TODO

## `--config` {#arg-config}

- **Type:** File Path
- **Required**
- **Alias:** `-c`

Path to the [configuration](/reference/config/) file.

```shell
iroha --config path/to/iroha.toml
```

::: tip

Paths parameters in the config file are resolved relative to its own
location. See how
[paths resolution](/reference/config/glossary#paths-resolution) works.

:::

## `--terminal-colors` {#arg-terminal-colors}

- **Type:** Boolean, either `--terminal-colors=false` or
  `--terminal-colors=true`
- **Default:** Auto-detect
- **ENV:** `TERMINAL_COLORS`

Whether to enable ANSI-colored output or not.

By default, Iroha determines whether the terminal supports colored output
or not.

To explicitly disable colors:

```shell 
iroha --terminal-colors=false

# or via env

set TERMINAL_COLORS=false
iroha
```

## `--submit-genesis`

**TO BE REMOVED**

- **Type:** Flag, either set or omitted

Whether the current peer should submit the genesis block or not.

Only one peer in the network should submit the genesis block.

This argument must be set alongside with
[`genesis.file`](/reference/config/params#param-genesis-file) and
[`genesis.public_key`](/reference/config/params#param-genesis-public-key)
configuration parameters. If not, Iroha will exit with an error.

In case when the network consists only of this one peer, i.e. the amount of
trusted peers in the configuration
([`sumeragi.trusted_peers`](/reference/config/params#param-sumeragi-trusted-peers))
is less than 2, this peer must submit the genesis, since there are no other
peers who can provide it. In this case, Iroha will exit with an error if
`--submit-genesis` is not set.

**Examples:**

```shell
# the peer that doesn't submit the genesis block
iroha

# the peer submits the genesis
iroha --submit-genesis
```
