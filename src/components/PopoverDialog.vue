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
          <DialogTitle>
            <slot name="title"></slot>
          </DialogTitle>
          <DialogDescription>
            <slot name="description"></slot>
          </DialogDescription>

          <slot></slot>

          <slot name="footer" :confirm="handleConfirm" :cancel="handleCancel">
            <MobileButton @click="handleConfirm">
              Confirm
            </MobileButton>
            <MobileButton @click="handleCancel">
              Cancel
            </MobileButton>
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
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue'
import MobileButton from './MobileButton.vue';

const isOpen = defineModel();

function setIsOpen(value) {
  isOpen.value = value
}

function handleCancel() {
  setIsOpen(false);
}

function handleConfirm() {
  setIsOpen(false);
}
</script>