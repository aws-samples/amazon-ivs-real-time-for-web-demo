<template>
  <TransitionRoot :show="isOpen || false" as="template">
    <Dialog @close="setIsOpen" class="relative z-30 flex items-center">
      <!-- Background -->
      <TransitionChild enter="transition duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-surfaceAlt3/70 backdrop-blur-sm" />
      </TransitionChild>
      <!-- Dialog -->
      <TransitionChild class="flex justify-center w-full" enter="transition duration-300 ease-out" enter-from="opacity-0 translate-y-64" enter-to="opacity-100 translate-y-0"
        leave="duration-200 ease-in" leave-from="opacity-100 translate-y-0" leave-to="opacity-0 translate-y-64">
        <DialogPanel class="absolute w-full bottom-0 sm:w-[480px] sm:bottom-16 rounded-t-2xl sm:rounded-2xl bg-white z-40 pb-safe shadow-[0_-15px_50px_-15px_rgba(0,0,0,0.3)] sm:shadow-2xl">
          <slot>
            <div class="px-4 py-8 flex flex-col gap-y-2 items-center text-uiText">
              <figure class="relative">
                <UserAvatar :size="64" :name="winnerName" />
              </figure>
              <h3 class="font-black text-2xl" v-if="props.winner.userId === props.currentUserId">You Won</h3>
              <h3 class="font-black text-2xl" v-else>{{ winnerName }}</h3>
              <p class="text-base leading-snug text-uiTextAlt2 text-center text-pretty">
                <template v-if="props.winner.userId === props.currentUserId">
                  You are the winner! Congratulations!
                </template>
                <template v-else>
                  The winner is {{ winnerName }}! Congratulations!
                </template>
              </p>
            </div>
          </slot>

          <slot name="footer" :confirm="handleConfirm" :cancel="handleCancel">
            <div class="flex flex-col gap-y-2 text-center px-3">
              <MobileButton @click="handleConfirm" class="w-full text-lg font-bold bg-surfaceAlt active:bg-surfaceAlt3 rounded-full px-8 py-2.5">
                Close
              </MobileButton>
            </div>
          </slot>
        </DialogPanel>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from '@headlessui/vue'
import MobileButton from './MobileButton.vue';
import { computed, ref, watch } from 'vue';
import UserAvatar from './UserAvatar.vue';
import { spawnFirework } from '../utils/confetti';

const isOpen = defineModel('show');
const props = defineProps(['winner', 'currentUserId']);
const intervalRef = ref();

const winnerName = computed(() => {
  return props.winner?.attributes?.username || "Unknown Participant";
});

function setIsOpen(value) {
  isOpen.value = value
}

function handleCancel() {
  setIsOpen(false);
}

function handleConfirm() {
  setIsOpen(false);
}

function clearFireworkTimer() {
  if (intervalRef.value) clearInterval(intervalRef.value)
}

watch(isOpen, (newVal) => {
  clearFireworkTimer();
  if (newVal) {
    intervalRef.value = setInterval(() => {
      spawnFirework();
    }, 250);
  }
})
</script>