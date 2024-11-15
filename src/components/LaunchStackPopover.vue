<template>
  <PopoverDialog v-model="showModel">
    <template #title>
      <span class="sr-only">Select AWS region</span>
    </template>
    <template #description>
      <span class="sr-only">Select the AWS region in which to deploy your stack.</span>
    </template>
    <template #default>
      <div class="transform-gpu px-4 pt-8 pb-8 flex flex-col gap-y-2 items-center text-uiText">
        <figure class="relative left-1.5">
          <PhGlobeHemisphereWest weight="fill" :size="64" class="transform text-secondary" />
          <div class="absolute -bottom-1 -left-2">
            <div class="bg-secondary p-1.5 rounded-full text-white/90 ring ring-surface">
              <PhCloud weight="fill" :size="20" />
            </div>
          </div>
        </figure>
        <h3 class="font-black text-2xl">
          Select region
        </h3>
        <p class="text-base leading-snug text-uiTextAlt2 text-center text-pretty mb-6">
          Select the AWS region that is closest to your location.
        </p>
        <div class="flex flex-col w-full gap-2">
          <Select v-model:selected="selectedStackRef" :items="STACKS" />
        </div>
      </div>
    </template>
    <template #footer="{ cancel }">
      <div class="flex flex-col gap-y-2 text-center px-3">
        <a :href="selectedStackRef.value" target="_blank" rel="noreferrer noopener">
          <MobileButton @click="() => handleCancel(cancel)"
            class="w-full text-lg bg-secondary active:bg-secondaryAlt disabled:pointer-events-none font-bold rounded-full text-uiTextAlt px-8 py-2.5 inline-flex justify-center items-center">
            Continue
          </MobileButton>
        </a>
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
import Select from './Select.vue';
import { ref } from 'vue';
import { PhCloud, PhGlobeHemisphereWest } from '@phosphor-icons/vue';
import { STACKS } from '../constants/stacks'

const showModel = defineModel('show');
const emit = defineEmits(['confirm']);
const selectedStackRef = ref(STACKS[0]);

const props = defineProps({
  qrValue: {
    type: String,
    default: window.location.href
  },
});

const handleCancel = (cancel) => {
  cancel();
}
</script>