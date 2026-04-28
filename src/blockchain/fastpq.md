# FastPQ

FastPQ is Iroha's STARK proof path for selected execution effects. It does
not replace normal transaction execution or consensus. Transactions still
run through ISI, IVM, and Sumeragi as usual; FastPQ consumes the
deterministic execution witness and turns supported effects into proof
batches.

The current host integration has three main paths:

- transparent numeric asset transfers recorded during block execution
- Nexus verified lane relays whose AXT proof envelope carries a FastPQ
  binding
- SCCP transparent message proof helpers that wrap a FastPQ proof in an
  open-verification envelope

## Transfer Witness Path

Transparent numeric transfers create a structured transfer transcript when
the instruction mutates balances. The transcript records:

- the source account, destination account, asset definition, and amount
- sender and receiver balances before and after the transfer
- the transaction entrypoint hash used as the batch hash
- an authority digest derived from the submitting account
- a Poseidon digest for single-delta transcripts

Batch transfers use one transcript with multiple deltas. In that case the
single-delta Poseidon digest is omitted until per-delta digests are
available.

At block finalization, Iroha groups these transcripts by entrypoint hash.
The execution witness then carries both the original transcript bundles and
the FastPQ transition batches prepared for the prover.

Each transfer delta becomes two transition rows:

| Row             | Key shape                                        | Pre-value               | Post-value             |
| --------------- | ------------------------------------------------ | ----------------------- | ---------------------- |
| Sender debit    | `asset/<asset-definition>/<source-account>`      | sender balance before   | sender balance after   |
| Receiver credit | `asset/<asset-definition>/<destination-account>` | receiver balance before | receiver balance after |

Numeric values are normalized into integer witness units. A value is
rejected for FastPQ batching if it cannot be represented as a non-negative
`u64` at the selected decimal scale.

## Public Inputs

Every FastPQ transition batch carries public inputs that bind the proof to
the block and execution context:

| Input         | Meaning                                                         |
| ------------- | --------------------------------------------------------------- |
| `dsid`        | Dataspace identifier encoded as little-endian bytes             |
| `slot`        | Block creation time converted to nanoseconds                    |
| `old_root`    | Parent state root derived from the execution witness            |
| `new_root`    | Post-state root derived from the execution witness              |
| `perm_root`   | Poseidon commitment over active role permissions                |
| `tx_set_hash` | Hash over sorted transaction and time-trigger entrypoint hashes |

The host uses `fastpq-lane-balanced` as the canonical parameter set for
these batches.

## Mathematical Model

This section describes the arithmetic implemented by the current Rust
prover and verifier. All field operations below are over the Goldilocks
prime field:

$$
F = \mathbb{F}_p,\qquad p = 2^{64} - 2^{32} + 1
$$

FastPQ uses Poseidon2 over `F` for field commitments. The sponge has width
`t = 3`, rate `r = 2`, and capacity `1`. The hash absorbs field elements in
rate-2 blocks and appends a single field element `1` before the final
permutation:

$$
H_F(x_0,\ldots,x_{m-1}) =
\operatorname{Poseidon2}_F(x_0,\ldots,x_{m-1},1)
$$

Byte strings are packed into 7-byte little-endian limbs so every limb is
strictly below `p`:

$$
\operatorname{pack}(b)_j =
\sum_{i=0}^{6} b_{7j+i}2^{8i},\qquad 0 \leq \operatorname{pack}(b)_j < p
$$

Domain-separated field hashes are represented as:

$$
H_D(m) =
H_F(
|\operatorname{pack}(D)|,\operatorname{pack}(D),
|\operatorname{pack}(m)|,\operatorname{pack}(m)
)
$$

For hashes that start from byte-domain digests, FastPQ maps the first eight
little-endian bytes into the field:

$$
\operatorname{seed}(D)=
\operatorname{le64}(\operatorname{Hash}(D)[0..8])\bmod p
$$

### Public Input Binding

The host encodes a dataspace id by writing its `u64` value into the first
eight little-endian bytes of the 16-byte field:

$$
\operatorname{dsid\_bytes}(d)[0..8]=\operatorname{le64}(d),
\qquad
\operatorname{dsid\_bytes}(d)[8..16]=0
$$

The block creation time is converted from milliseconds to nanoseconds:

$$
\operatorname{slot}=\operatorname{saturating\_mul}
(\operatorname{creation\_time\_ms},1{,}000{,}000)
$$

The transaction-set hash is a byte-domain hash over the sorted entrypoint
hashes:

$$
\operatorname{tx\_set\_hash} =
\operatorname{Hash}(
\texttt{fastpq:v1:tx\_set}\|h_0\|\cdots\|h_{n-1}
)
$$

where `h_i` are sorted transaction and time-trigger entrypoint hashes. In
the proof public IO, if `perm_root` or `tx_set_hash` is all zero, the
prover fills fallback values:

$$
\operatorname{perm\_root} =
\begin{cases}
0^{32},& \text{if there are no permission hashes}\\
\operatorname{Hash}(\texttt{fastpq:v1:perm\_root}\|p_0\|\cdots\|p_{n-1}),
& \text{otherwise}
\end{cases}
$$

$$
\operatorname{tx\_set\_hash}_{fallback} =
\operatorname{Hash}(\texttt{fastpq:v1:tx\_set}\|\operatorname{ordering\_hash})
$$

### Numeric Normalization

For each transfer delta, the target decimal scale is the maximum trimmed
scale across the amount and both balance snapshots:

$$
s =
\max(
\operatorname{scale}(a),
\operatorname{scale}(f_0),
\operatorname{scale}(f_1),
\operatorname{scale}(t_0),
\operatorname{scale}(t_1)
)
$$

A `Numeric` value with mantissa `m` and scale `q` is accepted only when
`m >= 0` and `q <= s`. Its FastPQ witness value is:

$$
\operatorname{norm}_s(m,q)=m\cdot10^{s-q}
$$

The normalized result must fit in `u64`.

### Canonical Ordering

Before trace construction, the batch is sorted by transition key, operation
rank, and original insertion index:

$$
r(\operatorname{Transfer})=0,\quad
r(\operatorname{Mint})=1,\quad
r(\operatorname{Burn})=2,\quad
r(\operatorname{RoleGrant})=3,\quad
r(\operatorname{RoleRevoke})=4,\quad
r(\operatorname{MetaSet})=5
$$

The ordering commitment is a Poseidon2 field hash over the domain
`fastpq:v1:ordering` and the Norito encoding of the sorted transitions:

$$
\operatorname{ordering\_hash} =
H_F(
|P(D_o)|,P(D_o),|P(E(T^\star))|,P(E(T^\star))
)
$$

where `P` is 7-byte packing, `E` is Norito encoding, `D_o` is
`fastpq:v1:ordering`, and `T*` is the sorted transition list.

### Transfer Equations

For a transfer amount `a`, sender balance `f`, and receiver balance `t`,
FastPQ validates the normalized witness values before building the trace:

$$
f_0 \geq a
$$

$$
f_1 = f_0 - a
$$

$$
t_1 = t_0 + a
$$

The transition rows then encode:

$$
\Delta_{\text{sender}} = f_1 - f_0 = -a
$$

$$
\Delta_{\text{receiver}} = t_1 - t_0 = a
$$

Inside the trace, signed deltas are reduced into `F`:

$$
\delta_i = (\operatorname{post}_i - \operatorname{pre}_i)\bmod p
$$

The optional single-delta transfer digest commits the encoded transfer
preimage:

$$
d_{\text{transfer}} =
\operatorname{PoseidonHashBytes}(
E(\text{from})\|E(\text{to})\|E(\text{asset})\|E(a)\|\text{batch\_hash}
)
$$

For multi-delta transfer transcripts, the current code requires this
top-level digest to be absent until per-delta digest plumbing is available.

The host authority digest for transfer transcripts is:

$$
d_{\text{authority}} =
\operatorname{Hash}(\texttt{iroha:fastpq:v1:authority|}\|E(\text{authority\_account}))
$$

### Trace Rows

Let the sorted transition list contain `n` real rows. The trace length is
the next power of two:

$$
N = 2^{\lceil\log_2(\max(1,n))\rceil}
$$

Rows `0..n-1` are active; rows `n..N-1` are padding rows. Each real row has
one operation selector set:

$$
s_{\text{active}} =
s_{\text{transfer}}+
s_{\text{mint}}+
s_{\text{burn}}+
s_{\text{role\_grant}}+
s_{\text{role\_revoke}}+
s_{\text{meta\_set}}
$$

All selector columns are Boolean:

$$
s(s-1)=0
$$

Permission lookup rows are exactly role grant and role revoke rows:

$$
s_{\text{perm}} =
s_{\text{role\_grant}} + s_{\text{role\_revoke}}
$$

For numeric operation rows:

$$
\delta_i = \operatorname{value\_new}_{i,0} - \operatorname{value\_old}_{i,0}
$$

The builder also tracks running per-asset deltas:

$$
R_i(a)=R_{i-1}(a)+\delta_i
\quad\text{for transfer, mint, and burn rows of asset }a
$$

Only mint and burn rows update the supply counter:

$$
S_i(a)=S_{i-1}(a)+
\begin{cases}
\delta_i,& \text{if row }i\text{ is mint or burn}\\
0,& \text{otherwise}
\end{cases}
$$

Metadata and dataspace trace columns are field hashes derived before row
materialization:

$$
\operatorname{metadata\_hash} =
\begin{cases}
0,& \text{if metadata is empty}\\
H_D(E(\text{metadata})),& \text{otherwise}
\end{cases}
$$

$$
\operatorname{dsid\_trace}=H_D(\operatorname{public\_input\_dsid})
$$

The metadata hash, dataspace hash, and slot are stable across adjacent
trace rows:

$$
\operatorname{metadata\_hash}_i=\operatorname{metadata\_hash}_{i+1}
$$

$$
\operatorname{dsid}_i=\operatorname{dsid}_{i+1}
$$

$$
\operatorname{slot}_i=\operatorname{slot}_{i+1}
$$

### Transfer Merkle Columns

Transfer rows carry a 32-level sparse Merkle path. If a host proof is
missing, the prover synthesizes a deterministic path from the row key,
pre-balance, and whether the row is the sender or receiver side.

For synthetic paths, the flavor salt is `fastpq:smt:from` for sender rows
and `fastpq:smt:to` for receiver rows:

$$
K =
\operatorname{Hash}(\texttt{fastpq:smt:key|}\|\operatorname{salt}\|\operatorname{key})
$$

$$
V =
\operatorname{Hash}(\texttt{fastpq:smt:value|}\|\operatorname{salt}\|\operatorname{le64}(\operatorname{balance}))
$$

$$
b_\ell = \operatorname{bit}_\ell(K)
$$

$$
s_\ell =
\operatorname{Hash}(
\texttt{fastpq:smt:sibling|}\|
\operatorname{le64}(\ell)\|K\|\operatorname{le64}(\operatorname{balance})\|\operatorname{salt}
)
$$

The synthetic leaf and internal nodes are:

$$
L = \operatorname{Hash}(
\texttt{fastpq:smt:leaf|}\|
K\|V
)
$$

$$
N_{\ell+1} =
\operatorname{Hash}(
\texttt{fastpq:smt:node|}\|
\operatorname{left}_\ell\|
\operatorname{right}_\ell
)
$$

The trace records the bit `b_l`, sibling `s_l`, input node `x_l`, and
output node `x_{l+1}` at every level. With the code's branch convention:

$$
(\operatorname{left}_\ell,\operatorname{right}_\ell)=
\begin{cases}
(s_\ell,x_\ell),& b_\ell=0\\
(x_\ell,s_\ell),& b_\ell=1
\end{cases}
$$

### Permission Hashes

Role grant and revoke rows hash the permission witness:

$$
h_{\text{perm}} =
H_F(P(\operatorname{role\_id}\|\operatorname{permission\_id}\|\operatorname{epoch}_{le}))
$$

The host permission table root sorts entries by role bytes, permission
bytes, and epoch bytes, then builds a Poseidon2 Merkle tree:

$$
M_0[j]=h_{\text{perm},j}
$$

$$
M_{k+1}[j] =
H_F(\operatorname{seed}(\texttt{fastpq:v1:poseidon\_node}),M_k[2j],M_k[2j+1])
$$

Odd-width levels duplicate the final element.

### Trace Commitment

For each trace column `c`, FastPQ first interpolates the column values over
the trace domain and hashes the coefficient vector:

$$
C_c =
H_F(
\operatorname{seed}(\texttt{fastpq:v1:trace:column:}c),
\operatorname{coeffs}(c)
)
$$

The trace root is a Poseidon2 Merkle root over column commitments:

$$
R_{\text{trace}} = \operatorname{MerkleRoot}(C_0,\ldots,C_{m-1})
$$

The final trace commitment is a byte hash over the domain, parameter set,
trace shape, column digests, and trace root:

$$
\operatorname{commitment} =
\operatorname{Hash}(
\operatorname{len}(D_c)\|D_c\|
\operatorname{len}(\text{parameter})\|\text{parameter}\|
n\|N\|m\|C_0\|\cdots\|C_{m-1}\|R_{\text{trace}}
)
$$

where `D_c` is `fastpq:v1:trace_commitment`.

### AIR Composition

The V1 AIR composition value is a linear combination of row-local residues.
The transcript samples two challenges:

$$
\alpha_0,\alpha_1 \in F
$$

For each adjacent row pair `(i,i+1)`, the prover computes:

$$
A_i=\sum_j \alpha_{j\bmod2}\rho_{i,j}
$$

The residues `rho` are, in code order:

$$
\rho=s(s-1)
\quad\text{for each selector column}
$$

$$
\rho =
s_{\text{active}} -
(s_{\text{transfer}}+s_{\text{mint}}+s_{\text{burn}}+
s_{\text{role\_grant}}+s_{\text{role\_revoke}}+s_{\text{meta\_set}})
$$

$$
\rho =
s_{\text{perm}}-(s_{\text{role\_grant}}+s_{\text{role\_revoke}})
$$

$$
\rho =
s_{\text{active},i+1}(1-s_{\text{active},i})
$$

For rows with numeric columns:

$$
\rho =
(s_{\text{transfer}}+s_{\text{mint}}+s_{\text{burn}})
\cdot
((\operatorname{value\_new}_{0}-\operatorname{value\_old}_{0})-\delta)
$$

And for stable batch context columns:

$$
\rho =
\operatorname{metadata\_hash}_i-\operatorname{metadata\_hash}_{i+1}
$$

$$
\rho =
\operatorname{dsid}_i-\operatorname{dsid}_{i+1}
$$

$$
\rho =
\operatorname{slot}_i-\operatorname{slot}_{i+1}
$$

The verifier recomputes `A_i` for sampled row openings and checks it
against the composition value committed under the AIR composition Merkle
root.

### Lookup Product

The permission lookup accumulator uses the Fiat-Shamir challenge `gamma`.
Over the low-degree extension evaluations of `s_perm` and `perm_hash`, the
running product is:

$$
z_0=1
$$

$$
z_{i+1}=
\begin{cases}
z_i\cdot(w_i+\gamma),& s_{\text{perm},i}\ne0\\
z_i,& s_{\text{perm},i}=0
\end{cases}
$$

The proof records:

$$
\operatorname{lookup\_grand\_product}=H_F(z_0,z_1,\ldots)
$$

### Low-Degree Extension

Let `omega_T` be the trace-domain generator, `omega_E` the
evaluation-domain generator, and `g` the configured coset offset. For a
trace column with values `v_i`, interpolation produces coefficients `a_j`
such that:

$$
f(\omega_T^i)=v_i
$$

The low-degree extension evaluates the same polynomial on the coset:

$$
\operatorname{LDE}_f(i)=f(g\cdot\omega_E^i)
$$

The implementation computes this by multiplying coefficients by powers of
the coset offset before FFT:

$$
a'_j = a_j g^j
$$

and then evaluating `a'` on the evaluation domain.

### Merkle Openings

LDE values are grouped into chunks of:

$$
B_{\text{lde}}=8\cdot\operatorname{fri\_arity}
$$

Each chunk leaf is:

$$
L_j=H_D(j\|v_{jB}\|\cdots\|v_{jB+B-1})
$$

Merkle parents are:

$$
P_j =
H_F(\operatorname{seed}(\texttt{fastpq:v1:trace:node}),L_{2j},L_{2j+1})
$$

Odd levels duplicate the last node. Query paths verify by hashing left or
right according to the query leaf index parity at each level.

AIR trace row leaves are:

$$
L^{\text{air}}_i =
H_D(i\|m\|x_{i,0}\|\cdots\|x_{i,m-1})
$$

AIR composition leaves are:

$$
L^{\text{comp}}_i = H_D(i\|A_i)
$$

### FRI Folding

FRI commits to AIR composition evaluations. For each round `l`, the
transcript samples a challenge `beta_l`. The layer is padded to a multiple
of the arity by repeating the last value. Each arity-sized group folds to:

$$
y_{l+1,j} =
\sum_{k=0}^{a-1} y_{l,ja+k}\beta_l^k
$$

where `a` is the FRI arity. The verifier checks, for every sampled query
chain, that:

$$
y_{l+1,\lfloor i/a\rfloor}
=
\sum_{k=0}^{a-1} y_{l,\lfloor i/a\rfloor a+k}\beta_l^k
$$

and authenticates each opened FRI group against the corresponding FRI layer
root.

### Fiat-Shamir Transcript

The canonical parameter catalogue labels the transcript hash as SHA3-256.
The current prover and verifier implementation derives challenge bytes with
`iroha_crypto::Hash::new`, which is a 32-byte Blake2bVar digest, then
reduces the first eight little-endian bytes into `F`:

$$
\chi(\text{tag}) =
\operatorname{le64}(\operatorname{Hash}(\text{state}\|\operatorname{len}(\text{tag})\|\text{tag})[0..8])
\bmod p
$$

Challenge calls append the full digest to the transcript state. The replay
order is:

1. public IO, protocol version, parameter version, and parameter name
2. LDE root and trace root
3. `gamma`
4. AIR composition challenges `alpha_0`, `alpha_1`
5. AIR trace root and AIR composition root
6. lookup grand product
7. FRI layer roots and `beta_l` challenges
8. sampled query indices

Query sampling keeps drawing 32-byte challenge digests and reading them as
little-endian `u64` chunks until it has the requested number of unique
indices:

$$
q = \operatorname{le64}(\text{digest chunk})\bmod N_{\text{eval}}
$$

The sampled set is returned in sorted order.

## What The Prover Checks

Before building the trace, the FastPQ prover canonicalizes the batch order
by transition key, operation rank, and insertion order. Transfer rows also
require transcript metadata. A batch with transfer rows but no transfer
transcripts is invalid.

For transfer transcripts, the prover-side checks include:

- the sender balance must not underflow
- `sender_after` must equal `sender_before - amount`
- `receiver_after` must equal `receiver_before + amount`
- the transcript must cover every transfer row in the batch
- a single-delta Poseidon digest, when present, must match the transcript
  preimage
- provided sparse-Merkle proofs must decode as version 1; missing paths are
  filled with deterministic synthetic proofs

The trace contains selector columns for transfer, mint, burn, role grant,
role revoke, metadata set, and permission lookup rows. Numeric operation
rows also carry signed deltas, running per-asset deltas, and supply
counters.

## Prover Lane

`irohad` starts the FastPQ prover lane at startup if the prover backend can
be initialized. The lane is a background task with a bounded queue. After a
block produces an execution witness, the commit path submits a prover job
containing the block hash, height, view, and witness.

If the lane is not running or the queue is full, the job is skipped and
normal block processing continues. This means the background prover lane is
not a transaction admission or consensus gate. It is a proof-production
path over state that has already been executed.

The lane constructs a prover with:

```text
parameter = "fastpq-lane-balanced"
execution_mode = auto | cpu | gpu
poseidon_mode = auto | cpu | gpu
```

`auto` lets the prover choose the available backend. `cpu` pins execution
to the CPU. `gpu` prefers GPU execution, with CPU fallback where the
backend cannot use the requested kernels.

## Verification

FastPQ proof verification rebuilds the canonical batch commitment and
replays the public transcript. The verifier checks the protocol version,
parameter-set version, replay limits, trace commitment, public inputs,
sampled Merkle openings, AIR openings, and FRI query chain.

Default replay limits include:

| Limit              | Default |
| ------------------ | ------: |
| Transition rows    |     256 |
| Batch payload size | 256 KiB |
| FRI layers         |      16 |
| Query openings     |     128 |

## Nexus Verified Relays

Nexus AXT proof envelopes can embed an `AxtFastpqBinding`. When
`RegisterVerifiedLaneRelay` executes, Iroha:

1. verifies the lane relay envelope and FastPQ proof material
2. checks the dataspace and manifest root
3. decodes the AXT proof envelope
4. requires a `fastpq_binding`
5. rebuilds the FastPQ batch from that binding
6. decodes the embedded FastPQ proof
7. calls the FastPQ verifier on the rebuilt batch and proof

If verification succeeds, Iroha stores a `VerifiedLaneRelayRecord`
containing the relay reference, original envelope, proof payload hash,
verification height, manifest root, and FastPQ binding.

Lane relay envelopes also carry compact FastPQ proof material. The material
is a digest over the lane id, dataspace id, block height, verification
height, block header hash, settlement hash, and manifest root. A relay is
merge admissible only when it has both a QC and valid FastPQ proof
material.

## SCCP Transparent Message Proofs

The SCCP helper crate also uses FastPQ for transparent cross-chain message
proofs. This path is separate from the `irohad` background prover lane. It
builds a FastPQ batch directly from an SCCP message proof bundle and
manifest, then wraps the resulting proof for open verification.

The SCCP batch uses `fastpq-lane-balanced` and three metadata transitions:

| Key                             | Operation |
| ------------------------------- | --------- |
| `sccp:transparent:v1:statement` | `MetaSet` |
| `sccp:transparent:v1:context`   | `MetaSet` |
| `sccp:transparent:v1:payload`   | `MetaSet` |

Its public inputs are derived from the SCCP transparent inner proof:

| FastPQ input  | SCCP source                                                |
| ------------- | ---------------------------------------------------------- |
| `dsid`        | First 16 bytes of a Blake2b digest over the statement hash |
| `slot`        | Finality height                                            |
| `old_root`    | Payload hash                                               |
| `new_root`    | Commitment root                                            |
| `perm_root`   | Finality block hash                                        |
| `tx_set_hash` | Statement hash                                             |

The raw FastPQ proof is Norito-encoded into a `StarkFriOpenProofV1`, then
wrapped in an `OpenVerifyEnvelope` with backend `Stark`. SCCP verification
rebuilds the same FastPQ batch from the bundle and manifest, checks the
open verification envelope metadata, and calls the FastPQ verifier on the
rebuilt batch and proof.

## Parameter Sets

The canonical parameter catalogue exposes two parameter sets. The host
prover lane currently uses `fastpq-lane-balanced`.

| Parameter              | Purpose                    | Field                          | Hashes                                      | FRI                             |
| ---------------------- | -------------------------- | ------------------------------ | ------------------------------------------- | ------------------------------- |
| `fastpq-lane-balanced` | balanced prover throughput | Goldilocks quadratic extension | Poseidon2 commitments, catalogue SHA3 label | arity 8, blowup 8, 46 queries   |
| `fastpq-lane-latency`  | latency-sensitive lanes    | Goldilocks quadratic extension | Poseidon2 commitments, catalogue SHA3 label | arity 16, blowup 16, 34 queries |

Both target 128-bit security and use a trace domain size of `2^16`. The
Rust V1 transcript replay code currently derives Fiat-Shamir challenge
bytes with `iroha_crypto::Hash::new` rather than directly invoking
SHA3-256.

The exact catalogue constants used by the Rust prover are:

| Constant             | `fastpq-lane-balanced` | `fastpq-lane-latency` |
| -------------------- | ---------------------: | --------------------: |
| `target_security`    |                    128 |                   128 |
| `grinding_bits`      |                     23 |                    21 |
| `trace_log_size`     |                     16 |                    16 |
| `trace_root`         |   `0x002a247f81c6f850` |  `0x6a9f4eb38fb9b892` |
| `lde_log_size`       |                     19 |                    20 |
| `lde_root`           |   `0x60263388dbbf9b2a` |  `0x9c9c3a571b6f89ac` |
| `permutation_size`   |                 65,536 |                65,536 |
| `lookup_log_size`    |                     19 |                    20 |
| `omega_coset`        |   `0x6af325e825ad5c18` |  `0x3a5fd4171e3c3a4d` |
| `fri_arity`          |                      8 |                    16 |
| `fri_blowup`         |                      8 |                    16 |
| `fri_max_reductions` |                      8 |                     6 |
| `fri_queries`        |                     46 |                    34 |

## Configuration

FastPQ configuration is nested under `zk.fastpq`.

```toml
[zk.fastpq]
execution_mode = "auto"
poseidon_mode = "auto"

# Optional telemetry labels.
device_class = "apple-m4"
chip_family = "m4"
gpu_kind = "integrated"

# Optional Metal backend tuning.
metal_queue_fanout = 3
metal_queue_column_threshold = 24
metal_max_in_flight = 5
metal_threadgroup_width = 128
metal_trace = false
metal_debug_enum = false
metal_debug_fused = false
```

The same execution and telemetry labels can be overridden from `irohad`:

```shell
irohad --fastpq-execution-mode auto
irohad --fastpq-poseidon-mode cpu
irohad --fastpq-device-class apple-m4
irohad --fastpq-chip-family m4
irohad --fastpq-gpu-kind integrated
```

Environment variables are also supported for the configuration fields. The
FastPQ-specific variables include:

- `FASTPQ_EXECUTION_MODE`
- `FASTPQ_POSEIDON_MODE`
- `FASTPQ_DEVICE_CLASS`
- `FASTPQ_CHIP_FAMILY`
- `FASTPQ_GPU_KIND`
- `FASTPQ_METAL_QUEUE_FANOUT`
- `FASTPQ_METAL_COLUMN_THRESHOLD`
- `FASTPQ_METAL_MAX_IN_FLIGHT`
- `FASTPQ_METAL_THREADGROUP`
- `FASTPQ_METAL_TRACE`
- `FASTPQ_DEBUG_METAL_ENUM`
- `FASTPQ_DEBUG_FUSED`

## Metrics

When telemetry is enabled, FastPQ exports metrics for backend selection and
Metal runtime behavior:

| Metric                            | Meaning                                                                     |
| --------------------------------- | --------------------------------------------------------------------------- |
| `fastpq_execution_mode_total`     | Requested and resolved execution mode by backend and device labels          |
| `fastpq_poseidon_pipeline_total`  | Requested and resolved Poseidon pipeline path                               |
| `fastpq_metal_queue_depth`        | Metal queue limit, max in-flight count, dispatch count, and sampling window |
| `fastpq_metal_queue_ratio`        | Metal queue busy and overlap ratios                                         |
| `fastpq_zero_fill_duration_ms`    | Host zero-fill duration for Metal runs                                      |
| `fastpq_zero_fill_bandwidth_gbps` | Derived zero-fill bandwidth                                                 |

For general performance triage, use these with the consensus and queue
signals listed in [Performance and Metrics](/guide/advanced/metrics.md).

## Related Reference

- [Data Model Schema](/reference/data-model-schema.md) for generated type details
- `FastpqTransitionBatch`
- `FastpqPublicInputs`
- `TransferTranscript`
- `AxtFastpqBinding`
- `LaneFastpqProofMaterial`
- [`irohad` FastPQ options](/reference/irohad-cli.md#arg-fastpq-execution-mode)
