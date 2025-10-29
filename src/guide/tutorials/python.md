# Python 3 Guide

## 1. Iroha 2 Client Setup

There are two versions of Iroha Python to choose from. In theory, the Iroha
1 version of Iroha Python (that also has the best documentation) should be
compatible with an Iroha 2 deployment.

Thus we should build and install the Iroha 2 compatible version of
Iroha-python, using (for now) its GitHub repository.

Let's create a separate folder for Iroha Python and clone its GitHub
repository into it:

```bash
$ cd ~/Git/
$ git clone https://github.com/hyperledger-iroha/iroha-python/ --branch iroha2
$ cd iroha-python
```

Iroha Python is written in Rust using the PyO3 library. Thus, unlike most
Python packages, you must build it first:

```bash
$ pip install maturin
$ maturin build
```

After the build is complete, install it into your system:

```bash
$ pip install ./target/wheels/iroha_python-*.whl
```

Finally, you will need a working client configuration:

```bash
$ cp -vfr ~/Git/iroha/configs/client/config.json example/config.json
```

::: tip

You can also use the provided `config.json` in the `example` folder if you
also call `docker compose up` from that same folder. This has to do with
the fact that the configuration for the Docker files in Iroha Python is
slightly different.

:::

## 2. Configuring Iroha 2

Unlike `iroha` binary, finding the configuration file in a scripting
language is the responsibility of the person writing the script. The
easiest method is to de-serialise a dictionary type from the provided
`config.json`.

This is an example of how you could do that in Python:

```python
import json
from iroha2 import Client

cfg = json.loads(open("config.json").read())
cl = Client(cfg)
```

If the configuration file is malformed, you can expect an `exception` to
notify you. However, the client doesn't do any verification: if the account
used in `config.json` is not in the blockchain or has the wrong private
key, you won't know that until you try and execute a simple instruction.
More on that in the following section.

::: info

It should also be noted that Iroha Python is under heavy development. It
severely lacks in documentation and its API can be made more idiomatically
Python.

<!-- Check: a reference about future releases or work in progress -->

:::

## 3. Registering a Domain

It is important to remember that Iroha Python is wrapping Rust code. As
such, many of Python idioms are not yet accommodated; for example, there's
no duck-typing of the `Register` instruction.

```python
from iroha2.data_model.isi import *
from iroha2.data_model.domain import *

domain = Domain("looking_glass")
register = Register(Expression(Value(Identifiable(domain))))
```

Instead, we are creating a domain and wrapping it in multiple type-erasing
constructs. A domain is wrapped in `Identifiable` (which would be a trait
in Rust), which is wrapped in `Value`, which is wrapped in `Expression`,
which finally is wrapped in the `Register` instruction. This is not
entirely against Python conventions (it is strongly typed, after all), and
not entirely counter-intuitive, once you see the corresponding Rust code.

The instruction to register must be submitted, in order for anything to
happen.

```python
hash = cl.submit_isi(register)
```

Note that we also keep track of the `hash` of the transaction. This will
become useful when you [visualize the output](#_6-visualizing-outputs).

## 4. Registering an Account

Registering an account is similar to the process of registering a domain,
except the wrapping structures are different. There are a couple of things
to watch out for.

First of all, we can only register an account to an existing domain. The
best UX design practices dictate that you should check if the requested
domain exists now, and if it doesn't, suggest a fix to the user.

```python
from iroha2.data_model.isi import *
from iroha2.data_model.account import *

public_key = … # Get this from white_rabbit.
bunny = Account("white_rabbit@looking_glass", signatories=[public_key])
register = Register(Expression(Value(Identifiable(bunny))))
```

Second, you should provide the account with a public key. It is tempting to
generate both the public and the private key at this time, but it isn't the
brightest idea. Remember that _the white_rabbit_ trusts _you,
alice@wonderland,_ to create an account for them in the domain
_looking_glass_, **but doesn't want you to have access to that account
after creation**.

If you gave _white_rabbit_ a key that you generated yourself, how would
they know if you don't have a copy of their private key? Instead, the best
way is to **ask** _white_rabbit_ to generate a new key-pair, and then give
you the public half of it.

After putting all of this together, we submit it as before:

```python
hash = cl.submit_isi(register)
```

## 5. Registering and minting assets

Iroha has been built with few
[underlying assumptions](/blockchain/assets.md) about what the assets need
to be in terms of their value type and characteristics (fungible or
non-fungible, mintable or non-mintable).

Asset creation is by far the most cumbersome:

```python
import iroha2.data_model.asset as asset
from iroha2.sys.iroha_data_model import Value

time = asset.Definition(
    value_type=asset.ValueType.Quantity,
    id=asset.DefinitionId(name="time", domain_name="looking_glass"),
    metadata={"a": Value.U32(10)},
    mintable=False
)
```

Note the following; First, we used the `**kwargs` syntax to make everything
more explicit.

We have a `value_type` which must be specified. Python is duck-typed, while
Rust isn't. Make sure that you track the types diligently, and make use of
`mypy` annotations.

The `Quantity` value type is an internal 32-bit unsigned integer. Your
other options are `BigQuantity`, which is a 128-bit unsigned integer, and
`Fixed`. All of these are unsigned. Any checked operation with a negative
`Fixed` value (one that you got by converting a negative floating-point
number), will result in an error.

Continuing the theme of explicit typing, the `asset.DefinitionId` is its
own type. We could have also written
`asset.DefinitionId.parse("time#looking_glass")`, but making sure that you
know what's going on is more useful in this case.

Finally, we have `mintable`. By default this is set to `True`, however,
setting it to `False` means that any attempt to mint more of
`time#looking_glass` is doomed to fail. Unfortunately, since we didn't add
any `time` at genesis, the _white_rabbit_ will never have time. There just
isn't any in his domain, and more can't be minted.

OK. So how about a mint demonstration? Fortunately, _alice@wonderland_ has
an asset called _roses#wonderland_, which can be minted. For that we need
to do something much simpler.

```python
amount = Expression(Value(U32(42)))
destination = Expression(Value(Identifiable(asset.DefinitionId.parse("rose#wonderland"))))
mint_amount = Mint(amount, destination)
cl.submit_isi(mint_amount)
```

This would add `42` to the current tally of roses that Alice has.

## 6. Visualizing outputs

The paradigm that Iroha chose to allow monitoring some events is the
_filter-map paradigm_. Let's look at what we need to do in order to know
e.g. what happened to a submitted instruction.

First, we'll need to remember the `hash` of the transaction that we want to
track, next we create a filter:

```python
filter = EventFilter.Pipeline(
    pipeline.EventFilter(
        entity=pipeline.EntityType.Transaction(),
        hash=None,
    ))
```

And add a listener on that filter. Don't worry, the Rust side of the
process is asynchronous, so barring issues with the GIL, you won't lock up
your interpreter.

Note the types. The `EventFilter` is a type that filters out anything that
isn't an event (and non-event types are beyond the scope of this tutorial).
The `pipeline` module helps us by providing a concrete type of
`EventFilter`, namely one that listens for transactions. Note that we
haven't used the `hash` here.

Finally, we add a listening filter to the client:

```python
listener = cl.listen(filter)
```

Now we must actually listen for events:

```python
for event in listener:
    print(event)

    if event["Pipeline"]["status"] == "Committed" \
        and event["Pipeline"]["hash"] == hash:
        break
```

And now, we have an infinite loop that will not quit until the event gets
committed.

::: warning

Nobody should do this in production code, and instead monitor the event
queue for (at least) the possibility that the transaction gets `Rejected`.

:::
