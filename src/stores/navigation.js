import { ref } from 'vue';

export const shouldTransition = ref(false);
export const navigateWithTransition = (navigate) => {
  shouldTransition.value = true;
  navigate();
};
