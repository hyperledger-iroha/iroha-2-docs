import path from 'path'

export const IROHA_REV = process.env.IROHA_REV ?? '11d3d92d74d278583467461e52f3d390ec18ba64'
export const IROHA_RAW_BASE =
  process.env.IROHA_RAW_BASE ?? `https://raw.githubusercontent.com/hyperledger-iroha/iroha/${IROHA_REV}`
export const IROHA_SOURCE_DIR = path.resolve(process.env.IROHA_SOURCE_DIR ?? path.resolve(__dirname, '../../iroha'))
