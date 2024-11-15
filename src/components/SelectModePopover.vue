<template>
  <PopoverDialog v-model="showModel">
    <template #title>
      <span class="sr-only">Select stage mode</span>
    </template>
    <template #description>
      <span class="sr-only">Join the stage in the selected mode</span>
    </template>
    <template #default>
      <div class="transform-gpu px-4 pt-8 pb-6 flex flex-col gap-y-2 items-center text-uiText">
        <h3 class="text-2xl font-black text-center text-uiText text-pretty mb-4">
          Select stage mode
        </h3>
        <RadioGroup v-model="selectedStageModeRef" class="w-full">
          <RadioGroupLabel class="sr-only">Stage mode</RadioGroupLabel>
          <div class="space-y-2">
            <RadioGroupOption as="template" v-for="streamType in streamTypes" :key="streamType.name" :value="streamType.value" v-slot="{ active, checked }">
              <div :class="[
                active
                  ? 'ring-2 ring-secondary ring-offset-2 ring-offset-surface'
                  : '',
                checked ? 'bg-secondary/15 text-secondaryAlt ' : 'bg-surfaceAlt',
              ]" class="relative flex cursor-pointer rounded-lg px-5 py-4 focus:outline-none">
                <div class="flex w-full items-center justify-between">
                  <div class="flex items-center">
                    <div class=" shrink-0 mr-4" :class="checked ? 'text-secondaryAlt' : 'text-uiText/50'">
                      <component :is="streamType.icon" :size="28" :weight="checked ? 'fill' : 'regular'" />
                    </div>
                    <div class="text-sm">
                      <RadioGroupLabel as="p" :class="checked ? 'text-secondaryAlt' : 'text-uiText'" class="transition ease-out duration-150 font-bold text-lg leading-tight">
                        {{ streamType.name }}
                      </RadioGroupLabel>
                      <RadioGroupDescription as="span" :class="checked ? 'text-secondaryAlt/80' : 'text-uiText/50'" class="inline">
                        <span> {{ streamType.description }}</span>
                      </RadioGroupDescription>
                    </div>
                  </div>
                  <div class="shrink-0 text-secondaryAlt">
                    <PhCheckCircle :size="24" weight="fill" :class="['transform transition ease-out duration-150', { 'opacity-100 scale-100': checked, 'opacity-0 scale-50': !checked }]" />
                  </div>
                </div>
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>
      </div>
    </template>
    <template #footer="{ cancel }">
      <div class="flex flex-col gap-y-2 text-center px-3">
        <MobileButton @click="() => handleJoin(cancel)" :class="['w-full text-lg font-bold rounded-full px-8 py-2.5 bg-secondary active:bg-secondaryAlt']">
          <span class="inline-flex gap-x-2 items-center text-white">
            Join
          </span>
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
import {
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption,
  RadioGroupDescription
} from '@headlessui/vue'
import MobileButton from './MobileButton.vue';
import { ref } from 'vue';
import { PhBoxingGlove, PhCheckCircle, PhUserSquare } from '@phosphor-icons/vue';

const emit = defineEmits(['join'])
const selectedStageModeRef = ref('GUEST_SPOT');
const streamTypes = [
  {
    name: 'Guest spot',
    description: 'Join as a guest',
    icon: PhUserSquare,
    value: 'GUEST_SPOT',
  },
  {
    name: 'PK Mode',
    description: 'Join as a contestant',
    icon: PhBoxingGlove,
    value: 'PK',
  }
]

const showModel = defineModel('show')

const handleJoin = (cancel) => {
  // Close the popover
  cancel();

  // Emit join event
  emit('join', selectedStageModeRef.value);
}

const handleCancel = (cancel) => {
  cancel();
}
</script>