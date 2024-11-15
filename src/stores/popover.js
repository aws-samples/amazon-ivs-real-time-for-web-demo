import { defineStore } from 'pinia';
import { ref } from 'vue';

export const showPopover = ref(false);
export const shouldProceed = ref(false);
export const confirmAction = ref(() => {});

export const usePopoverStore = defineStore('popover', {
  state: () => ({
    shouldHide: false,
  }),
  actions: {
    getUserPermission(action) {
      confirmAction.value = action;
      if (!this.shouldHide) {
        showPopover.value = true;
      } else if (action) {
        action();
      }
    },
  },
  persist: true,
});
