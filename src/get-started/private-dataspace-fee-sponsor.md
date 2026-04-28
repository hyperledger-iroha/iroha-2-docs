# Sponsor Fees for a Private Dataspace

Fee sponsorship lets users submit private-dataspace transactions without
holding XOR. The user still signs the transaction. The transaction metadata
points at a sponsor account, and the runtime debits the sponsor's XOR balance
for the network fee.

The integration has three moving parts:

1. the node allows fee sponsorship
2. the sponsor account exists and has XOR
3. each user has `CanUseFeeSponsor` for that sponsor

After that, every sponsored user transaction only needs this metadata:

```json
{
  "fee_sponsor": "<SPONSOR_ACCOUNT_I105>"
}
```

This page shows two common patterns:

- **Free user writes**: the sponsor pays XOR and the user pays nothing.
- **Local-token fees**: the user pays the sponsor in an app token, and the
  sponsor pays the network in XOR.

Use Taira or a private test network first. A new private dataspace is an
operator and governance change; it is not created by client configuration.

## Example Values

The commands below use these placeholders:

```bash
export DATASPACE="team"
export USER="<USER_ACCOUNT_I105>"
export SPONSOR="<SPONSOR_ACCOUNT_I105>"
export TREASURY="<TREASURY_ACCOUNT_I105>"
export XOR_ASSET="xor#universal"
export BILLING_DOMAIN="billing.team"
export LOCAL_FEE_ASSET="usage#billing.team"
export LOCAL_FEE_ASSET_ID="<LOCAL_FEE_ASSET_DEFINITION_BASE58>"
export USER_ALIAS="alice@team"
export PHONE_POLICY="phone#team"
export EMAIL_POLICY="email#team"
export POLICY_OWNER="<IDENTIFIER_POLICY_OWNER_ACCOUNT_I105>"
```

Use canonical I105 account IDs unless your deployment has active account
aliases for the same accounts.

## 1. Prepare the Dataspace

Start from the private dataspace catalog and routing work described in
[Connect to SORA Nexus Dataspaces](/get-started/sora-nexus-dataspaces.md#_8-provision-a-new-dataspace).
An operator-facing fragment looks like this:

```toml
[[nexus.lane_catalog]]
index = 5
alias = "team-private"
description = "Private team lane"
dataspace = "team"
visibility = "private"
metadata = {}

[[nexus.dataspace_catalog]]
alias = "team"
id = 42
description = "Private team dataspace"
fault_tolerance = 1

[[nexus.routing_policy.rules]]
lane = 5
dataspace = "team"
[nexus.routing_policy.rules.matcher]
account_prefix = "team."
description = "Route team domains to the private dataspace"
```

Before moving to user transactions, check that:

- the private lane appears in the node `/status` response
- user accounts are admitted by your private onboarding flow
- the sponsor account exists
- the XOR fee asset and fee sink account are valid on the network

## 2. Register Assets in the Dataspace

Register the asset definitions that users will hold inside the private
dataspace before you wire them into application logic. For the local-token fee
pattern, the tutorial uses `usage#billing.team`:

```text
<asset-name>#<domain>.<dataspace>
usage#billing.team
```

First register the domain that owns the asset namespace:

```bash
iroha --config ./operator.client.toml \
  ledger domain register --id "$BILLING_DOMAIN"
```

Then register the asset definition. The canonical `--id` is the network-level
asset definition ID. The alias is what developers and end users should use in
dataspace code:

```bash
iroha --config ./operator.client.toml \
  ledger asset definition register \
  --id "$LOCAL_FEE_ASSET_ID" \
  --name usage \
  --alias "$LOCAL_FEE_ASSET" \
  --scale 0
```

Mint or transfer the local token to a user during onboarding:

```bash
iroha --config ./operator.client.toml \
  ledger asset mint \
  --definition-alias "$LOCAL_FEE_ASSET" \
  --account "$USER" \
  --quantity 100
```

Check the user's balance:

```bash
iroha --config ./operator.client.toml \
  ledger asset get \
  --definition-alias "$LOCAL_FEE_ASSET" \
  --account "$USER"
```

Use the same pattern for application assets in the dataspace. Register one
asset definition per token, give each one a dataspace alias, and refer to the
alias from SDK code instead of hard-coding canonical asset definition IDs.

## 3. Register User Aliases

Accounts are still canonical I105 account IDs. User-facing names are account
aliases, and aliases should be non-sensitive handles such as `alice@team` or
`alice@members.team`. Do not use phone numbers or email addresses as aliases.
Those belong in the private identifier flow in the next section.

Alias registration is an instruction flow:

```text
AcquireAccountAliasLease(
  alias = "$USER_ALIAS",
  owner = "$USER",
  payer = "$USER",
  term_years = 1,
  pricing_class_hint = null
)

SetPrimaryAccountAlias(
  account = "$USER",
  alias = "$USER_ALIAS",
  lease_expiry_ms = null
)
```

The current CLI exposes alias lookup helpers, but not a typed helper for
creating leases and bindings. Generate the `AcquireAccountAliasLease` and
`SetPrimaryAccountAlias` instructions with your SDK or onboarding service and
submit them as one transaction. If the user should not pay XOR, submit the
transaction with the same `fee_sponsor` metadata used later in this tutorial.

After the alias is bound, verify it from the CLI:

```bash
iroha --config ./operator.client.toml \
  app alias resolve --alias "$USER_ALIAS"

iroha --config ./operator.client.toml \
  app alias by-account \
  --account-id "$USER" \
  --dataspace "$DATASPACE"
```

For new account creation, prefer an onboarding service that builds
`NewAccount` with a stable `uaid` and, if needed, an initial `label`. The
simple `ledger account register --id` command only registers the canonical
account ID.

## 4. Register Phone and Email Privately with FHE

Use phone numbers and email addresses as private identifier claims, not public
aliases. The FHE-backed flow keeps raw identifiers out of account aliases,
transaction metadata, and world state:

1. the operator registers a RAM-LFE/FHE program policy for phone and email
2. the operator registers active identifier policies such as `phone#team` and
   `email#team`
3. the wallet normalizes the phone or email locally
4. the wallet sends the encrypted value to the resolver
5. the resolver returns an `IdentifierResolutionReceipt`
6. the user submits `ClaimIdentifier` with the receipt
7. the chain stores an opaque identifier and receipt hash, not the raw phone or
   email value

The operator-side policy setup is an SDK or service task. Build and submit
these instruction pairs for each identifier type:

```text
RegisterRamLfeProgramPolicy(
  program_id = "phone_team",
  owner = "$POLICY_OWNER",
  backend = "bfv-programmed-sha3-256-v1",
  verification_mode = "signed",
  commitment = "<HIDDEN_PROGRAM_POLICY_COMMITMENT>",
  resolver_public_key = "<RESOLVER_PUBLIC_KEY>"
)
ActivateRamLfeProgramPolicy(program_id = "phone_team")

RegisterIdentifierPolicy(
  id = "$PHONE_POLICY",
  owner = "$POLICY_OWNER",
  normalization = "PhoneE164",
  program_id = "phone_team",
  note = "Private phone registration for team dataspace"
)
ActivateIdentifierPolicy(policy_id = "$PHONE_POLICY")
```

Repeat it for email with:

```text
program_id = "email_team"
policy_id = "$EMAIL_POLICY"
normalization = "EmailAddress"
```

During onboarding, the wallet or backend should normalize locally:

```text
PhoneE164: "+15551234567"
EmailAddress: "alice@example.com"
```

After the sponsor metadata file is created in step 8, submit a user-signed
claim instruction with that metadata:

```text
ClaimIdentifier(
  account = "$USER",
  receipt = IdentifierResolutionReceipt {
    payload: {
      policy_id: "$PHONE_POLICY",
      opaque_id: "<OPAQUE_ACCOUNT_ID>",
      uaid: "<USER_UAID>",
      account_id: "$USER",
      ...
    },
    attestation: "<RESOLVER_SIGNATURE_OR_PROOF>"
  }
)
```

The current CLI does not expose typed commands for these identity
instructions. Generate serialized `InstructionBox` values with the SDK and
submit them through `ledger transaction stdin`:

```bash
printf '["<BASE64_CLAIM_IDENTIFIER_INSTRUCTION_BOX>"]\n' |
  iroha --config ./alice.client.toml \
    --metadata ./sponsored-fee.json \
    ledger transaction stdin
```

Keep these guardrails in the onboarding service:

- account aliases are human-readable handles only
- raw phone and email values never appear in aliases, metadata, logs, or
  transaction payloads
- the account has a `uaid` before it claims private identifiers
- receipts bind `policy_id`, `opaque_id`, `uaid`, `account_id`, and expiry
- resolver keys and hidden-program commitments are controlled by governance

## 5. Enable Sponsorship on the Node

Fee sponsorship is a node/runtime policy. Enable it in the Nexus fee config:

```toml
[nexus.fees]
fee_asset_id = "xor#universal"
fee_sink_account_id = "<FEE_SINK_ACCOUNT_I105_OR_ALIAS>"
base_fee = "0"
per_byte_fee = "0"
per_instruction_fee = "0.001"
per_gas_unit_fee = "0.00005"
sponsorship_enabled = true
sponsor_max_fee = "0"
```

`fee_asset_id` is the network fee asset. For SORA Nexus this is XOR. Use the
active XOR alias or canonical XOR asset definition ID exposed by your network.

`sponsor_max_fee = "0"` means there is no per-transaction sponsor cap. For
production, set a non-zero cap after you know the normal size and gas profile
of your dataspace transactions.

Restart or roll this config through your normal operator process.

## 6. Create and Fund the Sponsor

Generate a sponsor key pair if needed:

```bash
kagami keys --algorithm ed25519 --json
```

Convert the public key into the account format for your network:

```bash
iroha tools address convert \
  --network-prefix <CHAIN_DISCRIMINANT> \
  <SPONSOR_ED25519_PUBLIC_KEY_HEX>
```

Register the sponsor account through your private onboarding flow:

```bash
iroha --config ./operator.client.toml \
  ledger account register --id "$SPONSOR"
```

Fund the sponsor with XOR from a treasury, claim account, or another funded
account:

```bash
iroha --config ./treasury.client.toml \
  ledger asset transfer \
  --definition-alias "$XOR_ASSET" \
  --account "$TREASURY" \
  --to "$SPONSOR" \
  --quantity 1000
```

Check the sponsor's XOR balance:

```bash
iroha --config ./operator.client.toml \
  ledger asset get \
  --definition-alias "$XOR_ASSET" \
  --account "$SPONSOR"
```

## 7. Grant a User Access to the Sponsor

The sponsor must grant each user permission to charge fees to it. The grant is
what prevents users from naming arbitrary sponsor accounts.

Run this as the sponsor account, or as an operational account allowed by your
runtime policy:

```bash
printf '{
  "name": "CanUseFeeSponsor",
  "payload": {
    "sponsor": "%s"
  }
}\n' "$SPONSOR" |
  iroha --config ./sponsor.client.toml \
    ledger account permission grant --id "$USER"
```

For onboarding services, make this a normal account-provisioning step and log:

- user account
- sponsor account
- dataspace or application
- approval ticket or governance decision

To inspect a user's grants:

```bash
iroha --config ./operator.client.toml \
  ledger account permission list --id "$USER"
```

## 8. Attach Sponsor Metadata

Create a reusable metadata file:

```bash
printf '{
  "fee_sponsor": "%s"
}\n' "$SPONSOR" > sponsored-fee.json
```

Any write submitted with this metadata is charged to the sponsor:

```bash
iroha --config ./alice.client.toml \
  --metadata ./sponsored-fee.json \
  ledger transaction ping --msg "sponsored private-dataspace write"
```

For SDKs, attach the same transaction metadata object to the signed
transaction. The user signs the transaction with the user's key. The sponsor
does not sign every user transaction because the prior `CanUseFeeSponsor`
grant is the authorization.

## Pattern 1: Users Pay No Fees

Use this when the application or operator absorbs all network fees.

Developer checklist:

1. Keep the user's normal transaction payload unchanged.
2. Add transaction metadata with `fee_sponsor`.
3. Sign as the user.
4. Submit through the private dataspace route.

The user account does not need a XOR balance. The sponsor account must keep
enough XOR to cover the configured Nexus fees.

## Pattern 2: Users Pay a Local Token

Use this when users should not hold XOR, but the dataspace still wants an
internal app fee, credit spend, or quota token.

In this pattern, the local token is an application payment. It is not the
network fee asset. The sponsor still pays the network fee in XOR.

For example, use a local token in the private dataspace:

```text
usage#billing.team
```

Fund users with `usage#billing.team` during onboarding, subscription renewal,
or quota allocation. Then make the user transaction atomic:

1. transfer local tokens from the user to the sponsor
2. perform the requested app operation
3. include `fee_sponsor` metadata so the sponsor pays XOR

A minimal CLI smoke test is just the local-token transfer sponsored by XOR:

```bash
iroha --config ./alice.client.toml \
  --metadata ./sponsored-fee.json \
  ledger asset transfer \
  --definition-alias "$LOCAL_FEE_ASSET" \
  --account "$USER" \
  --to "$SPONSOR" \
  --quantity 1
```

For a real app, do not submit the local-token payment as a separate
best-effort transaction. Build one signed transaction containing both the
payment and the business instruction, or expose a contract entrypoint that
collects the local token before applying the business operation.

Keep conversion policy in your app or contract:

- which operation costs how many local token units
- how local token inflow maps to sponsor XOR top-ups
- what happens when user balance is too low
- what happens when sponsor XOR balance is too low

::: warning

Do not use `gas_asset_id` for the "local-token fee" pattern unless you want
the sponsor to be charged in that gas asset too. In the current runtime,
`fee_sponsor` also makes the sponsor the payer for configured pipeline-gas
asset debits. For local-token user fees, collect the token explicitly with a
transfer or contract rule.

:::

## Debug Failed Sponsored Transactions

Common rejection reasons usually point to one missing setup step:

| Error text | What to check |
| --- | --- |
| `fee sponsorship is disabled` | `nexus.fees.sponsorship_enabled` is still `false` on the node. |
| `fee sponsor is not authorized` | The user does not have `CanUseFeeSponsor` for this sponsor. |
| `fee asset ... is missing` | The sponsor does not hold the configured XOR fee asset. |
| `fee balance ... is insufficient` | Top up the sponsor's XOR balance. |
| `fee exceeds sponsor_max_fee` | Raise `sponsor_max_fee` or reduce transaction size/gas. |
| `invalid nexus fee asset id` | Fix `nexus.fees.fee_asset_id` or the XOR asset alias. |

When debugging pattern 2, check both balances:

```bash
iroha --config ./operator.client.toml \
  ledger asset get \
  --definition-alias "$XOR_ASSET" \
  --account "$SPONSOR"

iroha --config ./operator.client.toml \
  ledger asset get \
  --definition-alias "$LOCAL_FEE_ASSET" \
  --account "$USER"
```

## Operate the Sponsor

Treat the sponsor as a treasury account:

- keep separate sponsor keys for testnet, staging, and mainnet
- alert before the sponsor XOR balance reaches the admission floor
- set a non-zero `sponsor_max_fee` cap once traffic is characterized
- rate-limit sponsored writes in your application or gateway
- revoke `CanUseFeeSponsor` when users leave the dataspace
- reconcile user transaction hashes, local-token payments, and sponsor XOR
  debits

Revoke sponsorship for a user:

```bash
printf '{
  "name": "CanUseFeeSponsor",
  "payload": {
    "sponsor": "%s"
  }
}\n' "$SPONSOR" |
  iroha --config ./sponsor.client.toml \
    ledger account permission revoke --id "$USER"
```

## Related Pages

- [Connect to SORA Nexus Dataspaces](/get-started/sora-nexus-dataspaces.md)
- [Operate Iroha 3 via CLI](/get-started/operate-iroha-2-via-cli.md)
- [Assets](/blockchain/assets.md)
- [Permissions](/blockchain/permissions.md)
- [Permission Tokens](/reference/permissions.md)
