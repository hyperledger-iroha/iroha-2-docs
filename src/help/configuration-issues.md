# Troubleshooting Configuration Issues

This section offers troubleshooting tips for issues with Iroha 2
configuration. Make sure you
[checked the keys](./overview.md#check-the-keys) first, as it is the most
common source of issues in Iroha.

If the issue you are experiencing is not described here, contact us via
[Telegram](https://t.me/hyperledgeriroha).

## Outdated genesis on a Docker-compose setup

When you are using the Docker-compose version of Iroha, you might encounter
the issue of one of the peer containers failing with the
`Failed to deserialize raw genesis block` error. This happens if there is a
mismatch between Iroha versions, meaning an Iroha peer cannot be
initialized with the given genesis file.

If one of the peers is failing and it's been a while since you pulled the
Iroha code for the first time, it's safe to assume the outdated genesis
file is the cause. Here is how you can make sure Iroha is working
incorrectly for exactly this reason:

1. Use `docker ps` to check the current containers. Depending on the
   version, you will see either `hyperledger/iroha2:dev` or
   `hyperledger/iroha2:lts` containers. Check the number of Iroha peer
   containers in the `docker ps` output. By default, there are 4 peers
   configured in `docker-compose.yml` for Iroha, although you may have
   changed that value. You will see that the first container that should
   have been running Iroha just exited with an error, while three other
   containers remain active.

2. Check the logs and look for the
   `Failed to deserialize raw genesis block` error. If you started your
   Iroha in daemon mode with `docker compose up -d`, use
   `docker compose logs` command.

The way to troubleshoot such an issue depends on the use of Iroha.

If this is a basic demo and you don't need the peer data to be restored,
you can simply reset the genesis file to its latest state. To do this, use
the `git checkout configs/peer/genesis.json` command.

If you need to restore the Iroha instance data, do the following:

1. Connect the second Iroha peer that will copy the data from the first
   (failed) peer.
2. Wait for the new peer to synchronize the data with the first peer.
3. Leave the new peer active.
4. Update the genesis file of the first peer.

::: info

The features needed to monitor the copying progress between peers and a
migration tool to update the genesis file are to be implemented in future
releases.

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
