import path from 'path'

export const IROHA_REV = process.env.IROHA_REV ?? 'i23-features'
export const IROHA_RAW_BASE =
  process.env.IROHA_RAW_BASE ?? `https://raw.githubusercontent.com/hyperledger-iroha/iroha/${IROHA_REV}`
export const IROHA_SOURCE_DIR = process.env.IROHA_SOURCE_DIR ? path.resolve(process.env.IROHA_SOURCE_DIR) : undefined
