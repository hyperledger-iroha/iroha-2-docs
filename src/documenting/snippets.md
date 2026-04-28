# Code Snippets

To make code snippets in the documentation more "real" and robust, it is
better to fetch them directly from the source files. The sources are
located in other repositories, where they are built, run, and tested.

## How it works

### Snippet Sources

Snippet sources are defined in
[`snippet_sources.ts`](https://github.com/hyperledger-iroha/iroha-2-docs/blob/main/etc/snippet-sources.ts).
The `snippet_sources.ts` file is located in the documentation repository. By
default, Iroha snippets are loaded from pinned raw GitHub sources so CI and
preview builds do not require a sibling checkout. Override `IROHA_REV` or
`IROHA_RAW_BASE` to point snippets at another published revision. Set
`IROHA_SOURCE_DIR` when the data-model schema snapshot is empty and you want to
regenerate that page from a local Iroha source checkout.

It has the following format:

```ts
import { IROHA_RAW_BASE } from './meta'

function irohaRawSource(...segments: string[]): string {
  return `${IROHA_RAW_BASE}/${segments.join('/')}`
}

export default [
  {
    src: irohaRawSource('defaults/client.toml'),
  },
  {
    src: './src/example_code/lorem.rs',
  },
]
```

- `src` defines the source file location and could be either an HTTP(s) URI
  or a relative file path.
- `filename` (optional) explicitly defines the local filename.
- `transform` (optional) can derive a snippet from generated source data. The
  data-model reference uses this to render the current schema.

### Fetching Snippets

Code snippets are fetched from the locations specified in
`snippet_sources.ts` and written into the `/src/snippets` directory. There
are two ways to fetch the snippets:

- Automatically after dependencies were installed (i.e. `pnpm install`)
- Manually by calling `pnpm get-snippets`

::: tip

By default, snippets are deleted and reloaded each time `pnpm get-snippets`
is called. For local development it might be more convenient to enable
"lazy" behavior by calling `pnpm get-snippets --force false`.

:::

### Using Snippets in Markdown

Use
[Code Snippets feature in VitePress](https://vitepress.vuejs.org/guide/markdown#import-code-snippets)
to include snippets into documentation:

**Input**

```md
<<<@/example_code/lorem.rs

<<<@/example_code/lorem.rs#ipsum
```

**Output**

<<<@/example_code/lorem.rs

<<<@/example_code/lorem.rs#ipsum

Note that we included only the `#ipsum` code region, not the entire file.
This feature is essential when it comes to including code from real source
files into the documentation.

## Example

Let's add a code snippet from Iroha JavaScript SDK. For example, this one:
[`/packages/docs-recipes/src/1.client-install.ts`](https://github.com/hyperledger-iroha/iroha-javascript/blob/e300886e76c777776efad1e2f5cb245bfb8ed02e/packages/docs-recipes/src/1.client-install.ts).

1. First, get a permalink to the file. Open the file on GitHub and click
   `Raw` button to get the link. For example:
   https://raw.githubusercontent.com/hyperledger-iroha/iroha-javascript/e300886e76c777776efad1e2f5cb245bfb8ed02e/packages/docs-recipes/src/1.client-install.ts

2. Define the new snippet in the [Snippet Sources](#snippet-sources):

   ```ts
   export default [
     /// ...

     {
       src: 'https://raw.githubusercontent.com/hyperledger-iroha/iroha-javascript/e300886e76c777776efad1e2f5cb245bfb8ed02e/packages/docs-recipes/src/1.client-install.ts',
       filename: 'js-sdk-1-client-install.ts',
     },
   ]
   ```

   ::: tip

   Since `snippet_sources.ts` is a TypeScript file, it can use small helper
   functions. Keep those helpers focused: snippets should continue to reflect
   built and tested source files, not hand-written copies.

   :::

3. [Include](#using-snippets-in-markdown) the snippet in any Markdown file
   in the documentation as follows:

   **Input**

   ```md
   <<<@/snippets/js-sdk-1-client-install.ts
   ```

   **Output**

   ```ts
   // Example snippet content fetched into src/snippets/js-sdk-1-client-install.ts
   ```
