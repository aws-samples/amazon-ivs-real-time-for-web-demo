<template>
  <div class="transform relative h-full flex flex-col pb-safe bg-surfaceAlt">
    <div class="fixed inset-0 bg-surfaceAlt"></div>
    <!-- Header -->
    <header :class="['fixed z-20 flex justify-between items-center mb-8 w-full px-2.5 pt-4 bg-gradient-to-t from-transparent to-white top-0']">
      <div class="w-full max-w-screen-xl mx-auto flex justify-between items-center">
        <div class="flex gap-x-2 items-center">
          <UserAvatar />
          <h1 class="text-lg font-mono">{{ usernameStore.username }}</h1>
        </div>
        <router-link custom to="/settings" v-slot="{ navigate }">
          <MobileButton @click="() => handleSettingsSelect(navigate)" class="p-2 rounded-full bg-white shadow">
            <PhGearSix weight="bold" :size="24" />
          </MobileButton>
        </router-link>
      </div>
    </header>

    <!-- List of streams -->
    <div class="w-full max-w-screen-xl mx-auto relative z-10 px-2.5 pb-3 space-y-4 flex flex-col grow justify-end">
      <router-link custom v-for="demo in demos" :key="demo.path" :to="demo.path" v-slot="{ href, route, navigate }">
        <MobileButton class="w-full bg-white rounded-xl p-4 shadow flex flex-col items-start gap-5 transition" @click="() => handleDemoSelect(navigate, demo.id, route)" :disabled="stageLoading">
          <span class="text-lg">{{ demo.name }}</span>
          <svg role="presentation" class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M15.5 8C15.5 8.29 15.38 8.56 15.16 8.75L7.16 15.75L5.84 14.24L11.84 8.99H0.5V6.99H11.84L5.84 1.76L7.16 0.25L15.16 7.25C15.38 7.44 15.5 7.71 15.5 8Z" data-type="fill"></path>
          </svg>
        </MobileButton>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from "../components/UserAvatar.vue";
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUsernameStore } from '../stores/usernameStore';
import { useStageStore } from '../stores/stage';
import { navigateWithTransition } from '../stores/navigation';
import { fetchDemoToken } from '../utils/stage';
import MobileButton from '../components/MobileButton.vue';
import { PhGearSix } from '@phosphor-icons/vue';

const usernameStore = useUsernameStore();
const stageStore = useStageStore();
const stageLoading = ref(undefined);

const demos = [
  { name: 'Join Audio-only stream', path: '/demos/audio-only', id: 'audio' },
  { name: 'Join VS/PK stream', path: '/demos/pk-mode', id: 'pk' },
  { name: 'Join Guest spot stream', path: '/demos/guest-spot', id: 'guest' },
];

const handleSettingsSelect = (navigate) => {
  navigateWithTransition(navigate);
};

const handleDemoSelect = async (navigate, demoId, route) => {
  stageLoading.value = true;
  // Leave any existing stages
  if (stageStore.stage) stageStore.leaveStage();

  const token = await fetchDemoToken(usernameStore.username, demoId);
  await stageStore.connectToStage(token);
  navigateWithTransition(navigate);
  stageLoading.value = false;
}

onMounted(async () => {
  if (stageStore.stage) {
    stageStore.leaveStage();
  }
})
</script>