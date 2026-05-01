# Accounts

An account is an authority that can sign transactions and own ledger state.
In the current Iroha 3 data model, `AccountId` is canonical and domainless:
it is derived from the account controller rather than from an `account@domain`
string.

## Structure

A registered `Account` contains:

- `id`: the canonical `AccountId`
- `metadata`: arbitrary account metadata
- `label`: an optional stable alias
- `uaid`: an optional Universal Account ID used by Nexus flows
- `opaque_ids`: opaque identifiers bound to the account's UAID

The transaction payload used to create an account is `NewAccount`. It carries
the same identity, metadata, label, UAID, and opaque ID fields used by the
registered account.

`uaid` complements the canonical `AccountId`; it does not replace it. Use it
when Nexus services need a stable user or organization handle across
dataspaces, privacy-preserving enrollment, or service capability lookup. The
runtime keeps a one-to-one UAID-to-account index, requires opaque identifiers
to be attached through a UAID, and rejects duplicate or colliding opaque
identifiers. See
[FHE and UAID](/blockchain/sora-nexus-services.md#fhe-and-uaid) for the Nexus
service-layer flow.

## Account controllers

The controller defines how the account authorizes actions. The default client
flow uses an Ed25519 key pair, but the data model also supports richer
controllers such as multisignature policy controllers.

Client configuration stores the signing authority separately from peer
configuration:

```toml
[account]
public_key = "ed0120..."
private_key = { digest_function = "ed25519", payload = "..." }
```

See [client configuration](/guide/configure/client-configuration.md) and
[key generation](/guide/security/generating-cryptographic-keys.md) for the
current key formats.

## Try It on Taira

List a few canonical account IDs from the public Taira testnet:

```bash
curl -fsS 'https://taira.sora.org/v1/accounts?limit=5' \
  | jq -r '.items[] | [.id, (.primary_alias // "-")] | @tsv'
```

To inspect account assets, copy an account ID from the first call and URL-encode
it before placing it in the path. This Python snippet does that for the first
listed account:

```bash
python3 - <<'PY'
import json
import urllib.parse
import urllib.request

root = "https://taira.sora.org"
accounts = json.load(urllib.request.urlopen(f"{root}/v1/accounts?limit=1"))["items"]
account_id = accounts[0]["id"]
encoded = urllib.parse.quote(account_id, safe="")
assets = json.load(
    urllib.request.urlopen(f"{root}/v1/accounts/{encoded}/assets?limit=5")
)

print(json.dumps({"account_id": account_id, "assets": assets["items"]}, indent=2))
PY
```

These are public reads. Creating or updating an account is a signed transaction
and requires the faucet-funded Taira setup described in
[Connect to SORA Nexus Dataspaces](/get-started/sora-nexus-dataspaces.md).

## Registration and permissions

Accounts are registered and unregistered with the generic
[`Register` and `Unregister`](/blockchain/instructions.md#un-register)
instructions. The active runtime validator decides who can create accounts
and which permission tokens or roles are required.

After registration, an account can:

- sign transactions
- hold assets
- own domains
- receive roles and permission tokens
- store metadata
- participate in alias, rekey, recovery, and Nexus identity flows when those
  features are enabled

## Troubleshooting identity issues

If a transaction is rejected unexpectedly, check that:

- the client public key matches the private key used for signing
- the account was registered in genesis or by a committed transaction
- the authority has the permissions required by the instruction
- scripts are not using old `account@domain` literals where a canonical
  account address is required

See also:

- [Permissions](/blockchain/permissions.md)
- [Metadata](/blockchain/metadata.md)
- [Client configuration](/guide/configure/client-configuration.md)
- [SORA Nexus dataspaces](/get-started/sora-nexus-dataspaces.md)
