<template>
  <PopoverDialog v-model="showModel">
    <template #default>
      <slot>
        <div class="px-4 py-8 flex flex-col gap-y-2 items-center text-uiText">
          <figure class="relative">
            <component :is="props.icon" weight="fill" :size="64" class="transform text-destruct" />
          </figure>
          <h3 class="font-black text-2xl">{{ props.title }}</h3>
          <p class="text-base leading-snug text-uiTextAlt2 text-center text-pretty">
            {{ props.description }}
          </p>
        </div>
      </slot>
    </template>
    <template #footer="{ cancel }">
      <slot name="footer" :cancel="cancel">
        <div class="flex flex-col gap-y-2 text-center px-3">
          <MobileButton @click="() => handleEnd(cancel)" :class="['w-full text-lg font-bold rounded-full px-8 py-2.5 bg-destruct active:bg-destructAlt']">
            <span class="inline-flex gap-x-2 items-center text-white">
              {{ props.actionLabel }}
            </span>
          </MobileButton>
          <MobileButton @click="() => handleCancel(cancel)" class="w-full text-lg font-bold bg-surfaceAlt active:bg-surfaceAlt3 rounded-full px-8 py-2.5">
            {{ props.cancelLabel }}
          </MobileButton>
        </div>
      </slot>
    </template>
  </PopoverDialog>
</template>

<script setup>
import PopoverDialog from './PopoverDialog.vue';
import MobileButton from './MobileButton.vue';
import { PhHandWaving } from '@phosphor-icons/vue';

const emit = defineEmits(['end'])

const showModel = defineModel('show')
const props = defineProps({
  title: {
    type: String,
    default: 'End stream'
  },
  description: {
    type: String,
    default: 'Everyone connected to the stream will be disconnected and the stream will end.'
  },
  icon: {
    type: Object,
    default: PhHandWaving,
  },
  actionLabel: {
    type: String,
    default: 'End',
  },
  cancelLabel: {
    type: String,
    default: 'Close',
  },
})

const handleEnd = (cancel) => {
  // Close the popover
  cancel();

  // Emit end event
  emit('end');
}

const handleCancel = (cancel) => {
  cancel();
}
</script>