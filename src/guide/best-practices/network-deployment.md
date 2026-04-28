# Network Deployment

Treat an Iroha network as a coordinated system. Validators must agree on
genesis, topology, trusted peers, and consensus-relevant configuration
before the network can start and keep finalizing blocks.

## Environment Separation

- Maintain separate config bundles for local development, shared testnet,
  staging, and production.
- Generate fresh keys for every non-disposable environment. Do not reuse
  localnet or Taira key material in production.
- Keep peer config, client config, signed genesis, scripts, and deployment
  notes together as a versioned release artifact.
- Store private keys outside repositories and deployment templates.

See
[Keys for Network Deployment](/guide/configure/keys-for-network-deployment.md).

## Genesis and Topology

- Make every validator use the same signed genesis transaction, trusted
  peer set, topology, and validator Proofs-of-Possession when the profile
  requires them.
- Use at least four validators for a minimum Byzantine-fault-tolerant
  deployment.
- Separate validators from observers in capacity planning. Observers do not
  vote, propose, or collect, but they still consume storage, block sync,
  and network bandwidth.
- Treat genesis, executor, and topology changes as coordinated migrations
  rather than single-peer edits.

See [Genesis](/reference/genesis.md),
[Peer Management](/guide/configure/peer-management.md), and
[Performance and Metrics](/guide/advanced/metrics.md#node-count-and-quorum).

## Torii and Network Access

- Put Torii behind a reverse proxy or firewall when it is exposed outside
  the host or private network.
- Terminate TLS and apply basic authentication, rate limiting, and
  request-size controls at the edge when the deployment requires them.
- Publish only the endpoints needed by the environment. Operator and
  telemetry routes should be more restricted than public read-only routes.
- Bind listener addresses to host-local interfaces when peers should not
  accept remote traffic directly.

See [Torii Endpoints](/reference/torii-endpoints.md) and
[Virtual Private Networks](/guide/security/vpn.md).

## Consensus and Capacity

- Measure the deployment before tuning consensus timers. Lower timeouts can
  reduce latency only while network, storage, and execution layers keep up.
- Watch queue direction, not just short samples of throughput. A queue that
  grows during steady load means the network is overloaded.
- Record effective Sumeragi parameters, telemetry profile, validator count,
  network RTT, workload shape, and hardware details for each benchmark.
- Increase collector fanout only after comparing latency, traffic, and
  backpressure signals.

See [Performance and Metrics](/guide/advanced/metrics.md).

## Bare-Metal and Process Management

- Keep each peer's `config.toml`, private key, storage directory, and ports
  separate.
- Use process managers such as systemd with explicit restart, logging, and
  resource policies.
- Preserve generated README and start commands from Kagami localnet bundles
  when translating a test topology to managed hosts.

See
[Running Iroha on Bare Metal](/guide/advanced/running-iroha-on-bare-metal.md).
