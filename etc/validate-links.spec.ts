import { describe, expect, test } from 'vitest'
import { LinkOtherFile, LinkSelfAnchor, parseLink } from './validate-links'

describe('Parse link', () => {
  test('Parse self link', () => {
    const result = parseLink({
      root: '.',
      source: './a/b.html',
      href: '#afse',
    })

    expect(result).toEqual({ type: 'self', anchor: 'afse' } satisfies LinkSelfAnchor)
  })

  test('Parse link with public path', () => {
    const result = parseLink({
      root: '/root',
      source: '/root/foo/bar.html',
      href: '/pub/baz.html',
      publicPath: '/pub/',
    })

    expect(result).toEqual({
      type: 'other',
      file: '/root/baz.html',
    } satisfies LinkOtherFile)
  })

  test('Fallback to index.html when public path is specified', () => {
    const result = parseLink({
      root: '/root',
      source: '/root/foo/bar.html',
      href: '/pub/#zzz',
      publicPath: '/pub/',
    })

    expect(result).toEqual({
      type: 'other',
      file: '/root/index.html',
      anchor: 'zzz',
    } satisfies LinkOtherFile)
  })

  test('Fallback to index.html without public path', () => {
    const result = parseLink({
      root: '/root',
      source: '/root/foo/bar.html',
      href: '/#zzz',
    })

    expect(result).toEqual({
      type: 'other',
      file: '/root/index.html',
      anchor: 'zzz',
    } satisfies LinkOtherFile)
  })

  test('Emoji in anchor (self)', () => {
    const result = parseLink({ root: '/root', source: '/root/index.html', href: '/#🆕' })
    expect(result).toEqual({ type: 'self', anchor: '🆕' } satisfies LinkSelfAnchor)
  })

  test('Emoji in anchor (other)', () => {
    const result = parseLink({ root: '/root', source: '/root/index.html', href: '/other.html#🆕' })
    expect(result).toEqual({ type: 'other', file: '/root/other.html', anchor: '🆕' } satisfies LinkOtherFile)
  })
})
