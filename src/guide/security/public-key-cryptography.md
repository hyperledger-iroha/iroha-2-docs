# Public Key Cryptography

Public key cryptography provides the means for secure communication and data protection, enabling activities such as secure online transactions, encrypted email communications, etc.

Public key cryptography employs a pair of cryptographic keys—a _public_ key and a _private_ key—to create a highly secure method of transmitting information over online networks.

It's easy to make a public key from a private key, but the opposite is rather difficult, if not impossible. This keeps things safe. You can freely share your public key without risking your private key, which remains secure.

## Encryption and Signatures

Public key cryptography allows individuals to send encrypted messages and data that can only be deciphered by the intended recipient possessing their corresponding private key. In other words, the public key functions as a lock, and the private key serves as an actual unique key that unlocks the encrypted data.

This encryption process not only ensures the privacy and confidentiality of sensitive information but also establishes the authenticity of the sender. By combining the sender's private key with the public key, a digital _signature_ is created. This signature serves as a digital stamp of approval, verifying the sender's identity and the validity of the transferred data. Anyone with your _public_ key can verify that the person who initiated the transaction used your _private_ key.

## Keys on the Client Side

Since every transaction must be signed on behalf of a peer, every operation requires a private key that is kept secret (hence the name). Therefore, the client program must handle both the storage and secure signing of transactions.

::: warning

All clients are different, but `iroha` binary is the least secure in this regard, as it stores a peer's private key in the `multihash` format saved to a plain text file that could be overridden with an environment variable.

**This is currently a reference implementation that will _not_ be a part of the production release.**

:::

One needs to register a user on behalf of another already registered user (just like you need to already have a pair of scissors to cut off the tag from a new one). Suppose that we want to register a user on behalf of `mad_hatter@wonderland`.

This entails generating a new private key, and sending its public key to the network so that said network can verify that it's indeed the trustworthy `mad_hatter@wonderland`, and not some impostor (e.g. `mad_hatter@wünderbar`). In this case, the client application must prompt you, the user, to provide a key pair and verify the authenticity of the transactions:  belonging to `mad_hatter@wonderland` and having a signature derived from the appropriate public key.

For public key cryptography to work effectively, avoid re-using keys when you need to specify a new key. While there's nothing stopping you from doing that, the public keys are _public_, which means that if an attacker sees the same public key being used, they will know that the private keys are also identical.

Even though _private_ keys operate on slightly different principles than passwords, the advice—*to make them as random as possible, never store them unencrypted and never share them with anyone under any circumstances*—applies.
