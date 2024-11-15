<template>
  <button class="will-change-transform p-2 bg-transparent text-uiText active:text-uiTextAlt2/50 transform scale-100 active:scale-95 transition duration-300 ease-in-out appearance-none text-center">
    <PhArrowLeft :size="24" weight="bold" />
  </button>
</template>

<script setup>
import { PhArrowLeft } from '@phosphor-icons/vue';
</script>