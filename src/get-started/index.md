# Iroha 3

Iroha 3 is the Nexus-oriented deployment track shipped from the main
Hyperledger Iroha workspace. It keeps the same core building blocks as
Iroha 2 while adding the Nexus model for data spaces, multi-lane execution,
and SORA-specific deployment profiles.

At a high level, Iroha 3 combines:

- deterministic execution and storage
- the Iroha Virtual Machine (IVM) for portable smart contracts
- Norito as the canonical wire format
- Torii for client, operator, and app-facing APIs
- Sumeragi consensus with operator telemetry and status endpoints

## Quickstart

If you are starting from scratch, follow these pages in order:

1. [Install Iroha 3](/get-started/install-iroha-2.md)
2. [Launch Iroha 3](/get-started/launch-iroha-2.md)
3. [Operate Iroha 3 via CLI](/get-started/operate-iroha-2-via-cli.md)
4. [Connect to SORA Nexus dataspaces](/get-started/sora-nexus-dataspaces.md)
5. [Sponsor private dataspace fees](/get-started/private-dataspace-fee-sponsor.md)

If you are migrating an existing deployment or mental model, read
[Iroha 3 vs. Iroha 2](/get-started/iroha-2.md) first.

## SDKs

The current SDK entry points documented in this site are:

- [Rust](/guide/tutorials/rust.md)
- [Python](/guide/tutorials/python.md)
- [JavaScript / TypeScript](/guide/tutorials/javascript.md)
- [Android, Kotlin, and Java](/guide/tutorials/kotlin-java.md)
- [Swift and iOS](/guide/tutorials/swift.md)

## Operator References

The pages you will use most often while running a network are:

- [Working with Iroha binaries](/reference/binaries.md)
- [Genesis reference](/reference/genesis.md)
- [Torii endpoints](/reference/torii-endpoints.md)
- [Connect to SORA Nexus dataspaces](/get-started/sora-nexus-dataspaces.md)
- [Sponsor private dataspace fees](/get-started/private-dataspace-fee-sponsor.md)
- [Compatibility matrix](/reference/compatibility-matrix.md)

## Learn More

- [Iroha `i23-features` branch](https://github.com/hyperledger-iroha/iroha/tree/i23-features)
- [Workspace docs index](https://github.com/hyperledger-iroha/iroha/blob/i23-features/docs/README.md)
- [Iroha 3 whitepaper](https://github.com/hyperledger-iroha/iroha/blob/i23-features/docs/source/iroha_3_whitepaper.md)
- [Iroha 2 whitepaper](https://github.com/hyperledger-iroha/iroha/blob/i23-features/docs/source/iroha_2_whitepaper.md)
