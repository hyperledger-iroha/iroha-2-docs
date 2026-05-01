# Troubleshooting Configuration Issues

This section offers troubleshooting tips for issues with Iroha 2 and Iroha 3
configuration. Make sure you
[checked the keys](./overview.md#check-the-keys) first, as it is the most
common source of issues in Iroha.

If the issue you are experiencing is not described here, contact us via
[Telegram](https://t.me/hyperledgeriroha).

## Outdated genesis on a Docker Compose setup

When you are using the Docker Compose version of Iroha, you might encounter
the issue of one of the peer containers failing with the
`Failed to deserialize raw genesis block` error. This usually means the peer,
signed genesis transaction, and generated configuration were produced by
different Iroha revisions or profiles.

Check the failure with these steps:

1. Use `docker ps` to check the current containers. Depending on the
   generated profile, you will usually see `hyperledger/iroha:dev`
   containers. The default Docker Compose profile contains four peer
   containers, although your generated `docker-compose.yml` may differ.

2. Check the logs and look for the
   `Failed to deserialize raw genesis block` error. If you started your
   Iroha in daemon mode with `docker compose up -d`, use
   `docker compose logs` command.

The way to troubleshoot such an issue depends on the use of Iroha. If this is a
basic demo and you do not need to preserve peer data, regenerate a matching
localnet or Docker Compose bundle with Kagami:

```bash
cargo run --bin kagami -- localnet --build-line iroha3 --peers 4 --out-dir ./localnet
cargo run --bin kagami -- docker --peers 4 --config-dir ./localnet --image hyperledger/iroha:dev --out-file ./docker-compose.yml
```

Then remove the old container state and restart from the regenerated
`genesis.signed.nrt`, peer `config.toml` files, and `client.toml`.

If you need to restore the Iroha instance data, do the following:

1. Connect the second Iroha peer that will copy the data from the first
   (failed) peer.
2. Wait for the new peer to synchronize the data with the first peer.
3. Leave the new peer active.
4. Update the genesis and configuration files of the first peer only as part of
   a coordinated migration.

::: info

There is no general automatic rewrite path for replacing genesis on a live
network. Treat this as a coordinated migration: preserve the old state, bring
up compatible peers, and only move validators to the new configuration after
the operators agree on the migration plan.

:::

## Multihash Format of Private and Public Keys

If you look at the
[client configuration](/guide/configure/client-configuration.md), you will
notice that the keys there are given in
[multi-hash format](https://github.com/multiformats/multihash).

If you've never worked with multi-hash before, it is natural to assume that
the right-hand-side is not a hexadecimal representation of the key bytes
(two symbols per byte), but rather the bytes encoded as ASCII (or UTF-8),
and call `from_hex` on the string literal in both the `public_key` and
`private_key` instantiation.

It is also natural to assume that calling `PrivateKey::try_from_str` on the
string literal would yield only the correct key. So if you get the number
of bits in the key wrong, e.g. 32 bytes vs 64, that it would raise an error
message.

**Both of these assumptions are wrong.** Unfortunately, the error messages
don't help in de-bugging this particular kind of failure.

**How to fix**: use `hex_literal`. This will also turn an ugly string of
characters into a nice small table of obviously hexadecimal numbers.

::: warning

Even the `try_from_str` implementation cannot verify if a given string is a
valid `PrivateKey` and warn you if it isn't.

It will catch some obvious errors, e.g. if the string contains an invalid
symbol. However, since we aim to support many key formats, it can't do much
else. It cannot tell if the key is the _correct_ private key _for the given
account_ either, unless you submit an instruction.

:::

These sorts of subtle mistakes can be avoided, for example, by
deserialising directly from string literals, or by generating a fresh
key-pair in places where it makes sense.
