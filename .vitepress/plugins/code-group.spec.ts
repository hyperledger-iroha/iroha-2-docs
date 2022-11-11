import { test, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import { codeGroupPlugin } from './code-group'

function mdFactory() {
  const md = new MarkdownIt()
  md.use(codeGroupPlugin)
  return md
}

test('single tab without title', () => {
  const result = mdFactory().render(`
# Hello

:::code-group

\`\`\`ts   
console.log()
\`\`\`

:::`)

  expect(result).toMatchInlineSnapshot(`
    "<h1>Hello</h1>
    <CodeGroup :blocks=\\"1\\" :langs=\\"{0: 'ts'}\\">
    <template #block-0>
    <pre><code class=\\"language-ts\\">console.log()
    </code></pre>
    </template>
    </CodeGroup>"
  `)
})

test('multiple tabs with titles and non-fence slots', () => {
  const result = mdFactory().render(`
:::code-group

\`\`\`
.-.
\`\`\`

# My Title

\`\`\`rs
struct New;
\`\`\`

:::`)

  expect(result).toMatchInlineSnapshot(`
    "<CodeGroup :blocks=\\"2\\" :langs=\\"{1: 'rs'}\\">
    <template #block-0>
    <pre><code>.-.
    </code></pre>
    </template>
    <template #block-1-title>My Title</template>
    <template #block-1>
    <pre><code class=\\"language-rs\\">struct New;
    </code></pre>
    </template>
    </CodeGroup>"
  `)
})

test('code-group within a list', () => {
  const result = mdFactory().render(`
- List item:
  
  :::code-group

  :::
  `)

  expect(result).toMatchInlineSnapshot(`
    "<ul>
    <li>
    <p>List item:</p>
    <CodeGroup :blocks=\\"0\\" :langs=\\"{}\\">
    </CodeGroup></li>
    </ul>
    "
  `)
})

test('code-group within a blockquote', () => {
  const result = mdFactory().render(`
> Quote
>
> :::code-group
>
> :::
  `)

  expect(result).toMatchInlineSnapshot(`
    "<blockquote>
    <p>Quote</p>
    <CodeGroup :blocks=\\"0\\" :langs=\\"{}\\">
    </CodeGroup></blockquote>
    "
  `)
})

test('multiple code-groups in a document', () => {
  const result = mdFactory().render(`
:::code-group

\`\`\`ts
const foo = 'bar'
\`\`\`

:::

----

:::code-group

\`\`\`js
const bar = 'baz'
\`\`\`

:::
  `)

  expect(result).toMatchInlineSnapshot(`
    "<CodeGroup :blocks=\\"1\\" :langs=\\"{0: 'ts'}\\">
    <template #block-0>
    <pre><code class=\\"language-ts\\">const foo = 'bar'
    </code></pre>
    </template>
    </CodeGroup><hr>
    <CodeGroup :blocks=\\"1\\" :langs=\\"{0: 'js'}\\">
    <template #block-0>
    <pre><code class=\\"language-js\\">const bar = 'baz'
    </code></pre>
    </template>
    </CodeGroup>"
  `)
})

test('code fence within a group has line highlighting data', () => {
  const result = mdFactory().render(`
:::code-group
\`\`\`ts{1-3}
\`\`\`
:::
  `)

  expect(result).toMatchInlineSnapshot(`
    "<CodeGroup :blocks=\\"1\\" :langs=\\"{0: 'ts'}\\">
    <template #block-0>
    <pre><code class=\\"language-ts{1-3}\\"></code></pre>
    </template>
    </CodeGroup>"
  `)
})
