# Generating Cryptographic Keys

In the realm of blockchain technology, cryptographic keys play a crucial role in upholding the security and authenticity of data transactions. With Iroha 2, you can create these vital keys to safeguard your digital assets and communications.

This section describes how to generate keys using the `kagami` tool, shipped alongside Iroha 2.

In the future, alternative methods of generating public keys shall be added.

## Generating Cryptographic Keys with Kagami {#kagami}

::: tip

Since `kagami` does not come with a manual page, you can use the `--help` (`-h`) command to retrieve a brief summary of all the usable `kagami` parameters within the CLI you are using.

:::

After [installing Iroha](/get-started/install-iroha-2.md), run the following command from the project's `root` directory to generate a new key pair:

```bash
$ cargo run --bin kagami --release -- crypto
```

You can specify a number of different parameters to tailor the generated key pair to your specific needs. The following parameters are available:

- `--algorithm` (`-a`): Specifies the algorithm used for the key pair generation and encryption. If no algorithm is specified, `ed25519` is used by default.
    Can be one of the following:

  - `ed25519` — <abbr title ="Elliptic Curve Cryptography">ECC</abbr> an algorithm that utilises the `Ed25519` curve, offering efficient and secure cryptographic operations for digital signatures and key exchange. If no algorithm is specified in a request, then `ed25519` is used by default.
    Learn more:
    - [EdDSA > Ed25519 (Wikipedia)](https://en.wikipedia.org/wiki/EdDSA#Ed25519:~:text=.-,Ed25519,-%5Bedit%5D)
    - [Ed25519: high-speed high-security signatures](https://ed25519.cr.yp.to/)

  - `secp256k1` — <abbr title ="Elliptic Curve Cryptography">ECC</abbr> an algorithm known for its application in blockchain systems like Bitcoin. It provides a robust foundation for secure key generation, digital signatures, and encryption.
  > Learn more:\
  [Secp256k1 (Bitcoin Wiki)](https://en.bitcoin.it/wiki/Secp256k1)

  - `bls_small` — The Boneh-Lynn-Shacham algorithm with a _small_ parameter configuration. This variant of the <abbr title ="Boneh-Lynn-Shacham">BLS</abbr> cryptographic scheme is optimised for efficiency in certain resource-constrained environments while maintaining fundamental security properties.
  > Learn more:\
  [BLS digital signature (Wikipedia)](https://en.wikipedia.org/wiki/BLS_digital_signature)

  - `bls_normal` — The Boneh-Lynn-Shacham algorithm with a _standard_ parameter configuration. This configuration of the <abbr title ="Boneh-Lynn-Shacham">BLS</abbr> cryptographic scheme offers a balanced approach between efficiency and security, making it suitable for a wide range of applications in blockchain and cryptographic protocols.
  > Learn more:\
  [BLS digital signature (Wikipedia)](https://en.wikipedia.org/wiki/BLS_digital_signature)

- `--seed` (`-s`): Specifies a string that serves as a deterministic starting point for the key pair generation. If a seed string is specified, `kagami` will generate the same key for the same string. If no seed is specified, a random `seed` value is chosen, and each invocation of `kagami crypto` will result in a different key. This parameter accepts a valid string of [Unicode](https://home.unicode.org/) characters. For example, the seed string can contain not only numeric and latin, but also cyrillic, logographic (e.g., Japanese kanji characters) and ideographic (e.g., emojis) characters, as well as any font-related variations of those characters introduced to Unicode over the years.

  ::: tip

  If one chooses to use a `seed`, it must be treated as if it were a password: more randomness and longer seed strings make the cryptographic keys more resilient to [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack).

  :::

- `--private-key` (`-p`): Specifies an existing private key as a string in the [`multihash`](https://github.com/multiformats/multihash) format that is used to generate a _public_ key.

- `--json` (`-j`): Specifies that the output must be generated in the JSON format, which is mostly helpful for copy-and-pasting into the `config.json` file.

- `--compact` (`-c`): Specifies that the output private and public keys are displayed on separate lines and are not labeled.

### Examples

::: code-group Examples

```bash [No parameters]

# Input
$ cargo run --bin kagami crypto

# Possible Output (same layout, different keys)
Public key (multihash): "ed01206B0F56F58761060056355DBA0E0FC489CFB2F974481ED64873082E6032796235"
Private key (ed25519): "F71EA9D897C4338CBF4F1DC7B492AAD0BF6CE896B803D7CDB9CF25ECC15109826B0F56F58761060056355DBA0E0FC489CFB2F974481ED64873082E6032796235"

```

```bash [--algorithm]
# Input
$ kagami crypto -a secp256k1

# Possible output
Public key (multihash): "e70121022A9D6E0D54022C0E2752E43ADD91ADA28259E1F2CE0C6D4E9183FB2882DE6749"
Private key (secp256k1): "7687B1433FB6731E6DC635A376B3EB3B5FCD1E02C9775C1642E7FD5DA035EC75"
```

```bash [--seed]
# Input
$ kagami crypto -s 1729

# Exact output
Public key (multihash): "ed0120B678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04"
Private key (ed25519): "2669BB1099477B970E1D7D7C54E345A64A54213FCFBA2465CBCD6D4E5091A71DB678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04"
```

```bash [--private-key]

# Input
$ kagami crypto -p 2669BB1099477B970E1D7D7C54E345A64A54213FCFBA2465CBCD6D4E5091A71DB678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04

# Exact output
Public key (multihash): "ed0120B678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04"
Private key (ed25519): "2669BB1099477B970E1D7D7C54E345A64A54213FCFBA2465CBCD6D4E5091A71DB678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04"

```

```bash [--json]
# Input
$ cargo run --bin kagami crypto -j

# Possible output
{
  "public_key": "ed0120B678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04",
  "private_key": {
    "digest_function": "ed25519",
    "payload": "2669bb1099477b970e1d7d7c54e345a64a54213fcfba2465cbcd6d4e5091a71db678073cfae6e247a58b442661c7da0e13bac5031cbc6343ef566b8718d47d04"
  }
}
```

```bash [--compact]
# Input
$ cargo run --bin kagami crypto -c

# Possible output
ed0120B678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04
2669BB1099477B970E1D7D7C54E345A64A54213FCFBA2465CBCD6D4E5091A71DB678073CFAE6E247A58B442661C7DA0E13BAC5031CBC6343EF566B8718D47D04
ed25519
```

```bash [Combination of parameters]
# Input
$ cargo run --bin kagami crypto -a bls_normal -s 2048

# Exact output
Public key (multihash): "ea01610402A54ABCC40819F15E3553CC8D42D628EEAD7E1B10724BD2AFE523A7C0446EB1CB3F14D4500BD68C997784136FD056BA04215DFD2D3FDC7883B43AE94AC52B7D01525F5A80B41C01701502B46DBB9F0384CC7BE037DC2CBC928014E52A4C5C3B"
Private key (bls_normal): "0000000000000000000000000000000035D9120A174E35E966DD92DE90B2446D4B060C8B72018B3917A1C97D7E93EAEC"
```

:::

## Other Operations with Kagami

### 1. Building `kagami`

The Iroha 2 node binary and all supporting tools are supplied in the official docker image. However, using it like this is cumbersome, as `kagami` is meant to be used as a standalone external tool, so building it from a source may be helpful.

To build `kagami`, run the following:

```bash
$ cargo build --bin kagami
```

This will produce a single statically linked executable in the target/debug directory, that still links dynamically against the system-provided standard C-library.

::: info Note

Iroha and all supporting tools can also be built to statically link against the musl standard library, which allows the application to run on any POSIX-compliant ELF-capable system (all GNU+Linux distributions, some BSD variants).

:::

### 2. Installing the source-built `kagami` into `/bin`

There are multiple ways to make your command line be able to use the `kagami` version that you have just compiled. One of the easiest ways that should work on most systems is to move or link the binary into the `/bin` directory on UNIX systems.

```bash
$ sudo mv target/debug/kagami /bin
```

### 3. Moving `kagami` to the `.local/bin` directory

To circumvent the requirement of having the binary in the global binary folder, and thus necessarily exposing the binary to all other users, as well as requiring root authentication (which is not always available), one can instead install the application as a regular user.

To move `kagami` to the authenticated user's `.local/bin` directory, making it uniquely accessible only by that user, run the following:

```bash
$ mv target/debug/kagami ~/.local/bin
```

This method works on most GNU Linux distributions, but is not guaranteed to do so. If it doesn't, consult the next subtopic.

#### Making the `<username>/.local/bin` directory available to the shell

To make the `<username>/.local/bin` directory explicitly available to your shell's `.rc` file, perform the following:

1. Check if `kagami` is available by running the following:

  ```bash
  $ whereis kagami
  kagami:
  ```

2. Depending on the shell that you are using, perform one of the following:

  - **If using [Bash](https://www.gnu.org/software/bash/)**: Fix the `PATH` variable for the shell and then reload the `.bashrc` script by running the following:

    ```bash
    $ echo "export PATH='${HOME}/.local/bin:${PATH}'" >> ~/.bashrc
    $ source ~/.bashrc
    ```

  - **If using [Zsh](https://www.zsh.org/)**: Fix the `PATH` variable for the shell and reload the `.zshrc` script by running the following:

    ```bash
    $ echo "export PATH='${HOME}/.local/bin:${PATH}'" >> ~/.zshrc
    $ source ~/.zshrc
    ```

  - **If using [fish](https://fishshell.com/)**: Fix the `PATH` variable for the shell variable permanently by running the following:

    ```bash
    $ fish_add_path ~/.local/bin
    ```

::: info

In addition to the methods listed above, consult documentation for the shell you're using or consider adding the `PATH` variant to your terminal's session configuration.

:::
