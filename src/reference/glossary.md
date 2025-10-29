# Glossary <!-- omit in toc -->

Here you can find definitions of all Iroha-related entities.

- [Peer](#peer)
- [Asset](#asset)
- [Byzantine fault-tolerance (BFT)](#byzantine-fault-tolerance-bft)
- [Iroha Components](#iroha-components)
  - [Sumeragi (Emperor)](#sumeragi-emperor)
  - [Torii (Gate)](#torii-gate)
  - [Kura (Warehouse)](#kura-warehouse)
  - [Kagami(Teacher and Exemplar and/or looking glass)](#kagami-teacher-and-exemplar-and-or-looking-glass)
  - [Merkle tree (hash tree)](#merkle-tree-hash-tree)
  - [Smart contracts](#smart-contracts)
  - [Triggers](#triggers)
  - [Versioning](#versioning)
  - [Hijiri (peer reputation system)](#hijiri-peer-reputation-system)
- [Iroha Modules](#iroha-modules)
- [Iroha Special Instructions (ISI)](#iroha-special-instructions-isi)
  - [Utility Iroha Special Instructions](#utility-iroha-special-instructions)
  - [Core Iroha Special Instructions](#core-iroha-special-instructions)
  - [Domain-specific Iroha Special Instructions](#domain-specific-iroha-special-instructions)
  - [Custom Iroha Special Instruction](#custom-iroha-special-instruction)
- [Iroha Query](#iroha-query)
- [View change](#view-change)
- [World state view (WSV)](#world-state-view-wsv)
- [Leader](#leader)

## Blockchain ledgers

Blockchain ledgers are digital record-keeping systems that use blockchain
technology to keep financial records. These are named after old-fashioned
books that were used for financial records such as prices, news, and
transaction information.

During medieval times, ledger books were open for public viewing and
accuracy verification. This idea is reflected in the blockchain-based
systems that can check the stored data for validity.

## Peer

A peer in Iroha means an Iroha process instance to which other Iroha processes
and client applications can connect.
A single machine can host several Iroha peers.
Peers are equal regarding their resources and capabilities,
with an important exception: only one of the peers runs
the genesis block at the bootstrapping stage of the Iroha network.

Other blockchains may refer to the same concept as a node or a validator.

A peer can be a process on its host system.
It also can be contained in a Docker container and a Kubernetes pod.

## Asset

In the context of blockchains, an asset is the representation of a valuable
object on the blockchain.

Additional information on assets is available
[here](/blockchain/assets.md).

### Fungible assets

Such assets can be easily swapped for other assets of the same type because
they are interchangeable.

As an example, all units of the same currency are equal in their value and
can be used to purchase goods. Typically, fungible assets are identical in
appearance, aside from the wear of banknotes and coins.

### Non-fungible assets

Non-fungible assets are unique and valuable due to their specific
characteristics and rarity; their value cannot be compared to other assets.

- A painting's value can vary based on the artist, the time period it was
  painted, and the public's interest in it.
- Two houses on the same street may have differing levels of maintenance.
- Jewellery manufacturers typically offer a range of different designs.

### Mintable assets

An asset is mintable if more of the same type can be issued.

### Non-mintable assets

If the initial amount of an asset is specified once and doesn't change, it
is considered non-mintable.

The [Genesis block](/guide/configure/genesis.md) sets this information for
the Iroha configuration.

## Byzantine fault-tolerance (BFT)

The property of being able to properly function with a network containing a
certain percentage of malicious actors. Iroha is capable of functioning
with up to 33% malicious actors in its peer-to-peer network.

## Iroha Components

Rust modules containing Iroha functionality.

### Sumeragi (Emperor)

The Iroha module responsible for consensus.

### Torii (Gate)

Module with the incoming request handling logic for the [peer](#peer). It is used to
receive, accept and route incoming instructions, and HTTP queries, as well
as run-time configuration updates.

### Kura (Warehouse)

Persistence-related logic. It handles storing the blocks, log rotation,
block storage folder rotation, etc.

### Kagami(Teacher and Exemplar and/or looking glass)

Generator for commonly used data. It can generate cryptographic key pairs,
genesis blocks, documentation, etc.

### Merkle tree (hash tree)

A data structure used to validate and verify the state at each block
height. Iroha's current implementation is a binary tree. See
[Wikipedia](https://en.wikipedia.org/wiki/Merkle_tree) for more details.

### Smart contracts

Smart contracts are blockchain-based programs that run when a specific set
of conditions is met. In Iroha smart contracts are implemented using
[core Iroha special instructions](#core-iroha-special-instructions).

### Triggers

An event type that allows invoking an Iroha special instruction at specific
block commit, time (with some caveats), etc. More on triggers
[here](/blockchain/triggers.md).

### Versioning

Each request is labelled with the API version to which it belongs. It
allows a combination of different binary versions of Iroha client/peer
software to interoperate, which in turn allows software upgrades in the
Iroha network.

### Hijiri (peer reputation system)

Iroha's reputation system. It allows prioritising communication with [peers](#peer)
that have a good track-record, and reducing the harm that can be caused by
malicious [peers](#peer).

## Iroha Modules

Third party extensions to Iroha that provide custom functionality.

## Iroha Special Instructions (ISI)

A library of smart contracts provided with Iroha. These can be invoked via
either transactions or registered event listeners. More on ISI
[here](/blockchain/instructions.md).

#### Utility Iroha Special Instructions

This set of [isi](#iroha-special-instructions-isi) contains logical
instructions like `If`, I/O related like `Notify` and compositions like
`Sequence`. They are mostly used as
[custom instructions](#custom-iroha-special-instruction).

### Core Iroha Special Instructions

[Special instructions](#iroha-special-instructions-isi) provided with every
Iroha deployment. These include some
[domain-specific](#domain-specific-iroha-special-instructions) as well as
[utility instructions](#utility-iroha-special-instructions).

### Domain-specific Iroha Special Instructions

Instructions related to domain-specific activities: assets, accounts,
domains, peer management). These provide the tools necessary to make
changes to the [World State View](#world-state-view-wsv) in a secure and
safe manner.

### Custom Iroha Special Instruction

Instructions provided in [Iroha Modules](#iroha-modules), by clients or 3rd
parties. These can only be built using
[the Core Instructions](#core-iroha-special-instructions). Forking and
modifying the Iroha source code is not recommended, as special instructions
not agreed-upon by [peers](#peer) in an Iroha deployment will be treated as faults,
thus [peers](#peer) running a modified instance will have their access revoked.

## Iroha Query

A request to read the World State View without modifying said view. More on
queries [here](/blockchain/queries.md).

## View change

A process that takes place in case of a failed attempt at consensus.
Usually this entails the election of a new [Leader](#leader).

## World state view (WSV)

In-memory representation of the current blockchain state. This includes all
currently loaded blocks, with all of their contents, as well as [peers](#peer)
elected for the current epoch.

## Leader

In an iroha network, a peer is selected randomly and granted the special
privilege of forming the next block. This privilege can be revoked in
networks that achieve
[Byzantine fault-torelance](#byzantine-fault-tolerance-bft) via
[view change](#view-change).
