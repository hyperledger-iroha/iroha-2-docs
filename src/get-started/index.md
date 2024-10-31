# Iroha 2

Iroha 2 is a fully-featured [blockchain ledger](/reference/glossary.md#blockchain-ledgers). With Iroha 2 you can:
- Create and manage custom [fungible assets](/reference/glossary.md#fungible-assets), such as currencies, gold, etc.
- Create and manage [non-fungible](/reference/glossary.md#non-fungible-assets) assets, such as digital art, intellectual property, etc.
- Manage user accounts with a domain hierarchy and multi-signature transactions.
- Use efficient portable smart contracts implemented with [WebAssembly](/blockchain/wasm.md) and [Iroha Special Instructions](/blockchain/instructions.md).
- Use both permissioned and permissionless blockchain deployments.

## Get Started

If you are just starting with Iroha 2, begin with the following step-by-step tutorials:
1. [Install Iroha 2](/get-started/install-iroha-2.md): install prerequisites and clone the GitHub repository.
2. [Launch Iroha 2](/get-started/launch-iroha-2.md): install prerequisites and establish an instance of Iroha network.
3. [Operate Iroha 2 via CLI](/get-started/operate-iroha-2-via-cli.md): learn how to [setup](operate-iroha-2-via-cli.md#_1-set-up-iroha-client-cli) and [configure](operate-iroha-2-via-cli.md#_2-configure-iroha-client-cli) Iroha Client, and perform necessary basic operations on the network (e.g., [registering domains](operate-iroha-2-via-cli.md#_3-register-a-domain) and [accounts](operate-iroha-2-via-cli.md#_4-register-an-account), [registering and minting assets](operate-iroha-2-via-cli.md#_6-register-and-mint-assets), etc.).

If you would like to operate Iroha 2 using a different programming language, Iroha provides SDKs and language-specific tutorials for the following languages:
- [Python](/guide/tutorials/python.md)
- [Rust](/guide/tutorials/rust.md)
- [Kotlin/Java](/guide/tutorials/kotlin-java.md)
- [JavaScript (TypeScript)](/guide/tutorials/javascript.md)

::: tip

The current version of Iroha covered in this documentation is Iroha 2. If you have previously worked with Iroha 1, you may want to start with the [Iroha 2 vs. Iroha 1](/get-started/iroha-2.md) comparison that will help you understand the improvements and new features of Iroha 2.

:::

## Explore In-Depth

Once you have learned the basics, we suggest exploring the following sections:
- [Security](/guide/security/index.md): find out about [core security principles](/guide/security/security-principles.md) and [operational security measures](/guide/security/operational-security.md) that are necessary to ensure the safety and validity of data and assets. This section also covers [cryptographic keys](/guide/security/public-key-cryptography.md), [how to generate them](/guide/security/generating-cryptographic-keys.md), and [how to store them securely](/guide/security/storing-cryptographic-keys.md).
- Iroha Explained: learn [how Iroha works](../blockchain/iroha-explained.md) and find information on key Iroha concepts, including entities, operations, and features, such as [Iroha Special Instructions](/blockchain/instructions.md), [triggers](/blockchain/triggers.md), [queries](/blockchain/queries.md).
- Configuration and Management: discover ways to configure the Iroha network , including [genesis blocks and accounts](/guide/configure/genesis.md), [client configuration](/guide/configure/client-configuration.md), and [public and private modes](/guide/configure/modes.md).

<!-- TODO: add head topics for all sections, then add the links here; review the order (?) -->

## Learn More

For more information on Iroha, see the following:
- [Iroha 2 Whitepaper](https://github.com/hyperledger-iroha/iroha/tree/main/docs/source/iroha_2_whitepaper.md)
- [Hyperledger Foundation Wiki: Hyperledger Iroha > Iroha 2](https://wiki.hyperledger.org/display/iroha/Iroha+2)

For more information on Iroha 1, see the official [Hyperledger Iroha documentation](https://iroha.readthedocs.io/en/develop/index.html).

::: tip

If you want to contribute to Hyperledger Iroha, see the [Contributing Guide](https://github.com/hyperledger-iroha/iroha/blob/main/CONTRIBUTING.md).

:::
