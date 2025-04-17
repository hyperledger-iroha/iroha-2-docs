# Operational Security

Operational Security (OPSEC) is a systematic approach to security and risk management, which is essentially a collection of strategies and advice adopted for specific use-cases with the aim of preventing unauthorized access and data leakage.

<abbr title="Operational Security">OPSEC</abbr> is the standard practice for most companies to guarantee the availability and stability of their assets. This includes considering such factors as physical security (e.g., making sure that unattended post-it notes do not contain sensitive data), secure communication protocols (e.g., not sending sensitive data over unencrypted SMS), threat analysis (e.g., determining potential malicious parties, learning about the latest attack methods), personnel training (e.g., without employees following <abbr title="Operational Security">OPSEC</abbr> measures, they _will_, sooner or later, prove to be ineffective), and risk mitigation (e.g., encrypting your hard drives and USB devices).

Since Iroha 2 is likely to be deployed as a financial ledger, <abbr title="Operational Security">OPSEC</abbr> measures and practices must be taken seriously. This topic describes strategies and approaches that individuals and organizations using Iroha 2 in their operations should consider as part of their extensive security protocol.

Following and adopting the guidelines in this topic is a necessary step towards achieving total security, however, it is not sufficient on its own. To further improve your security, learn more throughout the rest of the [Security](./index.md) section and specifically the following topics:

- [Security Principles](./security-principles.md)
- [Password Security](./password-security.md)

## Recommended OPSEC Measures

- Stay vigilant. The [most likely](https://arxiv.org/pdf/2209.08356.pdf) way in which one can lose their assets in a blockchain is by giving away their sensitive details.

- Encrypt your disks. Encrypting boot devices allows them to protect your data even if an attacker have gained access to the hardware. Doing it for your portable devices is twice as important.

- Use trusted software. Software that ships via reproducible binary builds, and that you build from source, is the most trustworthy. Proprietary or open-source software that hasn't been audited is a potential risk that must be taken seriously.

- Never leave portable devices with sensitive data unattended. A split second is enough to steal your device.

- Verify the signatures on binary packages. This is not too different from the public key cryptography used inside Iroha v2.

- To prevent unauthorized access, always secure your laptop or personal computer when leaving it unattended. Use strong passwords, lock the screen, and follow best practices for securing your devices.

- Establish a secure [air-gapped](https://en.wikipedia.org/wiki/Air_gap_(networking)) location for your keys. First, encrypt the keys, then store them in an _offline-only_ device, ideally with electromagnetic shielding installed. [Hardware keys](./storing-cryptographic-keys.md#using-a-hardware-key) are specifically designed this purpose.

- Always keep your software updated to their latest version across all devices, including computers and phones. Regular updates help patch vulnerabilities and minimise potential risks associated with outdated software, even before such vulnerabilities are disclosed.

- Develop a routine for periodically updating passwords and cryptographic keys. This proactive approach significantly contributes to enhancing overall security posture, since it is much harder to hit a moving target.

## Using Browsers

If an application connected to Iroha 2 features a web UI, your browser can either aid the security or pose a potential threat. It is essential to exercise caution, especially when it comes to the plugins you choose to install.

Consider the following measures to enhance your browsing security:

- Avoid using browsers that are known for having bad security models and for leaking their users' data.
  
  You can look up privacy violations and security issues for any browser. For example, [this article on browser privacy](https://www.unixsheikh.com/articles/choose-your-browser-carefully.html) discusses a variety of browsers and how secure they are. Note that proprietary browsers (such as Chrome, Safari, Opera, Vivaldi, Edge, and others) are generally tremendously harder to audit due to their code being hidden from public, which means that you cannot be sure how secure they are.

- Give preference to browsers with solid history of valuing and protecting their users' privacy and security:
  - [Librewolf](https://librewolf.net/), [Icecat](https://www.gnu.org/software/gnuzilla/), [Firedragon](https://github.com/dr460nf1r3/firedragon-browser), etc. — well established forks of Mozilla Firefox with added security features.
  - [Ungoogled chromium](https://github.com/ungoogled-software/ungoogled-chromium) — a highly audited open-source version of Google Chrome that is enhanced with additional security measures and has all of the Google-related web services removed.
  - [Brave](https://brave.com/) — a highly audited open-source version of [Google Chromium](https://www.chromium.org/Home/) that is enhanced with additional security measures; has a built-in <abbr title="Virtual Private Network">VPN</abbr> and ad blocker functionality.
  - [Falkon](https://www.falkon.org/) — an open-source Qt-based web browser (built on `QtWebEngine`, a wrapper for [Google Chromium](https://www.chromium.org/Home/)) with known track record of being secure; has a number of extensions available for download from its [KDE store page](https://store.falkon.org/browse/).
  - [Qutebrowser](https://qutebrowser.org/) — an open-source Qt-based web browser (built on `QtWebEngine`, a wrapper for [Google Chromium](https://www.chromium.org/Home/)) with known track record of being secure; has a unique keyboard-focused approach with minimalist GUI; considered to be a browser of choice for many security specialists.

- Avoid enabling `JavaScript` unless necessary.

- Use the browser's built-in confinement mechanism for plugins to restrict the access rights that the installed plugins have.

- Clear cookies before and after important operations. Be mindful not to enable the **Keep Me Signed In** or **Remember me** feature. Keep in mind that some websites have this feature enabled by default.

- Use an ad blocker. These not only block ads but also disable site tracking features. Depending on the browser you use, an ad blocker may not be a built-in feature.

- Be mindful of lookalike characters (e.g., `0`, `θ`, `O`, `О`, `ዐ` and `߀` are six different characters). Paying attention to details like this may save you from a phishing attack.

- Avoid web UI email clients in favour of desktop clients. Before using it, set up your desktop email client to sign and verify GPG key signatures.

- Avoid using web-based messaging services. For instance, Discord (built with the infamous `electron` framework) is susceptible to many of the same attacks as would a Google Chromium window with the web version of Discord open.

- Update your browser to the latest version whenever possible. Updates often include critical security patches that address vulnerabilities.

- Be cautious of what browser extensions you install. Only use well-known and trusted extensions from reputable sources. Rogue extensions can compromise your data and privacy.

- Create separate browser profiles for various tasks. Use one profile for everyday browsing and another for activities involving high security and sensitive data. This way, extensions installed on the profile for everyday browsing cannot access the sensitive data from the secure one.

- Use a portable version of your browser copied to a USB flash drive. This method ensures that even if a security bug grants one of the installed plugins with access to data between the profiles, your security-related profile remains on a separate and removable device.

- Periodically clear your browser's cache and cookies to remove potentially sensitive data that may accidentally be stored on your device.

## Recovery Plan

In the event of an emergency, such as losing a key or facing a security breach, a well-structured and prepared in advance recovery plan is an essential lifeline. Creating a clear set of steps to follow can help mitigate potential damage and promptly reinstate security.

Organizations should consider the following key aspects when developing their recovery plan:

- Outline step-by-step procedures to be followed in case of key loss or other security incidents. Ensure that these steps are easily accessible and understandable by the users and/or employees.

- Establish a communication channel that may be used to promptly report security breaches and potential threats, such as leaked or lost cryptographic keys and password.

- If you utilize hardware keys (e.g., [YubiKey](https://www.yubico.com/products/) or [SoloKeys Solo](https://solokeys.com/collections/all)) as a security measure, consider adopting redundancy strategy. Keep two keys: one for daily use and another stored in a secure location. This precaution ensures access even if the primary key is compromised or lost.

- When security breaches or leaks are reported, react promptly by replacing or disabling affected keys and passwords. This proactive response minimizes the potential risks and damage.

- Periodically review and update your recovery plan. This ensures that the plan remains relevant and effective as your security landscape evolves.

::: warning

Remember that a recovery plan is not just another document. Rather, it's a lifeline that helps navigate unexpected challenges. By anticipating potential scenarios and establishing a clear roadmap for action, you fortify your operational security and enhance your readiness to respond effectively to any security incident.

:::
