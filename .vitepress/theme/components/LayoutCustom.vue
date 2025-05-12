<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme

const ShareFeedback = defineAsyncComponent(() => import('./ShareFeedback.vue'))
const FEEDBACK_URL: string | undefined = import.meta.env.VITE_FEEDBACK_URL
</script>

<template>
  <Layout>
    <template
      v-if="FEEDBACK_URL"
      #sidebar-nav-before
    >
      <div class="sticky-container py-4">
        <ShareFeedback :feedback-url="FEEDBACK_URL" />
      </div>
    </template>
  </Layout>
</template>

<style lang="scss" scoped>
.sticky-container {
  position: sticky;
  top: 0;
  background: var(--vp-sidebar-bg-color);
  z-index: 9;

  :deep(.VPSidebar.open) & {
    top: -32px;
  }
}
</style>
