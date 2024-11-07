# World

`World` is the global entity that contains other entities. The `World`
consists of:

- Iroha [configuration parameters](/guide/configure/client-configuration.md)
- the list of
  [trusted peers](/guide/configure/peer-configuration#trusted-peers)
- registered domains
- registered [triggers](/blockchain/triggers.md)
- registered
  [roles](/blockchain/permissions.md#permission-groups-roles)
- registered
  [permission token definitions](/blockchain/permissions.md#permission-tokens)
- permission tokens for all accounts
- [the chain of runtime validators](/blockchain/permissions.md#runtime-validators)

When domains, peers, or roles are registered or unregistered, the `World`
is the target of the (un)register
[instruction](/blockchain/instructions.md).

## World State View (WSV)

World State View is the in-memory representation of the current blockchain
state. This includes all currently loaded blocks, with all of their
contents, as well as peers elected for the current epoch.
