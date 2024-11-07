import { Schema, SchemaTypeDefinition as Segment } from './types'
import { match, P } from 'ts-pattern'
// https://github.com/vuejs/vitepress/blob/b16340acbd3c60fee023daadb0ec5a0292060a1e/src/node/markdown/markdown.ts#L13
import { slugify } from '@mdit-vue/shared'

function segmentHeading(content: string) {
  return `## ${code(content)}`
}

function segmentPropNameOnly(prop: string) {
  return `**${prop}:**`
}

function segmentProp(name: string, content: string) {
  return `${segmentPropNameOnly(name)} ${content}`
}

function segmentType(type: string) {
  return segmentProp('Type', type)
}

function joinDouble(...lines: string[]): string {
  return lines.join('\n\n')
}

function tyMdLink(ty: string) {
  return match(ty)
    .with(
      P.when((x: string): x is `u${number}` => /^u\d+$/.test(x)),
      'bool',
      'Bool',
      'String',
      (x) => `${code(x)}`,
    )
    .otherwise((ty) => `[${code(ty)}](#${slugify(ty)})`)
}

function code(content: string) {
  return `\`${content}\``
}

function table(
  cols: (string | { title: string; align?: 'left' | 'right' | 'center' })[],
  rows: string[][],
  options: { indent: string },
): string {
  const { titles, aligns } = cols
    .map<[string, string]>((x) =>
      typeof x === 'string'
        ? [x, '---']
        : [
            x.title,
            match(x.align)
              .with('left', () => ':--')
              .with('center', () => ':-:')
              .with('right', () => '--:')
              .with(undefined, () => '---')
              .exhaustive(),
          ],
    )
    .reduce<{ titles: string[]; aligns: string[] }>(
      (acc, [title, align]) => {
        acc.titles.push(title)
        acc.aligns.push(align)
        return acc
      },
      { titles: [], aligns: [] },
    )

  return [titles, aligns, ...rows].map((row) => `${options.indent}| ${row.join(' | ')} |`).join('\n')
}

function predicateNotFalse<T>(value: false | T): value is T {
  return Boolean(value)
}

function renderSegment(segment: Segment, segmentName: string): string {
  const heading = segmentHeading(segmentName)

  const body = match<Segment, string>(segment)
    .with({ Struct: P.select() }, (declarations) =>
      joinDouble(
        segmentType('Struct'),
        segmentPropNameOnly('Declarations'),
        table(
          [
            { title: 'Field name', align: 'right' },
            { title: 'Field value', align: 'left' },
          ],
          declarations.map((x) => [code(x.name), tyMdLink(x.type)]),
          { indent: '  ' },
        ),
      ),
    )
    .with({ Enum: P.select() }, (variants) =>
      joinDouble(
        segmentType('Enum'),
        segmentPropNameOnly('Variants'),
        table(
          [{ title: 'Variant name', align: 'right' }, { title: 'Variant value', align: 'left' }, 'Discriminant'],
          variants.map((x) => [code(x.tag), x.type ? tyMdLink(x.type) : `&mdash;`, String(x.discriminant)]),
          { indent: '  ' },
        ),
      ),
    )
    .with({ Tuple: P.select() }, (types) =>
      joinDouble(
        // .
        segmentType('Tuple'),
        segmentProp('Values', `(` + types.map((ty) => tyMdLink(ty)).join(', ') + `)`),
      ),
    )
    .with({ Map: P.select() }, ({ key, value }) =>
      joinDouble(
        ...[
          segmentType('Map'),
          segmentProp('Key', tyMdLink(key)),
          segmentProp('Value', tyMdLink(value)),
          // sorted_by_key && segmentProp('Sorted by key', 'Yes'),
        ].filter(predicateNotFalse),
      ),
    )
    .with({ Vec: P.select() }, (ty) =>
      joinDouble(
        ...[
          //
          segmentType('Vec'),
          segmentProp('Value', tyMdLink(ty)),
          // sorted && segmentProp('Sorted', 'Yes'),
        ].filter(predicateNotFalse),
      ),
    )
    .with({ Int: P.select() }, (str) => joinDouble(segmentType('Int'), segmentProp('Kind', str)))
    .with({ FixedPoint: P.select() }, ({ base, decimal_places }) =>
      joinDouble(
        segmentType('Fixed Point'),
        segmentProp('Base', code(base)),
        segmentProp('Decimal places', String(decimal_places)),
      ),
    )
    .with({ Array: P.select() }, ({ type, len }) =>
      joinDouble(
        // .
        segmentType('Array'),
        segmentProp('Length', String(len)),
        segmentProp('Value', tyMdLink(type)),
      ),
    )
    .with({ Option: P.select() }, (ty) =>
      joinDouble(
        // .
        segmentType('Option'),
        segmentProp('Some', tyMdLink(ty)),
      ),
    )
    .with(P.string, (alias) =>
      joinDouble(
        // .
        segmentType('Alias'),
        segmentProp('To', tyMdLink(alias)),
      ),
    )
    .with(null, () => segmentType('Zero-Size Type (unit type, null type)'))
    .with({ Bitmap: P.select() }, ({ repr, masks }) =>
      joinDouble(
        // .
        segmentType('Bitmap'),
        segmentProp('Repr', repr),
        segmentPropNameOnly('Masks'),
        table(
          [
            { title: 'Field name', align: 'right' },
            { title: 'Field value', align: 'left' },
          ],
          masks.map((x) => [code(x.name), code('0x' + x.mask.toString(16))]),
          { indent: '  ' },
        ),
      ),
    )
    .exhaustive()

  return joinDouble(heading, body)
}

/**
 * Returns Markdown
 */
export function render(schema: Schema): string {
  const entries = Object.entries(schema)
  return joinDouble(...entries.map(([name, segment]) => renderSegment(segment, name)))
}
