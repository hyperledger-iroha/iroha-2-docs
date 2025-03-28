# Operate Iroha 2 via CLI

You can perform most operations in an Iroha 2 network using the Iroha Client CLI. This tutorial guides you through setting it up, configuring it, and executing basic operations on the network.

## 1. Set Up Iroha Client CLI

::: info

To set up the Iroha Client CLI, an instance of the Iroha network must be [launched and operational](./launch-iroha-2.md).

:::

Create a new directory and copy the `client.toml` configuration file there:

```bash
$ cp path_to_iroha_repo/defaults/client.toml path_to_new_directory/
```

## 2. Configure Iroha Client CLI

1. Navigate to the directory with the copied `client.toml` configuration file.

2. Run the Iroha Client CLI:

   ```bash
   $ iroha
   ```

   ::: details Expected result

   ```bash
    Iroha Client CLI provides a simple way to interact with the Iroha Web API

    Usage: iroha [OPTIONS] <COMMAND>

    Commands:
      domain         Read and write domains
      account        Read and write accounts
      asset          Read and write assets
      nft            Read and write NFTs
      peer           Read and write peers
      events         Subscribe to events: state changes, transaction/block/trigger progress
      blocks         Subscribe to blocks
      multisig       Read and write multi-signature accounts and transactions
      query          Read various data
      transaction    Read transactions and write various data
      role           Read and write roles
      parameter      Read and write system parameters
      trigger        Read and write triggers
      executor       Read and write the executor
      markdown-help  Output CLI documentation in Markdown format
      help           Print this message or the help of the given subcommand(s)

    Options:
      -c, --config <PATH>    Path to the configuration file [default: client.toml]
      -v, --verbose          Print configuration details to stderr
      -m, --metadata <PATH>  Path to a JSON5 file for attaching transaction metadata (optional)
      -i, --input            Reads instructions from stdin and appends new ones
      -o, --output           Outputs instructions to stdout without submitting them
      -h, --help             Print help (see more with '--help')
      -V, --version          Print version

   ```

   :::

By default, the Iroha Client searches for a configuration in the `client.toml` file located in its current working directory. We already copied it there, so we're all set.

::: tip

To run any of the Iroha client commands with some other configuration file, use the following syntax:

```bash
$ iroha --config path/to/client.toml <COMMAND>
```

This is a _non-persistent configuration_: each time you run `iroha`, you must add the `--config path/to/client.toml` command-line argument, unless the `client.toml` config file is in the working directory.

:::

The account specified in the `[account]` section of `client.toml` is preregistered in the default [genesis block](/guide/configure/genesis) of the blockchain. Only it can interact with the blockchain for now. If you change the keys or the domain of the account in the configuration file, make sure that they are preregistered on the blockchain too.

To check that a configuration works, run the following query:

```bash
$ iroha domain list all
```

The output should contain several preregistered domains.

::: details Expected result

```json
[
  "garden_of_live_flowers",
  "genesis",
  "wonderland"
]

```

:::


## 3. Register a Domain

::: info

A _domain_ is a group of entities like asset definitions, accounts, and other objects grouped logically. These are described in greater detail in the [Iroha Explained](/blockchain/iroha-explained) section of the documentation.

:::

To register a new domain, run:

```bash
$ iroha domain register --id="looking_glass"
```

Once executed, a confirmation message appears. However, since the details of the new domain are not directly readable in that message, to confirm that you have successfully created the new `looking_glass` domain, run:

```bash
$ iroha domain list all
```

::: details Expected result

```json
[
  "garden_of_live_flowers",
  "genesis",
  "looking_glass",
  "wonderland"
]
```

Note that the owner of the new domain is the account specified in our config file. They performed the registration.

:::

With a domain available, it is time to register an account in it.

## 4. Register an Account

To register a new account, you need a cryptographic key pair consisting of a _public_ and a _private_ key. You will use it to establish a secure communication channel between yourself and the network.

For users' convenience, Iroha comes with `kagami`, a built-in key generator tool. To generate a new key pair with `kagami`, run the following command:

```bash
$ kagami crypto
```

::: tip

To customize the generated keys, you can specify a number of parameters. For instance, `kagami` can use one of four available algorithms to generate cryptographic keys.

To learn more about generating cryptographic keys with `kagami`, available algorithms, and other parameters, see [Generating Cryptographic Keys with Kagami](/guide/security/generating-cryptographic-keys.md#kagami)

:::

For the purposes of this tutorial, we iuse the following key pair:

```bash
Public key (multihash): "ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379"
Private key (multihash): "802620CBD3D701B561FE98463767729176404DC757D690F78980B8FDD40C171CCB8EB5"
```

To register a new account within the `looking_glass` domain, run:

```bash
$ iroha account register --id="ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass"
```

The `--id` argument in the above code snippet specifies the _account id_, the unique identifier of the account. It consists of the user public key (generated using `kagami`) and the domain it is associated with.

If the account registration is successful, you receive a confirmation message. Similar to the domain registration, to confirm that you have successfully created a new account within the `looking_glass` domain, run:

```bash
$ iroha account list all
```

::: details Expected result

```json
[
  "ed0120E9F632D3034BAB6BB26D92AC8FD93EF878D9C5E69E01B61B4C47101884EE2F99@garden_of_live_flowers",
  "ed01204164BF554923ECE1FD412D241036D863A6AE430476C898248B8237D77534CFC4@genesis",
  "ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass",
  "ed012004FF5B81046DDCCF19E2E451C45DFB6F53759D4EB30FA2EFA807284D1CC33016@wonderland",
  "ed0120CE7FA46C9DCE7EA4B125E2E36BDB63EA33073E7590AC92816AE1E861B7048B03@wonderland"
]
```
:::

## 5. Transfer a Domain

The account we just created is part of the `looking_glass` domain but doesn't own it, so it can't manage the domain. To enable this, we'll transfer `looking_glass` ownership to our new account.

We could change the keys and domain in `client.toml` at this point and continue working with the account we just created, but we wouldn't be able to do much in the `looking_glass` domain, as our new account is not the owner of the `looking_glass` domain, and therefore cannot manage it.

To transfer a domain, perform the following:

1. Run the transfer command:

   ```bash
   $ iroha domain transfer --id="looking_glass" --from "ed0120CE7FA46C9DCE7EA4B125E2E36BDB63EA33073E7590AC92816AE1E861B7048B03@wonderland" --to "ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass"
   ```

2. Check that the ownership changed:

   ```bash
   $ iroha domain get --id looking_glass
   ```
  
  ::: details Expected result

    ```json
    {
      "id": "looking_glass",
      "logo": null,
      "metadata": {},
      "owned_by": "ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass"
    }

    ```
  :::

3. Switch to the newly created account. For this, we need to modify the `public_key`, `private_key`, and `domain` in the `client.toml` config file with the credentials of the user we want to act as.

Note that here the domain of the user that we are switching to matches the one we just transferred. However, this is not a requirement. A user may be registered in one domain and own multiple others. When setting the domain in the configuration file, always use the one that your user is registered with.

::: details Expected result

The `account` section of your updated `client.toml` file:

```toml
[account]
domain = "looking_glass"
public_key = "ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379"
private_key = "802620CBD3D701B561FE98463767729176404DC757D690F78980B8FDD40C171CCB8EB5"
```

:::

::: tip
[Permissions](/blockchain/permissions) determine accounts rights within Iroha. Domain owners have the most rights in a domain by default, but permission configuration in Iroha is very flexible and can be customized to your needs.
:::

Now that we control the domain, we can define and manage assets in it.

## 6. Register and Mint Assets

To mint an asset, its [asset definition](/blockchain/assets) must be registered first.

To register a `tea` token within the `looking_glass` domain, run:

```bash
$ iroha asset definition register --id="tea#looking_glass"
```

The `tea` asset is now registered within the `looking_glass` domain.

If you open the terminal where the Iroha network runs, you will see that all our activity caused numerous pipeline events there.

To mint `tea` tokens run:

```bash
$ iroha asset mint --id="tea##ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass" --quantity="100"
```

After minting one hundred `tea`, more pipeline events are expected, and you can also query the assets that you have just minted:

```bash
$ iroha asset list all
```

::: details Expected result

```json
[
  "tea##ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass",
  "cabbage#garden_of_live_flowers#ed0120CE7FA46C9DCE7EA4B125E2E36BDB63EA33073E7590AC92816AE1E861B7048B03@wonderland",
  "rose##ed0120CE7FA46C9DCE7EA4B125E2E36BDB63EA33073E7590AC92816AE1E861B7048B03@wonderland"
]
```
:::


## 7. Transfer Assets

After minting the assets, you can transfer some of your `tea` to another account:

```bash
$ iroha asset transfer --to="ed0120CE7FA46C9DCE7EA4B125E2E36BDB63EA33073E7590AC92816AE1E861B7048B03@wonderland" --id="tea##ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass"  --quantity=33
```

## 8. Burn Assets

Burning assets is quite similar to minting them:

```bash
$ iroha asset burn --id="tea##ed0120ABA0446CFBD4E12627FFA870FB37993ED83EB1AE0588184B90D832A64C24C379@looking_glass" --quantity="15"

```

## 9. Visualize Outputs

Although you will get a constant data feed of the network within the terminal running `docker compose`, you can also configure an output to listen to events of several types on the network: blocks generation, transactions, data events and triggers.

We will set up an event listener for the block pipeline.

From a new terminal tab/window run:

```bash
$ iroha events block
```

::: details Expected result

```json
Listening to events with filter: Pipeline(Block(BlockEventFilter { height: None, status: None }))
{
  "Pipeline": {
    "Block": {
      "header": {
        "height": 17,
        "prev_block_hash": "0F6B562D8B3F635C46CD7BEB20C801B8C7594B56AD5F3E0CFBD596C0894885F3",
        "transactions_hash": "5A85B662672155A7D93DC54A132975FA4252152AB04CA224CE49C7FF97D742AB",
        "creation_time_ms": 1742405889662,
        "view_change_index": 2
      },
      "status": "Created"
    }
  }
}
{
  "Pipeline": {
    "Block": {
      "header": {
        "height": 17,
        "prev_block_hash": "0F6B562D8B3F635C46CD7BEB20C801B8C7594B56AD5F3E0CFBD596C0894885F3",
        "transactions_hash": "5A85B662672155A7D93DC54A132975FA4252152AB04CA224CE49C7FF97D742AB",
        "creation_time_ms": 1742405889662,
        "view_change_index": 2
      },
      "status": "Approved"
    }
  }
}
{
  "Pipeline": {
    "Block": {
      "header": {
        "height": 17,
        "prev_block_hash": "0F6B562D8B3F635C46CD7BEB20C801B8C7594B56AD5F3E0CFBD596C0894885F3",
        "transactions_hash": "5A85B662672155A7D93DC54A132975FA4252152AB04CA224CE49C7FF97D742AB",
        "creation_time_ms": 1742405889662,
        "view_change_index": 2
      },
      "status": "Committed"
    }
  }
}
{
  "Pipeline": {
    "Block": {
      "header": {
        "height": 17,
        "prev_block_hash": "0F6B562D8B3F635C46CD7BEB20C801B8C7594B56AD5F3E0CFBD596C0894885F3",
        "transactions_hash": "5A85B662672155A7D93DC54A132975FA4252152AB04CA224CE49C7FF97D742AB",
        "creation_time_ms": 1742405889662,
        "view_change_index": 2
      },
      "status": "Applied"
    }
  }
}

```

::: tip

To find out how to listen to other types of events, run the `iroha events help` command.

:::

## What's Next

Now that you understand the basics, you can explore these advanced documentation:
- Try running a node on the [Iroha 2-based public testnet](https://wiki.sora.org/running-a-sora-testnet-node.html) on the Sora blockchain.
- Learn how to build on Iroha 2 with our [SDK turorials](/guide/tutorials/).
- Understand the fundamental concepts behind Iroha 2 in the [Iroha Explained](/blockchain/iroha-explained) section.
- Build more complex networks using the [Configuration and Management](/guide/configure/overview) section.