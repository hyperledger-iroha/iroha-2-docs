# Public Key Cryptography

Public key cryptography provides the means for secure communication and data protection, enabling activities such as secure online transactions, encrypted email communications, etc.

Public key cryptography employs a pair of cryptographic keys—a _public_ key and a _private_ key—to create a highly secure method of transmitting information over online networks.

It's easy to make a public key from a private key, but the opposite is rather difficult, if not impossible. This keeps things safe. You can freely share your public key without risking your private key, which remains secure.

## Encryption and Signatures

Public key cryptography allows individuals to send encrypted messages and data that can only be deciphered by the intended recipient possessing their corresponding private key. In other words, the public key functions as a lock, and the private key serves as an actual unique key that unlocks the encrypted data.

This encryption process not only ensures the privacy and confidentiality of sensitive information but also establishes the authenticity of the sender. By combining the sender's private key with the public key, a digital _signature_ is created. This signature serves as a digital stamp of approval, verifying the sender's identity and the validity of the transferred data. Anyone with your _public_ key can verify that the person who initiated the transaction used your _private_ key.

## Keys on the Client Side

Every transaction must be signed by an account authority. The private key or
controller material for that authority must stay secret, so client software is
responsible for secure storage and signing.

::: warning

All clients are different, but plain-text client configuration is only suitable
for development and controlled test networks. Production integrations should
use a secret manager, hardware-backed key storage, or another audited signing
boundary.

**This is currently a reference implementation that will _not_ be a part of the production release.**

:::

Registering a new account entails generating controller material, such as an
Ed25519 key pair, and submitting the public part to the network. Later
transactions from that account must be signed by the matching private key or by
the configured account controller policy.

For public key cryptography to work effectively, avoid re-using keys when you need to specify a new key. While there's nothing stopping you from doing that, the public keys are _public_, which means that if an attacker sees the same public key being used, they will know that the private keys are also identical.

Even though _private_ keys operate on slightly different principles than passwords, the advice—*to make them as random as possible, never store them unencrypted and never share them with anyone under any circumstances*—applies.
