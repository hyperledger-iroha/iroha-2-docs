# World

`World` is the global entity that contains other entities. The `World`
consists of:

- Iroha [configuration parameters](/guide/configure/client-configuration.md)
- registered peers
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
state. It includes the `World`, committed block hashes, transaction indexes,
and peers elected for the current epoch. Full block payloads are served from
Kura rather than duplicated as mutable WSV data.

The WSV is the state that queries read and that block execution mutates. It
is not the durable source of truth by itself. Durable history is stored in
[Kura](#kura-storage), and the WSV can be rebuilt from Kura blocks or loaded
from a state snapshot and then caught up by replaying newer Kura blocks.

### What the WSV Tracks

The WSV is broader than the `World` object. In practice it contains:

- the `World`: parameters, peers, domains, accounts, assets, NFTs, roles,
  permissions, triggers, executor data, and other registered data-model
  objects
- committed block hashes and the latest committed height
- transaction-to-block indexes used by queries and receipts
- the current and previous commit topology used by consensus
- in-memory indexes derived from committed blocks, such as data-availability
  commitments, receipt cursors, pin intents, and query projection markers
- runtime configuration snapshots needed for deterministic block execution,
  such as cryptography, governance, pipeline, content, settlement, and Nexus
  settings

Queries normally receive a read-only `StateView` over these structures. A
view is a consistent snapshot for query execution; it does not allow direct
mutation of the WSV.

### How the WSV Changes

WSV changes are staged before they are committed. Block execution creates a
block-scoped state overlay, and each accepted transaction applies its
instructions in a transaction-scoped overlay. Data triggers invoked by those
transactions run in the same block context. Time triggers are evaluated after
transaction effects for the block.

After consensus commits a block, the peer first enqueues the committed block
in Kura. If this enqueue step fails, the WSV is not advanced and the
consensus loop retries or requeues the block payload. When the block is
accepted into Kura's queue, Iroha applies the post-execution block effects,
updates derived indexes, and commits the staged WSV changes under a
state-view lock. This keeps readers from observing a partially committed
block.

The consensus-critical rule is that peers must reach the same WSV from the
same committed blocks. Direct local edits to WSV data bypass instructions and
will make peers disagree during validation or replay.

### Startup and Replay

On startup, Iroha initializes Kura first and learns the stored block height.
It then tries to load a state snapshot. If no snapshot is available, or if a
snapshot is rejected as recoverable, Iroha creates an initial state and
replays committed blocks from Kura. If a snapshot is valid but behind Kura,
only the missing height range is replayed.

Replay validates each stored block, reconstructs the commit roster for that
height, applies the block effects to the WSV, and commits the resulting
state. This means Kura is the recovery path for the WSV, while snapshots are
an optimization that avoid replaying the whole chain.

## Kura Storage

_Kura_ is Iroha's persistent block storage. It stores signed blocks and
recovery metadata. It does not store a second mutable copy of the WSV.

Kura storage is rooted at [`kura.store_dir`](/reference/peer-config/params.md#param-kura-store-dir).
Within that root, block data is split by lane or segment. The primary files
for a segment are:

| Path | Purpose |
| --- | --- |
| `blocks/<segment>/blocks.data` | Contiguous Norito-framed signed block payloads. |
| `blocks/<segment>/blocks.index` | Fixed-size `(start, length)` entries that map block height to bytes in `blocks.data`. |
| `blocks/<segment>/blocks.hashes` | Block hashes by height for fast lookup and startup validation. |
| `blocks/<segment>/blocks.count.norito` | Durable commit marker recording how many block index entries are safe to use. |
| `blocks/<segment>/da_blocks/` | Evicted block payloads kept outside `blocks.data` when disk-budget enforcement moves old bodies out of the hot file. |
| `blocks/<segment>/pipeline/sidecars.norito` and `sidecars.index` | Pipeline recovery sidecars keyed by block height. |
| `blocks/<segment>/pipeline/roster_sidecars.norito` and `roster_sidecars.index` | Recent commit-roster sidecars used by block sync and replay. |
| `merge_ledger/<segment>.log` | Merge-ledger entries aligned with committed blocks. |
| `commit-rosters.norito` | Retained commit certificates and validator checkpoints for recent blocks. |

Kura keeps a compact in-memory vector for the chain: each height has the
block hash and, optionally, the block body. The genesis block remains cached,
and the most recent [`kura.blocks_in_memory`](/reference/peer-config/params.md#param-kura-blocks-in-memory)
non-genesis blocks keep their bodies in memory. Older block bodies are
dropped from memory and reloaded from Kura files when needed.

During initialization, `strict` mode validates stored blocks from the block
payloads and rewrites the hash file if needed. `fast` mode starts from stored
hash/index metadata and falls back to strict initialization if that metadata
is inconsistent. If Kura detects a corrupt tail, it prunes storage to the
last validated block.

Kura writes new blocks through a background writer. The writer appends block
payloads, hashes, and index entries, then advances the durable count marker
according to the configured fsync policy. When disk-budget enforcement is
active, Kura can purge retired segments or evict older block bodies into
`da_blocks/` while keeping hashes and index entries available for validation
and lookup.
