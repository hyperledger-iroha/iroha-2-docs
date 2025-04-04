// FIXME: this file reflects types from `@iroha2/data-model-schema` package which isn't published yet
//        https://github.com/hyperledger-iroha/iroha-javascript/pull/170

export interface Schema {
  [type: string]: SchemaTypeDefinition
}

export type SchemaTypeDefinition =
  | UnitType
  | DirectAlias
  | MapDefinition
  | VecDefinition
  | OptionDefinition
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
