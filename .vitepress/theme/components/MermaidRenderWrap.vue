<script>
import { defineAsyncComponent } from 'vue'

const Mermaid = defineAsyncComponent(() => import('./MermaidRender.vue'))

export default {
  components: { Mermaid },
  inheritAttrs: false,
}
</script>

<template>
  <ClientOnly>
    <Mermaid v-bind="$attrs" />
  </ClientOnly>
</template>
