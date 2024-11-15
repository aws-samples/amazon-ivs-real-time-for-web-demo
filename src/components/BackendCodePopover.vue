<template>
  <PopoverDialog v-model="showModel">
    <template #title>
      <span class="sr-only">Enter customer code</span>
    </template>
    <template #description>
      <span class="sr-only">Enter your customer code in order to continue.</span>
    </template>
    <template #default>
      <div class="transform-gpu px-4 pt-8 pb-8 flex flex-col gap-y-2 items-center text-uiText">
        <figure class="relative left-1.5">
          <PhLockLaminated weight="light" :size="64" class="transform text-secondary" />
          <div class="absolute -bottom-1 -left-2">
            <div class="bg-secondary p-1.5 rounded-full text-white/90 ring ring-surface">
              <PhUser weight="fill" :size="20" />
            </div>
          </div>
        </figure>
        <h3 class="font-black text-2xl mb-6">
          Enter authentication code
        </h3>
        <!-- <p class="text-base leading-snug text-uiTextAlt2 text-center text-pretty mb-6">
          Enter your authentication code to continue
        </p> -->
        <div class="flex flex-col w-full gap-2">
          <div class="flex w-full gap-x-2 items-center justify-center text-center text-xs">
            <div class="w-full h-12 flex flex-col gap-1">
              <CodeInput v-model:code="codeRef" @done="handleConfirm" :class="['grow shrink', { 'ring-destruct focus:ring-destructAlt bg-destruct/10': validationErrorMsgRef !== '' }]" />
            </div>
            <MobileButton class="shrink-0 text-base rounded-2xl px-4 h-12 inline-flex gap-x-1 items-center" @click="handlePaste">
              <PhClipboardText weight="bold" :size="24" class="transform text-uiText" />
            </MobileButton>
          </div>
          <div v-if="validationErrorMsgRef !== ''" class="inline-flex gap-x-1 text-xs sm:text-sm py-2 px-4 text-uiTextAlt2 relative text-pretty rounded-2xl bg-destruct/10">
            <span className="text-destruct animate-error-shake">
              <span class="font-bold">Error:</span> {{ validationErrorMsgRef }}
            </span>
            <PhWarning weight="fill" :size="16" class="shrink-0 relative top-px text-destruct" />

          </div>
          <div v-else class="inline-flex gap-x-1 text-xs sm:text-sm py-2 px-4 text-uiTextAlt2 relative text-pretty rounded-2xl bg-surfaceAlt">
            <span>
              Use your <span class="font-bold font-mono">domainName</span> and <span class="font-bold font-mono">apiKey</span> to create your authentication code. <RouterLink to="/settings/connect"
                class="text-secondary">
                Learn more</RouterLink>
            </span>
            <PhInfo weight="fill" :size="16" class="shrink-0 relative top-px" />
          </div>
        </div>
      </div>
    </template>
    <template #footer="{ cancel }">
      <div class="flex flex-col gap-y-2 text-center px-3">
        <MobileButton @click="handleConfirm" :disabled="codeRef.length < 1 || validationErrorMsgRef !== ''" :loading="isValidatingRef"
          :class="twMerge('w-full text-lg bg-secondary active:bg-secondaryAlt disabled:pointer-events-none font-bold rounded-full text-white px-8 py-2.5 inline-flex justify-center items-center', isValidRef && 'bg-positive active:bg-positiveAlt')">
          <PhCheck v-if="isValidRef" :size="24" weight="bold" />
          <span v-else :class="[{ 'opacity-0': isValidatingRef }]">Confirm</span>
        </MobileButton>
        <MobileButton @click="() => handleCancel(cancel)" class="w-full text-lg font-bold bg-surfaceAlt active:bg-surfaceAlt3 rounded-full px-8 py-2.5">
          Close
        </MobileButton>
      </div>
    </template>
  </PopoverDialog>
</template>

<script setup>
import PopoverDialog from './PopoverDialog.vue';
import MobileButton from './MobileButton.vue';
import { ref, watch } from 'vue';
import { PhLockLaminated, PhClipboardText, PhUser, PhInfo, PhWarning, PhCheck } from '@phosphor-icons/vue';
import CodeInput from './CodeInput.vue';
import { useBackend } from '../composables/useBackend';
import { useBackendStore } from '../stores/backend'
import { getApiUrlFromDomain } from '../utils/backend';
import { twMerge } from 'tailwind-merge';

const { listStreams } = useBackend();
const backendStore = useBackendStore();

const showModel = defineModel('show')
const emit = defineEmits(['confirm'])
const codeRef = ref('');
const isValidatingRef = ref(false);
const isValidRef = ref(false);
const validationErrorMsgRef = ref('');

const props = defineProps({
  qrValue: {
    type: String,
    default: window.location.href
  },
});

const handlePaste = async () => {
  const text = await navigator.clipboard.readText();
  codeRef.value = text;
}

const handleConfirm = async () => {
  isValidatingRef.value = true;
  validationErrorMsgRef.value = ''

  if (!codeRef.value) return;

  // Parse code
  const { domain, apiKey } = parseCode(codeRef.value);
  const apiUrl = getApiUrlFromDomain(domain);

  if (!domain || !apiKey) {
    validationErrorMsgRef.value = 'Unable to verify code. Please check if the code was entered correctly.'
    isValidatingRef.value = false;
    return;
  }

  // Try to list streams
  let streams;
  try {
    streams = await listStreams(apiKey, apiUrl);
    validationErrorMsgRef.value = '';
  } catch (err) {
    validationErrorMsgRef.value = 'Unable to verify code. Please check if the code was entered correctly.'
    isValidatingRef.value = false;
    console.error(err);
    return false;
  }

  // Save values, if no errors
  backendStore.domain = domain;
  backendStore.apiKey = apiKey;
  backendStore.streams = streams;

  // Close popover, and refresh page
  isValidatingRef.value = false;
  isValidRef.value = true;
  emit('confirm');
}

const parseCode = (code) => {
  // Regular expression to match the pattern
  const pattern = /^([a-zA-Z0-9]+)-([a-zA-Z0-9]+)$/;

  const match = code.match(pattern);
  if (!match) {
    return {
      domain: '',
      apiKey: '',
    };
  }

  return {
    domain: match[1],
    apiKey: match[2]
  };
}

const handleCancel = (cancel) => {
  cancel();
}

watch(codeRef, () => {
  // When the input changes, clear out the error message
  validationErrorMsgRef.value = '';
})
</script>