<template>
  <div class="transform relative h-full bg-surface flex flex-col">
    <header class="w-full h-16 shrink-0 grow-0 grid grid-rows-1 grid-cols-[50px_minmax(0,1fr)_50px] items-center border-b border-surfaceAlt2/10">
      <BackButton @click="handleBack" class="w-full h-full grow-0 shrink-0 justify-self-center" />
      <div class="justify-self-center font-bold text-lg">Manage AWS Account</div>
      <div class="w-full h-full grow-0 shrink-0 justify-self-center">
      </div>
    </header>

    <div v-if="backendStore.isAuthenticated" class="flex flex-col grow">
      <div class="w-full pl-4 pr-4 pt-4 pb-2 mb-1 bg-surface inline-flex justify-start items-center gap-x-3">
        <figure class="relative">
          <Avatar :size="56" variant="marble" :name="backendStore.secretCode" :title="true" :colors="['#4200DB', '#7598FF', '#1B232D', '#008559', '#00A4BD', '#FFD000']" class="shrink-0" />
          <div class="absolute inset-0 flex items-center justify-center">
            <PhPlugsConnected :size="24" weight="fill" class="text-white drop-shadow-md" />
          </div>
        </figure>
        <div class="w-full min-w-0 grow shrink flex flex-col gap-px items-start justify-normal relative">
          <p class="w-full text-left overflow-x-hidden text-ellipsis text-nowrap align-middle">
            Connected to account
            <PhCheckCircle :size="16" weight="fill" class="inline-block relative -top-0.5 text-positive" />
          </p>
          <MobileButton @click="() => { showSecretRef = !showSecretRef; }" class="bg-transparent inline-flex items-center px-2 relative -left-2 rounded-full h-5">
            <span v-if="showSecretRef" class="w-full clear-both text-uiText/50 font-mono text-xs text-left overflow-x-hidden text-ellipsis text-nowrap">{{ backendStore.secretCode }}</span>
            <span v-else class="w-full clear-both text-uiText/50 font-mono text-xs text-left overflow-x-hidden text-ellipsis text-nowrap">
              <PhLockLaminated :size="16" weight="fill" class="inline-block relative -top-px text-uiText/50 mr-1" />Show secret code
            </span>
          </MobileButton>
        </div>
      </div>
      <div class="px-3">
        <div class="inline-flex gap-x-1 text-xs sm:text-sm py-2.5 px-3 mb-4 text-uiTextAlt2 relative text-pretty rounded-2xl bg-surfaceAlt3">
          <span>
            This app is connected to an AWS account, enabling you to create and share your own streams. Viewers will need to enter the correct authentication code to watch.
          </span>
          <PhInfo weight="fill" :size="16" class="shrink-0 relative top-px" />
        </div>
      </div>
      <div class="border-b border-surfaceAlt2/10 pb-4 mb-4">
        <router-link custom to="/custom" v-slot="{ navigate }">
          <MobileButton :class="twMerge(navItemClass)" @click="navigate">
            <PhVideoConference :size="24" weight="regular" class=" shrink-0 text-uiText" />
            <div class="flex flex-col gap-px items-start justify-normal">
              <span class="clear-both">View account-specific streams</span>
            </div>
          </MobileButton>
        </router-link>
        <router-link custom to="/demos" v-slot="{ navigate }">
          <MobileButton :class="twMerge(navItemClass)" @click="navigate">
            <PhFilmReel :size="24" weight="regular" class=" shrink-0 text-uiText" />
            <div class="flex flex-col gap-px items-start justify-normal">
              <span class="clear-both">View demo streams</span>
            </div>
          </MobileButton>
        </router-link>
      </div>
      <MobileButton :class="twMerge(navItemClass)" @click="() => copy(backendStore.secretCode)" :disabled="!isSupported">
        <PhCheck v-if="copied" :size="24" weight="regular" class=" shrink-0 text-positive" />
        <PhCopy v-else :size="24" weight="regular" class=" text-uiText shrink-0" />
        <div class="flex flex-col gap-px items-start justify-normal">
          <span v-if="copied" class="clear-both text-positive">Copied successfully</span>
          <span v-else class="clear-both">Copy authentication code</span>
        </div>
      </MobileButton>
      <MobileButton :class="twMerge(navItemClass, 'bg-transparent active:bg-destruct/10')" @click="showConfirmationPopover = true">
        <PhPlugs :size="24" weight="regular" class="text-destruct shrink-0" />
        <div class="flex flex-col gap-px items-start justify-normal text-destruct">
          <span class="clear-both">Remove connection</span>
        </div>
      </MobileButton>
    </div>
    <div v-else class="flex flex-col grow items-center pt-2">
      <div class="w-full max-w-screen-md px-4 py-2 bg-surface inline-flex justify-start items-center gap-x-3 mb-6">
        <p class="text-uiTextAlt2 leading-tight">Deploy the full solution in your AWS account, and connect it to create and share your own streams.</p>
      </div>
      <ol class="px-4 list-outside list-none max-w-screen-md">
        <li class="flex gap-4 mb-8">
          <div class="shrink-0 rounded-full bg-surfaceAlt3 size-8 flex items-center justify-center font-display font-bold">1</div>
          <div>
            <p class="mb-2 font-bold text-uiText/80 text-lg">Deploy resources</p>
            <p class="clear-both mb-4 text-uiText/80">Launch the cloudformation stack to deploy the necessary resources to your AWS account. <a
                href="https://github.com/aws-samples/amazon-ivs-real-time-serverless-demo" target="_blank" rel="noreferrer noopener" class="underline underline-offset-2 relative inline-block">View
                source on Github</a>
            </p>
            <div class="inline-flex flex-col gap-1 w-full">
              <MobileButton :class="twMerge(buttonClass, 'p-2 inline-flex gap-1 items-center justify-center bg-primary/10 active:bg-primary/20 text-primary w-full')"
                @click="showLaunchStackRef = true">
                Launch stack
              </MobileButton>
            </div>
          </div>
        </li>
        <li class="flex gap-4 mb-8">
          <div class="shrink-0 rounded-full bg-surfaceAlt3 size-8 flex items-center justify-center font-display font-bold">2</div>
          <div>
            <p class="mb-2 font-bold text-uiText/80 text-lg">Generate an authentication code</p>
            <span class="clear-both text-uiText/80">Once the stack has been deployed, view the stack outputs and use the first part of the <code class='font-mono font-bold'>domainName</code> and the
              <code class='font-mono font-bold'>secretUrl</code> to
              create your authentication code in the following format: <code class='font-mono font-bold'>
                domainId-apiKey</code>.</span>
          </div>
        </li>
        <li class="flex gap-4 mb-8">
          <div class="shrink-0 rounded-full bg-surfaceAlt3 size-8 flex items-center justify-center font-di˜splay font-bold">3</div>
          <div class="w-full">
            <p class="mb-2 font-bold text-uiText/80 text-lg">Authenticate with your code</p>
            <MobileButton @click="showBackendCodePopoverRef = true"
              :class="twMerge(buttonClass, 'p-2 inline-flex gap-1 items-center justify-center bg-primary/10 active:bg-primary/20 text-primary w-full')">
              Authenticate
            </MobileButton>
          </div>
        </li>
      </ol>
    </div>

    <BackendCodePopover v-model:show="showBackendCodePopoverRef" @confirm="handleConfirm" />
    <ConfirmationPopover v-model:show="showConfirmationPopover" @end="handleClear" title="Remove connection"
      description="Removing this connection will immediately clear the authentication code and prevent you from viewing and creating streams created with it." :icon="PhPlugs">
      <template #footer="{ cancel }">
        <div class="flex flex-col gap-y-2 text-center px-3">
          <div class="inline-flex gap-x-1 text-xs sm:text-sm py-2 px-4 text-destruct relative text-pretty rounded-2xl bg-destruct/10 mb-4">
            <span class=text-left>
              This action <span class="font-bold">will not</span> delete the resources created on the associated AWS account. To delete all resources created by this app, following the instructions:
              <a href="https://github.com/aws-samples/amazon-ivs-real-time-serverless-demo?tab=readme-ov-file#tearing-down-the-backend-stack" rel="noreferrer noopener"
                class="underline underline-offset-2" target="_blank">Tearing down the
                backend stack</a></span>
            <PhWarning weight="fill" :size="16" class="shrink-0 relative top-px" />
          </div>
          <MobileButton @click="handleClear" :class="['w-full text-lg font-bold rounded-full px-8 py-2.5 bg-destruct active:bg-destructAlt']">
            <span class="inline-flex gap-x-2 items-center text-white">
              Remove
            </span>
          </MobileButton>
          <MobileButton @click="cancel" class="w-full text-lg font-bold bg-surfaceAlt active:bg-surfaceAlt3 rounded-full px-8 py-2.5">
            Close
          </MobileButton>
        </div>
      </template>
    </ConfirmationPopover>
    <LaunchStackPopover v-model:show="showLaunchStackRef" />
  </div>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'
import Avatar from 'vue-boring-avatars';
import BackButton from '../../components/BackButton.vue';
import { navigateWithTransition } from '../../stores/navigation';
import { useBackendStore } from '../../stores/backend';
import { useRouter } from 'vue-router';
import { PhCheck, PhCheckCircle, PhCopy, PhFilmReel, PhInfo, PhLockLaminated, PhPlayCircle, PhPlugs, PhPlugsConnected, PhVideoConference, PhWarning } from '@phosphor-icons/vue';
import { ref } from 'vue';
import MobileButton from '../../components/MobileButton.vue';
import { twMerge } from "tailwind-merge";
import BackendCodePopover from "../../components/BackendCodePopover.vue";
import ConfirmationPopover from '../../components/ConfirmationPopover.vue';
import LaunchStackPopover from '../../components/LaunchStackPopover.vue';

const router = useRouter();
const { copy, copied, isSupported } = useClipboard()

const showConfirmationPopover = ref(false);
const showBackendCodePopoverRef = ref(false);
const showSecretRef = ref(false);
const showLaunchStackRef = ref(false);
const timeoutRef = ref();

const backendStore = useBackendStore();

const navItemClass = 'w-full px-4 h-12 bg-surface active:bg-surfaceAlt3 inline-flex justify-start items-center gap-x-3';
const buttonClass = 'bg-surfaceAlt active:bg-surfaceAlt3 px-3 py-1 rounded-2xl';

const handleConfirm = () => {
  if (timeoutRef.value) clearTimeout(timeoutRef);
  setTimeout(() => {
    showBackendCodePopoverRef.value = false;
    navigateWithTransition(() => router.push('/custom'));
  }, 300);
}

const handleClear = () => {
  backendStore.$reset();
  handleBack();
}

const handleBack = (e) => {
  e?.preventDefault();
  navigateWithTransition(() => router.go(-1));
}
</script>