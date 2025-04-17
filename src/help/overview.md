# Troubleshooting

This section is intended to help if you encounter issues while working with
Iroha. If something goes wrong, please [check the keys](#check-the-keys)
first. If that doesn't help, check the troubleshooting instructions for
each stage:

- [Installation issues](./installation-issues.md)
- [Configuration issues](./configuration-issues.md)
- [Deployment issues](./deployment-issues.md)
- [Integration issues](./integration-issues.md)

If the issue you are experiencing is not described here, contact us via
[Telegram](https://t.me/hyperledgeriroha).

## Check the keys

Most issues arise as a result of unmatched keys. This is why we recommend
to follow this rule: **If something goes wrong, check the keys
first**.

Here's a quick explanation: It is not possible to differentiate the error
messages that arise when peers' keys do not match the keys in the array of
trusted peers (TODO link to config guide)
because it would expose the peers' public key. As such, if you have Helm
charts or K8s deployed with keys defined via the environment variables, you
should check for Key definitions.

If in doubt, [generate a new pair of keys](/guide/security/generating-cryptographic-keys.md).
