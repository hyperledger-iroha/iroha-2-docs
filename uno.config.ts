import { defineConfig } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  theme: {
    colors: {
      vp: {
        brand: {
          1: 'var(--vp-c-brand-1)',
          2: 'var(--vp-c-brand-2)',
          3: 'var(--vp-c-brand-3)',
          soft: 'var(--vp-c-brand-soft)',
        },
        bg: {
          DEFAULT: 'var(--vp-c-bg)',
          alt: 'var(--vp-c-bg-alt)',
          elv: 'var(--vp-c-bg-elv)',
          soft: 'var(--vp-c-bg-soft)',
        },
      },
    },

    boxShadow: {
      'elevation-btn':
        '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)',
    },
  },
  transformers: [transformerDirectives()],
})
