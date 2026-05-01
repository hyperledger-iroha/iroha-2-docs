# Virtual Private Networks

A <abbr title="Virtual Private Network">VPN</abbr> is a network control that
limits who can reach Iroha services. It is most useful for private and
consortium deployments where validators, application backends, and operators
should communicate over private addresses instead of open internet routes.

A VPN does not replace Iroha peer keys, account keys, permissions, firewall
rules, monitoring, or secure key storage. Treat it as one layer in the
deployment boundary: the VPN narrows network reachability, while Iroha
configuration and governance decide which peers and accounts are trusted.

## When to Use a VPN

Use a VPN when:

- validators are operated by different organizations or in different hosting
  environments
- Torii should only be reachable by application backends, operators, or trusted
  clients
- metrics, logs, SSH, or other administration endpoints must stay on a private
  operator network
- a test or staging network should resemble production access controls without
  exposing public endpoints

A VPN is not required for every deployment. Public networks may intentionally
expose Torii through a public gateway, load balancer, or reverse proxy. Even in
that case, keep validator peer-to-peer traffic and administration endpoints on a
restricted network whenever possible.

::: tip

A browser VPN only protects traffic from that browser. It does not protect
`irohad`, CLI, SDK, SSH, metrics, or backup traffic unless those processes are
routed through the same private network.

:::

## Deployment Pattern

For a private validator mesh, give every validator a stable VPN address or
private DNS name. Configure peers so their advertised peer-to-peer addresses are
reachable from the other validators over that network:

```toml
trusted_peers = [
  "PUBLIC_KEY_1@10.20.0.11:1337",
  "PUBLIC_KEY_2@10.20.0.12:1337",
  "PUBLIC_KEY_3@10.20.0.13:1337",
  "PUBLIC_KEY_4@10.20.0.14:1337",
]

[network]
address = "10.20.0.11:1337"
public_address = "10.20.0.11:1337"

[torii]
address = "10.20.0.11:8080"
```

Use the address assigned to the current peer in `network.address` and
`network.public_address`. Each peer should list the same trusted peer identities,
but with addresses that are reachable from its own VPN route table.

Client and CLI configurations should point at a Torii endpoint reachable through
the VPN or through a controlled internal gateway:

```toml
torii_url = "http://10.20.0.11:8080"
```

If Torii must be available outside the VPN, put it behind a reverse proxy or
load balancer that provides TLS, authentication, rate limiting, and logging.
Avoid exposing raw peer-to-peer ports or administration endpoints directly to the
public internet.

## Firewall Rules

Use host and cloud firewall rules even when a VPN is present:

| Service | Recommended access |
| --- | --- |
| Peer-to-peer port | Other validator VPN addresses only |
| Torii | Application backends, operators, or trusted client VPN ranges |
| Metrics and health checks | Monitoring systems on the operator network |
| SSH and administration | Bastion host, privileged operator VPN range, or break-glass process |
| Backups and storage replication | Backup systems on a private network |

Default-deny rules are easier to audit than broad allow rules. When a new peer
joins the network, update the VPN membership, firewall allow list, and Iroha
trusted peer configuration as one coordinated change.

## Operational Checklist

- Choose an audited and actively maintained VPN implementation, such as
  WireGuard, IPsec, or an organization-approved managed private network.
- Use unique VPN credentials for each host and operator. Do not share VPN keys
  between validators.
- Keep VPN credentials separate from Iroha private keys and genesis signing
  material.
- Monitor VPN latency, packet loss, reconnects, and route changes. Consensus is
  sensitive to sustained network instability.
- Test the effective MTU. Packet fragmentation can look like intermittent peer
  or Torii failures.
- Document which VPN ranges are allowed to reach peer-to-peer, Torii, metrics,
  SSH, and backup endpoints.
- Rotate VPN credentials when a host, operator account, or organization leaves
  the network.
- Avoid a single VPN gateway as the only route between validators. Plan
  redundant gateways or site-to-site routes for production networks.
- Include VPN failures in incident response drills so operators know when to
  distinguish a network partition from an Iroha process failure.

## Related Pages

- [Security Principles](/guide/security/security-principles.md)
- [Operational Security](/guide/security/operational-security.md)
- [Keys for Network Deployment](/guide/configure/keys-for-network-deployment.md)
- [Peer Management](/guide/configure/peer-management.md)
- [Peer Configuration Reference](/reference/peer-config/index.md)
