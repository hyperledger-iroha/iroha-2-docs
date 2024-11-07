import { SnippetSourceDefinition } from './types'
import { match, P } from 'ts-pattern'
import path from 'path'
import { URL } from 'url'
import fs from 'fs/promises'

export async function isAccessible(path: string): Promise<boolean> {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false)
}

export function parseSnippetSrc(src: string): ParsedSource {
  if (/^http(s)?:\/\//.test(src)) return { type: 'hyper', url: src }
  return { type: 'fs', path: src }
}

type ParsedSource = { type: 'fs'; path: string } | { type: 'hyper'; url: string }

export interface ParsedSnippetDefinition {
  source: ParsedSource
  saveFilename: string
  transform: null | ((content: string) => Promise<string>)
}

export type ParseDefinitionResult = ({ type: 'ok' } & ParsedSnippetDefinition) | { type: 'error'; err: Error }

export function parseDefinition(definition: SnippetSourceDefinition): ParseDefinitionResult {
  return match(parseSnippetSrc(definition.src))
    .with({ type: P.union('fs', 'hyper') }, (source): ParseDefinitionResult => {
      let saveFilename: string

      if (definition.filename) {
        saveFilename = definition.filename
      } else {
        const uri = match(source)
          .with({ type: 'fs' }, (x) => x.path)
          .with({ type: 'hyper' }, (x) => x.url)
          .exhaustive()

        saveFilename = path.basename(uri)
      }

      const { transform } = definition

      return {
        type: 'ok',
        source,
        saveFilename,
        transform: transform ? async (x) => transform(x) : null,
      }
    })
    .exhaustive()
}

export function detectSaveCollisions(
  parsedDefinitions: ParsedSnippetDefinition[],
): Map<string, [ParsedSource, ParsedSource, ...ParsedSource[]]> {
  const map = new Map<string, ParsedSource[]>()

  for (const i of parsedDefinitions) {
    const items = map.get(i.saveFilename) ?? []
    items.push(i.source)
    map.set(i.saveFilename, items)
  }

  return new Map(
    [...map].filter((x): x is [string, [ParsedSource, ParsedSource, ...ParsedSource[]]] => x[1].length > 1),
  )
}

export function concurrentTasks<T>(data: T[], fn: (data: T) => Promise<void>, maxConcurrency = 20): Promise<void> {
  let cursor = 0
  let wip = 0

  let resolve: () => void
  let reject: (reason?: unknown) => void
  const promise = new Promise<void>((promResolve, promReject) => {
    resolve = promResolve
    reject = promReject
  })

  function handleResolve() {
    wip--
    if (!wip && cursor === data.length) resolve()
    else executeTasks()
  }

  function handleReject(reason?: unknown) {
    reject(reason)
  }

  function executeTasks() {
    while (wip < maxConcurrency && cursor < data.length) {
      const dataItem = data[cursor++]
      fn(dataItem).then(handleResolve).catch(handleReject)
      wip++
    }
  }

  executeTasks()
  return promise
}

/**
 * Replace relative to some URL Markdown links with actual links to that URL
 *
 * Examples:
 *
 * - `(./config.md#some_hash)` -> `(<base>/config.md#some_hash)`
 * - `(../../client)` -> `(<base with applied ../../>/client)`
 *
 * FIXME: unused
 */
export function rewriteMdLinks(base: string): (markdown: string) => string {
  return (markdown) =>
    markdown.replaceAll(/\((\..+?)([)#])/g, (_sub, relative, ending) => {
      const rewritten = new URL(path.join(base, relative)).href
      return `(${rewritten}${ending}`
    })
}
