<template>
  <div class="relative h-full flex flex-col px-4 pt-4 pb-safe">
    <div class="fixed inset-0 bg-gradient-to-b from-white to-surfaceAlt"></div>

    <div class="absolute inset-0 px-4 pb-4 max-w-xl h-full flex flex-col mx-auto justify-between">
      <div class="flex flex-col grow items-center justify-center gap-y-4">
        <img src="/assets/APP_LOGO.png" class="bg-white p-1 size-24 rounded-3xl ring-1 ring-black/10 shadow-xl pointer-events-none" />
        <h1 class="text-3xl font-display mb-8 text-uiText text-pretty text-center max-w-[20ch]">
          Welcome to the Amazon IVS Real-time Demo
        </h1>
      </div>

      <div class="flex flex-col shrink-0 items-center justify-center gap-y-4 mb-8">
        <span class="text-xs text-uiTextAlt2 text-pretty text-center max-w-none sm:max-w-[60ch]">
          <p class="mb-2">View source code on <a href="https://github.com/aws-samples/amazon-ivs-real-time-for-web-demo" target="blank" rel="noreferrer noopener"
              class="underline underline-offset-2">Github</a>.</p>
          <p>For more demos, visit <a href="https://ivs.rocks/examples/" target="blank" rel="noreferrer noopener" class="underline underline-offset-2">ivs.rocks/examples</a></p>
        </span>
      </div>

      <MobileButton @click="handleContinue" class="w-full flex justify-center px-8 py-2.5 bg-orange-400/10 ring-2 ring-orange-400/30 text-orange-500 text-lg font-bold rounded-full active:bg-orange-400/40 active:ring-orange-400/70
        active:text-red-600 transition duration-300 ease-in-out appearance-none mb-4">
        Continue
      </MobileButton>
      <MobileButton v-if="shouldShowInstallButton"
        class="rounded-full px-8 py-2.5 text-center inline-flex items-center justify-center text-lg text-uiTextAlt2 bg-transparent active:bg-surfaceAlt3 ring-2 ring-neutral/25"
        @click="pwaStore.showInstallPopup">
        Install
      </MobileButton>
    </div>

  </div>
</template>

<script setup>
import MobileButton from '../components/MobileButton.vue';
import { navigateWithTransition } from '../stores/navigation';
import { usePwaStore } from '../stores/pwa'
import { useDeviceStore } from '../stores/device'
import { useBackendStore } from '../stores/backend'
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const pwaStore = usePwaStore();
const deviceStore = useDeviceStore();
const backendStore = useBackendStore();
const router = useRouter();

const handleContinue = () => {
  let path = '/demos';
  if (backendStore.domain && backendStore.apiKey) path = '/custom'
  navigateWithTransition(() => router.push({ path }));
}

const shouldShowInstallButton = computed(() => {
  // Do not show the install button if the app is installed
  if (pwaStore.isInstalled) return false;

  // Do not show the install button if running in app mode
  if (pwaStore.isApp) return false;

  // Show the install button on safari browsers
  if (deviceStore.isSafariBrowser) return true;

  // If the device is not chromium-based, never show the prompt
  if (!deviceStore.isChromiumBrowser) return false;

  // Only show the install button when the deferredPrompt is not undefined
  return pwaStore.deferredPrompt !== undefined;
})
</script>