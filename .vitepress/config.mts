/// <reference types="vite/client" />

import { defineConfig, DefaultTheme } from 'vitepress'
import footnote from 'markdown-it-footnote'
import { resolve } from 'path'
import ViteSvgLoader from 'vite-svg-loader'
import ViteUnoCSS from 'unocss/vite'
import { mermaid } from './md-mermaid'
import { katex } from '@mdit/plugin-katex'

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      items: [
        // { text: 'Get Started', link: '/guide/get-started/index' },
        // { text: 'Build and Install', link: '/guide/get-started/install-iroha' },
        // { text: 'Tutorials', link: '/guide/get-started/tutorials'},
        {
          text: 'Get Started',
          items: [
            { text: 'Install and Build', link: '/guide/get-started/install-iroha-2' },
            { text: 'SDK Tutorials', link: '/guide/get-started/tutorials' },
          ],
        },
        // every part of guides needs an intro
        { text: 'How Iroha Works', link: '/guide/blockchain/how-iroha-works' },
        { text: 'Security', link: '/guide/security/index' },
        { text: 'Configuration and Management', link: '/guide/configure/overview' },
        { text: 'Troubleshooting', link: '/guide/troubleshooting/overview' },
      ],
    },
    {
      text: 'Reference',
      link: '/reference/torii-endpoints',
      activeMatch: '/reference/',
    },
    {
      text: 'Cookbook',
      link: '/cookbook/',
      activeMatch: '/cookbook/',
    },
  ]
}

function sidebarCookbook(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Access Control',
      collapsed: true,
      items: [
        {
          text: 'Permission Tokens',
          collapsed: true,
          items: [
            {
              text: 'Grant Permissions',
              link: '/cookbook/grant-permissions',
            },
            {
              text: 'Revoke Permissions',
              link: '/cookbook/revoke-permissions',
            },
          ],
        },
        {
          text: 'Roles',
          collapsed: true,
          items: [
            {
              text: 'Register a Role',
              link: '/cookbook/register-roles',
            },
            {
              text: 'Grant a Role',
              link: '/cookbook/grant-roles',
            },
            {
              text: 'Revoke a Role',
              link: '/cookbook/revoke-roles',
            },
          ],
        },
      ],
    },
    {
      text: 'Accounts',
      collapsed: true,
      items: [
        {
          text: 'Register Accounts',
          link: '/cookbook/register-accounts',
        },
        {
          text: 'Unregister Accounts',
          link: '/cookbook/unregister-accounts',
        },
      ],
    },
    {
      text: 'Asset Definitions',
      collapsed: true,
      items: [
        {
          text: 'Register Asset Definitions',
          link: '/cookbook/register-asset-definitions',
        },
        {
          text: 'Unregister Asset Definitions',
          link: '/cookbook/unregister-asset-definitions',
        },
        {
          text: 'Transfer Asset Definitions',
          link: '/cookbook/transfer-asset-definitions',
        },
      ],
    },
    {
      text: 'Assets',
      collapsed: true,
      items: [
        {
          text: 'Assets',
          collapsed: true,
          items: [
            {
              text: 'Register Assets',
              link: '/cookbook/register-assets',
            },
            {
              text: 'Unregister Assets',
              link: '/cookbook/unregister-assets',
            },
            {
              text: 'Transfer Assets Between Accounts',
              link: '/cookbook/transfer-assets',
            },
            {
              text: 'Transfer Groups of Assets',
              link: '/cookbook/transfer-group-assets',
            },
          ],
        },
        {
          text: 'Numeric Assets',
          collapsed: true,
          items: [
            {
              text: 'Work with Numeric Assets',
              link: '/cookbook/work-with-numeric-assets',
            },
          ],
        },
        {
          text: 'Store Assets',
          collapsed: true,
          items: [
            {
              text: 'Work with Store Assets',
              link: '/cookbook/work-with-store-assets',
            },
          ],
        },
        {
          text: 'Mintable Assets',
          collapsed: true,
          items: [
            {
              text: 'Mint Assets',
              link: '/cookbook/mint-assets',
            },
            {
              text: 'Mint More of a Mintable Asset',
              link: '/cookbook/mint-more-assets',
            },
            {
              text: 'Burn Assets',
              link: '/cookbook/burn-assets',
            },
          ],
        },
        {
          text: 'Non-Mintable Assets',
          collapsed: true,
          items: [
            {
              text: 'Work with Non-Mintable Assets',
              link: '/cookbook/work-with-non-mintable-assets',
            },
          ],
        },
        {
          text: 'Tokens',
          collapsed: true,
          items: [
            {
              text: 'Create Asset-backed Tokens',
              link: '/cookbook/create-asset-backed-tokens',
            },
            {
              text: 'Create Non-Fungible Tokens (NFTs)',
              link: '/cookbook/create-nfts',
            },
          ],
        },
      ],
    },
    {
      text: 'Domains',
      collapsed: true,
      items: [
        {
          text: 'Register Domains',
          link: '/cookbook/register-domains',
        },
        {
          text: 'Unregister Domains',
          link: '/cookbook/unregister-domains',
        },
        {
          text: 'Transfer Domain Owner',
          link: '/cookbook/transfer-domain-owner',
        },
      ],
    },
    {
      text: 'Events and Filters', // for this sections no files were created
      collapsed: true,
      items: [
        {
          text: 'Pipeline Events',
          collapsed: true,
          items: [],
        },
        {
          text: 'Data Events',
          collapsed: true,
          items: [],
        },
        {
          text: 'Trigger Events',
          collapsed: true,
          items: [],
        },
        {
          text: 'Advanced Filtering',
          collapsed: true,
          items: [],
        },
        {
          text: 'Block Stream',
          collapsed: true,
          items: [
            {
              text: 'Subscribe to Block Stream',
            },
            {
              text: 'View output',
            },
          ],
        },
      ],
    },
    {
      text: 'Executors',
      collapsed: true,
      items: [
        {
          text: 'Write Executor',
          link: '/cookbook/write-executor',
        },
        {
          text: 'Update Executor',
          link: '/cookbook/update-executor',
        },
        {
          text: 'Define Custom Permission Tokens',
          link: '/cookbook/define-custom-permission-tokens',
        },
      ],
    },
    {
      text: 'Instructions',
      collapsed: true,
      items: [
        {
          text: 'Use Instructions',
          link: '/cookbook/use-instructions',
        },
        {
          text: 'Combine Instructions via Expressions',
          link: '/cookbook/combine-instructions',
        },
      ],
    },
    {
      text: 'Metadata',
      collapsed: true,
      items: [
        {
          text: 'Set Key Value',
          link: '/cookbook/set-key-value',
        },
        {
          text: 'Remove Key Value',
          link: '/cookbook/remove-key-value',
        },
        {
          text: 'Access Metadata',
          link: '/cookbook/access-metadata',
        },
      ],
    },
    {
      text: 'Peers',
      collapsed: true,
      items: [
        {
          text: 'Register Peers',
          link: '/cookbook/register-peers',
        },
        {
          text: 'Unregister Peers',
          link: '/cookbook/unregister-peers',
        },
        {
          text: "Check Peer's Load",
          link: '/cookbook/check-peer-load',
        },
        {
          text: 'Find the Leader Among Running Peers',
          link: '/cookbook/find-leader-among-running-peers',
        },
        {
          text: 'Query Connected Peers',
          link: '/cookbook/query-connected-peers',
        },
      ],
    },
    {
      text: 'Queries',
      collapsed: true,
      items: [{ text: 'Use queries' }, { text: 'Filter query results' }, { text: 'Use Sorting and Pagination' }],
    },
    {
      text: 'Telemetry',
      collapsed: true,
      items: [
        {
          text: 'Check Status',
          link: '/cookbook/check-status',
        },
        {
          text: 'Get Metrics',
          link: '/cookbook/get-metrics',
        },
        {
          text: 'Monitor Iroha Performance',
          link: '/cookbook/monitor-iroha-performance',
        },
        {
          text: 'Check Health',
          link: '/cookbook/check-health',
        },
      ],
    },
    {
      text: 'Transactions',
      collapsed: true,
      items: [
        {
          text: 'Create Transactions',
          link: '/cookbook/create-transactions',
        },
        {
          text: 'Submit Transactions',
          link: '/cookbook/submit-transactions',
        },
        {
          text: 'Use Multi-Signature Transactions',
          link: '/cookbook/use-multi-signature-transactions',
        },
      ],
    },
    {
      text: 'Triggers',
      collapsed: true,
      items: [
        {
          text: 'Register a Data Trigger',
          link: '/cookbook/register-data-triggers',
        },
        {
          text: 'Register a Scheduled Trigger',
          link: '/cookbook/register-scheduled-triggers',
        },
        {
          text: 'Register a Pre-commit Trigger',
          link: '/cookbook/register-pre-commit-triggers',
        },
        {
          text: 'Register a By-call Trigger',
          link: '/cookbook/register-by-call-triggers',
        },
        {
          text: 'Unregister a Trigger',
          link: '/cookbook/unregister-triggers',
        },
      ],
    },
  ]
}

function sidebarAPI(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'About',
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
          text: 'Compatibility Matrix',
          link: '/reference/compatibility-matrix',
        },
        {
          text: 'Foreign Function Interfaces',
          link: '/reference/ffi',
        },
      ],
    },
    {
      text: 'Reference',
      items: [
        {
          text: 'Torii Endpoints',
          link: '/reference/torii-endpoints.md',
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
      ],
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Get Started',
      link: '/guide/get-started/',
      items: [
        {
          text: 'Install Iroha 2',
          link: '/guide/get-started/install-iroha-2',
        },
        {
          text: 'Launch Iroha 2',
          link: '/guide/get-started/launch-iroha-2',
        },
        {
          text: 'Operate Iroha 2 via CLI',
          link: '/guide/get-started/operate-iroha-2-via-cli',
        },
        {
          text: 'Iroha 2 vs. Iroha 1',
          link: '/guide/iroha-2',
        },
        {
          text: 'Receive support',
          link: '/guide/support.md',
        },
      ],
    },
    {
      text: 'Security',
      collapsed: true,
      items: [
        {
          text: 'Overview',
          link: '/guide/security/',
        },
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
      text: 'SDK Tutorials',
      collapsed: true,
      items: [
        {
          text: 'Introduction',
          link: '/guide/get-started/tutorials',
        },
        /* a common lang-agnostic section will go here */
        {
          text: 'Language-specific Guides',
          items: [
            {
              text: 'Python 3',
              link: '/guide/get-started/python',
            },
            {
              text: 'Rust',
              link: '/guide/get-started/rust',
            },
            {
              text: 'Kotlin/Java',
              link: '/guide/get-started/kotlin-java',
            },
            {
              text: 'JavaScript',
              link: '/guide/get-started/javascript',
            },
          ],
        },
      ],
    },
    {
      text: 'Blockchain',
      items: [
        {
          text: 'How Iroha Works',
          link: '/guide/blockchain/how-iroha-works',
        },
        {
          text: 'Overview',
          collapsed: true,
          items: [
            {
              text: 'Transactions',
              link: '/guide/blockchain/transactions',
            },
            {
              text: 'Consensus',
              link: '/guide/blockchain/consensus',
            },
            {
              text: 'Data Model',
              link: '/guide/blockchain/data-model',
            },
          ],
        },
        {
          text: 'Entities',
          collapsed: true,
          items: [
            {
              text: 'Assets',
              link: '/guide/blockchain/assets',
            },
            /*
            {
              text: 'Accounts',
              link: '/guide/blockchain/accounts',
            },
            {
              text: 'Domains',
              link: '/guide/blockchain/domains',
            },
            */
            {
              text: 'Metadata',
              link: '/guide/blockchain/metadata',
            },
            {
              text: 'Events',
              link: '/guide/blockchain/events',
            },
            {
              text: 'Filters',
              link: '/guide/blockchain/filters',
            },
            {
              text: 'Triggers',
              link: '/guide/blockchain/triggers',
            },
            {
              text: 'Queries',
              link: '/guide/blockchain/queries',
            },
            {
              text: 'Permissions',
              link: '/guide/blockchain/permissions',
            },
            {
              text: 'World',
              link: '/guide/blockchain/world',
            },
          ],
        },
        {
          text: 'Operations',
          collapsed: true,
          items: [
            {
              text: 'Instructions',
              link: '/guide/blockchain/instructions',
            },
            {
              text: 'Expressions',
              link: '/guide/blockchain/expressions',
            },
            {
              text: 'Web Assembly',
              link: '/guide/blockchain/wasm',
            },
          ],
        },
      ],
    },
    {
      text: 'Configuration and Management',
      items: [
        {
          text: 'Overview',
          link: '/guide/configure/overview',
        },
        {
          text: 'Configure Iroha',
          collapsed: true,
          items: [
            {
              text: 'Configuration Types',
              link: '/guide/configure/configuration-types',
            },
            {
              text: 'Samples',
              link: '/guide/configure/sample-configuration',
            },
            {
              text: 'Peer Configuration',
              link: '/guide/configure/peer-configuration',
            },
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
      text: 'Troubleshooting',
      collapsed: true,
      items: [
        {
          text: 'Overview',
          link: '/guide/troubleshooting/overview',
        },
        {
          text: 'Installation',
          link: '/guide/troubleshooting/installation-issues',
        },
        {
          text: 'Configuration',
          link: '/guide/troubleshooting/configuration-issues',
        },
        {
          text: 'Deployment',
          link: '/guide/troubleshooting/deployment-issues',
        },
        {
          text: 'Integration',
          link: '/guide/troubleshooting/integration-issues',
        },
      ],
    },
    {
      text: 'Advanced Mode',
      collapsed: true,
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
    {
      text: 'Reports',
      collapsed: true,
      items: [
        {
          text: 'CSD/RTGS linkages via on-chain scripting',
          link: '/guide/reports/csd-rtgs',
        },
      ],
    },
  ]
}

const BASE = process.env.PUBLIC_PATH ?? '/'

export default defineConfig({
  base: BASE,
  srcDir: 'src',
  srcExclude: ['snippets/*.md'],
  title: 'Hyperledger Iroha 2 Documentation',
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
    // logo: '/icon.svg',
    siteTitle: 'Iroha 2',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hyperledger/iroha-2-docs' },
      {
        icon: {
          /**
           * https://icones.js.org/collection/material-symbols?s=bug
           */
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-1.625 0-3.013-.8T6.8 18H4.975q-.425 0-.7-.288T4 17q0-.425.288-.713T5 16h1.1q-.075-.5-.088-1T6 14H4.975q-.425 0-.7-.288T4 13q0-.425.288-.713T5 12h1q0-.5.013-1t.087-1H4.975q-.425 0-.7-.288T4 9q0-.425.288-.713T5 8h1.8q.35-.575.788-1.075T8.6 6.05l-.925-.95q-.275-.3-.263-.713T7.7 3.7q.275-.275.7-.275t.7.275l1.45 1.45q.7-.225 1.425-.225t1.425.225l1.5-1.475q.3-.275.713-.262t.687.287q.275.275.275.7t-.275.7l-.95.95q.575.375 1.038.863T17.2 8h1.825q.425 0 .7.288T20 9q0 .425-.288.713T19 10h-1.1q.075.5.088 1T18 12h1.025q.425 0 .7.288T20 13q0 .425-.288.713T19 14h-1q0 .5-.013 1t-.087 1h1.125q.425 0 .7.288T20 17q0 .425-.288.713T19 18h-1.8q-.8 1.4-2.188 2.2T12 21Zm0-2q1.65 0 2.825-1.175T16 15v-4q0-1.65-1.175-2.825T12 7q-1.65 0-2.825 1.175T8 11v4q0 1.65 1.175 2.825T12 19Zm-1-3h2.025q.425 0 .7-.288T14 15q0-.425-.288-.713T13 14h-2.025q-.425 0-.7.288T10 15q0 .425.288.713T11 16Zm0-4h2.025q.425 0 .7-.288T14 11q0-.425-.288-.713T13 10h-2.025q-.425 0-.7.288T10 11q0 .425.288.713T11 12Zm1 1Z"/></svg>`,
        },
        link: 'https://github.com/hyperledger/iroha-2-docs/issues/new',
      },
    ],

    editLink: {
      pattern: 'https://github.com/hyperledger/iroha-2-docs/edit/main/src/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Last Updated',
    },

    nav: nav(),
    outline: [2, 3],

    sidebar: {
      '/guide/': sidebarGuide(),
      '/reference/': sidebarAPI(),
      '/cookbook/': sidebarCookbook(),
    },

    search: {
      provider: 'local',
    },
  },
})
