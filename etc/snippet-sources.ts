import { spawnSync } from 'child_process'
import type { SnippetSourceDefinition } from './types'
import { IROHA_RAW_BASE, IROHA_SOURCE_DIR } from './meta'
import { render as renderDataModelSchema } from './schema'

const ANSI_ESCAPE_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')
const IROHA_SCHEMA_PATH = 'docs/source/references/schema.json'

function irohaRawSource(...segments: string[]): string {
  return `${IROHA_RAW_BASE.replace(/\/$/, '')}/${segments.join('/')}`
}

function generateDataModelSchema(): string {
  if (!IROHA_SOURCE_DIR) {
    throw new Error('IROHA_SOURCE_DIR is not configured.')
  }

  const command = spawnSync('cargo', ['run', '-p', 'iroha_kagami', '--', 'advanced', 'schema'], {
    cwd: IROHA_SOURCE_DIR,
    encoding: 'utf8',
  })

  if (command.status !== 0 || command.error) {
    throw new Error(
      [
        'Failed to generate data-model schema from the configured Iroha source checkout.',
        command.error?.message,
        command.stderr,
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return command.stdout
}

function renderCurrentDataModelSchema(source: string): string {
  let schema = source
  if (source.trim() === '') {
    try {
      schema = generateDataModelSchema()
    } catch (error) {
      const message = (error instanceof Error ? error.message : String(error)).replace(ANSI_ESCAPE_PATTERN, '')
      const detail = message.length > 4000 ? message.slice(-4000) : message
      return [
        '> [!WARNING]',
        '> The Iroha data-model schema snapshot is currently unavailable.',
        `> \`${irohaRawSource(IROHA_SCHEMA_PATH)}\` is empty, and \`kagami advanced schema\` could not generate a replacement from the configured Iroha source checkout.`,
        '>',
        '> Refresh this page with `pnpm get-snippets` after the upstream schema generator succeeds. Set `IROHA_SOURCE_DIR` if you need to generate the schema from a local checkout.',
        '',
        '```text',
        detail,
        '```',
        '',
      ].join('\n')
    }
  }

  return renderDataModelSchema(JSON.parse(schema))
}

export default [
  {
    src: irohaRawSource(IROHA_SCHEMA_PATH),
    filename: 'data-model-schema.md',
    transform: renderCurrentDataModelSchema,
  },
  {
    src: irohaRawSource('docs/source/references/client.template.toml'),
  },
  {
    src: irohaRawSource('docs/source/references/peer.template.toml'),
  },
  {
    src: irohaRawSource('defaults/genesis.json'),
  },
] satisfies SnippetSourceDefinition[]
