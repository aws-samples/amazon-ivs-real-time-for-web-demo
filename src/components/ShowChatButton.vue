<template>
  <button @click="$emit('click')"
    class="flex gap-2 items-center justify-center grow-0 w-full h-full px-4 py-2 rounded-full bg-secondary/10 active:bg-secondaryAlt/20 transition text-secondary active:text-secondaryAlt">
    <slot>
      <span class="font-bold">Chat</span>
      <PhChatCircle :size="24" weight="fill" />
    </slot>
  </button>
</template>

<script setup>
import { PhChatCircle } from '@phosphor-icons/vue';
</script>