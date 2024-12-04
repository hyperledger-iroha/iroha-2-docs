# Genesis Block

The **genesis block** is the first block in your blockchain. It's never
empty, even if `configs/peer/genesis.json` is. Here's an example:

::: details Genesis Block Example: alice@wonderland

<<< @/snippets/genesis.json

:::

The **genesis account** is specified in the
[`genesis` section of the peer configuration](/reference/peer-config/params#genesis) file.
This is the account that will submit the
genesis block. The genesis account is like a super user account that has
elevated privileges, but only during the genesis round. The genesis account
should be signed by one of the peers, or, in other words, it should have
the public key of this peer.

If you look at the example of a genesis block above, you will see that it
contains instructions for registering a new domain (`wonderland`), two new
accounts (`alice@wonderland` and `bob@wonderland`), a new asset
(`rose#wonderland`) and a `Mint` instruction for this asset, as well as
several permission tokens and roles. Both new accounts are signed with the
`ed01207233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0`
public key.

::: info Note

Iroha is **case-sensitive**, meaning that _Alice_@wonderland is different
from _alice_@wonderland. It should go without saying that
_alice@wonderland_ is not the same as _alice@looking_glass_ either, since
these accounts belong to different domains, `wonderland` and
`looking_glass`.

:::

The accounts registered in the genesis block are just new accounts. As we
said above, the **genesis account** is determined in the peer
configuration. However, you can use the matching signature for the genesis
account and for a new account in the genesis block. Since the genesis
account only has privileges during the genesis round, it won't be a
security issue.

You can generate the default genesis block or create a custom one.

If you need to recommit a genesis block, remove the previously stored
blocks, then restart the Docker container. The new genesis block will be
automatically recommited upon container restart.

## Generation

You can add various instructions to the genesis block, such as registering
new accounts or assets, as well as minting assets. You can also register
permission tokens and roles, as well as grant them to the registered
accounts.

### Generate default genesis block

You can use `kagami` to generate the default genesis block:

- Generate a genesis block in JSON format:

  ```bash
  $ kagami genesis
  ```

- Generate a genesis block in JSON format and write the output to the
  specified file:

  ```bash
  $ kagami genesis > genesis.json
  ```

- Generate a synthetic genesis block in JSON format and write the `n`
  domains, `m` accounts per domain and `p` assets per domain:

  ```bash
  $ kagami genesis --synthetic --domains n --accounts-per-domain m --assets-per-domain p
  ```

The genesis block should be located in `configs/peer/genesis.json`.
