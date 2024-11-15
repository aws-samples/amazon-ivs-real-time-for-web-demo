<template>
  <div class="transform relative h-full flex flex-col pb-safe bg-surfaceAlt">
    <div class="fixed inset-0 bg-gradient-to-b from-white to-surfaceAlt"></div>

    <div class="absolute inset-0 px-4 pb-4 max-w-xl h-full flex flex-col mx-auto justify-between">
      <div class="flex flex-col grow items-center justify-center gap-y-4">
        <figure class="relative left-1">
          <PhLockLaminated weight="light" :size="64" class="transform text-secondary" />
          <div class="absolute -bottom-1 -left-2">
            <div class="bg-secondary p-1.5 rounded-full text-white/90 ring ring-surface">
              <PhUser weight="fill" :size="20" />
            </div>
          </div>
        </figure>
        <h1 class="text-3xl font-display mb-8 text-uiText text-pretty text-center max-w-[20ch]">
          Authentication code required
        </h1>
        <p class="text-base leading-snug text-uiTextAlt2 text-center text-pretty mb-6">
          You must enter an authentication code to continue. <router-link to="/settings" class="text-secondary">Learn more</router-link>
        </p>
      </div>

      <MobileButton class="w-full flex justify-center px-8 py-2.5 bg-secondary/10 ring-2 ring-secondary/30 text-secondaryAlt text-lg font-bold rounded-full active:bg-secondary/40 active:ring-secondary/70
        active:text-red-600 transition duration-300 ease-in-out appearance-none mb-4" @click="showBackendCodePopoverRef = true">
        Enter code
      </MobileButton>

      <router-link custom to="/demos" v-slot="{ href, route, navigate }">
        <MobileButton class="rounded-full px-8 py-2.5 text-center inline-flex items-center justify-center text-lg text-uiTextAlt2 bg-transparent active:bg-surfaceAlt3 ring-2 ring-neutral/25"
          @click="navigate">
          View public demos
        </MobileButton>
      </router-link>
    </div>
  </div>
  <BackendCodePopover v-model:show="showBackendCodePopoverRef" @confirm="handleConfirm" />
</template>

<script setup>
import { ref } from 'vue';
import MobileButton from '../components/MobileButton.vue';
import { PhLockLaminated, PhUser } from '@phosphor-icons/vue';
import { useRoute, useRouter } from "vue-router";
import BackendCodePopover from "../components/BackendCodePopover.vue";

const router = useRouter();
const route = useRoute();

const showBackendCodePopoverRef = ref(true);

const handleConfirm = () => {
  const redirectPath = route.query.redirect;
  router.push({ path: redirectPath });
}
</script>