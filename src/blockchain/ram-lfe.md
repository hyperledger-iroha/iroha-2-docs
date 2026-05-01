# RAM-LFE

RAM-LFE is Iroha's generic hidden-function layer for programs whose public
policy is on-chain but whose evaluator logic, secret, or raw input should not
be written to world state. It is used by SORA Nexus identifier flows, such as
private phone or email lookup, and can also be exposed as a generic Torii
program-execution helper when a node profile enables the app-facing routes.

The chain stores the policy commitment and receipt verification metadata. A
resolver or Torii runtime evaluates the hidden program, returns only the
allowed output, and attaches a receipt that clients, support tooling, or
ledger instructions can verify against the registered policy.

## Naming

The naming split matters:

| Term | Meaning |
| --- | --- |
| `ram_lfe` | The outer hidden-function abstraction: program policies, commitments, execution receipts, and receipt verification mode. |
| `BFV` | The Brakerski/Fan-Vercauteren homomorphic encryption scheme used by encrypted-input RAM-LFE backends. |
| `ram_fhe_profile` | BFV-specific metadata for the programmed encrypted execution machine. It is not a second name for RAM-LFE. |

In the data model, `RamLfeProgramPolicy` and `RamLfeExecutionReceipt` are
RAM-LFE types. BFV parameters, ciphertext envelopes, and the hidden
RAM-FHE program profile belong to the encrypted-execution backend used by a
policy.

## What It Records

A RAM-LFE program policy is globally registered by `program_id`. The policy
contains:

- the owner account that can activate, deactivate, or otherwise mutate the
  policy
- the backend advertised to clients
- the receipt verification mode, either `signed` or `proof`
- a commitment to the hidden program metadata and evaluator secret
- the resolver public key for signed receipts
- optional public encrypted-input metadata, such as BFV parameters and
  `ram_fhe_profile`
- an `active` flag that controls whether the policy can issue new receipts

The hidden secret, plaintext identifier value, and hidden program body are
not stored in world state. Clients should treat commitments, opaque hashes,
receipt hashes, ciphertexts, and program digests as opaque protocol values.

## Backends

Current RAM-LFE support is centered on three backend identifiers:

| Backend | Use |
| --- | --- |
| `hkdf-sha3-512-prf-v1` | Historical commitment-bound PRF evaluation. |
| `bfv-affine-sha3-256-v1` | BFV-backed secret affine evaluation over encrypted identifier slots. |
| `bfv-programmed-sha3-256-v1` | BFV-backed programmed execution over encrypted registers and memory lanes. |

For identifier policies, the programmed BFV backend is the important modern
path. It lets wallets encrypt normalized input locally, lets the resolver
evaluate without seeing a public identifier in the transaction, and returns a
receipt that binds the output hash to the registered program policy.

## Math

This section describes the implementation-level algebra used by the current
RAM-LFE code. It is not a security proof; it is the deterministic transcript
and encrypted-evaluation model that policies, receipts, and clients must
agree on.

### Notation

Let:

- \(H(m)\) be Iroha `Hash::new(m)`: Blake2b-32 over `m`, with the least
  significant bit of the final byte forced to `1`.
- \(N(x)\) be the canonical Norito encoding of `x`.
- \(a \parallel b\) mean byte-string concatenation.
- \(\operatorname{le64}(i)\) be the 8-byte little-endian encoding of an
  unsigned integer.
- \(s\) be the resolver secret held outside world state.
- \(P\) be public policy parameters.
- \(A\) be request associated data.
- \(x\) be normalized input bytes or a Norito-encoded encrypted-input
  envelope, depending on the backend.

RAM-LFE uses domain-separated hashes. The formulas below name the domains by
purpose; their current byte strings are:

| Symbol | Domain string |
| --- | --- |
| \(D_{\mathrm{policy}}\) | `iroha.ram_lfe.policy.hkdf_sha3_512_prf.v1` |
| \(D_{\mathrm{secret}}\) | `iroha.ram_lfe.policy_secret.hkdf_sha3_512_prf.v1` |
| \(D_{\mathrm{salt}}\) | `iroha.ram_lfe.hkdf_salt.hkdf_sha3_512_prf.v1` |
| \(D_{\mathrm{hkdf\_opaque}}\) | `iroha.ram_lfe.opaque_info.hkdf_sha3_512_prf.v1` |
| \(D_{\mathrm{hkdf\_receipt}}\) | `iroha.ram_lfe.receipt_info.hkdf_sha3_512_prf.v1` |
| \(D_{\mathrm{opaque}}\) | `iroha.ram_lfe.opaque_hash.hkdf_sha3_512_prf.v1` |
| \(D_{\mathrm{receipt}}\) | `iroha.ram_lfe.receipt_hash.hkdf_sha3_512_prf.v1` |
| \(D_{\mathrm{affine\_circuit}}\) | `iroha.ram_lfe.bfv_affine.circuit.v1` |
| \(D_{\mathrm{affine\_opaque}}\) | `iroha.ram_lfe.bfv_affine.opaque_hash.v1` |
| \(D_{\mathrm{affine\_receipt}}\) | `iroha.ram_lfe.bfv_affine.receipt_hash.v1` |
| \(D_{\mathrm{program\_memory}}\) | `iroha.ram_lfe.bfv_program.memory.v1` |
| \(D_{\mathrm{program\_opaque}}\) | `iroha.ram_lfe.bfv_program.opaque_hash.v1` |
| \(D_{\mathrm{program\_receipt}}\) | `iroha.ram_lfe.bfv_program.receipt_hash.v1` |
| \(D_{\mathrm{program\_digest}}\) | `iroha.ram_lfe.bfv_program.digest.v1` |
| \(D_{\mathrm{output}}\) | `iroha.ram_lfe.output_hash.v1` |
| \(D_{\mathrm{id\_opaque}}\) | `iroha.ram_lfe.identifier.opaque_hash.v1` |
| \(D_{\mathrm{id\_receipt}}\) | `iroha.ram_lfe.identifier.receipt_hash.v1` |
| \(D_{\mathrm{bfv\_keygen}}\) | `iroha.crypto.fhe.bfv.keygen.v1` |
| \(D_{\mathrm{bfv\_encrypt}}\) | `iroha.crypto.fhe.bfv.encrypt.v1` |
| \(D_{\mathrm{id\_keygen}}\) | `iroha.crypto.fhe.bfv.identifier.keygen.v1` |
| \(D_{\mathrm{id\_slot}}\) | `iroha.crypto.fhe.bfv.identifier.slot.v1` |

### Policy Commitment

A policy commitment binds the public parameters and hidden resolver secret to
a backend. First, the secret is committed separately:

$$
C_s = H(D_{\mathrm{secret}} \parallel s)
$$

Then the full policy transcript is encoded:

$$
T_{\mathrm{policy}} = N(\mathrm{backend}, P, C_s)
$$

and the published policy hash is:

$$
\mathrm{policy\_hash} =
H(D_{\mathrm{policy}} \parallel T_{\mathrm{policy}})
$$

The on-chain `PolicyCommitment` is:

$$
(\mathrm{backend}, \mathrm{policy\_hash}, P)
$$

Evaluation recomputes the same value from the runtime secret. If the
recomputed hash differs, evaluation fails with a commitment mismatch.

### HKDF-SHA3-512 Backend

For `hkdf-sha3-512-prf-v1`, the output is the normalized input itself, but
the opaque identifier and receipt hash are secret-bound PRF outputs.

The request transcript is:

$$
T_{\mathrm{req}} =
N(\mathrm{policy\_hash}, P, A, x)
$$

The HKDF salt and pseudorandom key are:

$$
\mathrm{salt} = D_{\mathrm{salt}} \parallel \mathrm{policy\_hash}
$$

$$
\mathrm{PRK} = \operatorname{HKDF\text{-}Extract}_{\mathrm{SHA3\text{-}512}}
(\mathrm{salt}, s)
$$

Opaque material is expanded and hashed:

$$
m_o =
\operatorname{HKDF\text{-}Expand}_{\mathrm{SHA3\text{-}512}}
(\mathrm{PRK}, D_{\mathrm{hkdf\_opaque}} \parallel T_{\mathrm{req}}, 32)
$$

$$
\mathrm{opaque\_id} =
H(D_{\mathrm{opaque}} \parallel m_o)
$$

Receipt material additionally binds the opaque id:

$$
m_r =
\operatorname{HKDF\text{-}Expand}_{\mathrm{SHA3\text{-}512}}
(\mathrm{PRK},
D_{\mathrm{hkdf\_receipt}} \parallel T_{\mathrm{req}}
\parallel \mathrm{opaque\_id}, 32)
$$

$$
\mathrm{receipt\_hash} =
H(D_{\mathrm{receipt}} \parallel m_r \parallel \mathrm{opaque\_id})
$$

The backend returns:

$$
(\mathrm{output}, \mathrm{opaque\_id}, \mathrm{receipt\_hash})
= (x, \mathrm{opaque\_id}, \mathrm{receipt\_hash})
$$

### BFV Primer

BFV is a lattice-based homomorphic encryption scheme. "Homomorphic" means
that a program can add and multiply encrypted values and, after decryption,
get the same result as if it had performed the additions and multiplications
on the plaintext values.

For RAM-LFE, BFV is used as an encrypted-input mechanism:

1. A wallet normalizes a private value, such as a phone number or email
   address.
2. The wallet turns the bytes into small integer slots.
3. Each slot is encrypted with the resolver's BFV public key.
4. The resolver runtime evaluates the hidden program over those ciphertexts.
5. The runtime decrypts only the hidden program output and signs or proves a
   receipt.

BFV is exact integer arithmetic, not approximate arithmetic. This is why it is
better suited to identifier bytes and small modular computations than to
floating-point model inference. In Iroha's current BFV usage, each encrypted
slot carries one scalar value modulo \(t\), usually a byte or a byte-length
field. The ciphertext itself lives modulo a much larger integer \(q\). The
gap between \(q\) and \(t\) gives decryption room for the noise that encryption
and homomorphic operations introduce.

A BFV ciphertext has two polynomial components:

$$
c=(c_0,c_1)
$$

The secret key is another polynomial \(s_k\). Decryption combines the
components:

$$
v = c_0 + c_1s_k
$$

If the ciphertext was formed correctly and the noise is still small enough,
\(v\) is close to the scaled plaintext. Rounding recovers the plaintext
coefficient modulo \(t\). The useful property is that ciphertext operations
preserve this structure:

| Plain operation | Ciphertext operation |
| --- | --- |
| \(m+n\) | Add ciphertext components. |
| \(m+\alpha\) | Add a scaled plaintext constant into \(c_0\). |
| \(\alpha m\) | Scale both ciphertext components by \(\alpha\). |
| \(mn\) | Multiply ciphertext polynomials, rescale, then relinearize. |

Multiplication is the expensive operation. A product of two two-component
ciphertexts naturally creates a three-component ciphertext that decrypts with
\(1\), \(s_k\), and \(s_k^2\). Relinearization uses a published evaluation key
to fold the \(s_k^2\) term back into a normal two-component ciphertext. That
keeps later additions and multiplications using the same ciphertext shape.

BFV is also "leveled": every encrypted operation consumes some noise budget.
This implementation does not bootstrap ciphertexts to refresh that budget.
Instead, RAM-LFE publishes a small `ram_fhe_profile` and accepts only a bounded
hidden program shape. That keeps evaluation within the parameter set's
supported depth. The current programmed profile allows a fixed register
count, fixed memory-lane count, and at most one ciphertext-ciphertext
multiplication per programmed step.

In this RAM-LFE design, BFV hides client input from public ledger data and
from observers who only see the transaction or route payload. It does not mean
the chain executes arbitrary encrypted programs by itself. The Torii resolver
runtime still owns the BFV secret material, evaluates the configured hidden
program, decrypts the permitted output, and attests the result. The ledger
then verifies the attestation against the on-chain policy commitment and
resolver public key or proof metadata.

The identifier use case chooses a simple representation on purpose. A
normalized string is encoded as:

```text
[length, byte_0, byte_1, ..., byte_n, 0, 0, ...]
```

Each element is encrypted as its own BFV scalar ciphertext. That shape makes
normalization and envelope validation explicit, lets wallets build encrypted
requests from public parameters, and lets the resolver canonicalize equivalent
encrypted inputs into a stable receipt transcript.

### BFV Ring Model

The BFV backends use the negacyclic polynomial ring:

$$
R_q = \mathbb{Z}_q[X] / (X^n + 1)
$$

and plaintext ring:

$$
R_t = \mathbb{Z}_t[X] / (X^n + 1)
$$

where:

- \(n\) is `polynomial_degree`, a power of two
- \(q\) is `ciphertext_modulus`
- \(t\) is `plaintext_modulus`
- \(q > t\) and \(t \mid q\)
- \(\Delta = q/t\)
- \(B = 2^{\mathrm{decomposition\_base\_log}}\)

Plaintext coefficient vectors are encoded by scaling each coefficient:

$$
\operatorname{EncPlain}(m)_i = \Delta m_i \bmod q
$$

Decryption center-lifts each coefficient of:

$$
v = c_0 + c_1 s_k \in R_q
$$

then rounds it back into \(R_t\):

$$
\operatorname{Dec}(c)_i =
\left\lfloor \frac{t \cdot \operatorname{center}_q(v_i)}{q}
\right\rceil \bmod t
$$

Here \(s_k\) is the BFV secret-key polynomial, not the outer RAM-LFE resolver
secret \(s\).

### BFV Key Generation

For encrypted identifier input, BFV key material is deterministic per
resolver secret and associated data:

$$
\sigma_{\mathrm{id}} =
H(D_{\mathrm{id\_keygen}} \parallel A \parallel s)
$$

The BFV RNG is seeded as:

$$
\operatorname{ChaCha20Rng}(H(D_{\mathrm{bfv\_keygen}} \parallel \sigma_{\mathrm{id}}))
$$

The key generator samples:

- \(s_k \in \{-1,0,1\}^n\), represented modulo \(q\)
- \(a \leftarrow R_q\) uniformly
- \(e \in \{-1,0,1\}^n\)

The public key is:

$$
\mathrm{pk}=(b,a),\qquad b = -a s_k - e \pmod q
$$

For relinearization, let \(s_k^2\) be the ring product in \(R_q\). For each
base-\(B\) digit \(j\), sample \(a_j\) uniformly and \(e_j\) from the small
distribution, then publish:

$$
\mathrm{rlk}_j=(b_j,a_j),\qquad
b_j = -a_j s_k - e_j + B^j s_k^2 \pmod q
$$

The public BFV policy metadata contains \((n,q,t,B)\), the public key, and
`max_input_bytes`. The BFV secret key and relinearization key stay in the
resolver runtime.

### BFV Encryption and Operations

To encrypt a plaintext polynomial \(m\), the implementation seeds another
ChaCha20 RNG from:

$$
H(D_{\mathrm{bfv\_encrypt}} \parallel \mathrm{seed})
$$

It samples \(u,e_1,e_2 \in \{-1,0,1\}^n\) and computes:

$$
c_0 = b u + e_1 + \operatorname{EncPlain}(m) \pmod q
$$

$$
c_1 = a u + e_2 \pmod q
$$

The ciphertext is \(c=(c_0,c_1)\).

Homomorphic addition is component-wise:

$$
c+d=(c_0+d_0,\ c_1+d_1)\pmod q
$$

Adding a plaintext scalar \(\alpha\) to coefficient zero changes only
\(c_0\):

$$
c+\alpha = (c_0 + \Delta\alpha,\ c_1)\pmod q
$$

Multiplying by a plaintext scalar \(\alpha\) scales both components:

$$
\alpha c = (\alpha c_0,\ \alpha c_1)\pmod q
$$

For two ciphertexts \(c=(c_0,c_1)\) and \(d=(d_0,d_1)\), ciphertext
multiplication first computes a size-three ciphertext and scales each
coefficient back by \(t/q\):

$$
\tilde c_0 = \left\lfloor \frac{t(c_0 d_0)}{q} \right\rceil \bmod q
$$

$$
\tilde c_1 =
\left\lfloor \frac{t(c_0 d_1 + c_1 d_0)}{q} \right\rceil \bmod q
$$

$$
\tilde c_2 = \left\lfloor \frac{t(c_1 d_1)}{q} \right\rceil \bmod q
$$

All products above are negacyclic ring products in \(R_q\). Then
\(\tilde c_2\) is decomposed into base-\(B\) polynomials:

$$
\tilde c_2 = \sum_j B^j u_j
$$

and relinearized:

$$
c'_0 = \tilde c_0 + \sum_j u_j b_j \pmod q
$$

$$
c'_1 = \tilde c_1 + \sum_j u_j a_j \pmod q
$$

The result is again a two-component BFV ciphertext.

### Identifier Ciphertext Envelope

An identifier input byte string:

$$
x=(x_0,\ldots,x_{\ell-1})
$$

is encoded into scalar slots:

$$
m_0 = \ell
$$

$$
m_{i+1}=x_i,\qquad 0 \le i < \ell
$$

and all remaining slots are zero up to `max_input_bytes + 1`. Each scalar
slot is encrypted as the coefficient-zero plaintext polynomial \([m_i]\).
The per-slot encryption seed is:

$$
\sigma_i =
H(D_{\mathrm{id\_slot}} \parallel \mathrm{seed} \parallel \operatorname{le64}(i))
$$

The encrypted identifier envelope is:

$$
(\operatorname{BFV.Enc}_{\mathrm{pk}}([m_0];\sigma_0),\ldots,
\operatorname{BFV.Enc}_{\mathrm{pk}}([m_M];\sigma_M))
$$

where \(M=\mathrm{max\_input\_bytes}\).

### BFV Affine Backend

For `bfv-affine-sha3-256-v1`, the runtime first derives BFV key material from
\(s\) and \(A\). The derived public parameters must exactly match the public
parameters committed on-chain.

The affine circuit seed is:

$$
\sigma_{\mathrm{affine}} =
H(D_{\mathrm{affine\_circuit}} \parallel s
\parallel \mathrm{policy\_hash} \parallel A)
$$

From this seed the runtime samples, modulo \(t\), a 32-row affine circuit:

$$
y_j = b_j + \sum_i w_{j,i} m_i \pmod t,
\qquad 0 \le j < 32
$$

where \(m_i\) are the decrypted identifier slots. Homomorphically, it computes
the same value over ciphertexts:

$$
C_j = b_j + \sum_i w_{j,i} C_i
$$

The resolver decrypts each \(C_j\), requires all trailing plaintext
coefficients to be zero, converts the coefficient-zero values to bytes, and
forms:

$$
O=(y_0,\ldots,y_{31})
$$

Then:

$$
\mathrm{opaque\_id} =
H(D_{\mathrm{affine\_opaque}}
\parallel \mathrm{policy\_hash} \parallel O)
$$

$$
\mathrm{receipt\_hash} =
H(D_{\mathrm{affine\_receipt}}
\parallel \mathrm{policy\_hash} \parallel O
\parallel \mathrm{opaque\_id})
$$

### BFV Programmed Backend

For `bfv-programmed-sha3-256-v1`, public parameters wrap the BFV identifier
encryption parameters plus a hidden-program digest:

$$
\mathrm{program\_digest}
= H(D_{\mathrm{program\_digest}} \parallel N(\mathrm{program}))
$$

The current RAM-FHE profile is:

| Field | Value |
| --- | --- |
| `profile_version` | `1` |
| `register_count` | `4` |
| `memory_lane_count` | `32` |
| `ciphertext_mul_per_step` | `1` |
| `encrypted_input_mode` | `resolver_canonicalized_envelope_v1` |
| `min_ciphertext_modulus` | \(2^{52}\) |

Plaintext input submitted to Torii is encrypted into the same BFV envelope
before execution. The deterministic seed for that server-side encryption is:

$$
H(
\texttt{"iroha.ram\_lfe.execute.plaintext\_bfv.v1"}
\parallel N(\mathrm{program\_id}) \parallel x
)
$$

For externally supplied encrypted input, the resolver decrypts the identifier
envelope and re-encrypts it onto this deterministic envelope before executing.
That canonicalization keeps receipt hashes stable across semantically equal
BFV ciphertexts.

Initial encrypted memory lanes are derived from:

$$
\sigma_{\mathrm{mem}} =
H(D_{\mathrm{program\_memory}} \parallel s
\parallel \mathrm{policy\_hash} \parallel A
\parallel \operatorname{le64}(0))
$$

For each of 32 lanes, the runtime samples \(r_j \in [0,t)\) and stores a BFV
ciphertext encrypting \(r_j\). The hidden program then executes over encrypted
registers and encrypted memory:

| Instruction | Algebra |
| --- | --- |
| `LoadInput(dst, i)` | \(R_{\mathrm{dst}} \leftarrow C_i\) |
| `LoadState(dst, j)` | \(R_{\mathrm{dst}} \leftarrow S_j\) |
| `StoreState(j, src)` | \(S_j \leftarrow R_{\mathrm{src}}\) |
| `LoadConst(dst, a)` | \(R_{\mathrm{dst}} \leftarrow \operatorname{Enc}(a)\) |
| `Add(dst, a, b)` | \(R_{\mathrm{dst}} \leftarrow R_a + R_b\) |
| `AddPlain(dst, src, a)` | \(R_{\mathrm{dst}} \leftarrow R_{\mathrm{src}} + a\) |
| `SubPlain(dst, src, a)` | \(R_{\mathrm{dst}} \leftarrow R_{\mathrm{src}} - a\) |
| `MulPlain(dst, src, a)` | \(R_{\mathrm{dst}} \leftarrow aR_{\mathrm{src}}\) |
| `Mul(dst, a, b)` | \(R_{\mathrm{dst}} \leftarrow R_aR_b\), then relinearize |
| `SelectEqZero(dst, cond, z, nz)` | Decrypt \(R_{\mathrm{cond}}\); choose \(R_z\) when it is zero, otherwise \(R_{nz}\). |
| `Output(src)` | Append \(R_{\mathrm{src}}\) to the output register list. |

After the instruction tape finishes, the resolver decrypts each output
register, converts coefficient zero to a byte, and concatenates those bytes:

$$
O = \operatorname{bytes}(\operatorname{Dec}(R_{o_0})_0,\ldots,
\operatorname{Dec}(R_{o_k})_0)
$$

The generic programmed backend hashes are:

$$
\mathrm{opaque\_hash} =
H(D_{\mathrm{program\_opaque}}
\parallel \mathrm{policy\_hash} \parallel O)
$$

$$
\mathrm{receipt\_hash}_{\mathrm{program}} =
H(D_{\mathrm{program\_receipt}}
\parallel \mathrm{policy\_hash} \parallel O
\parallel \mathrm{opaque\_hash})
$$

The default programmed identifier tape has 64 input slots. For each slot
\(i\), it loads the input slot, loads memory lane \(i \bmod 32\), adds them,
and outputs the result:

$$
R_0 \leftarrow C_i,\qquad
R_1 \leftarrow S_{i\bmod 32},\qquad
R_2 \leftarrow R_0 + R_1,\qquad
\operatorname{Output}(R_2)
$$

### Output Hashes and Receipts

The generic RAM-LFE execution receipt does not sign the raw output. It signs
the output hash:

$$
\mathrm{output\_hash} =
H(D_{\mathrm{output}} \parallel O)
$$

For Torii RAM-LFE execution receipts, associated data is the canonical
program identifier bytes:

$$
A = N(\mathrm{program\_id})
$$

$$
\mathrm{associated\_data\_hash}=H(A)
$$

The signed receipt payload is:

$$
R =
(\mathrm{program\_id},
\mathrm{program\_digest},
\mathrm{backend},
\mathrm{verification\_mode},
\mathrm{output\_hash},
\mathrm{associated\_data\_hash},
\mathrm{executed\_at\_ms},
\mathrm{expires\_at\_ms})
$$

For `signed` mode:

$$
\mathrm{attestation} =
\operatorname{Sign}_{\mathrm{resolver}}(N(R))
$$

Verification checks the signature with `resolver_public_key` and rejects the
receipt unless all of these equalities hold:

$$
R.\mathrm{program\_id} = \mathrm{policy.program\_id}
$$

$$
R.\mathrm{backend} = \mathrm{policy.backend}
$$

$$
R.\mathrm{verification\_mode} = \mathrm{policy.verification\_mode}
$$

$$
R.\mathrm{program\_digest} =
\mathrm{policy.public\_parameters.hidden\_program\_digest}
$$

$$
R.\mathrm{associated\_data\_hash} =
H(N(\mathrm{policy.program\_id}))
$$

If the caller supplies `output_hex`, the verifier also checks:

$$
H(D_{\mathrm{output}} \parallel \operatorname{bytes}(\mathrm{output\_hex}))
= R.\mathrm{output\_hash}
$$

For `proof` mode, the attestation carries a proof envelope instead of a
signature. Verification checks that the proof backend, circuit id,
public-input schema hash, verifying-key hash, and exposed public instances
match the proof verifier metadata and the encoded receipt-payload hash. Let:

$$
h_R = H(N(R)) = (h_0,\ldots,h_{31})
$$

The expected public instances are four one-element columns. Column \(j\)
contains bytes \(h_{8j}\ldots h_{8j+7}\) followed by 24 zero bytes:

$$
\mathrm{instance}_j =
h_{8j}\parallel\cdots\parallel h_{8j+7}\parallel 0^{24},
\qquad 0 \le j < 4
$$

### Identifier Projection

Identifier resolution does not use the generic backend `opaque_hash` as the
user-facing opaque account identifier. It projects the RAM-LFE output hash
through identifier-specific domains:

$$
\mathrm{opaque\_id}_{\mathrm{id}} =
H(D_{\mathrm{id\_opaque}}
\parallel N(\mathrm{program\_id})
\parallel \mathrm{output\_hash})
$$

$$
\mathrm{receipt\_hash}_{\mathrm{id}} =
H(D_{\mathrm{id\_receipt}}
\parallel N(\mathrm{program\_id})
\parallel \mathrm{output\_hash}
\parallel \mathrm{opaque\_id}_{\mathrm{id}})
$$

An `IdentifierResolutionReceipt` signs a higher-level payload:

$$
I =
(\mathrm{policy\_id},
R,
\mathrm{opaque\_id}_{\mathrm{id}},
\mathrm{receipt\_hash}_{\mathrm{id}},
\mathrm{uaid},
\mathrm{account\_id})
$$

For signed identifier receipts:

$$
\mathrm{attestation} =
\operatorname{Sign}_{\mathrm{resolver}}(N(I))
$$

`ClaimIdentifier` accepts the receipt only when the signature or proof is
valid, the embedded RAM-LFE execution payload matches the referenced program
policy, and the `uaid` and `account_id` are the binding being claimed.

## Execution Flow

A generic RAM-LFE execution follows this shape:

1. Governance or an operator registers `RamLfeProgramPolicy`.
2. The owner activates the policy.
3. The client reads the public policy metadata from Torii.
4. The client submits exactly one input form to the resolver: plaintext
   `input_hex` or an encrypted BFV input envelope.
5. The runtime evaluates the hidden program and returns `output_hex`,
   `output_hash`, `opaque_hash`, `receipt_hash`, and a
   `RamLfeExecutionReceipt`.
6. The client or backend verifies the receipt against the published policy,
   optionally checking that the returned `output_hex` hashes to the receipt's
   `output_hash`.
7. A higher-level instruction, such as `ClaimIdentifier`, can embed the
   attested receipt instead of embedding the raw input.

```mermaid
flowchart LR
    client["Wallet or application"] --> policy["Read program policy"]
    policy --> input["Normalize and optionally encrypt input"]
    input --> torii["Torii RAM-LFE runtime"]
    torii --> eval["Hidden evaluator"]
    eval --> receipt["Output and execution receipt"]
    receipt --> verify["Client or ledger verifies receipt"]
    verify --> claim["Use receipt in higher-level flow"]
```

## Identifier Policies

Identifier policies are a concrete use of RAM-LFE. They add a business
namespace and normalization rule on top of a generic program policy:

```text
RegisterRamLfeProgramPolicy(
  program_id = "phone_team",
  owner = "<POLICY_OWNER>",
  backend = "bfv-programmed-sha3-256-v1",
  verification_mode = "signed",
  commitment = "<HIDDEN_PROGRAM_POLICY_COMMITMENT>",
  resolver_public_key = "<RESOLVER_PUBLIC_KEY>"
)
ActivateRamLfeProgramPolicy(program_id = "phone_team")

RegisterIdentifierPolicy(
  id = "phone#team",
  owner = "<POLICY_OWNER>",
  normalization = "PhoneE164",
  program_id = "phone_team",
  note = "Private phone registration for team dataspace"
)
ActivateIdentifierPolicy(policy_id = "phone#team")
```

The identifier layer uses the RAM-LFE receipt to bind:

- `policy_id`
- the opaque identifier derived by the hidden function
- the deterministic `receipt_hash`
- the account's UAID
- the canonical `account_id`
- the generic RAM-LFE execution payload

For user-facing onboarding, keep account aliases separate from private
identifiers. Aliases are public names; phone numbers, email addresses, and
similar values should flow through identifier policies and receipts.

## Torii Routes

When the app-facing route family is enabled, Torii exposes RAM-LFE and
identifier helpers:

| Route | Purpose |
| --- | --- |
| `GET /v1/ram-lfe/program-policies` | List active and inactive RAM-LFE program policies and public execution metadata. |
| `POST /v1/ram-lfe/programs/{program_id}/execute` | Execute one program from `input_hex` or `encrypted_input` and return output hashes plus a stateless receipt. |
| `POST /v1/ram-lfe/receipts/verify` | Verify a `RamLfeExecutionReceipt` against the published policy and optionally compare `output_hex` to `output_hash`. |
| `GET /v1/identifier-policies` | List identifier policies, normalization modes, resolver keys, and encrypted-input metadata. |
| `POST /v1/accounts/{account_id}/identifiers/claim-receipt` | Issue the receipt that a user can embed in `ClaimIdentifier`. |
| `POST /v1/identifiers/resolve` | Resolve a normalized identifier input to the bound account when an active claim exists. |
| `GET /v1/identifiers/receipts/{receipt_hash}` | Look up a persisted identifier claim by receipt hash for audit and support tooling. |

Always check the target node's `/openapi` or `/openapi.json` document before
building against these routes. Availability depends on the node build and
network profile.

## Node Runtime

Torii's in-process RAM-LFE runtime is configured under
`torii.ram_lfe.programs[*]`, keyed by `program_id`. Each configured program
must match the on-chain policy commitment and must provide the runtime
material needed to evaluate and attest receipts. Identifier routes reuse this
same runtime; they do not require a separate identifier-resolver config
surface.

Registering a policy on-chain is not enough by itself. A target node must
also expose the route family and have matching runtime material for the
programs it is expected to execute.

## Operational Guardrails

- Register policies inactive, verify the public metadata, then activate them.
- Keep hidden evaluator secrets, resolver signing keys, and BFV secret
  material out of docs, logs, transactions, and client bundles.
- Do not put raw identifiers in account aliases, transaction metadata,
  events, or world-state fields.
- Verify receipts client-side before submitting higher-level instructions
  when the SDK exposes a verifier.
- Use expiry fields where stale receipts should not remain valid forever.
- Rotate by registering a new program or identifier policy, migrating clients,
  and deactivating the old policy once new receipts are flowing.

## Related Topics

- [Sponsor Fees for a Private Dataspace](/get-started/private-dataspace-fee-sponsor.md#_4-register-phone-and-email-privately-with-fhe)
- [Torii Endpoints](/reference/torii-endpoints.md#app-and-sora-route-families)
- [Anonymous Transactions](/blockchain/anonymous-transactions.md)
