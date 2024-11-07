# Troubleshooting Installation Issues

This section offers troubleshooting tips for issues with Iroha 2
installation. If the issue you are experiencing is not described here,
contact us via [Telegram](https://t.me/hyperledgeriroha).

<!-- TODO: add -->

## Troubleshooting Rust Toolchain

Sometimes, things don’t go as planned. Especially if you had `rust` on your
system a while ago, but didn’t upgrade. A similar problem can occur in
Python: XKCD has a famous example of what that might look like:

<div class="flex justify-center">

<!-- FIXME untitled -->

![Untitled](/img/install-troubles.png)

</div>

### Check Rust version

In the interest of preserving both your and our sanity, make sure that you
have the right version of `cargo` paired with the right version of `rustc`
(1.57 and 1.57) respectively. To show the versions, do

```bash
$ cargo -V
$ cargo 1.60.0 (d1fd9fe 2022-03-01)
```

and then

```bash
$ rustc --version
$ rustc 1.60.0 (7737e0b5c 2022-04-04)
```

If you have higher versions, you're fine. If you have lower versions, you
can run the following command to update it:

```bash
$ rustup toolchain update stable
```

### Check installation location

If you get lower version numbers **and** you updated the toolchain and it
didn’t work… let’s just say it’s a common problem, but it doesn’t have a
common solution.

Firstly, you should establish where the version that you want to use is
installed:

```bash
$ rustup which rustc
$ rustup which cargo
```

User installations of the toolchains are _usually_ in
`~/.rustup/toolchains/stable-*/bin/`. If that is the case, you should be
able to run

```bash
$ rustup toolchain update stable
```

and that should fix your problems.

### Check the default Rust version

Another option is that you have the up-to-date `stable` toolchain, but it
is not set as the default. Run:

```bash
$ rustup default stable
```

This can happen if you installed a `nightly` version, or set a specific
Rust version, but forgot to un-set it.

### Check if there are other Rust versions

Continuing down the troubleshooting rabbit-hole, we could have shell
aliases:

```bash
$ type rustc
$ type cargo
```

If these point to locations other than the one you saw when running
`rustup which *`, then you have a problem. Note that it’s not enough to
just

```bash
$ alias rustc "~/.rustup/toolchains/stable-*/bin/rustc"
$ alias cargo "~/.rustup/toolchains/stable-*/bin/cargo"
```

because there is an internal logic that could break, regardless of how you
re-arrange your shell aliases.

The simplest solution would be to remove the versions that you don’t use.

It’s easier _said_ than _done_, however, since it entails tracking all the
versions of rustup installed and available to you. Usually, there are only
two: the system package manager version and the one that got installed into
the standard location in your home folder when you ran the command in the
beginning of this tutorial. For the former, consult your (Linux)
distribution’s manual, (`apt remove rust`). For the latter, run:

```bash
$ rustup toolchain list
```

And then, for every `<toolchain>` (without the angle brackets of course):

```bash
$ rustup remove <toolchain>
```

After that, make sure that

```bash
$ cargo --help
```

results in a command-not-found error, i.e. that you have no active Rust
toolchain installed. Then, run:

```bash
$ rustup toolchain install stable
```

## Troubleshooting Python toolchain

When you install the Python Wheel package using pip on the "[client setup](/guide/tutorials/python#_1-iroha-2-client-setup)" step, you may encounter an error like:
"iroha_python-*.whl is not a supported wheel on this platform".

This error means that pip is outdated, so you need to update it.
First of all, it is recommended to check your OS for updates and perform a system upgrade.

If this doesn't work, you can try updating `pip` for your user directory.

`python -m pip install --upgrade pip`

Make sure that `pip` that is installed in your home directory. To do this, run `whereis pip` and check if `/home/username/.local/bin/pip` is among the paths. If not, update your shell's `PATH` variable.

If the issue persists, please [contact us](/help/) and report the outputs.

```
python --version
python3 --version
pip --version
pip3 --version
```
