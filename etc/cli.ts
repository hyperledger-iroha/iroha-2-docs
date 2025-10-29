import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { SNIPPET_SRC_DIR } from './const'
import SOURCES from './snippet-sources'
import { SnippetSourceDefinition } from './types'
import { concurrentTasks, detectSaveCollisions, isAccessible, parseDefinition, ParsedSnippetDefinition } from './util'
import { match, P } from 'ts-pattern'
import fs from 'fs/promises'
import chalk from 'chalk'
import fetch from 'node-fetch'
import path from 'path'
import makeDir from 'make-dir'
import { deleteAsync } from 'del'
import { scanAndReport } from './validate-links'

async function prepareOutputDir(options?: { clean?: boolean }) {
  const optionClean = options?.clean ?? false

  const dirDisplay = chalk.bold(path.relative(process.cwd(), SNIPPET_SRC_DIR))

  return Promise.resolve()
    .then<unknown>(
      () => optionClean && deleteAsync([SNIPPET_SRC_DIR]).then(() => console.info(chalk`Deleted ${dirDisplay}`)),
    )
    .then(() => makeDir(SNIPPET_SRC_DIR).then(() => console.info(chalk`Created ${dirDisplay}`)))
}

async function processSnippet(
  parsed: ParsedSnippetDefinition,
  options?: { force?: boolean },
): Promise<'skipped' | 'written'> {
  const writePath = path.join(SNIPPET_SRC_DIR, parsed.saveFilename)

  if (!options?.force && (await isAccessible(writePath))) {
    return 'skipped'
  }

  const fileContent: string = await match<typeof parsed.source, Promise<string>>(parsed.source)
    .with({ type: 'fs' }, async ({ path: snippetPath }) => {
      return fs.readFile(snippetPath, { encoding: 'utf-8' })
    })
    .with({ type: 'hyper' }, async ({ url }) => {
      return fetch(url).then((x) => {
        if (x.ok) return x.text()
        throw new Error(`Failed to fetch: ${x.status}`)
      })
    })
    .exhaustive()
    .then((content) => parsed.transform?.(content) ?? content)

  await fs.writeFile(writePath, fileContent)

  return 'written'
}

yargs(hideBin(process.argv))
  .command(
    'get-snippets',
    'Parses snippet sources and collects them',
    (y) => y.option('force', { type: 'boolean', default: true }),
    async (opts) => {
      const parseResult = SOURCES.map((x) => [x, parseDefinition(x)] as const).reduce<{
        ok: ParsedSnippetDefinition[]
        err: { source: SnippetSourceDefinition; err: Error }[]
      }>(
        (acc, [item, result]) => {
          match([result, acc] as const)
            .with([{ type: 'error' }, P._], ([{ err }]) => acc.err.push({ source: item, err }))
            .with([{ type: 'ok' }, P.when((x) => !x.err.length)], ([res]) => acc.ok.push(res))
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .otherwise(() => {})

          return acc
        },
        { ok: [], err: [] },
      )

      if (parseResult.err.length) {
        for (const { source, err } of parseResult.err) {
          console.error(chalk.red`Failed to parse snippet with source {bold ${source.src}}: ${String(err)}`)
        }
        throw new Error('Failed to parse sources')
      }

      const { ok: parsed } = parseResult

      {
        const collisions = detectSaveCollisions(parsed)
        let thereAreCollisions = false
        for (const [saveFile, sources] of collisions) {
          thereAreCollisions = true

          const sourcesJoined = sources
            .map((x) =>
              chalk.bold(
                match(x)
                  .with({ type: 'fs' }, ({ path }) => `(fs) ${path}`)
                  .with({ type: 'hyper' }, ({ url }) => `(http) ${url}`)
                  .exhaustive(),
              ),
            )
            .join(', ')
          console.error(
            chalk.red`Multiple sources resolves into the same save file name {bold ${saveFile}}: ${sourcesJoined}`,
          )
        }
        if (thereAreCollisions) throw new Error('Collisions found')
      }

      await prepareOutputDir({ clean: opts.force })

      {
        let done = 0
        const total = String(parsed.length)
        const progressLabel = () => `[${String(done).padStart(total.length, ' ')}/${total}]`

        console.log('Fetching snippets...')

        await concurrentTasks(parsed, async (src) => {
          try {
            const result = await processSnippet(src, { force: opts.force })
            done++
            match(result)
              .with('written', () => console.log(chalk.green`${progressLabel()} Written {bold ${src.saveFilename}}`))
              .with('skipped', () => console.log(chalk.gray`${progressLabel()} Skipped {bold ${src.saveFilename}}`))
              .exhaustive()
          } catch (err) {
            console.log(chalk.red`Failed to process {bold ${src.saveFilename}}`)
            throw err
          }
        })

        console.log('Done')
      }
    },
  )
  .command(
    'validate-links <root>',
    'Parses HTML output of VitePress and detects broken links',
    (y) =>
      y
        .positional('root', { description: "Root directory of VitePress's output", type: 'string', demandOption: true })
        .option('public-path', { description: 'Public path, used in the links', default: null, type: 'string' }),
    async (opts) => {
      await scanAndReport({
        root: opts.root,
        publicPath: opts.publicPath ?? undefined,
      })
    },
  )
  .showHelpOnFail(false)
  .parse()
