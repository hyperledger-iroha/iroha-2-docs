<script setup lang="ts">
import IconCheck from './icons/IconCheck.vue'
import IconCancelOutlineRounded from './icons/IconCancelOutlineRounded.vue'
import IconQuestionMarkRounded from './icons/IconQuestionMarkRounded.vue'
import { computed } from 'vue'

export type Status = 'ok' | 'failed' | 'no-data'

const props = withDefaults(
  defineProps<{
    status: Status
    inline: boolean
  }>(),
  { inline: false },
)

// eslint-disable-next-line vue/return-in-computed-property
const chosenComponent = computed(() => {
  switch (props.status) {
    case 'ok':
      return IconCheck
    case 'failed':
      return IconCancelOutlineRounded
    case 'no-data':
      return IconQuestionMarkRounded
  }
})
</script>

<template>
  <component
    :is="chosenComponent"
    :data-status="status"
    :class="{ 'inline-icon': inline }"
  />
</template>

<style lang="scss" scoped>
svg {
  &[data-status='ok'] {
    color: var(--vp-c-green-1);
  }

  &[data-status='failed'] {
    color: var(--vp-c-red-1);
  }

  &[data-status='no-data'] {
    color: var(--vp-c-yellow-1);
  }
}

.inline-icon {
  display: inline;
  vertical-align: middle;
}
</style>
