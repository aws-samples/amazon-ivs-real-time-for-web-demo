<template>
  <PopoverDialog v-model="pwaStore.shouldShowInstallInstructions">
    <template #title>
      <span class="sr-only">{{ props.title }}</span>
    </template>
    <template #description>
      <span class="sr-only">{{ props.description }}</span>
    </template>
    <template #default>
      <div class="px-4 pt-8 pb-6 flex flex-col gap-y-2 items-center text-uiText">
        <figure class="relative left-1 mb-4">
          <div class="overflow-hidden rounded-3xl ring-1 ring-black/10 shadow-md p-1">
            <img src="/pwa/pwa-512x512.png" :width="72" :height="72" />
          </div>
          <div class="absolute -bottom-2 -right-3">
            <div class="bg-positive p-1.5 rounded-full text-white/90 ring-1 ring-offset-2 ring-black/10 ring-offset-surface">
              <PhPlus weight="bold" :size="20" />
            </div>
          </div>
        </figure>
        <h3 class="font-black text-2xl">Install this app</h3>
        <p class="text-base text-center text-uiTextAlt2 text-pretty">
          Install this app to add it to your home screen and launch it as a standalone app.
        </p>
        <div class="relative w-full mt-6 mb-3 text-center">
          <div class="absolute top-1/2 w-full h-0.5 bg-surfaceAlt3 rounded-full"></div>
          <p class="relative text-sm font-bold text-uiText inline-flex px-3 py-1 bg-surface">Installation instructions</p>
        </div>
        <div class="w-full text-center">
          <template v-if="deviceStore.isSafariBrowser">
            <ol class="text-left list-decimal list-outside marker:text-uiText/50 text-base leading-snug text-uiText text-pretty space-y-2">
              <li class="text-pretty ml-5">
                Select
                <span class="inline-flex flex-wrap gap-x-1 items-baseline text-uiText font-bold">
                  Share
                  <PhExport weight="bold" :size="24" class="inline-flex self-center p-1 bg-surfaceAlt3 rounded-md mr-1" />
                </span>
                in the browser toolbar
              </li>
              <li class="text-pretty ml-5">
                In the share menu, scroll down and select
                <span class="inline-flex flex-wrap gap-x-1 items-baseline text-uiText font-bold">
                  <template v-if="deviceStore.isMobileBrowser">
                    <!-- Safari Mobile -->
                    Add to Home Screen
                    <PhPlusSquare weight="bold" :size="24" class="inline-flex self-center p-1 bg-surfaceAlt3 rounded-md mr-1" />
                  </template>
                  <template v-else>
                    <!-- Safari Desktop -->
                    Add to Dock
                    <PhMonitor weight="bold" :size="24" class="inline-flex self-center p-1 bg-surfaceAlt3 rounded-md mr-1" />
                  </template>
                </span>
              </li>
            </ol>
          </template>
        </div>
      </div>
    </template>
    <template #footer="{ cancel }">
      <div class="flex flex-col gap-y-2 text-center px-3">
        <MobileButton @click="() => handleCancel(cancel)" class="w-full text-lg font-bold bg-surfaceAlt active:bg-surfaceAlt3 rounded-full px-8 py-2.5">
          Done
        </MobileButton>
      </div>
    </template>
  </PopoverDialog>
</template>

<script setup>
import { PhExport, PhPlusSquare, PhPlus, PhMonitor } from '@phosphor-icons/vue';
import PopoverDialog from './PopoverDialog.vue';
import MobileButton from './MobileButton.vue';
import { usePwaStore } from '../stores/pwa';
import { useDeviceStore } from '../stores/device';

const pwaStore = usePwaStore();
const deviceStore = useDeviceStore();

const props = defineProps({
  title: String,
});

const handleCancel = (cancel) => {
  cancel();
}
</script>