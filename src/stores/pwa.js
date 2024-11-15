import { defineStore } from 'pinia';
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh } = useRegisterSW();

export const usePwaStore = defineStore('pwa', {
  state: () => ({
    isInstalled: false,
    shouldShowInstallInstructions: false,
    shouldShowQrCode: false,
    forceHideBanner: false,
    deferredPrompt: undefined,
    displayMode: undefined,
  }),
  actions: {
    initPwaListeners() {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevents the default mini-infobar or install dialog from appearing on mobile
        e.preventDefault();

        // If this event fires, assume the app is not installed
        this.isInstalled = false;

        // Save the event because you'll need to trigger it later.
        this.deferredPrompt = e;
      });

      window.addEventListener('appinstalled', () => {
        // If visible, hide the install promotion
        this.isInstalled = true;
      });

      window
        .matchMedia('(display-mode: standalone)')
        .addEventListener('change', ({ matches }) => {
          if (matches) this.displayMode = 'standalone';
        });

      if (window.matchMedia('(display-mode: standalone)').matches)
        this.displayMode = 'standalone';
    },
    async showInstallPopup() {
      if (!this.deferredPrompt) {
        // If deferredPromptRef is not available and the install prompt is visible, assume the page is open in iOS safari, and show the install instructions popover
        this.shouldShowInstallInstructions = true;
        return;
      }

      this.deferredPrompt.prompt();

      // Find out whether the user confirmed the installation or not
      const { outcome } = await this.deferredPrompt.userChoice;

      // Act on the user's choice
      if (outcome === 'accepted') {
        this.isInstalled = true;
      } else if (outcome === 'dismissed') {
        this.isInstalled = false;
      }
    },
  },
  getters: {
    isApp(state) {
      return state.displayMode === 'standalone';
    },
    shouldShowBanner(state) {
      if (state.forceHideBanner) return false;
      if (state.displayMode === 'standalone') {
        return needRefresh.value;
      } else {
        return !state.isInstalled;
      }
    },
  },
  persist: {
    pick: ['isInstalled', 'forceHideBanner'],
  },
});
