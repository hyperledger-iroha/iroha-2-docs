# Iroha Special Instructions

<!-- TODO: move reference content from the guide part -->

The following instructions are supported in Iroha 2:


|                                       Instruction                                       |                   Descriptions                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [Register/Unregister](/blockchain/instructions#un-register)                       | Give an ID to a new entity on the blockchain.     |
| [Mint/Burn](/blockchain/instructions#mint-burn)                                   | Mint/burn assets, triggers, or permission tokens. |
| [SetKeyValue/RemoveKeyValue](/blockchain/instructions#setkeyvalue-removekeyvalue) | Update blockchain object metadata.                |
| [NewParameter/SetParameter](/blockchain/instructions#newparameter-setparameter)   | Create/set a chain-wide config parameter.         |
| [Grant/Revoke](/blockchain/instructions#grant-revoke)                             | Give or remove certain permissions from accounts. |
| [Transfer](/blockchain/instructions#transfer)                                     | Transfer assets between accounts.                 |
| [ExecuteTrigger](/blockchain/instructions#executetrigger)                         | Execute triggers.                                 |
| [If, Pair, Sequence](/blockchain/instructions#composite-instructions)             | Use to create composite instructions.             |

::: details Diagram: Iroha Special Instructions

```mermaid
classDiagram

direction LR

class Instruction {
    <<enumeration>>
    Register(RegisterBox)
    Unregister(UnregisterBox)
    Mint(MintBox)
    Burn(BurnBox)
    Transfer(TransferBox)
    If(Box~If~)
    Pair(Box~Pair~)
    Sequence(SequenceBox)
    Fail(FailBox)
    SetKeyValue(SetKeyValueBox)
    RemoveKeyValue(RemoveKeyValueBox)
    Grant(GrantBox)
    Revoke(RevokeBox)
    ExecuteTrigger(ExecuteTriggerBox)
}

class SetKeyValueBox {
    object_id: EvaluatesTo~IdBox~    
    key: EvaluatesTo~Name~    
    value: EvaluatesTo~Value~    
}

class RemoveKeyValueBox {
    object_id: EvaluatesTo~IdBox~    
    key: EvaluatesTo~Name~    
}


class RegisterBox {
    object: EvaluatesTo~RegistrableBox~    
}

class UnregisterBox {
    object_id: EvaluatesTo~IdBox~    
}


class MintBox {
    object: EvaluatesTo~Value~    
    destination_id: EvaluatesTo~IdBox~    
}

class BurnBox {
    object: EvaluatesTo~Value~    
    destination_id: EvaluatesTo~IdBox~    
}

class TransferBox {
    source_id: EvaluatesTo~IdBox~    
    object: EvaluatesTo~Value~    
    destination_id: EvaluatesTo~IdBox~    
}


class SequenceBox {
    instructions: Vec~Instruction~    
}

class GrantBox {
    object: EvaluatesTo~Value~    
    destination_id: EvaluatesTo~IdBox~    
}

class RevokeBox {
    object: EvaluatesTo~Value~    
    destination_id: EvaluatesTo~IdBox~    
}

class ExecuteTriggerBox {
    trigger_id: TriggerId
}

class SetKeyValue~SetKeyValueBox~
class RemoveKeyValue~RemoveKeyValueBox~
class Register~RegisterBox~
class Unregister~UnregisterBox~
class Mint~MintBox~
class Burn~BurnBox~
class Transfer~TransferBox~
class Grant~GrantBox~
class Revoke~RevokeBox~


Instruction --> SetKeyValue
Instruction --> RemoveKeyValue
Instruction --> Register
Instruction --> Unregister
Instruction --> Mint
Instruction --> Burn
Instruction --> Transfer
Instruction --> Grant
Instruction --> Revoke
Instruction --> ExecuteTrigger
Instruction --> Sequence

SetKeyValue .. SetKeyValueBox
RemoveKeyValue .. RemoveKeyValueBox
Register .. RegisterBox
Unregister .. UnregisterBox
Mint .. MintBox
Burn .. BurnBox
Transfer .. TransferBox
Grant .. GrantBox
Revoke .. RevokeBox
ExecuteTrigger .. ExecuteTriggerBox
Sequence .. SequenceBox

class If {
    condition: EvaluatesTo~bool~    
    then: Instruction    
    otherwise: Option~Instruction~    
}

class Pair {
    left_instruction: Instruction    
    right_instruction: Instruction    
}

Instruction --> If
Instruction --> Pair
```

:::