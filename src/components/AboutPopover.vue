<template>
  <PopoverDialog v-model="showModel">
    <template #title>
      <span class="sr-only">About this app</span>
    </template>
    <template #description>
      <span class="sr-only">Detailed information about this application</span>
    </template>
    <template #default>
      <div class="transform-gpu px-4 py-10 flex flex-col gap-y-5 items-center text-uiText">
        <figure class="relative">
          <img src="/assets/APP_LOGO.png" class="bg-white p-1 size-24 rounded-3xl ring-1 ring-black/10 shadow-xl pointer-events-none" />
        </figure>
        <h3 class="font-display text-2xl mb-6">
          Amazon IVS Real-time Demo
        </h3>

        <div class="flex flex-col w-full gap-2 text-center items-center">
          <span class="leading-snug text-uiTextAlt2 mb-10">
            <p class="text-sm mb-0">IVS Broadcast SDK: {{ BroadcastVersion }}</p>
            <p class="text-sm mb-0">IVS Chat Client Messaging SDK: {{ CHAT_VERSION }}</p>
          </span>
          <span class="text-xs text-uiTextAlt2 text-pretty max-w-none sm:max-w-[60ch]">
            <p class="mb-2">View source code on <a href="https://github.com/aws-samples/amazon-ivs-real-time-for-web-demo" target="blank" rel="noreferrer noopener"
                class="underline underline-offset-2">Github</a>.</p>
            <p>For more demos, visit <a href="https://ivs.rocks/examples/" target="blank" rel="noreferrer noopener" class="underline underline-offset-2">ivs.rocks/examples</a></p>
          </span>
        </div>
      </div>
    </template>
    <template #footer="{ cancel }">
      <div class="flex flex-col gap-y-2 text-center px-3">
        <MobileButton @click="cancel" class="w-full text-lg font-bold bg-surfaceAlt active:bg-surfaceAlt3 rounded-full px-8 py-2.5">
          Close
        </MobileButton>
      </div>
    </template>
  </PopoverDialog>
</template>

<script setup>
import PopoverDialog from './PopoverDialog.vue';
import MobileButton from './MobileButton.vue';
import { __version as BroadcastVersion } from 'amazon-ivs-web-broadcast';

// The Chat SDK does not emit a version, so it's hardcoded here
const CHAT_VERSION = '1.1.1';

const showModel = defineModel('show')
const emit = defineEmits(['confirm'])

const props = defineProps({
  qrValue: {
    type: String,
    default: window.location.href
  },
});
</script>