<template>
  <!-- Install banner -->
  <div class="fixed h-16 shrink-0 grow-0 z-20 flex gap-x-2 w-full border-b border-black/10 items-center pr-2.5 py-2 bg-white/80 backdrop-blur">
    <MobileButton class="relative z-10 bg-transparent active:bg-surfaceAlt2/10 font-bold rounded-md text-uiText p-4" @click="() => pwaStore.forceHideBanner = true">
      <PhX weight="bold" :size="16" />
    </MobileButton>

    <div class="relative flex gap-x-2 grow shrink items-center -ml-3">
      <img src="/assets/APP_LOGO.png" class="aspect-square h-10 ring-1 ring-black/10 rounded-lg" />
      <div class="flex flex-col h-full w-full gap-y-1 overflow-x-hidden">
        <span class="text text-uiText font-semibold leading-none truncate">Amazon IVS Real-time</span>
        <span v-if="!shouldShowInstallButton" class="text-xs text-uiTextAlt2 leading-4 truncate">Open this app on your smartphone</span>
        <span v-else class="text-xs text-uiTextAlt2 leading-none truncate">Add this app to your homescreen</span>
      </div>
    </div>

    <div class="flex items-center gap-x-1">
      <MobileButton v-if="!deviceStore.isMobileBrowser" :class="['font-bold text-uiText inline-flex items-center gap-x-1', {
        'bg-secondary active:bg-secondaryAlt text-white px-4 py-1 mr-0.5 rounded-full': !shouldShowInstallButton,
        'bg-transparent active:bg-surfaceAlt3 p-1.5 rounded-full': shouldShowInstallButton,
      }]" @click="pwaStore.shouldShowQrCode = true">
        <span v-if="!shouldShowInstallButton" class="font-normal text-sm">Show QR code</span>
        <PhQrCode weight="regular" :size="24" />
      </MobileButton>
      <MobileButton v-if="shouldShowInstallButton" class="bg-secondary active:bg-secondaryAlt font-bold rounded-full text-white px-4 py-1" @click="handleInstallSelect">Install</MobileButton>
    </div>
  </div>
  <div class="relative h-16 w-full pointer-events-none"></div>
</template>

<script setup>
import MobileButton from './MobileButton.vue';
import { usePwaStore } from '../stores/pwa';
import { useDeviceStore } from '../stores/device';
import { PhQrCode, PhX } from '@phosphor-icons/vue';
import { computed } from 'vue';

const pwaStore = usePwaStore();
const deviceStore = useDeviceStore();

const handleInstallSelect = () => {
  pwaStore.showInstallPopup();
}

const shouldShowInstallButton = computed(() => {
  // Always show the install button on safari browsers
  if (deviceStore.isSafariBrowser) return true;

  // If the device is not chromium-based, don't show the prompt
  if (!deviceStore.isChromiumBrowser) return false;

  // Only show the install button when the deferredPrompt is not undefined
  return pwaStore.deferredPrompt !== undefined;
})
</script>