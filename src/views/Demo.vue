<template>
  <div :class="['absolute flex flex-col bg-surface h-full grow shrink w-dvw touch-none', { 'pb-2': shouldRemovePadding }, { 'pb-safe': !shouldRemovePadding }]">
    <header :class="headerClass">
      <div class="w-full max-w-screen-xl grid grid-rows-1 grid-cols-[50px_minmax(0,1fr)_50px] items-center">
        <router-link custom to="/demos" v-slot="{ navigate }">
          <BackButton @click="() => handleBack(navigate)" class="w-full h-full grow-0 shrink-0 justify-self-center" />
        </router-link>
        <div class="justify-self-center font-bold text-lg">{{ currentDemo.title }}</div>
        <div class="justify-self-end"></div>
      </div>
    </header>
    <component :is="currentDemo.component" class="pt-16 min-h-0 w-full grow shrink touch-none" />
    <div class="absolute inset-0 z-50 pointer-events-none">
      <PrivacyPopover class="pointer-events-auto" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { twMerge } from 'tailwind-merge';
import { shouldTransition } from '../stores/navigation';
import BackButton from '../components/BackButton.vue';
import GuestSpotDemo from '../demos/GuestSpotDemo.vue';
import PKModeDemo from '../demos/PKModeDemo.vue';
import AudioOnlyDemo from '../demos/AudioOnlyDemo.vue';
import { usePwaStore } from '../stores/pwa';
import { useChatStore } from '../stores/chat';
import PrivacyPopover from '../components/PrivacyPopover.vue';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const route = useRoute();
const router = useRouter();
const pwaStore = usePwaStore();
const chatStore = useChatStore();

const shouldRemovePadding = computed(() => {
  return chatStore.inputFocused && isMobile;
})

const demos = {
  'guest-spot': {
    title: 'Guest spot',
    component: GuestSpotDemo,
  },
  'pk-mode': {
    title: 'PK mode',
    component: PKModeDemo
  },
  'audio-only': {
    title: 'Audio room',
    component: AudioOnlyDemo
  },
};

const headerClass = computed(() =>
  twMerge('fixed z-10 w-full h-16 shrink-0 grow-0 flex justify-center', { 'top-16': pwaStore.shouldShowBanner }, { 'top-0': !pwaStore.shouldShowBanner })
);

const currentDemo = computed(() => demos[route.params.demoId]);

const handleBack = (navigate) => {
  shouldTransition.value = true;
  navigate();
};

onMounted(() => {
  if (!currentDemo.value) {
    router.push('/demos');
  }
});
</script>