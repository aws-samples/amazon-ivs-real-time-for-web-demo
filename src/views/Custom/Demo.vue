<template>
  <div :class="['absolute flex flex-col bg-surface h-full grow shrink w-dvw touch-none', { 'pb-2': shouldRemovePadding }, { 'pb-safe': !shouldRemovePadding }]">
    <header :class="headerClass">
      <div class="w-full max-w-screen-xl grid grid-rows-1 grid-cols-[50px_minmax(0,1fr)_50px] items-center">
        <router-link custom to="/custom" v-slot="{ href, route, navigate }">
          <BackButton v-if="isHost" @click="showLeavePopoverRef = true" class="w-full h-full grow-0 shrink-0 justify-self-center" />
          <BackButton v-else @click="() => handleBack(navigate)" class="w-full h-full grow-0 shrink-0 justify-self-center" />
        </router-link>
        <div class="justify-self-center font-bold text-lg">Your stage</div>
        <div class="justify-self-end relative">
          <MobileButton @click="pwaStore.shouldShowQrCode = true"
            class="relative will-change-transform p-2 bg-transparent active:bg-transparent text-uiText active:text-uiTextAlt2/50 transform scale-100 active:scale-95 transition duration-300 ease-in-out appearance-none text-center">
            <PhShare :size="24" weight="bold" />
          </MobileButton>
        </div>
      </div>
    </header>
    <ConfirmationPopover v-model:show="showLeavePopoverRef" @end="handleEndStream" />
    <component :is="stageTypes[backendStore.currentStageType]?.component || null" class="pt-16 min-h-0 w-full grow shrink touch-none" :hostId="route.params.hostId" :isHost="isHost"
      @leave="showLeavePopoverRef = true" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { twMerge } from 'tailwind-merge';
import { PhShare } from '@phosphor-icons/vue';
import BackButton from '../../components/BackButton.vue';
import VideoStage from '../../custom/VideoStage.vue';
import AudioStage from '../../custom/AudioStage.vue';
import { usePwaStore } from '../../stores/pwa';
import { useChatStore } from '../../stores/chat';
import { useUsernameStore } from '../../stores/usernameStore';
import { navigateWithTransition } from '../../stores/navigation';
import { useBackendStore } from '../../stores/backend';
import ConfirmationPopover from '../../components/ConfirmationPopover.vue';
import MobileButton from '../../components/MobileButton.vue';

const route = useRoute();
const router = useRouter();

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const pwaStore = usePwaStore();
const chatStore = useChatStore();
const usernameStore = useUsernameStore();
const backendStore = useBackendStore();

const showLeavePopoverRef = ref(false);

const shouldRemovePadding = computed(() => {
  return chatStore.inputFocused && isMobile;
})

const stageTypes = {
  'VIDEO': {
    title: 'Video stage',
    component: VideoStage,
  },
  'AUDIO': {
    title: 'Audio room',
    component: AudioStage
  },
};

const isHost = computed(() => route.params.hostId === usernameStore.userId)

const headerClass = computed(() =>
  twMerge('fixed z-10 w-full h-16 shrink-0 grow-0 flex justify-center', { 'top-16': pwaStore.shouldShowBanner }, { 'top-0': !pwaStore.shouldShowBanner })
);

const handleBack = (navigate) => {
  navigateWithTransition(navigate);
};

const handleEndStream = (navigate) => {
  backendStore.destroyStream(route.params.hostId);
  if (!navigate) {
    navigateWithTransition(() => router.push('/custom'));
    return;
  }
  navigateWithTransition(navigate);
};

onMounted(async () => {
  // Find the current stream index to get stream info
  if (!backendStore.streamsExist) {
    await backendStore.refreshStreams();
    backendStore.updateCurrentStreamIndex(route.params.hostId);
  }
});
</script>