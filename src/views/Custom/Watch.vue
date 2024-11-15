<template>
  <PaginatedScroll :pages="1" v-model:load-stream="loadStreamRef" :scroll-threshhold="SCROLL_THRESHHOLD" :suppress-scroll="stageStore.onStage" v-slot="pageSlots" @navigate="handleNavigate">
    <div :class="['absolute flex flex-col bg-surface h-full grow shrink w-dvw touch-none', { 'pb-2': shouldRemovePadding }, { 'pb-safe': !shouldRemovePadding }]" :key="backendStore.currentStage">
      <header :class="headerClass">
        <div class="w-full max-w-screen-xl grid grid-rows-1 grid-cols-[50px_minmax(0,1fr)_50px] items-center">
          <router-link custom to="/custom" v-slot="{ href, route, navigate }">
            <BackButton @click="() => handleBack(navigate)" class="w-full h-full grow-0 shrink-0 justify-self-center" />
          </router-link>
          <div class="justify-self-center font-bold text-lg">
            <span v-if="backendStore.currentHostName">{{ `${backendStore.currentHostName}'s Stage` }}</span>
            <span v-else>Watch Streams</span>
          </div>
          <div class="justify-self-end relative">
            <MobileButton @click="pwaStore.shouldShowQrCode = true"
              class="relative will-change-transform p-2 bg-transparent active:bg-transparent text-uiText active:text-uiTextAlt2/50 transform scale-100 active:scale-95 transition duration-300 ease-in-out appearance-none text-center">
              <PhShare :size="24" weight="bold" />
            </MobileButton>
          </div>
        </div>
      </header>
      <Transition enter-active-class="duration-300 ease-out" enter-from-class="transform opacity-0 scale-75" enter-to-class="opacity-100 scale-100" leave-active-class="duration-200 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="transform opacity-0 scale-75">
        <div v-if="loadStreamRef === 'NEXT'" class="absolute bottom-0 z-30 w-full flex items-center justify-center py-6">
          <div class="bg-secondary text-white font-bold text-sm px-2 py-1 rounded-full">
            Load next stream
          </div>
        </div>
        <div v-else-if="loadStreamRef === 'PREV'" class="absolute top-10 z-30 w-full flex items-center justify-center py-6">
          <div class="bg-secondary text-white font-bold text-sm px-2 py-1 rounded-full">
            Load previous stream
          </div>
        </div>
      </Transition>
      <Transition enter-active-class="duration-300 ease-out" enter-from-class="transform opacity-0 scale-75" enter-to-class="opacity-100 scale-100" leave-active-class="duration-200 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="transform opacity-0 scale-75" mode="out-in">
        <!-- Stream component -->
        <component v-if="backendStore.currentStreamIndex !== -1" :is="stageTypes[backendStore.currentStageType]?.component || null" class="pt-16 min-h-0 w-full grow shrink touch-none transform"
          :style="{ transform: `translateY(${pageSlots.scrollAmount * -1}px)` }" :hostId="backendStore.currentStage?.hostId" :key="backendStore.currentStage?.hostId" :isHost="false"
          @leave="() => handleEndStream()" />

        <!-- Couldn't find stage -->
        <div v-else-if="(backendStore.currentStreamIndex === -1) && route.params.hostId" class="pt-16 px-2 pb-2 min-h-0 w-full grow shrink touch-none transform">
          <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">
            <div class="relative w-full grow flex items-center justify-center gap-4 overflow-hidden rounded-xl bg-surfaceAlt">
              <div class="flex flex-col items-center justify-center">
                <div class="flex flex-col items-center justify-center pb-4 mb-4 border-b border-surfaceAlt2/10">
                  <PhImageBroken weight="fill" :size="64" class="transform text-uiTextAlt2 mb-2" />
                  <h3 class="text-xl text-uiText font-bold">Unable to load stream</h3>
                  <p class="text text-center text-uiTextAlt2">The stream may be offline, or connected to a different AWS account.</p>
                </div>
                <div class="flex flex-col gap-2">
                  <MobileButton :loading="loadingStreams" @click="handleRefresh" class="text-lg bg-secondary active:bg-secondaryAlt font-bold rounded-full text-white px-6 py-2">Refresh</MobileButton>
                  <MobileButton @click="showBackendCodePopoverRef = true" class="text-lg bg-surfaceAlt3/50 active:bg-surfaceAlt3 rounded-full text-uiText px-6 py-2">Re-connect AWS account
                  </MobileButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No streams -->
        <div v-else-if="!backendStore.streamsExist || !route.params.hostId" class="pt-16 px-2 pb-2 min-h-0 w-full grow shrink touch-none transform">
          <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">
            <div class="relative w-full grow flex items-center justify-center gap-4 overflow-hidden rounded-xl bg-surfaceAlt">
              <div class="flex flex-col items-center justify-center">
                <div class="flex flex-col items-center justify-center pb-4 mb-4 border-b border-surfaceAlt2/10">
                  <PhMaskSad weight="light" :size="64" class="transform text-uiTextAlt2 mb-2" />
                  <h3 class="text-xl text-uiText font-bold">No streams</h3>
                  <p class="text text-uiTextAlt2">There are currently no active streams</p>
                </div>
                <MobileButton :loading="loadingStreams" @click="handleRefresh" class="text-lg bg-secondary active:bg-secondaryAlt font-bold rounded-full text-white px-6 py-2">Refresh</MobileButton>
              </div>
            </div>
          </div>
        </div>

      </Transition>
    </div>
    <BackendCodePopover v-model:show="showBackendCodePopoverRef" @confirm="() => router.go()" />
  </PaginatedScroll>
</template>

<script setup>
import { computed, onMounted, ref, Transition, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { twMerge } from 'tailwind-merge';
import BackButton from '../../components/BackButton.vue';
import MobileButton from '../../components/MobileButton.vue';
import VideoStage from '../../custom/VideoStage.vue';
import AudioStage from '../../custom/AudioStage.vue';
import { usePwaStore } from '../../stores/pwa';
import { useChatStore } from '../../stores/chat';
import { useStageStore } from '../../stores/stage';
import { useUsernameStore } from '../../stores/usernameStore';
import { navigateWithTransition } from '../../stores/navigation';
import { useBackendStore } from '../../stores/backend';
import PaginatedScroll from '../../custom/PaginatedScroll.vue';
import { PhImageBroken, PhMaskSad, PhShare } from '@phosphor-icons/vue';
import BackendCodePopover from '../../components/BackendCodePopover.vue';

const SCROLL_THRESHHOLD = 40;

const route = useRoute();
const router = useRouter();

const showBackendCodePopoverRef = ref(false);
const loadStreamRef = ref();

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const pwaStore = usePwaStore();
const chatStore = useChatStore();
const usernameStore = useUsernameStore();
const stageStore = useStageStore();
const backendStore = useBackendStore();

// const isStageDeleted = computed(() => {
//   return !backendStore.streams.includes(route.params.hostId);
// })

// Watch for stage join changes. If the user disconnects from the stage,
// and the stage disappears from the streams list, the stage is deleted
watch(stageStore.stageJoined, (newVal, oldVal) => {
  // If previously disconnected, ignore
  if (oldVal === false) return;

  // If now connected, ignore
  if (newVal === true) return;

  const streams = backendStore.refreshStreams();
  const streamIsDeleted = !streams.includes(route.params.hostId);
  if (streamIsDeleted) handleBack();
})

const loadingStreams = ref(false);

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

const headerClass = computed(() =>
  twMerge('fixed z-10 w-full h-16 shrink-0 grow-0 flex justify-center', { 'top-16': pwaStore.shouldShowBanner }, { 'top-0': !pwaStore.shouldShowBanner })
);

const handleBack = (navigate) => {
  if (!navigate) {
    navigateWithTransition(() => router.push('/custom'));
    return;
  }
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

const handleNavigate = async (nextOrPrev) => {
  if (stageStore.onStage) return;

  let nextHostId;
  if (nextOrPrev === 'PREV') {
    nextHostId = backendStore.prevStage.hostId;
  } else {
    nextHostId = backendStore.nextStage.hostId;
  }

  if (nextHostId === route.params.hostId) return;

  if (stageStore.stage) {
    stageStore.leaveStage();
  }

  await router.push(`/custom/watch/${nextHostId}`);
  backendStore.updateCurrentStreamIndex(nextHostId);
}

const handleRefresh = async () => {
  loadingStreams.value = true;
  await backendStore.refreshStreams();

  if (!backendStore.streamsExist) {
    loadingStreams.value = false;
    return;
  }

  backendStore.currentStreamIndex = 0;
  const hostId = backendStore.streams.length < 1 ? '' : backendStore.streams[0].hostId;

  await router.replace(`/custom/watch/${hostId}`);
  backendStore.updateCurrentStreamIndex(hostId);
  loadingStreams.value = false;
}

onMounted(async () => {
  // Find the current stream index to get stream info
  if (!backendStore.streamsExist) {
    await backendStore.refreshStreams();
  }

  if (backendStore.currentStreamIndex === -1) {
    backendStore.updateCurrentStreamIndex(route.params.hostId);
  }

  if ((backendStore.currentStreamIndex !== -1) && !stageStore.stage) {
    const token = await backendStore.joinStream(route.params.hostId);
    await stageStore.connectToStage(token);
  }
});
</script>