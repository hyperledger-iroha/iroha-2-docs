// Types accepted by the docs schema renderer. They mirror the JSON emitted by
// `kagami advanced schema` in the local Iroha workspace.

export interface Schema {
  [type: string]: SchemaTypeDefinition
}

export type SchemaTypeDefinition =
  | UnitType
  | DirectAlias
  | MapDefinition
  | VecDefinition
  | OptionDefinition
  | ResultDefinition
  | NamedStructDefinition
  | EnumDefinition
  | ArrayDefinition
  | IntDefinition
  | FixedPointDefinition
  | TupleDef
  | BitmapDef

export interface MapDefinition {
  Map: {
    key: TypePath
    value: TypePath
  }
}

export interface TupleDef {
  Tuple: TypePath[]
}

export type DirectAlias = TypePath

export interface VecDefinition {
  Vec: TypePath
}

export interface ArrayDefinition {
  Array: {
    len: number
    type: TypePath
  }
}

export interface OptionDefinition {
  Option: TypePath
}

export interface ResultDefinition {
  Result: {
    ok: TypePath
    err: TypePath
  }
}

export interface NamedStructDefinition {
  Struct: Array<{
    name: string
    type: TypePath
  }>
}

export interface EnumDefinition {
  Enum: Array<EnumVariantDefinition>
}

export interface EnumVariantDefinition {
  tag: string
  discriminant: number
  type?: TypePath
}

export interface IntDefinition {
  Int: string
}

export interface FixedPointDefinition {
  FixedPoint: {
    base: string
    decimal_places: number
  }
}

export type TypePath = string

export type UnitType = null

export interface BitmapMask {
  name: string
  mask: number
}

export interface BitmapDef {
  Bitmap: {
    repr: string
    masks: Array<BitmapMask>
  }
}
