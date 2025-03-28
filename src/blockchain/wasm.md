# WASM

While we had initially assumed that all operations within Iroha will be
handled with instructions and conditionals, however, there are a few
problems with this approach.

- The ISI syntax is verbose and ugly.
- The ISI syntax is not familiar for most programmers.
- While simple ISI smart contracts are compact (usually a few bytes), they
  need different kinds of manual optimisations.

In the long run, all of these problems are taken care of by using a
**domain-specific language**, which gets optimised and compiled into a
sequence of instructions that executes fast and takes very little space in
the blocks, but is also easy to understand. Something that looks like your
traditional `if` statements and `for` loops.

However, in the interim, we have decided to use another portable binary
standard called **Web assembly**, or **WASM**.

## Working with WASM

The main advantage of using the WASM format is that you can use any
language you like (as long as it links statically against our helper
library), and produce a 32-bit portable executable. The compilers take care
of the optimisation, and you don't have to learn a new language (ahem...
solidity... ahem), just to operate on the blockchain.

You'd still need to use ISI from inside your WASM binary to do anything
on-chain, as we explained earlier.

In theory, you can do anything you want just using ISI as it is a
Turing-complete language. However, it'll be less convenient and efficient
since you'd need to use [metadata](/blockchain/metadata.md) as memory
and write complex conditionals using just the tools that we've provided in
the `Expression` and ISI infrastructure. We highly recommend choosing a
well-known programming language, such as Rust, to build the necessary logic
out of simple instructions. This is much easier than trying to reinvent the
wheel using ISI.

Moreover, as long as you fit within the limits of WASM runtime and the
provided libraries, you can do anything (and everything) you want. The
drawback is that this process is a tad more involved than just writing the
ISI using the client libraries.

## Simple Rust Smart Contract Example

WASM projects, just like any other binary in Rust, need to be separate
crates. Don't worry, it doesn't have to be big.

### 1. Create a new project

To get started, create a new project:

```bash
$ cargo new --lib
```

Yes! We need the `lib` type; more on that later.

The `Cargo.toml` of your project should look something like this:

```toml
[package]
name  = "smartcontract"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ['cdylib']

[dependencies]
iroha_wasm = { git = "https://github.com/hyperledger-iroha/iroha/"}
```

Note that the crate type is `cdylib`. Most Rust code is linked in a
non-portable architecture and OS-specific static manner, but WASM is a
portable format. Since C ABI is the _lingua franca_ of the programming
world and there is no other stable Rust ABI (yet), Iroha relies on the
C-linkage to generate WASM bindings. Thankfully, `iroha_wasm` takes care of
everything related to [foreign function interfaces](/reference/ffi.md) (FFI), so
you don't have to worry about things like `unsafe`, `repr(C)`, padding,
alignment, and others.

The `iroha_wasm` crate contains all of the bindings, macros, and trait
implementations that you'd need to write the program, most notably the
`iroha_wasm` attribute macro. The crate also exposes our `data_model`,
which contains all of the basic ISI and types. The chosen serialisation
format is `parity-scale-codec`, though there is a strong possibility it'll
get replaced with a different (custom) serialisation format in the near
future, as it seems to dominate the binary size[^1].

### 2. Write a smart contract

Now that we have the preliminaries nailed down, we get to write some code
for our smart contract. In the `src/lib.rs` you should write the following:

```rust
#![no_std]
#![no_main]

extern crate alloc;

use alloc::vec::Vec;

use iroha_wasm::data_model::prelude::*;

#[iroha_wasm::iroha_wasm]
fn smartcontract_entry_point(_account_id: AccountId) {
    let query = QueryBox::FindAllDomains(FindAllDomains {});
    let domains: Vec<Domain> = query.execute().try_into().unwrap();

    for domain in domains {
        let new_account_id = AccountId {
            name: Name::new("mad_hatter").unwrap(),
            domain_id: domain.id,
        };

        Instruction::Register(RegisterBox::new(NewAccount::new(new_account_id))).execute();
    }
}
```

To submit the instruction and run it, execute the following command (be
sure to have a peer up):

```
cargo run --release
```

What does this smart contract do? Let's see. It queries all of the
currently existing domains and puts the results into a `std::vec::Vec`. In
this case, `std::vec::Vec` has to be imported from `alloc`, as we use
`no_std` (more on that [later](#work-under-a-no-std-environment)). It is
then used to add the user named `mad_hatter` to all of the existing
domains.

Building the same logic out of `Expression` and `If` and `Sequence` would
be significantly harder. Moreover, the actual low-level instructions that
would run are very likely not going to be as well-optimised as what the
compiler produces.

## Advanced Smart Contracts: Optimising for Size

WASM smart contracts can get big. So big, in fact, that we might not let
you store them in the blockchain. So how do you reduce the size? The most
important modifications are done in `Cargo.toml`:

```toml
[profile.release]
strip = "debuginfo" # Remove debugging info from the binary
panic = "abort"     # Abort panics as they are transcribed to Traps when compiling for WASM anyways
lto = true          # Use link-time-optimisation (it produces a notable decrease in binary size)
opt-level = "z"     # Optimise for size vs speed with "s"/"z"(removes vectorization)
codegen-units = 1   # Use one code generation unit (it further reduces the binary size but increases compilation time)
```

Let's take a closer look at what you can do to reduce the size of the WASM
binary.

### Remove debugging info

Rust stores a lot of debug information (even when compiled in `release`
mode), which is (as the name suggests) used for debugging a panic in your
Rust application. As you would expect, this information increases the size
of the compiled WASM significantly.

Normally, this would be a worthwhile trade-off, but not in our case.
Firstly, since the WASM is stored on-chain, it will be permanently recorded
in some block and take space on every full node of an Iroha network. Iroha
stores a lot of its information in RAM, so storage space for WASM is at a
premium.

Secondly, once the WASM smart contract is stored on-chain, the debug
information is no longer accessible. Indeed, you shouldn't debug on a peer.
Instead, you should replicate the conditions that caused the panic locally
and debug on your personal machine.

### Work under a `no_std` environment

Another step that we've already taken involves working under a `no_std`
environment. All of our size-related woes stem from Rust being
predominantly statically linked. As such, breaking the standard library
into more manageable crates, like using `alloc::vec` instead of `std::vec`,
can help us reduce the size and compilation time[^2].

### Re-compile `libcore`

Next, you're advised to re-compile `libcore` and any other standard library
crate (e.g. `alloc`) to exclude the leftover panic-related code that comes
with the prebuilt `core` library[^3]:

```bash
$ cargo +nightly build -Z build-std -Z build-std-features=panic_immediate_abort --target wasm32-unknown-unknown
```

Unfortunately, this is an unstable feature. In other words, the developers
of the Rust programming language can decide to change how this works, or
remove this option entirely.

### Use tools to optimise WASM size

Finally, you can use an automated tool to optimise the size of the WASM
binary. You could use [`wasm-opt`](https://github.com/WebAssembly/binaryen)
or [`twiggy`](https://rustwasm.github.io/twiggy/) to guide your manual
optimisation efforts.

We highly advise using `wasm-opt` because it will often significantly
reduce your binary size:

```bash
$ wasm-opt -Os -o output.wasm input.wasm
```

### Conclusion

At some point, unfortunately, the smallest size of your WASM blob is going
to be determined by the libraries that you need to use. Using all of the
above steps on the provided smart contract can reduce it down to a
manageable (for the blockchain) size.

[^1]:
    Size is an important metric. We shall cover size-optimisation
    strategies as we go.

[^2]:
    It should be noted that excluding the standard library is necessary for
    compiling to the wasm32 target, and is thus mandatory.

[^3]: `wasm-opt` can also be used to remove the debug sections.
