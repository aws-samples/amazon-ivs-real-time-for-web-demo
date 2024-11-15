<template>
  <div class="transform relative h-full bg-surface flex flex-col">
    <header class="w-full h-16 shrink-0 grow-0 grid grid-rows-1 grid-cols-[50px_minmax(0,1fr)_50px] items-center border-b border-surfaceAlt2/10">
      <BackButton @click="handleBack" class="w-full h-full grow-0 shrink-0 justify-self-center" />
      <div class="justify-self-center font-bold text-lg">Settings</div>
      <div class="w-full h-full grow-0 shrink-0 justify-self-center">
        <button
          class="will-change-transform p-2 bg-transparent text-uiText/80 active:text-uiTextAlt2/50 transform scale-100 active:scale-95 transition duration-300 ease-in-out appearance-none text-center inline-flex items-center justify-center w-full h-full"
          @click="showAboutPopoverRef = true">
          <PhInfo weight="bold" :size="24" />
        </button>
      </div>
    </header>

    <div class="flex flex-col">
      <div class="w-full pl-4 pr-4 pt-4 pb-2 mb-2 bg-surface inline-flex justify-start items-center gap-x-3">
        <UserAvatar :size="56" />
        <div class="w-full min-w-0 grow shrink flex flex-col gap-px items-start justify-normal">
          <p class="w-full text-left overflow-x-hidden text-ellipsis text-nowrap">{{ usernameStore.username }}</p>
          <span class="w-full clear-both text-uiText/50 font-mono text-sm text-left overflow-x-hidden text-ellipsis text-nowrap">{{ usernameStore.userId }}</span>
        </div>
      </div>
      <MobileButton :class="twMerge(navItemClass)" @click="handleRegen">
        <PhShuffle :size="24" weight="regular" class=" text-uiText shrink-0" />
        <div class="flex flex-col gap-px items-start justify-normal">
          <span class="clear-both">Regenerate username</span>
        </div>
      </MobileButton>
      <router-link custom to="/settings/connect" v-slot="{ navigate }">
        <MobileButton :class="twMerge(navItemClass)" @click="() => navigateWithTransition(navigate)">
          <PhPlugsConnected :size="24" weight="regular" class=" text-uiText shrink-0" />
          <div class="flex flex-col gap-px items-start justify-normal">
            <span v-if="backendStore.domain && backendStore.apiKey" class="clear-both">Manage AWS account connection</span>
            <span v-else class="clear-both">Connect AWS account</span>
          </div>
        </MobileButton>
      </router-link>
      <MobileButton :class="twMerge(navItemClass, 'bg-transparent active:bg-destruct/10')" @click="showConfirmationPopover = true">
        <PhTrash :size="24" weight="regular" class="text-destruct shrink-0" />
        <div class="flex flex-col gap-px items-start justify-normal text-destruct">
          <span class="clear-both">Delete saved data</span>
        </div>
      </MobileButton>
    </div>
    <AboutPopover v-model:show="showAboutPopoverRef" />
    <ConfirmationPopover v-model:show="showConfirmationPopover" @end="handleReset" title="Delete saved data"
      description="Deleting your saved data will clear your saved preferences, including your User ID and any connected AWS accounts." :icon="PhTrash" action-label="Delete" cancel-label="Close" />
  </div>
</template>

<script setup>
import { getActivePinia } from 'pinia'
import UserAvatar from "../components/UserAvatar.vue";
import BackButton from '../components/BackButton.vue';
import AboutPopover from '../components/AboutPopover.vue';
import { navigateWithTransition } from '../stores/navigation';
import { useUsernameStore } from '../stores/usernameStore';
import { useBackendStore } from '../stores/backend';
import { useRouter } from 'vue-router';
import { PhInfo, PhPlugsConnected, PhShuffle, PhTrash } from '@phosphor-icons/vue';
import { ref } from 'vue';
import MobileButton from '../components/MobileButton.vue';
import { twMerge } from "tailwind-merge";
import ConfirmationPopover from "../components/ConfirmationPopover.vue";

const router = useRouter();

const showAboutPopoverRef = ref(false);
const showConfirmationPopover = ref(false);
const usernameStore = useUsernameStore();
const backendStore = useBackendStore();

const navItemClass = 'w-full px-4 h-12 bg-surface active:bg-surfaceAlt3 inline-flex justify-start items-center gap-x-3';

const handleRegen = () => {
  usernameStore.regenerateUsername(true);
  usernameStore.regenerateUserId(true);
}

const handleBack = (e) => {
  e.preventDefault();
  navigateWithTransition(() => router.go(-1));
}

const handleReset = () => {
  // Reset all stores
  const pinia = getActivePinia();
  pinia._s.forEach((store) => store.$reset());

  // Regenerate username
  handleRegen();

  // Redirect to demos
  navigateWithTransition(() => router.push({ path: '/demos' }))
}
</script>