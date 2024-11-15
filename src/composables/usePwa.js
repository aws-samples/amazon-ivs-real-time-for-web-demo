import { computed, onMounted, ref } from 'vue';
import { usePwaStore } from '../stores/pwa';

export function usePwa() {
  const pwaStore = usePwaStore();
  const deferredPromptRef = ref();
  const displayModeRef = ref();
  const isApp = computed(() => displayModeRef.value === 'standalone');

  const initPwaListeners = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // If this event fires, assume the app is not installed
      pwaStore.isInstalled = false;

      // Save the event because you'll need to trigger it later.
      deferredPromptRef.value = e;

      // Prevents the default mini-infobar or install dialog from appearing on mobile
      e.preventDefault();
    });

    window.addEventListener('appinstalled', () => {
      // If visible, hide the install promotion
      pwaStore.isInstalled = true;
    });

    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', ({ matches }) => {
        if (matches) displayModeRef.value = 'standalone';
      });

    if (window.matchMedia('(display-mode: standalone)').matches)
      displayModeRef.value = 'standalone';
  };

  return {
    initPwaListeners,
    deferredPromptRef,
    displayModeRef,
    isApp,
  };
}
