# Storing Cryptographic Keys

Your sensitive data only remains private if you adopt <abbr title="Operational Security">OPSEC</abbr> practices to protect the cryptographic keys. Social engineering threats, where someone posing as a figure with authority tries to manipulate you into giving them your private cryptographic key, are real. Always be cautious and avoid sharing your private key, treating it as you would your apartment keys—reserved for trusted individuals only.

For more information on <abbr title="Operational Security">OPSEC</abbr> and its best practices, see [Operational Security](./operational-security).

## Storing Cryptographic Keys Digitally

When it comes to protecting cryptographic keys digitally, mainly only two approaches—[SSH](https://www.ssh.com/) and [GPG](https://www.gnupg.org/)—are available. These methods provide layers of security to prevent unauthorized access to your cryptographic keys.

Many of Iroha 2's architectural decisions have been influenced by the principles of the **Secure Shell** (`SSH`) protocol, which is why this section primarily focuses on the `SSH` approach, offering instructions on how to effectively implement the protocol for storing your cryptographic keys within the Iroha 2 ecosystem.

### Using SSH and SSH Agent

**Secure Shell Protocol** (`SSH`) is a cryptographic network protocol that serves as a virtual gateway, enabling secure access to remote machines via potentially not-so-secure networks by using SSH keys—access credentials. It provides an efficient way to remotely interact with systems without the necessity of physical presence. In this context, `SSH` offers two primary authentication mechanisms: the conventional password-based approach and the more secure public-private key pair method.

For more information on `SSH`, see [the related SSH Academy topic](https://www.ssh.com/academy/ssh).

To streamline the login process and bypass the need for repetitive input, it is possible to pair the `SSH` keys with the **SSH Agent** (`ssh-agent`)—the assistant program that remembers your `SSH` keys and/or password for the duration of a session. This setup permits the `SSH` gateway to effortlessly access the keys whenever it connects to other machines.

The workflow here is as follows: you have your public key stored on a remote system and keep your private key secure. Whenever you want to access a remote system, the `ssh-agent` steps in to communicate your _public_ key to the accessed system. The remote system then sends back a [challenge](https://en.wikipedia.org/wiki/Challenge%E2%80%93response_authentication) that only your _private_ key can properly respond to. Your `ssh-agent` handles this challenge by using your _private_ key and sends the correct response back to the remote system. If the response matches what the system expected, you're granted access.

The beauty of the `ssh-agent` is that it holds onto your private key during your session, so there is no need to keep entering your password or private key passphrase every time you connect to a remote system.

For more information on the `ssh-agent`, see [the related SSH Academy topic](https://www.ssh.com/academy/ssh/agent).

::: info Note

For a detailed overview of the `SSH` protocol and the `ssh-agent` tool, see the following [SSH Academy](https://www.ssh.com/academy) topics:

  - [What is SSH (Secure Shell)?](https://www.ssh.com/academy/ssh)
  - [ssh-agent: How to configure ssh-agent, agent forwarding, & agent protocol](https://www.ssh.com/academy/ssh/agent)

:::

### Adding a Password Manager Program

It is recommended to enhance the security of your `SSH` keys by protecting them with a password, which acts as an additional obstacle in the way of malicious parties aiming to obtain your sensitive information.

A variety of password managers can be used to store user passwords and `SSH` keys temporarily. For the sake of clarity, [KeePass](https://keepass.info/) is used as an example password manager, specifically, the [KeePassXC](https://keepassxc.org/) port running on Linux-based operating systems.

For instructions on how to set up KeePassXC see the [Configuring KeePassXC](#configuring-keepassxc) section below.

![KeePassXC: `Main` screen UI](../../img/KeePassXC.png)

KeePassXC offers enhanced security, flexibility, and control. It not only stores passwords but also the `SSH` keys. When used for key storage, this password manager provides the `ssh-agent` with the stored keys, which are then promptly removed from its memory once the KeePassXC window is closed.

::: tip

Theoretically, any of the KeePass ports [listed on the official website](https://keepass.info/download.html) can be utilized for key storage purposes.
We recommend any of the following: [KeePassX](https://www.keepassx.org/) or [KeePassXC](https://keepassxc.org/).

:::

#### Configuring KeePassXC

To configure KeePassXC, perform the following steps:

1. Launch KeePassXC, then go to **Tools** > **Settings**, or select the **Gear** button from the top UI panel.

2. In the **Application Settings** tab that appears, select **SSH Agent** from the left menu, and then select the **Enable SSH Agent integration** checkbox.

   ::: info Show reference screenshot

   ![KeePassXC `SSH Agent` tab: Enabling SSH Agent](../../img/keepassxc_ssh_agent.png)

   :::

3. Create a new KeePassXC Database. For instructions, see [KeePassXC User Guide > Creating Your First Database](https://keepassxc.org/docs/KeePassXC_UserGuide#_creating_your_first_database).

4. For every key that you would like to store in the KeePassXC Database you created, perform the following steps:

   - Add a new entry in the database. For instructions, see [KeePassXC User Guide > Creating Your First Database](https://keepassxc.org/docs/KeePassXC_UserGuide#_creating_your_first_database).

   - When adding a new entry, attach the file containing the key by doing the following: select **Advanced** from the left menu, then select **Add** in the **Attachments** section, choose the required file in the **Select files** window that appears.

   - When adding a new entry, select **SSH Agent** from the left menu, then select the key file you added from the **Attachment** menu in the **Private key** section; then select the following checkboxes:

      - **Add key to agent when database is opened/unlocked**

      - **Remove key from agent when database is closed/locked**

      - **Require user confirmation when this key is used**

   - If necessary, make other changes to the entry.

   - When ready, select **OK** to save the entry.

   ::: details Show reference screenshots

   ![KeePassXC `Advanced` tab: Adding a private key attachment](../../img/keepassxc_private_key.png)

   ![KeePassXC `SSH Agent` tab: Adding a private key attachment](../../img/keepassxc_pk_agent.png)

   :::

##### Expected Results

- Cryptographic and `shh` keys are stored as entries in a KeePassXC Database that can be accessed while the KeePassXC window is open.

- Stored cryptographic and `ssh` keys can be used whenever they are required for authorization.

- Stored cryptographic and `ssh` keys are removed from the `ssh-agent` once the KeePassXC window is closed.

::: info Note

Without enabling the **Require user confirmation when this key is used** option, the `ssh-agent` may not monitor the process that provided it with a key. In the event that the password manager process is terminated by malware or a system service through a `SIGKILL` signal, the key is likely to remain in the `ssh-agent`, as Unix system programs cannot intercept `SIGKILL`.

:::

## Storing Cryptographic Keys Physically

For those who seek the highest level of offline security, the option of storing cryptographic keys physically ensures that the keys remain completely disconnected from digital networks, thus minimizing the risk of unauthorized access. Acknowledging the physical option underscores our commitment to catering to diverse security needs.

### Using a Hardware Key

Our team considers hardware keys to be one of the best safety measures. A hardware key—a compact device that connects via a USB port and has the size of a typical flash drive—only processes security-related events when it is connected to a machine. This allows you to easily disconnect the device in case of a security breach, or simply reconnect it to a different machine whenever it is required.

However, since there are many brands of hardware keys—each with their unique APIs—it is important to research the market to find the key that best suits your needs.

So far, our team has internally tested the [YubiKey 5C](https://www.yubico.com/il/product/yubikey-5c/) hardware key which proved to have many positive features, including versatile API functionality.

However, there's a potential drawback to consider. Implementing the [HMAC challenge-response authentication](https://en.wikipedia.org/wiki/Challenge%E2%80%93response_authentication) and storing a corresponding _private_ key for this response could create a vulnerability. This setup might inadvertently enable attackers to make educated guesses about the information stored within the YubiKey 5C's memory, thereby compromising the overall security.

Luckily, this vulnerability can be mitigated by adopting an alternative approach to utilizing the YubiKey 5C. The idea is to use YubiKey 5C to securely access a KeePassXC database storing your cryptographic and `SSH` keys. This method can even be considered beneficial, since it surpasses the security of most passwords and makes it necessary for the malicious party to be in possession of your hardware key in case the KeePassXC database is leaked.

::: info

To read more about _the method above_, see the answer by one of the KeePassXC developers—[Janek Bevendorff](https://github.com/phoerious)—to the following StackExchange question:

[Is it reasonable to use KeePassXC with YubiKey?](https://security.stackexchange.com/questions/201345/is-it-reasonable-to-use-keepassxc-with-yubikey/258414#258414)

:::

### Using a Mnemonic Phrase

Alternatively, you can memorize a private key as a series of words, known as a _mnemonic phrase_. This method, used in many wallets, requires remembering around 25 specific words. Most password managers, including the previously discussed KeePassXC, offer mnemonic passphrase generation.
