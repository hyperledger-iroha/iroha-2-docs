# Smart Contracts

Iroha transactions execute `Executable` payloads. The current data model
supports:

- `Executable::Instructions`: an ordered set of Iroha Special Instructions
- `Executable::ContractCall`: a by-reference call to a deployed contract
  instance
- `Executable::Ivm`: Iroha VM bytecode
- `Executable::IvmProved`: Iroha VM bytecode with a precomputed instruction
  overlay and proof commitments

Older Iroha 2-era contract examples used legacy helper crates and boxed
query snippets. Current Iroha 3 contract work should target the Iroha VM
and current SDK builders instead.

## When To Use Smart Contracts

Use normal instructions when the transaction can be expressed directly:

- register or unregister objects
- mint, burn, or transfer assets
- update metadata
- grant or revoke permissions
- execute a trigger
- set on-chain parameters

Use a smart contract when the transaction needs packaged logic that is
awkward to express as a static instruction sequence, or when a deployed
contract instance should be called by reference.

## IVM Executables

`Executable::Ivm` carries raw IVM bytecode. Nodes execute that bytecode inside
the runtime limits configured for the chain. Keep bytecode small and
deterministic; contracts are part of transaction execution and therefore affect
consensus.

`Executable::IvmProved` is intended for proof-carrying flows. It carries:

- IVM bytecode
- a deterministic instruction overlay
- an execution-events commitment
- a gas-policy commitment

The proof binds the overlay to the executed bytecode. Depending on pipeline
policy, validators can verify the proof and replay execution as an additional
safety check.

## Deployed Contract Calls

`Executable::ContractCall` invokes a deployed contract instance by address.
Use this when contract code is registered separately and transactions should
call it by reference instead of carrying the bytecode every time.

## Operational Guidance

- Keep contracts deterministic. Contract behavior must not depend on local
  wall-clock time, host filesystem state, network calls, or other peer-local
  inputs.
- Keep payloads compact. Large bytecode increases transaction size and block
  propagation cost.
- Prefer typed instructions for simple ledger changes. They are easier to
  audit and cheaper to execute.
- Treat contract upgrade and registration permissions as high-risk
  operational controls.

See also:

- [Instructions](/blockchain/instructions.md)
- [Triggers](/blockchain/triggers.md)
- [Permissions](/blockchain/permissions.md)
- [Data model schema](/reference/data-model-schema.md#executable)
