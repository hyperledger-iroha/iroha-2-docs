# Configuration Types

Configuration options have different underlying types and default values,
which are denoted in code as types wrapped in a single `Option<..>` or in a
double `Option<Option<..>>`.

In this section we explain the difference between `Option<..>` and
`Option<Option<..>>` used for configuration types. You can find more about
available configuration options in the [Peer Configuration](peer-configuration.md) topic.

<!-- TODO: Add the new configuration reference, once its ready. Issue: https://github.com/hyperledger-iroha/iroha-2-docs/issues/392
The full list of available options is in the [Iroha Configuration Reference](https://github.com/hyperledger-iroha/iroha/blob/iroha2-dev/docs/source/references/config.md). -->

## `Option<..>`

A type wrapped in a single `Option<..>` signifies that in the corresponding
`json` block there is a fallback value for this type, and that it only
serves as a reference.

::: warning If a default for such a type has a `null` value, it means that
there is no meaningful fallback available for this particular value. It
doesn't mean that you can omit the value. Quite the opposite, it **must**
be set manually, either in the configuration file, or via the environment
variables.

:::

All the default values can be freely obtained from a provided
[sample configuration file](./sample-configuration),
but it is only a starting point. \*\*If left unchanged, the sample
configuration file will not work. All `null` values in place of public and
private keys as well as
[endpoint URLs](./peer-configuration.md#iroha-public-addresses) should be
provided either by modifying the sample config file or as environment
variables. No other overloading of configuration values happens besides
reading them from a file and capturing the environment variables, and
environment variables take precedence.

For both types of configuration options wrapped in a single `Option<..>`
(i.e. both those that have meaningful defaults and those that have `null`),
failure to provide them in any of the above two ways results in an error.

## `Option<Option<..>>`

`Option<Option<..>>` types should be distinguished from types wrapped in a
single `Option<..>`. Only the double option ones are allowed to stay
`null`, meaning that **not** providing them in an environment variable or a
file will **not** cause an error.

Thus, only these types are truly optional in the common sense of the word.
An example of this distinction is genesis
[public and private keys](./peer-configuration.md#genesis). While the first
one is a single `Option<..>` wrapped type, the latter is wrapped in
`Option<Option<..>>`. This means that the genesis _public_ key should
always be provided by the user, be it via a file config or an environment
variable, whereas the _private_ key is only needed for the peer that
submits the genesis block, and can be omitted for all others. The same
logic goes for other double option fields such as logger file path.

## Sumeragi: default `null` values

A special note about Sumeragi fields with `null` as default: only the
[`trusted_peers`](./peer-configuration.md#trusted-peers) field out of the
three can be initialized via a provided file or an environment variable.

The other two fields, namely `key_pair` and `peer_id`, go through a process
of finalization where their values are derived from the corresponding ones
in the uppermost Iroha config (using its `public_key` and `private_key`
fields) or the Torii config (via its `p2p_addr`). This ensures that these
linked fields stay in sync, and prevents the programmer error when
different values are provided to these field pairs. Providing either
`sumeragi.key_pair` or `sumeragi.peer_id` by hand will result in an error,
as it should never be done directly. In later versions these configuration
options shall be hidden completely.
