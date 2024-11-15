<template>
  <input ref="inputElemRef" :class="twMerge(['w-full h-full bg-surfaceAlt rounded-2xl px-4 text-[16px] ring-2 ring-transparent focus:ring-secondary appearance-none', $attrs.class])"
    placeholder="Enter code: domainId-apiKey" v-model="codeModel" @keyup.enter="$emit('done')" enterkeyhint="confirm" type="text" />
</template>

<script setup>
import { twMerge } from 'tailwind-merge';
import { ref } from 'vue';

const inputElemRef = ref();
const codeModel = defineModel('code');
const emit = defineEmits(['done']);
</script>