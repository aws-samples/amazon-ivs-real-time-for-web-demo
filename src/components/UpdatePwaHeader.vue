<template>
  <!-- Update banner -->
  <div class="fixed h-16 shrink-0 grow-0 z-20 flex gap-x-2 w-full border-b border-black/10 items-center px-2.5 py-2 bg-white/80 backdrop-blur">
    <div class="relative flex gap-x-2 grow shrink items-center">
      <img src="/assets/APP_LOGO.png" class="aspect-square h-10 ring-1 ring-black/10 rounded-lg" />
      <div class="flex flex-col h-full w-full gap-y-1">
        <span class="text text-uiText font-semibold leading-none">Amazon IVS Real-time</span>
        <span class="text-xs text-uiTextAlt2 leading-none">A new update is available</span>
      </div>
    </div>
    <MobileButton class="bg-positive active:bg-positiveAlt font-bold rounded-full text-white px-4 py-1" @click="handleUpdateSelect">Update</MobileButton>
  </div>
  <div class="relative h-16 w-full pointer-events-none"></div>
</template>

<script setup>
import MobileButton from './MobileButton.vue';
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { updateServiceWorker } = useRegisterSW();

const handleUpdateSelect = async () => {
  console.info('updating app');
  updateServiceWorker();
}
</script>