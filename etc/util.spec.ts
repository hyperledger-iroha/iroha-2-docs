import { test, expect, describe } from 'vitest'
import { SnippetSourceDefinition } from './types'
import { ParseDefinitionResult, parseSnippetSrc, parseDefinition, rewriteMdLinks } from './util'

describe('Parse snippet src', () => {
  test.each([
    ['./src/snippet.ts', { type: 'fs', path: './src/snippet.ts' }],
    ['http://github.com', { type: 'hyper', url: 'http://github.com' }],
    ['/abs', { type: 'fs', path: '/abs' }],
  ])('Parses %o to %o', (input, result) => {
    expect(parseSnippetSrc(input)).toEqual(result)
  })
})

describe('Parse snippet source definition', () => {
  test.each([
    [{ src: './hey' }, { type: 'ok', saveFilename: 'hey', source: { type: 'fs', path: './hey' }, transform: null }],
    [
      { src: 'https://github.com/file.ts', filename: 'override.ts' },
      {
        type: 'ok',
        source: { type: 'hyper', url: 'https://github.com/file.ts' },
        saveFilename: 'override.ts',
        transform: null,
      },
    ],
  ] satisfies [SnippetSourceDefinition, ParseDefinitionResult][])('Parses %o to %o', (input, output) => {
    expect(parseDefinition(input)).toEqual(output)
  })
})

describe('links rewrite', () => {
  const BASE = 'https://github.com/a/b/c/d/e/f'

  test('./config.md', () => {
    expect(rewriteMdLinks(BASE)(`[cfg](./config.md)`)).toMatchInlineSnapshot(
      '"[cfg](https://github.com/a/b/c/d/e/f/config.md)"',
    )
  })
  test('../../../client#foo', () => {
    expect(rewriteMdLinks(BASE)(`[foo](../../../client#foo)`)).toMatchInlineSnapshot(
      '"[foo](https://github.com/a/b/c/client#foo)"',
    )
  })
})
