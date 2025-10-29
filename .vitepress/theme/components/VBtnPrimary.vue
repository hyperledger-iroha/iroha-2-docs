<template>
  <button class="v-btn-primary">
    <slot />
  </button>
</template>

<style lang="scss">
.v-btn-primary {
  @apply bg-vp-brand-2 font-medium text-white rounded-lg font-medium text-sm px-3 py-1.5 dark:bg-vp-brand-3  shadow-elevation-btn;

  &:not(:disabled) {
    @apply hover:bg-vp-brand-1 dark:hover:bg-vp-brand-2;
  }

  &:disabled {
    @apply shadow-none opacity-50 cursor-not-allowed;
  }
}
</style>
