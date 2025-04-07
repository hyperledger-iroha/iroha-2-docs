/// <reference types="vite/client" />

import ThemeDefault from 'vitepress/theme'
import { type EnhanceAppContext } from 'vitepress'
import LayoutCustom from './components/LayoutCustom.vue'
import MermaidRenderWrap from './components/MermaidRenderWrap.vue'

import 'virtual:uno.css'
import './style/index.scss'
import { defineAsyncComponent } from 'vue'

export default {
  extends: ThemeDefault,
  Layout: LayoutCustom,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('MermaidRenderWrap', MermaidRenderWrap)
    app.component(
      'CompatibilityMatrixTable',
      defineAsyncComponent(() => import('./components/CompatibilityMatrixTable.vue')),
    )
    app.component(
      'CompatibilityMatrixTableIcon',
      defineAsyncComponent(async () => import('./components/CompatibilityMatrixTableIcon.vue')),
    )
  },
} satisfies import('vitepress').Theme
