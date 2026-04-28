# Build on SORA 3: Taira and Minamoto

SORA 3 is the app-facing public deployment track built on Iroha 3 and SORA
Nexus. Build and rehearse on Taira first, then move the same client shape
to Minamoto only when you have separate mainnet keys, real XOR for fees,
and production approval.

This tutorial shows how to configure an Iroha client for the public SORA 3
networks:

- Taira testnet at `https://taira.sora.org`
- Minamoto mainnet at `https://minamoto.sora.org`

Use Taira for integration tests, faucet-funded write canaries, and
deployment rehearsals. Use Minamoto only for production-ready mainnet
activity. Both networks charge fees in XOR:

- Taira uses testnet XOR from the public faucet.
- Minamoto uses real XOR. There is no Minamoto faucet.

## Builder Path

| Step                        | Taira Testnet                                                | Minamoto Mainnet                                   |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| Start reading network state | Query `/status` without keys                                 | Query `/status` without keys                       |
| Pick a dataspace            | Use public `universal` unless your app needs a governed lane | Use the same dataspace only after mainnet approval |
| Get fee asset               | Use the public Taira faucet                                  | Obtain real XOR, then claim it into Minamoto       |
| Test writes                 | Use faucet-funded test XOR                                   | Do not use test tooling; writes spend real XOR     |
| Promote                     | Keep retry logic, monitoring, and signer handling            | Use separate keys, funding, and release controls   |

The practical flow is:

1. Build the client against Taira and use the public `universal` dataspace.
2. Add a signer and fund it with the Taira faucet.
3. Exercise your app logic against Taira until failures are boring and
   observable.
4. Create a separate Minamoto signer, fund it with real XOR, and move only
   the same proven operations to mainnet.

## 1. Understand What You Are Setting Up

In SORA Nexus, a dataspace is part of the network lane and routing catalog.
A client does not create a new public dataspace just by changing
`client.toml`. Client setup does two things:

1. points the client at the right Torii endpoint
2. selects an account domain that belongs to an existing dataspace

For most applications, start with the public `universal` dataspace. Account
domains use `domain.dataspace` form, for example:

```text
wonderland.universal
```

If you need a new organizational dataspace, prepare a catalog and routing
proposal instead of trying to register it from an ordinary client account.
See [Provision a New Dataspace](#_8-provision-a-new-dataspace) below.

## 2. Check the Public Torii Endpoint

Check that the target endpoint is live before configuring a signer.

For Taira:

```bash
curl -fsS https://taira.sora.org/status \
  | jq '{peers, blocks, txs_approved, queue_size}'
```

For Minamoto:

```bash
curl -fsS https://minamoto.sora.org/status \
  | jq '{peers, blocks, txs_approved, queue_size}'
```

Inspect the dataspace and lane view exposed by the node:

```bash
curl -fsS https://taira.sora.org/status \
  | jq '.teu_lane_commit[] | {lane_id, alias, dataspace_id, dataspace_alias, visibility}'
```

Use the same command with `https://minamoto.sora.org/status` for mainnet.

## Toy Examples You Can Try Now

These examples are read-only unless noted. They work before you generate
keys and are safe to run against both public networks.

Compare Taira testnet and Minamoto mainnet health:

```bash
for network in taira minamoto; do
  root="https://$network.sora.org"
  printf '\n%s\n' "$network"
  curl -fsS "$root/status" \
    | jq '{blocks, txs_approved, txs_rejected, queue_size, peers}'
done
```

List the public dataspace lanes exposed by Taira:

```bash
curl -fsS https://taira.sora.org/status \
  | jq -r '.teu_lane_commit[]
    | [.lane_id, .alias, .dataspace_alias, .visibility, .storage_profile, .block_height]
    | @tsv'
```

Run the same command against Minamoto when you need the mainnet view:

```bash
curl -fsS https://minamoto.sora.org/status \
  | jq -r '.teu_lane_commit[]
    | [.lane_id, .alias, .dataspace_alias, .visibility, .storage_profile, .block_height]
    | @tsv'
```

Build a tiny Node.js status probe for a dashboard, bot, or deployment
check:

```bash
node --input-type=module <<'EOF'
const roots = {
  taira: 'https://taira.sora.org',
  minamoto: 'https://minamoto.sora.org',
};

for (const [name, root] of Object.entries(roots)) {
  const status = await fetch(`${root}/status`).then((res) => res.json());
  const publicSpaces = status.teu_lane_commit
    .filter((lane) => lane.visibility === 'public')
    .map((lane) => `${lane.dataspace_alias}:${lane.block_height}`)
    .join(', ');

  console.log(
    `${name}: ${status.blocks} blocks, ${status.queue_size} queued, public spaces ${publicSpaces}`,
  );
}
EOF
```

The first write-side toy should be a Taira faucet claim. It uses testnet
XOR and should never be pointed at Minamoto.

## 3. Create a Taira Client Config

Generate a keypair if you do not already have one:

```bash
kagami keys --algorithm ed25519 --json
```

Create `taira.client.toml`:

```toml
chain = "809574f5-fee7-5e69-bfcf-52451e42d50f"
torii_url = "https://taira.sora.org/"

[account]
domain = "wonderland.universal"
public_key = "<ED25519_PUBLIC_KEY_HEX>"
private_key = "<ED25519_PRIVATE_KEY_HEX>"
chain_discriminant = 369

[transaction]
time_to_live_ms = 100000
status_timeout_ms = 15000
nonce = false
```

Recent CLI builds infer the Taira `chain_discriminant` from the `chain`
value or from `taira.sora.org`, but keeping it explicit makes the config
portable across older builds.

Run a read-only check:

```bash
iroha --config ./taira.client.toml --output-format text ops sumeragi status
```

Run the public Taira diagnostics before write tests:

```bash
iroha taira doctor --public-root https://taira.sora.org --json
```

Fund the Taira account through the faucet before you run fee-paying writes.
The direct faucet flow is in
[Get Testnet XOR on Taira](#_4-get-testnet-xor-on-taira).

After the faucet claim is accepted and the account is funded, the Taira
canary is an optional write smoke test:

```bash
iroha --config ./taira.client.toml taira write-canary \
  --public-root https://taira.sora.org \
  --write-config ./taira.canary.client.toml \
  --json
```

The canary submits a signed ping, waits for confirmation, and writes the
runtime signer config when `--write-config` is provided. Taira is a public
testnet, so queue saturation can make the signed ping fail even when the
faucet itself works. If `taira doctor` reports a saturated queue or the
canary returns `PRTRY:NEXUS_FEE_ADMISSION_REJECTED`, wait and retry before
treating it as a client configuration error.

For unattended smoke tests, wrap the canary in a bounded retry loop:

```bash
ok=false
for attempt in 1 2 3 4 5; do
  iroha --config ./taira.client.toml taira write-canary \
    --public-root https://taira.sora.org \
    --write-config ./taira.canary.client.toml \
    --json && ok=true && break

  sleep 60
done

test "$ok" = true
```

Stop retrying if `iroha taira doctor` shows hard failures. Queue saturation
and fee-admission rejections are transient public-testnet conditions; DNS,
TLS, or `status = "fail"` diagnostics are not.

## Generate a SORA Nexus Account ID

A SORA Nexus account ID is a canonical I105 address derived from the
account public key and the target network prefix. It is not the
`[account].domain` value in client TOML. The same public key encodes to
different IDs on Taira and Minamoto, and production users should generate a
separate keypair for Minamoto.

Generate or load the Ed25519 keypair that will control the account:

```bash
kagami keys --algorithm ed25519 --json
```

Convert the public key into a Taira account ID:

```bash
iroha tools address convert --network-prefix 369 <ED25519_PUBLIC_KEY_HEX>
```

Convert a Minamoto public key with the mainnet prefix:

```bash
iroha tools address convert --network-prefix 753 <ED25519_PUBLIC_KEY_HEX>
```

Use the resulting account ID wherever a Nexus API or CLI command asks for a
canonical account ID, for example the Taira faucet `account_id`, balance
queries, strict account fields, or alias bindings. Keep the matching
private key in your client config, and keep `chain_discriminant` aligned
with the same prefix: `369` for Taira and `753` for Minamoto.

Generating the ID does not by itself create a funded on-chain account. On
Taira, the faucet can create and fund the account for testnet writes. On
Minamoto, use the approved mainnet onboarding, claim, or treasury flow.

### Key Storage and Backup

The account ID and public key can be shared. The matching private key,
passphrase, seed, and recovery material must be treated as secret.

Use these practices for SORA Nexus accounts:

- Store private keys in an encrypted password manager, hardware-backed
  keystore, or dedicated signing service. Do not commit keys to source
  control or leave production keys in shell history, logs, chat, tickets,
  or unencrypted backups.
- Use a unique high-entropy passphrase for each vault or production signer.
  Store passphrases in a password manager or split custody process, not in
  the same file or backup bundle as the encrypted private key.
- Keep Taira and Minamoto keys separate. Treat Taira keys as disposable
  testnet material and Minamoto keys as production funds authority.
- Back up the private key, public key, account ID, network prefix,
  `chain_discriminant`, and any account recovery or custody notes needed to
  restore the signer. A private key without the network context is easy to
  misuse during recovery.
- Keep at least one encrypted offline backup and one geographically
  separate encrypted backup for production signers. Test recovery with a
  small read-only operation before depending on the backup.
- Rotate or replace a signer if the private key, passphrase, backup media,
  or signing host may have been exposed.

For more detail, see
[Storing Cryptographic Keys](/guide/security/storing-cryptographic-keys.md)
and [Password Security](/guide/security/password-security.md).

## 4. Get Testnet XOR on Taira

Use the public faucet directly. The flow is:

1. Generate or load a signer and compute its canonical Taira account ID.
2. Fetch the current faucet puzzle.
3. Solve the puzzle if `difficulty_bits` is greater than `0`.
4. Submit the faucet claim.
5. Wait for the account or asset balance to become visible before sending
   fee-paying writes.

Convert a public key into the Taira I105 account ID expected by the faucet:

```bash
iroha tools address convert --network-prefix 369 <ED25519_PUBLIC_KEY_HEX>
```

Fetch the puzzle:

```bash
curl -fsS https://taira.sora.org/v1/accounts/faucet/puzzle | jq .
```

The response has this shape:

```json
{
  "algorithm": "scrypt-leading-zero-bits-v1",
  "difficulty_bits": 8,
  "anchor_height": 741,
  "anchor_block_hash_hex": "05d2...",
  "challenge_salt_hex": null,
  "scrypt_log_n": 13,
  "scrypt_r": 8,
  "scrypt_p": 1,
  "max_anchor_age_blocks": 6
}
```

When `difficulty_bits` is `0`, submit only the account ID:

```bash
curl -fsS https://taira.sora.org/v1/accounts/faucet \
  -H 'content-type: application/json' \
  -d '{"account_id":"<TAIRA_I105_ACCOUNT_ID>"}'
```

When `difficulty_bits` is greater than `0`, solve the puzzle and include
the anchor height plus nonce:

```bash
curl -fsS https://taira.sora.org/v1/accounts/faucet \
  -H 'content-type: application/json' \
  -d '{
    "account_id": "<TAIRA_I105_ACCOUNT_ID>",
    "pow_anchor_height": 741,
    "pow_nonce_hex": "<NONCE_HEX>"
  }'
```

The puzzle algorithm is:

1. Build the challenge as SHA-256 over:
   - the bytes of `iroha:accounts:faucet:pow:v2`
   - the UTF-8 account ID
   - `anchor_height` as big-endian `u64`
   - `anchor_block_hash_hex` decoded as bytes
   - `challenge_salt_hex` decoded as bytes, when present
2. Try `u64` nonces encoded as big-endian 8-byte values.
3. For each nonce, run scrypt with:
   - password: the 8-byte nonce
   - salt: the 32-byte challenge
   - `N = 2^scrypt_log_n`
   - `r = scrypt_r`
   - `p = scrypt_p`
   - output length: 32 bytes
4. The winning nonce is the first digest with at least `difficulty_bits`
   leading zero bits.

The faucet response includes the funded asset and queued transaction hash:

```json
{
  "account_id": "<TAIRA_I105_ACCOUNT_ID>",
  "asset_definition_id": "6TEAJqbb8oEPmLncoNiMRbLEK6tw",
  "asset_id": "...",
  "amount": "25000",
  "tx_hash_hex": "...",
  "status": "QUEUED"
}
```

The response is currently returned with HTTP `202 Accepted`. The asset
definition ID above is the Taira fee asset funded by the public faucet. The
faucet has accepted the request when it returns `tx_hash_hex` and
`status: "QUEUED"`.

Then poll for the funded asset before submitting your own fee-paying
transactions:

```bash
iroha --config ./taira.client.toml ledger asset get \
  --definition 6TEAJqbb8oEPmLncoNiMRbLEK6tw \
  --account <TAIRA_I105_ACCOUNT_ID>
```

If the faucet claim was accepted but the account or asset is not visible
yet, the transaction is still behind public testnet queue processing. Wait
and retry the read before sending writes.

For a ready-to-run direct API check, save this as `taira_faucet_claim.py`
and pass the Taira I105 account ID:

```python
#!/usr/bin/env python3
import hashlib
import json
import sys
import urllib.request


def has_leading_zero_bits(digest: bytes, bits: int) -> bool:
    full, rem = divmod(bits, 8)
    if digest[:full] != b"\0" * full:
        return False
    return rem == 0 or digest[full] >> (8 - rem) == 0


root = "https://taira.sora.org"
account_id = sys.argv[1]

with urllib.request.urlopen(f"{root}/v1/accounts/faucet/puzzle") as res:
    puzzle = json.load(res)

claim = {"account_id": account_id}
difficulty = int(puzzle["difficulty_bits"])

if difficulty > 0:
    challenge = hashlib.sha256()
    challenge.update(b"iroha:accounts:faucet:pow:v2")
    challenge.update(account_id.encode())
    challenge.update(int(puzzle["anchor_height"]).to_bytes(8, "big"))
    challenge.update(bytes.fromhex(puzzle["anchor_block_hash_hex"]))
    if puzzle.get("challenge_salt_hex"):
        challenge.update(bytes.fromhex(puzzle["challenge_salt_hex"]))

    n = 1 << int(puzzle["scrypt_log_n"])
    r = int(puzzle["scrypt_r"])
    p = int(puzzle["scrypt_p"])
    salt = challenge.digest()

    for nonce in range(1_000_000):
        nonce_bytes = nonce.to_bytes(8, "big")
        digest = hashlib.scrypt(nonce_bytes, salt=salt, n=n, r=r, p=p, dklen=32)
        if has_leading_zero_bits(digest, difficulty):
            claim["pow_anchor_height"] = puzzle["anchor_height"]
            claim["pow_nonce_hex"] = nonce_bytes.hex()
            break
    else:
        raise SystemExit("faucet nonce not found")

request = urllib.request.Request(
    f"{root}/v1/accounts/faucet",
    data=json.dumps(claim).encode(),
    headers={"content-type": "application/json"},
    method="POST",
)

with urllib.request.urlopen(request) as res:
    print(json.dumps(json.load(res), indent=2))
```

The faucet is only for Taira testnet funds. Do not use testnet XOR, faucet
accounts, or Taira canary signers in Minamoto flows.

## 5. Create a Minamoto Client Config

Use a separate keypair for Minamoto. Do not reuse Taira keys for mainnet.

Create `minamoto.client.toml`:

```toml
chain = "00000000-0000-0000-0000-000000000753"
torii_url = "https://minamoto.sora.org/"

[account]
domain = "wonderland.universal"
public_key = "<ED25519_PUBLIC_KEY_HEX>"
private_key = "<ED25519_PRIVATE_KEY_HEX>"
chain_discriminant = 753

[transaction]
time_to_live_ms = 100000
status_timeout_ms = 15000
nonce = false
```

The explicit `chain_discriminant = 753` is important for Minamoto configs
until your CLI or SDK version maps `minamoto.sora.org` automatically.

Convert a Minamoto public key into its canonical I105 account ID with the
mainnet prefix:

```bash
iroha tools address convert --network-prefix 753 <ED25519_PUBLIC_KEY_HEX>
```

Run only read-side checks until the account is provisioned and funded
through the mainnet onboarding or governance flow:

```bash
iroha --config ./minamoto.client.toml --output-format text ops sumeragi status
```

Do not run the Taira faucet or write-canary helper against Minamoto.

## 6. Get Real XOR on Minamoto

Minamoto fees are paid with real XOR. Before submitting write transactions,
fund the configured Minamoto account with XOR through an approved mainnet
path.

First obtain XOR on SORA 2, then move it into Minamoto. Common mainnet
paths are:

- receive XOR from an existing funded SORA 2 account
- use [SORA Wallet](https://sora.org/wallet) to hold, receive, and swap
  supported SORA assets
- use [Polkaswap](https://sora.org/polkaswap) to swap supported assets into
  XOR on the SORA network

The SORA wiki describes XOR as the SORA network utility token used for
transaction fees, and the Polkaswap swap guide explains the normal
source-asset to destination-asset swap flow. Check route, slippage, and
fees before signing. This documentation does not recommend a specific
exchange, bridge, or trade size.

After you have XOR on SORA 2, use the burn-backed Minamoto launch path
documented in the
[SORA Nexus Minamoto Mainnet Launch](https://sora-xor.medium.com/sora-nexus-minamoto-mainnet-launch-5ef2819a5deb)
post:

1. Burn XOR on SORA 2 using the published burn interface:
   `https://bafybeicmlt7f757a64kw2tzmtnmlgpahs7dlmu3nmjssjbbywre6x3nvr4.ipfs.dweb.link/#/burn`
2. Use only burns from SORA 2 block `25,867,650` onward for the Minamoto
   claim flow.
3. Claim the burned XOR on Minamoto through the SORAFS claim application:
   `https://minamoto.sora.org/claim`
4. Send a small read-side or balance check first, then use the funded
   account for fee-paying writes.

You can also receive real Minamoto XOR from an existing funded Minamoto
account or an approved operational treasury. Treat Minamoto XOR like
production funds: test on Taira first, keep separate keys, and do not
assume transactions can be reset.

Do not treat the Taira faucet as a real-XOR source. Testnet XOR cannot pay
Minamoto fees and cannot be upgraded into mainnet XOR.

## 7. Work Inside an Existing Dataspace

Use fully qualified domain names for ledger objects that live inside a
dataspace. For example, a project domain in the public dataspace should
use:

```text
apps.universal
```

After your account has the required permissions, register the domain:

```bash
iroha --config ./taira.client.toml ledger domain register --id apps.universal
```

Use the Minamoto config only when the same write is approved for mainnet:

```bash
iroha --config ./minamoto.client.toml ledger domain register --id apps.universal
```

Account aliases use the same dataspace suffix:

```text
alice@apps.universal
alice@universal
```

Strict account fields still use canonical I105 account IDs. Treat aliases
as human-readable bindings that resolve to canonical account IDs.

## 8. Provision a New Dataspace

A new dataspace is an operator and governance change. The public Torii
endpoint can route traffic to configured dataspaces, but it will reject
unknown dataspace aliases.

Before preparing a change, capture the current live catalog:

```bash
curl -fsS https://taira.sora.org/status \
  | jq '.teu_lane_commit[] | {lane_id, alias, dataspace_id, dataspace_alias, visibility}'
```

For an operator account, also check the lane manifest posture:

```bash
iroha --config ./operator.client.toml app nexus lane-report --summary
```

Do not promote a new alias unless the lane ID, dataspace ID, validator set,
fault tolerance, manifest, routing rules, and operational owner have been
reviewed together. A normal user account can register domains inside an
existing dataspace; it cannot safely add a new public dataspace.

For a private or organizational dataspace, prepare a catalog change with:

- a unique dataspace alias and numeric `id`
- a matching lane entry or an existing lane assignment
- the dataspace `fault_tolerance`
- routing rules for the instructions or account scopes that should land
  there
- a Space Directory manifest or equivalent rollout evidence, when the
  dataspace exposes UAID capabilities
- governance approval for validator, compliance, settlement, and monitoring
  policy

A reviewable config fragment looks like this:

```toml
[[nexus.lane_catalog]]
index = 5
alias = "payments"
description = "Payments lane"
dataspace = "payments"
visibility = "public"
metadata = {}

[[nexus.dataspace_catalog]]
alias = "payments"
id = 20
description = "Payments dataspace"
fault_tolerance = 1

[[nexus.routing_policy.rules]]
lane = 5
dataspace = "payments"
[nexus.routing_policy.rules.matcher]
account_prefix = "payments."
description = "Route payments domains to the payments dataspace"
```

Operator acceptance should include these gates:

- `irohad --sora --config <config.toml> --trace-config` passes on the
  resolved node configuration
- the generated or reviewed manifest is archived with hashes and signatures
- smoke tests pass on Taira before any Minamoto promotion
- the post-change `/status` catalog shows the intended lane and dataspace
- `iroha app nexus lane-report --summary` does not report missing required
  manifests

```bash
curl -fsS https://taira.sora.org/status \
  | jq '.teu_lane_commit[] | select(.dataspace_alias == "payments")'
```

Promote the same dataspace to Minamoto only after the Taira deployment,
smoke tests, monitoring, and governance evidence are complete.

## Related Pages

- [Install Iroha 3](/get-started/install-iroha-2.md)
- [Operate Iroha 3 via CLI](/get-started/operate-iroha-2-via-cli.md)
- [Sponsor fees for a private dataspace](/get-started/private-dataspace-fee-sponsor.md)
- [Torii endpoints](/reference/torii-endpoints.md)
- [Genesis reference](/reference/genesis.md)
- [SORA Taira Testnet](https://medium.com/sora-xor/sora-taira-testnet-be8cfc924b58)
- [SORA Nexus Minamoto Mainnet Launch](https://sora-xor.medium.com/sora-nexus-minamoto-mainnet-launch-5ef2819a5deb)
- [SORA Wallet](https://sora.org/wallet)
- [Polkaswap](https://sora.org/polkaswap)
- [SORA XOR token](https://wiki.sora.org/xor.html)
- [Swap on the SORA Network](https://wiki.sora.org/swap)
