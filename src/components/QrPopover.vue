<template>
  <PopoverDialog v-model="pwaStore.shouldShowQrCode">
    <template #title>
      <span class="sr-only">QR Code</span>
    </template>
    <template #description>
      <span class="sr-only">Copy a link or scan a QR code to share this demo</span>
    </template>
    <template #default>
      <div class="transform-gpu px-4 pt-8 pb-6 flex flex-col gap-y-2 items-center text-uiText">
        <h3 class="text-2xl font-black text-center text-uiText text-pretty">
          Scan QR Code
        </h3>
        <p class="text-sm text-uiText mb-4">
          Scan the code to open this app on another device.
        </p>
        <figure class="flex justify-center items-center relative overflow-hidden rounded-xl shadow-lg ring-1 ring-border p-8 mb-4">
          <div class='absolute inset-0'>
            <SuperBright :enabled='boostBrightness' />
          </div>
          <qrcode-vue level='H' :value="props.qrValue" render-as="svg" background='transparent' :size='200' class='relative' />
        </figure>
        <div class="flex w-full gap-x-2 items-center justify-center text-center text-xs px-12 overflow-hidden">
          <span class="truncate font-mono" :title="props.qrValue">
            {{ props.qrValue }}
          </span>
        </div>
      </div>
    </template>
    <template #footer="{ cancel }">
      <div class="flex flex-col gap-y-2 text-center px-3">
        <MobileButton @click="copy(props.qrValue)"
          :class="['w-full text-lg font-bold rounded-full px-8 py-2.5', { 'bg-positive/10 active:bg-positiveAlt/50': copied }, { 'bg-surfaceAlt active:bg-surfaceAlt3': !copied }]">
          <span v-if="copied" class="inline-flex gap-x-2 items-center text-positive">
            Copied
          </span>
          <span v-else class="inline-flex gap-x-4 items-center">
            Copy Link
          </span>
        </MobileButton>
        <MobileButton @click="() => handleCancel(cancel)" class="w-full text-lg font-bold bg-surfaceAlt active:bg-surfaceAlt3 rounded-full px-8 py-2.5">
          Done
        </MobileButton>
      </div>
    </template>
  </PopoverDialog>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'
import PopoverDialog from './PopoverDialog.vue';
import MobileButton from './MobileButton.vue';
import { usePwaStore } from '../stores/pwa';
import QrcodeVue from 'qrcode.vue';
import SuperBright from './SuperBright.vue';
import { ref } from 'vue';

const { copy, copied } = useClipboard();
const pwaStore = usePwaStore();
const boostBrightness = ref(false);

const props = defineProps({
  qrValue: {
    type: String,
    default: window.location.href
  },
});

const handleCancel = (cancel) => {
  cancel();
}
</script>