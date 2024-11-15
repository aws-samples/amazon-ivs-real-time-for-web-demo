<template>
  <PopoverDialog v-model="showPopover">
    <template #title>
      <span class="sr-only">{{ props.title }}</span>
    </template>
    <template #description>
      <span class="sr-only">For your privacy, other participants in this demo will not be able to see or hear you.</span>
    </template>
    <template #default>
      <div class="px-4 py-8 flex flex-col gap-y-2 items-center text-uiText">
        <figure class="relative left-1">
          <PhHandPalm weight="light" :size="64" class="transform text-secondary" />
          <div class="absolute -bottom-1 -left-1">
            <div class="bg-secondary p-1.5 rounded-full text-white/90">
              <PhDetective weight="fill" :size="20" />
            </div>
          </div>
        </figure>
        <h3 class="font-black text-2xl">{{ props.title }}</h3>
        <p class="text-base leading-snug text-uiTextAlt2 text-center text-pretty">
          For your privacy, other participants in this demo <span class="font-black text-uiText">will not</span> be able to see or hear you.
        </p>
      </div>
    </template>
    <template #footer="{ confirm, cancel }">
      <div class="flex flex-col gap-y-2 text-center px-3">
        <MobileButton @click="() => handleConfirm(confirm)" class="w-full text-lg bg-secondary active:bg-secondaryAlt font-bold rounded-full text-white px-8 py-2.5">
          Continue
        </MobileButton>
        <MobileButton @click="() => handleCancel(cancel)" class="w-full text-lg font-bold bg-transparent active:bg-surfaceAlt rounded-full px-8 py-2.5">
          Cancel
        </MobileButton>
        <div class="px-4 py-2.5 bg-surfaceAlt rounded-3xl">
          <Switch v-model="popoverStore.shouldHide" label="Hide this notice next time" />
        </div>
      </div>
    </template>
  </PopoverDialog>
</template>

<script setup>
import { PhDetective, PhHandPalm } from '@phosphor-icons/vue';
import PopoverDialog from './PopoverDialog.vue';
import Switch from './Switch.vue';
import { usePopoverStore, confirmAction } from '../stores/popover'
import MobileButton from './MobileButton.vue';
import { showPopover } from '../stores/popover';

const props = defineProps({
  title: {
    type: String,
    default: 'Joining incognito'
  },
});

const handleConfirm = (confirm) => {
  if (confirmAction.value) confirmAction.value();
  confirm();
  confirmAction.value = () => { };
}

const handleCancel = (cancel) => {
  cancel();
}

const popoverStore = usePopoverStore();
</script>