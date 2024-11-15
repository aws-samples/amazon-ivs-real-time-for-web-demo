<template>
  <button @click="$emit('click')"
    class="will-change-transform flex gap-2 items-center justify-center grow-0 disabled:bg-gray-200 text-destruct w-full h-full px-4 py-2 rounded-full bg-destruct/10 active:bg-destruct/20 active:text-destructAlt transition">
    <slot>
      <span class="font-bold">Leave quietly</span>
      <PhHandWaving :size="24" weight="fill" />
    </slot>
  </button>
</template>

<script setup>
import { PhHandWaving } from '@phosphor-icons/vue';
</script>