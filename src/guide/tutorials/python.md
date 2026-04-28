# Python

The Python SDK in the upstream workspace is `iroha-python`. It targets the
current Torii and Norito surfaces. Treat it as a fast-moving preview SDK and
pin the package version or source revision used by your integration.

## Install

```bash
pip install iroha-python
```

## Quickstart

```python
from iroha_python import (
    ToriiClient,
    Instruction,
    derive_ed25519_keypair_from_seed,
)

pair = derive_ed25519_keypair_from_seed(b"demo-seed")
authority = pair.default_account_id("wonderland")
instruction = Instruction.register_domain("wonderland")

client = ToriiClient("http://127.0.0.1:8080", auth_token="dev-token")
envelope, status = client.build_and_submit_transaction(
    chain_id="local",
    authority=authority,
    private_key=pair.private_key,
    instructions=[instruction],
    wait=True,
)

print(status)
```

## Current Coverage

The Python SDK already includes helpers for:

- Torii submission and query flows
- typed instruction builders
- streaming events and cursors
- offline allowances
- subscriptions
- account address handling

## Upstream References

- `python/iroha_python/README.md`
- `python/iroha_python/DESIGN.md`

Those files track the current Python surface more accurately than the older
Iroha 2-era examples that used the `iroha2` package name.
