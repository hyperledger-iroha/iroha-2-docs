# Password Security

In the realm of blockchain security, protecting passwords is paramount. To ensure your data and everything it represents remain impervious to unauthorized access, let's delve into the nuances of password security.

## Password Strength

Likely enough, you may have previously encountered recommendations on how to come up with a _strong_ password. These may entail such advice as minimum password length, addition of special characters, etc. Such recommendations aim to increase the strength of your password that hinges on entropy, i.e. randomness of the password.

So, what defines a _strong password_? A strong password is a password with _high entropy_.

To calculate the entropy of a password, we may follow the **Entropy formula**:

::: tip Entropy formula

$L$ — Password length; number of symbols in the password.\
$S$ — Character set; size of the pool of unique possible symbols.\
$S^L$ — Number of possible combinations.

$$Entropy=log_2(S^L)$$

The resulting number is the amount of entropy bits in a password. The higher the number, the harder the password is to crack.

Knowing the entropy value, the amount of attempts required to brute-force a password with said entropy can be derived by using the following formula:

$$S^L=2^Entropy$$

There is no universal answer as to how high the entropy of a password should be. For financial organizations, it is advised to keep the entropy of their passwords in the range from `64` to `127` bits (`128` bits or more is generally considered to be an overkill). However, keep in mind that <abbr title="Graphics Processing Unit">GPU</abbr>s keep constantly evolving, and the time required for password cracking keeps decreasing over time.

:::

Following the entropy formula, let us compare the following two examples:

  1. A 16-character password with the character set utilizing only lowercase letters of the modern English alphabet (26 characters) yields approximately 43 sextillion ($43*10^21$) possible combinations.

    $$Entropy=log_2(26^{16})=log_2(43,608,742,899,428,874,059,776)=75.20703...$$

  2. A 16-character password with the character set expanded to 96, including uppercase letters and special symbols, inflates the number of possible combinations to a staggering 52 nonillion ($52*10^30$), improving entropy significantly.

    $$Entropy=log_2(96^{16})=log_2(52,040,292,466,647,269,602,037,015,248,896)=105.35940... $$

As can be seen, even by only expanding the character set from 26 to 96 symbols, the number of possible combinations that a malicious party would need to bruteforce has expanded by $1.1933*10^9$ times.

Additionally increasing the length of the password, will grow the number of possible combinations even further, therefore enhancing the entropy—strength—of the password.

However, instead of wrestling with complexities, we advise using a password manager program—like [KeePassXC](https://keepassxc.org/) (for more details, see _[Adding a Password Manager Program](./storing-cryptographic-keys.md#adding-a-password-manager-program)_ and _[Configuring KeePassXC](./storing-cryptographic-keys.md#configuring-keepassxc)_)—to generate and securely store your passwords.

::: tip

Certain websites limit the maximum possible entropy of passwords, i.e., either limit the maximum password length or the set of accepted characters, or both.

Keep this in mind when using such websites and aim to periodically update your passwords.

:::

## Password Vulnerabilities

Passwords can fall victim to brute-force attacks, typically executed using powerful GPUs in conjunction with dictionaries or exhaustive iteration through all possibilities. To thwart such attempts, craft a unique password devoid of personal information like birthdays, addresses, phone numbers, or social security numbers. Avoid providing attackers with easily guessable clues.

So, how hard it is to crack a modern password? It really depends on who you ask.

With a setup like [Kevin Mitnick](https://en.wikipedia.org/wiki/Kevin_Mitnick)'s [cluster setup](https://twitter.com/kevinmitnick/status/1649421434899275778?s=20) housing 24 NVIDIA® GeForce RTX 4090's and 6 NVIDIA® GeForce RTX 2080's, all of them running [Hashtopolis](https://github.com/hashtopolis) software, he used to crack passwords that supposed to take a year in mere half a month.

However, let's now compare it to a single RTX 4090, capable of processing through 300 <abbr title="Hashes per second">H/s</abbr> using [`NTLM`](https://www.tarlogic.com/cybersecurity-glossary/ntlm-hash) and 200 <abbr title="Hashes per second">H/s</abbr> using [`bcrypt`](https://en.wikipedia.org/wiki/Bcrypt), as outlined in [this tweet](https://twitter.com/Chick3nman512/status/1580712040179826688).

As an extension of our previous entropy calculations, let's now examine the following projected cracking times:

  1. There are $31,540,000$ seconds in a regular non-leap year. Assuming the worst-case scenario with `NTLM`, at the speed of $300*10^9$ <abbr title="Hashes per second">H/s</abbr>, it would take a single RTX 4090 approximately $4,608.83$ years to crack a 16-character password with a character set of 26 letters of the modern English alphabet.

  2. If instead of `NTLM` we use `bcrypt`, therefore reducing the iteration speed to $200*10^3$ <abbr title="Hashes per second">H/s</abbr>, while also expanding the character set to 96, including uppercase letters and special symbols, the time to crack soars to about $8,249,887,835,549,662,270.456$ years, far surpassing the age of the universe.

So, simply picking higher entropy raised the time it takes to crack a password to unfathomable numbers. Yes, the process may be sped up by using multiple GPUs, however this method pales in comparison with the [XKCD approach](https://xkcd.com/538/).

It is important to note that an extensive character set isn't always necessary to reach high entropy. It can be obtained by using multi-word passwords, or lengthy sentences in particular. The classic [XKCD comic](https://xkcd.com/936/) illustrates this concept eloquently.

::: warning

Avoid writing your password down anywhere. Store your password recovery phrase securely. If the phrase is too long, you may write it down, ensuring that you can read it out and type it out later. Store the physical copy of the phrase in a secure location and/or container.

:::
