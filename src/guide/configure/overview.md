# Configuration and Management

Iroha configuration has two layers:

- **local peer and client configuration**, stored in TOML files or environment
  variables and read at process startup
- **on-chain configuration**, changed by transactions through
  [`SetParameter`](/blockchain/instructions.md#setparameter)

Use local configuration for node identity, addresses, logging, storage, and
client signing keys. Use on-chain configuration for values that must be agreed
by the network and replayed deterministically.

The main configuration entry points are:

- [Genesis](/guide/configure/genesis.md)
- [Client configuration](/guide/configure/client-configuration.md)
- [Keys for network deployment](/guide/configure/keys-for-network-deployment.md)
- [Running on bare metal](/guide/advanced/running-iroha-on-bare-metal.md)
- [Peer configuration reference](/reference/peer-config/index.md)
