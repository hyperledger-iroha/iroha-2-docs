import path from 'path'
import { spawnSync } from 'child_process'
import type { SnippetSourceDefinition } from './types'
import { IROHA_SOURCE_DIR } from './meta'
import { render as renderDataModelSchema } from './schema'

const ANSI_ESCAPE_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')

function irohaSource(...segments: string[]): string {
  return path.join(IROHA_SOURCE_DIR, ...segments)
}

function generateDataModelSchema(): string {
  const command = spawnSync('cargo', ['run', '-p', 'iroha_kagami', '--', 'advanced', 'schema'], {
    cwd: IROHA_SOURCE_DIR,
    encoding: 'utf8',
  })

  if (command.status !== 0 || command.error) {
    throw new Error(
      [`Failed to generate data-model schema from ${IROHA_SOURCE_DIR}.`, command.error?.message, command.stderr]
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
        '> The local Iroha data-model schema snapshot is currently unavailable.',
        `> \`${irohaSource('docs/source/references/schema.json')}\` is empty, and \`kagami advanced schema\` failed against \`${IROHA_SOURCE_DIR}\`.`,
        '>',
        '> Refresh this page with `pnpm get-snippets` after the upstream schema generator succeeds.',
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
    src: irohaSource('docs/source/references/schema.json'),
    filename: 'data-model-schema.md',
    transform: renderCurrentDataModelSchema,
  },
  {
    src: irohaSource('docs/source/references/client.template.toml'),
  },
  {
    src: irohaSource('docs/source/references/peer.template.toml'),
  },
  {
    src: irohaSource('defaults/genesis.json'),
  },
] satisfies SnippetSourceDefinition[]
