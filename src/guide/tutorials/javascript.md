# JavaScript/TypeScript Guide

**TBA**

::: info

This guide is being revised. For the time being, please consult the up-to-date [JavaScript SDK reference](https://jsr.io/@iroha).

:::

<!-- TODO: update 
## 1. Client Installation

The Iroha 2 JavaScript library consists of multiple packages:

| Package                                                   | Description                                                                                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`                                                  | Submits requests to Iroha Peer                                                                                                                     |
| `data-model`                                              | Provides [SCALE](https://github.com/paritytech/parity-scale-codec) (Simple Concatenated Aggregate Little-Endian)-codecs for the Iroha 2 Data Model |
| `crypto-core`                                             | Contains cryptography types                                                                                                                        |
| `crypto-target-node`                                      | Provides compiled crypto WASM ([Web Assembly](https://webassembly.org/)) for the Node.js environment                                               |
| `crypto-target-web`                                       | Provides compiled crypto WASM for native Web (ESM)                                                                                                 |
| <code class="whitespace-pre">crypto-target-bundler</code> | Provides compiled crypto WASM to use with bundlers such as Webpack                                                                                 |

All of these are published under the `@iroha2` scope into Iroha Nexus
Registry. In the future, they will be published in the main NPM Registry.

::: info

You can also work with the sources in Iroha Javascript repository, where
the active development is happening. Clone the repository and check out the
`iroha2` branch:

```bash
$ git clone https://github.com/hyperledger-iroha/iroha-javascript.git --branch iroha2
```

Please note that this guide does not cover the details of this workflow.

:::

While we've taken great care to decouple the packages, so you could
minimise their footprint, for the purposes of this tutorial, it's better to
install everything.

The installation consists of two steps: setting up a registry and then
installing the packages you need.

1. Set up a registry. In shell, run:

   ```bash
   $ echo "@iroha2:registry=https://nexus.iroha.tech/repository/npm-group/" > .npmrc
   ```

2. Install Iroha 2 packages as any other NPM package. If you are following
   the tutorial, we recommend installing all of the following:

   ```bash
   $ npm i @iroha2/client
   $ npm i @iroha2/data-model
   $ npm i @iroha2/crypto-core
   $ npm i @iroha2/crypto-target-node
   $ npm i @iroha2/crypto-target-web
   $ npm i @iroha2/crypto-target-bundler
   ```

   ::: info

   Note that you can use other package managers, such as
   [yarn](https://yarnpkg.com) or [pnpm](https://pnpm.io), for a faster
   installation. For example:

   ```bash
   $ yarn add @iroha2/data-model
   $ pnpm add @iroha2/crypto-target-web
   ```

   :::

   The set of packages that you need to install depends on what you are
   trying to achieve. If you only need to play with the Data Model to
   perform (de-)serialisation, the `data-model` package is sufficient. If
   you need to check on a peer in terms of its status or health, then you
   only need the client library.

3. Install the following packages as well:

   ```bash
   $ npm i hada
   $ npm i tsx -g
   ```

4. If you are planning to use the Transaction or Query API, you'll also
   need to inject an appropriate `crypto` instance into the client at
   runtime. This has to be adjusted according to your particular
   environment.

   For example, Node.js users need the following:

   <<<@/snippets/js-sdk-1-client-install.ts

   ::: info

   Please refer to the documentation of the respective
   `@iroha2/crypto-target-*` package, because each case has specific
   configuration steps. For example, the `web` target needs to be
   initialised (via asynchronous `init()`) before you can use any
   cryptographic methods.

   :::

::: info NOTE

When you are creating files in the following steps, you must place them in
the same directory that contains `node_modules`, like so:

```
╭───┬───────────────────┬──────╮
│ # │       name        │ type │
├───┼───────────────────┼──────┤
│ 0 │ node_modules      │ dir  │
│ 1 │ addClient.ts      │ file │
│ 2 │ example.ts        │ file │
│ 3 │ package.json      │ file │
│ 4 │ pnpm-lock.yaml    │ file │
│ 5 │ registerDomain.ts │ file │
╰───┴───────────────────┴──────╯
```

We recommend using [`tsx`](https://www.npmjs.com/package/tsx) to run the
scripts you've created. For example:

```bash
$ tsx example.ts
```

:::

## 2. Client Configuration

The JavaScript Client is fairly low-level in a sense that it doesn't expose
any convenience features like a `TransactionBuilder` or a `ConfigBuilder`.

::: info

The work on implementing those is underway, and these features will very
likely be available in the second round of this tutorial's release.

:::

Thus, on the plus side, configuration of the client is simple. On the
downside, you have to prepare a lot manually.

You may need to use transactions or queries, so before we initialize the
client, let's set up this part. Let's assume that you have stringified
public & private keys (more on that later). Thus, a key-pair generation
could look like this:

<<<@/snippets/js-sdk-2-1-1-key-pair.ts

When you have a key pair, you might create a `Signer` using the key pair:

<<<@/snippets/js-sdk-2-1-2-signer.ts

Now we're able to make signatures with `signer.sign(binary)`! However, to
interact with Iroha, we need to be able to do more than just sign. We would
need to send something to Iroha, like transactions or queries. `Torii` will
help us with that.

`Torii` handles HTTP / WebSocket communications with Iroha. We will use it
to communicate with Iroha endpoints. With the help of `Torii` we can:

- Submit transactions with `Torii.submit()`
- Send queries with `Torii.request()`
- Listen for events with `Torii.listenForEvents()`
- Listen for blocks stream with `Torii.listenForBlocksStream()`
- and so on

`Torii` is a stateless object, a compendium of methods. You can look at it
as if it is a class with only static methods. Each method has its own
_requirements_ to be passed in &mdash; some of them only need an HTTP
transport and Iroha Torii Telemetry URL, others &mdash; a WebSocket
transport and Iroha Torii API URL. To better understand how `Torii` is
used, look at this example:

<<<@/snippets/js-sdk-2-2-1-torii-usage-example.ts

In this example, we pass `fetch` (the HTTP transport) and `apiURL` as the
first parameter, and the query itself as the second.

To work with `Torii`, we need to know Iroha Torii URLs. Our Iroha Peer is
configured to listen for API endpoints at `http://127.0.0.1:8080` and for
telemetry endpoints at `http://127.0.0.1:8081`. Then, we need to provide
appropriate HTTP / WebSocket adapters which `Torii` will use[^1]. These
adapters depend on the environment in which you are going to use
`@iroha2/client`.

[^1]:
    We have to pass environment-specific `ws` and `fetch`, because there is
    no way for Iroha Client to communicate with a peer in an
    environment-agnostic way.

In Node.js, the full list of `Torii` requirements (i.e. covering all its
methods) will look like this:

<<<@/snippets/js-sdk-2-2-2-torii-pre-node.ts

::: tip

In the example above, we use
[`node-fetch`](https://www.npmjs.com/package/node-fetch) package which
implements [Fetch API](https://fetch.spec.whatwg.org/#fetch-method) in
Node.js. However, you can use
[`undici`](https://undici.nodejs.org/#/?id=undicifetchinput-init-promise)
as well.

:::

::: info

`fetch: nodeFetch as typeof fetch` type assertion is acceptable here for a
reason. `Torii` expects the "classic", native `fetch` function, which is
available natively in Browser. However, both `node-fetch` and `undici`
don't provide `fetch` that is 100% compatible with the native one. Since
`Torii` doesn't rely on those corner-features that are partially provided
by `node-fetch` and `undici`, it's fine to ignore the TypeScript error
here.

:::

And here is a sample of full `Torii` in-Browser requirements:

<<<@/snippets/js-sdk-2-2-3-torii-pre-web.ts

::: info NOTE

We make `fetch.bind(window)` to avoid
`TypeError: "'fetch' called on an object that does not implement interface Window."`.

:::

Great! Now we have `signer` and `Torii` requirements to work with. Finally,
we can create a `Client`:

<<<@/snippets/js-sdk-2-3-client.ts

`Client` provides useful utilities for transactions and queries. You can
also use `Torii` to communicate with the endpoints directly. `Signer` is
accessible with `client.signer`.

## 3. Registering a Domain

Here we see how similar the JavaScript code is to the Rust counterpart. It
should be emphasised that the JavaScript library is a thin wrapper: It
doesn't provide any special builder structures, meaning you have to work
with bare-bones compiled Data Model structures and define all internal
fields explicitly.

Doubly so, since JavaScript employs many implicit conversions, we highly
recommend that you employ TypeScript. This makes many errors far easier to
debug, but, unfortunately, results in more boilerplates.

Let's register a new domain named `looking_glass` using our current
account, _alice@wondeland_.

First, we need to import necessary models and a pre-configured client
instance:

<<<@/snippets/js-sdk-3-register-domain.ts#pre

To register a new domain, we need to submit a transaction with a single
instruction: to register a new domain. Let's wrap it all in an async
function:

<<<@/snippets/js-sdk-3-register-domain.ts#reg-domain-fn

Which we use to register the domain like so:

<<<@/snippets/js-sdk-3-register-domain.ts#do-reg

We can also use Query API to ensure that the new domain is created. Let's
create another function that wraps that functionality:

<<<@/snippets/js-sdk-3-register-domain.ts#ensure-fn

Now you can ensure that domain is created by calling:

<<<@/snippets/js-sdk-3-register-domain.ts#do-ensure

## 4. Registering an Account

Registering an account is a bit more involved than registering a domain.
With a domain, the only concern is the domain name. However, with an
account, there are a few more things to worry about.

First of all, we need to create an `AccountId`. Note that we can only
register an account to an existing domain. The best UX design practices
dictate that you should check if the requested domain exists _now_, and if
it doesn't, suggest a fix to the user. After that, we can create a new
account named _white_rabbit_.

Imports we need:

<<<@/snippets/js-sdk-4-register-account.ts#imports

The `AccountId` structure:

<<<@/snippets/js-sdk-4-register-account.ts#account

Second, you should provide the account with a public key. It is tempting to
generate both it and the private key at this time, but it isn't the
brightest idea. Remember that _the white_rabbit_ trusts _you,
alice@wonderland,_ to create an account for them in the domain
_looking_glass_, **but doesn't want you to have access to that account
after creation**.

If you gave _white_rabbit_ a key that you generated yourself, how would
they know if you don't have a copy of their private key? Instead, the best
way is to **ask** _white_rabbit_ to generate a new key-pair, and give you
the public half of it.

<<<@/snippets/js-sdk-4-register-account.ts#pubkey

Only then do we build an instruction from it:

<<<@/snippets/js-sdk-4-register-account.ts#isi

Which is then wrapped in a transaction and submitted to the peer the same
way as in the previous section when we registered a domain.

## 5. Registering and minting assets

Iroha has been built with few
[underlying assumptions](/blockchain/assets.md) about what the assets need
to be in terms of their value type and characteristics (fungible or
non-fungible, mintable or non-mintable).

In JS, you can create a new asset with the following construction:

<<<@/snippets/js-sdk-5-1-register-asset.ts

Pay attention to the fact that we have defined the asset as
`Mintable('Not')`. What this means is that we cannot create more of `time`.
The late bunny will always be late, because even the super-user of the
blockchain cannot mint more of `time` than already exists in the genesis
block.

This means that no matter how hard the _white_rabbit_ tries, the time that
he has is the time that was given to him at genesis. And since we haven't
defined any time in the domain _looking_glass_ at genesis and defined time
in a non-mintable fashion afterwards, the _white_rabbit_ is doomed to
always be late.

If we had set `mintable: Mintable('Infinitely')` on our time asset, we
could mint it:

<<<@/snippets/js-sdk-5-2-mint-asset.ts

Again it should be emphasised that an Iroha 2 network is strongly typed.
You need to take special care to make sure that only unsigned integers are
passed to the `Value('U32', ...)` factory method. Fixed precision
values also need to be taken into consideration. Any attempt to add to or
subtract from a negative Fixed-precision value will result in an error.

## 6. Transferring assets

After minting the assets, you can transfer them to another account. In the
example below, Alice transfers to Mouse 100 units of `time` asset:

<<<@/snippets/js-sdk-6-transfer-assets.ts

## 7. Querying for Domains, Accounts and Assets

TODO

<<<@/snippets/js-sdk-7-querying.ts#intro

::: code-group

<<<@/snippets/js-sdk-7-querying.ts#domains [Domains]

<<<@/snippets/js-sdk-7-querying.ts#accounts [Accounts]

<<<@/snippets/js-sdk-7-querying.ts#assets [Assets]

:::

## 8. Visualizing outputs in Web UI

Finally, we should talk about visualising data. The Rust API is currently
the most complete in terms of available queries and instructions. After
all, this is the language in which Iroha 2 was built.

Let's build a small Vue 3 application that uses each API we've discovered
in this guide!

::: tip

In this guide, we are roughly recreating the project that is a part of
`iroha-javascript` integration tests. If you want to see the full project,
please refer to the
[`@iroha2/client-test-web` sources](https://github.com/hyperledger-iroha/iroha-javascript/tree/main/tests/browser).

:::

Our app will consist of 3 main views:

- Status checker that periodically requests peer status (e.g. current
  blocks height) and shows it;
- Domain creator, which is a form to create a new domain with specified
  name;
- Listener with a toggle to setup listening for events.

You can use this folder structure as a reference:

```
╭───┬──────────────────────────────╮
│ # │             name             │
├───┼──────────────────────────────┤
│ 0 │ App.vue                      │
│ 1 │ client.ts                    │
│ 2 │ components/CreateDomain.vue  │
│ 3 │ components/Listener.vue      │
│ 4 │ components/StatusChecker.vue │
│ 5 │ config.json                  │
│ 6 │ crypto.ts                    │
│ 7 │ main.ts                      │
╰───┴──────────────────────────────╯
```

::: code-group

<<<@/snippets/js-sdk-8-config.json [config.json]

<<<@/snippets/js-sdk-8-crypto.ts [crypto.ts]

<<<@/snippets/js-sdk-8-client.ts [client.ts]

<<<@/snippets/js-sdk-8-components-StatusChecker.vue [components/StatusChecker.vue]

<<<@/snippets/js-sdk-8-components-CreateDomain.vue [components/CreateDomain.vue]

<<<@/snippets/js-sdk-8-components-EventListener.vue [components/EventListener.vue]

<<<@/snippets/js-sdk-8-App.vue [App.vue]

<<<@/snippets/js-sdk-8-main.ts [main.ts]

:::

:::info

In `client.ts`, we import the configuration file like this:

```ts
import { client_config } from '../../config'
```

Note that you need to import the config in this way because this is how the
source code of this application works. You can interpret this line as
`import client_config from 'config.json'`.

:::

### Demo

Here is a small demo with the usage of this component:

<div class="border border-solid border-gray-300 rounded-md shadow-md">

![Demo of the sample Vue application](/img/sample-vue-app.gif)

</div>

## 9. Subscribing to Block Stream

You can use
[`/block/stream` endpoint](/reference/torii-endpoints.md#blocks-stream)
to send a subscription request for block streaming.

Via this endpoint, the client first provides the starting block number
(i.e. height) in the subscription request. After sending the confirmation
message, the server starts streaming all the blocks from the given block
number up to the current block, and continues to stream blocks as they are
added to the blockchain.

Here is an example of how to listen to the block stream:

<<<@/snippets/js-sdk-9-blocks-stream.ts
-->