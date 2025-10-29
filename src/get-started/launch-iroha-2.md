# Launch Iroha 2

This tutorial explains how to launch an Iroha 2 network.

## 1. Prerequisites

To launch an instance of the Iroha 2 network, install the following first:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 2. Launch Iroha Network

1. In your terminal, navigate to the root directory of your local [`iroha`](https://github.com/hyperledger-iroha/iroha) repository:

   ```bash
   $ cd ~/Git/iroha
   ```

2. Run the `docker compose` command with the `docker-compose.yml` network configuration file specified to deploy a network of four containerized peers: <!-- TODO: consider explaining what network configuration file are, where to find them and how to customize them -->

   ```bash
   $ docker compose -f defaults/docker-compose.yml up
   ```

   Depending on your setup, this command will either pull an image from [Docker Hub](https://hub.docker.com/r/hyperledger/iroha2/tags) or build the container locally.
   
   Once the process completes, you will see an output similar to the following:

   <<< @/get-started/launch-iroha.docker-compose-output.ansi

After deploying the network, you can interact with it using the [Iroha Client CLI](./operate-iroha-2-via-cli.md).

::: tip

You can monitor blockchain events in the terminal where the network runs.

:::

### Docker Options

The following options are also available for local compilation:

- To test Iroha code quickly, use the `docker-compose.single.yml` network configuration file, which starts a container with a single peer.
- To test Iroha code in normal conditions, use the `docker-compose.local.yml` network configuration file, which starts four connected containers with peers.

::: tip Note

There is ongoing work to make our configurations for Docker even more customizable with the help of [Swarm](https://github.com/hyperledger-iroha/iroha/tree/main/crates/iroha_swarm).

<!-- Check: a reference about future releases or work in progress -->

:::
