import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['.vitepress/**/*.spec.ts', 'etc/**/*.spec.ts'],
  },
})
