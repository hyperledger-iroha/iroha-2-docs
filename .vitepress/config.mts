/// <reference types="vite/client" />

import { DefaultTheme, defineConfig } from 'vitepress'
import footnote from 'markdown-it-footnote'
import { resolve } from 'path'
import ViteSvgLoader from 'vite-svg-loader'
import ViteUnoCSS from 'unocss/vite'
import { mermaid } from './md-mermaid'
import { katex } from '@mdit/plugin-katex'

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Get Started',
      link: '/get-started/',
      activeMatch: '/get-started/',
    },
    {
      text: 'Build on Iroha',
      link: '/guide/tutorials/',
      activeMatch: '/guide/',
    },
    {
      text: 'Iroha Explained',
      link: '/blockchain/iroha-explained',
      activeMatch: '/blockchain/',
    },
    {
      text: 'Reference',
      link: '/reference/torii-endpoints',
      activeMatch: '^/reference/',
    },
    {
      text: 'Help',
      link: '/help/',
      activeMatch: '/help/',
    },
    {
      text: 'News',
      link: '/news/',
      activeMatch: '/news/',
    },
  ]
}

function sidebarStart(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Get Started',
      link: '/get-started/',
      items: [
        {
          text: 'Install Iroha',
          link: '/get-started/install-iroha-2',
        },
        {
          text: 'Launch Iroha',
          link: '/get-started/launch-iroha-2',
        },
        {
          text: 'Operate Iroha via CLI',
          link: '/get-started/operate-iroha-2-via-cli',
        },
        {
          text: 'Iroha 2 vs. Iroha 1',
          link: '/get-started/iroha-2',
        },
        {
          text: 'Join Iroha 2 Public Testnet',
          link: 'https://wiki.sora.org/running-a-sora-testnet-node.html',
        },
      ],
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'SDK Tutorials',
      link: '/guide/tutorials/',
      collapsed: false,
      items: [
        /* a common lang-agnostic section will go here */
        {
          text: 'Rust',
          link: '/guide/tutorials/rust',
        },
        {
          text: 'Python 3',
          link: '/guide/tutorials/python',
        },
        {
          text: 'Kotlin/Java',
          link: '/guide/tutorials/kotlin-java',
        },
        {
          text: 'JavaScript',
          link: '/guide/tutorials/javascript',
        },
        {
          text: 'Compatibility Matrix',
          link: '/reference/compatibility-matrix',
        },
      ],
    },
    {
      text: 'Configuration and Management',
      collapsed: false,
      items: [
        {
          text: 'Configure Iroha',
          collapsed: true,
          items: [
            {
              text: 'Client Configuration',
              link: '/guide/configure/client-configuration',
            },
            {
              text: 'Genesis Block',
              link: '/guide/configure/genesis',
            },
            {
              text: 'Metadata and Store assets',
              link: '/guide/configure/metadata-and-store-assets',
            },
          ],
        },
        {
          text: 'Keys for Network Deployment',
          link: '/guide/configure/keys-for-network-deployment.md',
        },
        {
          text: 'Peer Management',
          link: '/guide/configure/peer-management',
        },
        {
          text: 'Public and Private Blockchains',
          link: '/guide/configure/modes',
        },
      ],
    },
    {
      text: 'Security',
      link: '/guide/security/',
      collapsed: false,
      items: [
        {
          text: 'Security Principles',
          link: '/guide/security/security-principles.md',
        },
        {
          text: 'Operational Security',
          link: '/guide/security/operational-security.md',
        },
        {
          text: 'Password Security',
          link: '/guide/security/password-security.md',
        },
        {
          text: 'Public Key Cryptography',
          collapsed: true,
          link: '/guide/security/public-key-cryptography.md',
          items: [
            {
              text: 'Generating Cryptographic Keys',
              link: '/guide/security/generating-cryptographic-keys.md',
            },
            {
              text: 'Storing Cryptographic Keys',
              link: '/guide/security/storing-cryptographic-keys.md',
            },
          ],
        },
      ],
    },
    {
      text: 'Advanced Use Cases',
      collapsed: false,
      items: [
        {
          text: 'Iroha On Bare Metal',
          link: '/guide/advanced/running-iroha-on-bare-metal',
        },
        {
          text: 'Hot Reload Iroha',
          link: '/guide/advanced/hot-reload',
        },
        {
          text: 'Monitor Iroha Performance',
          link: '/guide/advanced/metrics',
        },
      ],
    },
    /*    {
      text: 'Reports',
      collapsed: true,
      items: [
        {
          text: 'CSD/RTGS linkages via on-chain scripting',
          link: '/guide/reports/csd-rtgs',
        },
      ],
    },
*/
  ]
}

function sidebarChain(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Iroha Explained',
      link: '/blockchain/iroha-explained',
      items: [
        {
          text: 'Overview',
          items: [
            {
              text: 'Transactions',
              link: '/blockchain/transactions',
            },
            {
              text: 'Consensus',
              link: '/blockchain/consensus',
            },
            {
              text: 'Data Model',
              link: '/blockchain/data-model',
            },
          ],
        },
        {
          text: 'Entities',
          items: [
            {
              text: 'Assets',
              link: '/blockchain/assets',
            },
            /*
            {
              text: 'Accounts',
              link: '/blockchain/accounts',
            },
            {
              text: 'Domains',
              link: '/blockchain/domains',
            },
            */
            {
              text: 'Metadata',
              link: '/blockchain/metadata',
            },
            {
              text: 'Events',
              link: '/blockchain/events',
            },
            {
              text: 'Filters',
              link: '/blockchain/filters',
            },
            {
              text: 'Triggers',
              link: '/blockchain/triggers',
              items: [
                {
                  text: 'Event Triggers by Example',
                  link: '/blockchain/trigger-examples',
                },
              ],
            },
            {
              text: 'Queries',
              link: '/blockchain/queries',
            },
            {
              text: 'Permissions',
              link: '/blockchain/permissions',
            },
            {
              text: 'World',
              link: '/blockchain/world',
            },
          ],
        },
        {
          text: 'Operations',
          items: [
            {
              text: 'Instructions',
              link: '/blockchain/instructions',
            },
            {
              text: 'Expressions',
              link: '/blockchain/expressions',
            },
            {
              text: 'Web Assembly',
              link: '/blockchain/wasm',
            },
          ],
        },
      ],
    },
  ]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Reference',
      items: [
        {
          text: 'Glossary',
          link: '/reference/glossary.md',
        },
        {
          text: 'Naming Conventions',
          link: '/reference/naming.md',
        },
        {
          text: 'Data Model Schema',
          link: '/reference/data-model-schema',
        },
        {
          text: 'Instructions',
          link: '/reference/instructions',
        },
        {
          text: 'Queries',
          link: '/reference/queries.md',
        },
        {
          text: 'Permissions',
          link: '/reference/permissions.md',
        },
        {
          text: 'Binaries',
          link: '/reference/binaries.md',
        },
        {
          text: 'irohad CLI',
          link: '/reference/irohad-cli.md',
        },
        {
          text: 'Torii HTTP API',
          link: '/reference/torii-endpoints.md',
        },
        {
          text: 'Foreign Function Interfaces',
          link: '/reference/ffi',
        },
        {
          text: 'Peer Configuration',
          link: '/reference/peer-config/index.md',
          items: [
            { text: 'Parameters', link: '/reference/peer-config/params.md' },
            { text: 'Migration from pre-rc.20', link: '/reference/peer-config/migration.md' },
          ],
        },
        {
          text: 'Genesis Block',
          link: '/reference/genesis.md',
        },
      ],
    },
  ]
}

function sidebarHelp(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Receive support',
      link: '/help/',
    },
    {
      text: 'Troubleshooting',
      items: [
        {
          text: 'Overview',
          link: '/help/overview',
        },
        {
          text: 'Installation',
          link: '/help/installation-issues',
        },
        {
          text: 'Configuration',
          link: '/help/configuration-issues',
        },
        {
          text: 'Deployment',
          link: '/help/deployment-issues',
        },
        {
          text: 'Integration',
          link: '/help/integration-issues',
        },
      ],
    },
  ]
}

function sidebarNews(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'News',
      link: '/news/',
    },
    {
      text: 'Socials',
      link: '/news/socials',
    },
     {
      text: 'Developer Updates',
      link: '/news/dev-updates/',
    },
  ]
}

const BASE = process.env.PUBLIC_PATH ?? '/'

export default defineConfig({
  base: BASE,
  srcDir: 'src',
  srcExclude: ['snippets/*.md'],
  title: "Hyperledger Iroha 2 Docs | World's Most Advanced Blockchain Framework",
  description:
    'Documentation for Hyperledger Iroha 2 offering step-by-step guides for SDKs and outlining the main differences between Iroha versions.',
  lang: 'en-US',
  vite: {
    plugins: [ViteUnoCSS('../uno.config.ts'), ViteSvgLoader()],
    envDir: resolve(__dirname, '../'),
  },
  lastUpdated: true,

  head: [
    // Based on: https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
    ['link', { rel: 'icon', href: BASE + 'favicon.ico', sizes: 'any' }],
    ['link', { rel: 'icon', href: BASE + 'icon.svg', sizes: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: BASE + 'apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: BASE + 'manifest.webmanifest' }],
    // Google Analytics integration
    ['script', { src: 'https://www.googletagmanager.com/gtag/js?id=G-D6ETK9TN47' }],
    [
      'script',
      {},
      `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-D6ETK9TN47');
    `,
    ],
    // KaTeX stylesheet
    ['link', { rel: 'stylesheet', href: 'https://esm.sh/katex@0.16.8/dist/katex.min.css' }],
  ],

  markdown: {
    async config(md) {
      md.use(footnote)
        .use(mermaid)
        // Note: Since vitepress@1.0.0-rc.14, it supports MathJax natively with `markdown.math = true`:
        //   https://github.com/vuejs/vitepress/pull/2977
        // Although KaTeX is more efficient, we might consider removing it in the future.
        .use(katex)
    },
  },

  themeConfig: {
    logo: '/icon.svg',
    siteTitle: 'Iroha 2',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hyperledger-iroha/iroha-2-docs' },
      {
        icon: {
          /**
           * https://icones.js.org/collection/material-symbols?s=bug
           */
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-1.625 0-3.013-.8T6.8 18H4.975q-.425 0-.7-.288T4 17q0-.425.288-.713T5 16h1.1q-.075-.5-.088-1T6 14H4.975q-.425 0-.7-.288T4 13q0-.425.288-.713T5 12h1q0-.5.013-1t.087-1H4.975q-.425 0-.7-.288T4 9q0-.425.288-.713T5 8h1.8q.35-.575.788-1.075T8.6 6.05l-.925-.95q-.275-.3-.263-.713T7.7 3.7q.275-.275.7-.275t.7.275l1.45 1.45q.7-.225 1.425-.225t1.425.225l1.5-1.475q.3-.275.713-.262t.687.287q.275.275.275.7t-.275.7l-.95.95q.575.375 1.038.863T17.2 8h1.825q.425 0 .7.288T20 9q0 .425-.288.713T19 10h-1.1q.075.5.088 1T18 12h1.025q.425 0 .7.288T20 13q0 .425-.288.713T19 14h-1q0 .5-.013 1t-.087 1h1.125q.425 0 .7.288T20 17q0 .425-.288.713T19 18h-1.8q-.8 1.4-2.188 2.2T12 21Zm0-2q1.65 0 2.825-1.175T16 15v-4q0-1.65-1.175-2.825T12 7q-1.65 0-2.825 1.175T8 11v4q0 1.65 1.175 2.825T12 19Zm-1-3h2.025q.425 0 .7-.288T14 15q0-.425-.288-.713T13 14h-2.025q-.425 0-.7.288T10 15q0 .425.288.713T11 16Zm0-4h2.025q.425 0 .7-.288T14 11q0-.425-.288-.713T13 10h-2.025q-.425 0-.7.288T10 11q0 .425.288.713T11 12Zm1 1Z"/></svg>`,
        },
        link: 'https://github.com/hyperledger-iroha/iroha-2-docs/issues/new',
      },
    ],

    editLink: {
      pattern: 'https://github.com/hyperledger-iroha/iroha-2-docs/edit/main/src/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Last Updated',
    },

    nav: nav(),

    sidebar: {
      '/get-started/': sidebarStart(),
      '/guide/': sidebarGuide(),
      '/blockchain/': sidebarChain(),
      '/reference/': sidebarReference(),
      '/help/': sidebarHelp(),
      '/news/': sidebarNews(),
    },

    search: {
      provider: 'local',
    },
  },
})
