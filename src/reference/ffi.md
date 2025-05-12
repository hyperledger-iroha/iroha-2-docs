# Foreign Function Interfaces (FFI)

To reduce the sizes of smartcontracts, we provide a dynamic library in the
execution environment. We shall detail how to link against that library and
use the functions at a later date, but for now, let's explore how to
include functions and trait implementations into that library.

## Why FFI

A function is a rather abstract entity, and while most languages agree on
what a function should do, the way in which said functions are represented
is very different. Moreover, in some languages (like Rust), the
consequences of calling a function, and the things that it is allowed to do
are different. Because one can use any language to create a
[WASM smartcontract](/blockchain/wasm.md), we need to level the
playing field. This is where the concept of foreign function interface
(FFI) comes in.

The main standard used today is the C application binary interface. It's
simple, it's guaranteed to be available even in languages which can't
compile to WASM, and it's stable. In principle, you could do everything
manually, but Iroha provides you with a crate `iroha_ffi` which contains
all you need to generate FFI-compliant functions out of your existing
`Rust` API.

You can, of course, do this your way. The `iroha_ffi` crate merely
generates the code that you would need to generate anyway. Writing the
necessary boilerplate requires quite a bit of diligence and discipline.
Every function call over the FFI boundary is `unsafe` with a potential to
cause undefined behaviour. The method by which we managed to solve it,
revolves around using **robust** `repr(C)` types.

::: info

The only exception are pointers. The null check and the validity cannot be
enforced globally, so raw pointers (as always) are only used in exceptional
cases. Given that we provide wrappers around almost every instance of an
object in the Iroha data model, you shouldn't have to use raw pointers at
all.

:::

## Example

Here is an example of generating a binding:

```rust
#[derive(FfiType)]
struct DaysSinceEquinox(u32);

#[ffi_export]
impl DaysSinceEquinox {
    pub fn update_value(&mut self, a: &u8) {
        self.0 = *a as u32;
    }
}
```

The example above will generate the following binding with
`DaysSinceEquinox` represented as an opaque pointer:

```rust
pub extern fn DaysSinceEquinox__update_value(handle: *mut DaysSinceEquinox, a: *const u8) -> FfiReturn {
    // function implementation
}
```

## FFI Binding Generation

The `iroha_ffi` crate is used to generate functions that are callable via
FFI. Given `Rust` structs and methods, they generate the `unsafe` code that
you would need in order to cross the linking boundary.

A Rust type is converted into a robust `repr(C)` type that can cross the
FFI boundary with `FfiType::into_ffi`. This goes the other way around as
well: FFI `ReprC` type is converted into a `Rust` type via
`FfiType::try_from_ffi`.

::: warning

Note that the opposite conversion is fallible and can cause undefined
behaviour. While we can make the best effort to avoid the most obvious
mistakes, you must ensure the program's correctness on your end.

:::

The diagram below uses the creation of a new domain as an example to show
the conversion process (more on the name mangling semantics in a
[separate section](#name-mangling)).

![Untitled](/img/ffi.png)

The main traits that enable binding generation are `ReprC`, `FfiType` and
`FfiConvert`

<!-- Check: might change in future releases -->

| Trait        | Description                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ReprC`      | This trait represents a robust type that conforms to C ABI. The type can be safely shared across FFI boundaries.                                                                |
| `FfiType`    | This trait defines a corresponding `ReprC` type for a given `Rust` type. The defined `ReprC` type is used in place of the `Rust` type in the API of the generated FFI function. |
| `FfiConvert` | This trait defines two methods `into_ffi` and `try_from_ffi` that are used to perform the conversion of the `Rust` type to or from `ReprC` type.                                |

Note that there is no ownership transfer over FFI except for opaque pointer
types. All other types that carry ownership, such as `Vec<T>`, are cloned.

### Name Mangling

Note the use of double underscores in generated names of FFI objects:

- For the `inherent_fn` method defined on the `StructName` struct, the FFI
  name would be `StructName__inherent_fn`.
- For the `MethodName` method from the `TraitName` trait in the
  `StructName` struct, the FFI name would be
  `StructName__TraitName__MethodName`.
- To set the `field_name` field in the `StructName` struct, the FFI
  function name would be `StructName__set_field_name`.
- To get the `field_name` field in the `StructName` struct, the FFI
  function name would be `StructName__field_name`.
- To get the mutable `field_name` field in the `StructName` struct, the FFI
  function name would be `StrucuName__field_name_mut`.
- For the freestanding `module_name::fn_name`, the FFI name would be
  `module_name::__fn_name`.
- For the traits that are not generic and allow sharing their
  implementation in the FFI (see `Clone` below), the FFI name would be
  `module_name::__clone`.

  ```rust
  impl Clone for Type1 {
      fn clone(&self) -> Self;
  }
  impl Clone for Type2 {
      fn clone(&self) -> Self;
  }
  ```
