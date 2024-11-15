<template>
  <button :class="buttonClass" :disabled="attrs.disabled || props.loading">
    <slot></slot>
    <div v-if="$props.loading" class="absolute inset-0 flex items-center justify-center">
      <LoadingSpinner class="relative size-6" />
    </div>
  </button>
</template>

<script setup>
import { twMerge } from 'tailwind-merge';
import { computed, useAttrs } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  }
})

const attrs = useAttrs();
const buttonClass = computed(() => {
  return twMerge('relative appearance-none bg-surfaceAlt active:bg-surfaceAlt3 disabled:opacity-50 disabled:cursor-progress', attrs.class)
})
</script>