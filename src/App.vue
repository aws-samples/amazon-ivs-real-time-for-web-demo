<template>
  <div class="relative flex flex-col overflow-hidden bg-surface w-dvw h-dvh">
    <PwaHeader v-if="pwaStore.shouldShowBanner" />
    <div class="relative h-full overflow-hidden">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <div class="absolute inset-0 z-50 pointer-events-none">
      <InstallPwaPopover class="pointer-events-auto" />
      <QrPopover :qr-value="qrValueRef" class="pointer-events-auto" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { shouldTransition } from './stores/navigation';
import { usePwaStore } from './stores/pwa';
import { useUsernameStore } from './stores/usernameStore';
import { useBackendStore } from './stores/backend';
import PwaHeader from './components/PwaHeader.vue';
import InstallPwaPopover from './components/InstallPwaPopover.vue';
import { onMounted, ref } from 'vue';
import QrPopover from './components/QrPopover.vue';

const qrValueRef = ref(window.location.href);
const router = useRouter();
const pwaStore = usePwaStore();
const usernameStore = useUsernameStore();
const backendStore = useBackendStore();

onMounted(() => {
  pwaStore.initPwaListeners();
  usernameStore.init();
})

// Guard before each route transition, to check if the transition should be animated
router.beforeEach(async (to, from) => {
  // Handle mobile transitions
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  if (shouldTransition.value) {
    to.meta.transition = toDepth < fromDepth ? 'removeStack' : 'addStack'
    if (to.path === '/demos' && from.path === '/settings') to.meta.transition = 'removeStack';
    if (to.path === '/custom' && from.path === '/settings') to.meta.transition = 'removeStack';
  }
  shouldTransition.value = false;

  // Handle route guards
  const isCustomRoute = to.path.startsWith('/custom');
  const isCustomDemoRoute = to.name === 'Custom Demo';

  // If there is no backend code saved, redirect to login
  if (isCustomRoute && !backendStore.isAuthenticated) {
    const nextPath = to.path || '/custom'
    return { name: 'Login', query: { redirect: nextPath } }
  }

  // Handle case where user goes to login page, even if logged in
  if (to.name === 'Login' && backendStore.isAuthenticated) {
    const nextPath = to.query.redirect || '/custom';
    return { path: nextPath }
  }

  // Handle case where a host shares their host URL
  if (isCustomDemoRoute) {
    const { hostId } = to.params;
    // Redirect to the corresponding watch page, if the user is not the host
    if (usernameStore.userId !== hostId) {
      return { path: `/custom/watch/${hostId}` };
    }
  }
});

router.afterEach(() => {
  qrValueRef.value = window.location.href;
})
</script>

<style>
.removeStack-enter-active,
.removeStack-leave-active,
.addStack-enter-active,
.addStack-leave-active {
  @apply absolute w-full transition duration-200 ease-out;
}

.removeStack-leave-active {
  @apply z-10
}

.removeStack-enter-to {
  @apply opacity-100 transform translate-x-0
}

.removeStack-enter-from {
  @apply opacity-100 transform translate-x-0
}

.removeStack-leave-to {
  @apply opacity-100 transform translate-x-full
}

.addStack-enter-to {
  @apply opacity-100 transform translate-x-0
}

.addStack-enter-from {
  @apply opacity-0 transform translate-x-full
}

.addStack-leave-to {
  @apply opacity-100 transform translate-x-0
}
</style>