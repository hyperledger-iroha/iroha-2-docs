import path from 'path'

export const IROHA_SOURCE_DIR = path.resolve(process.env.IROHA_SOURCE_DIR ?? path.resolve(__dirname, '../../iroha'))
