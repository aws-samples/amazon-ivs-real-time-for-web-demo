<template>
  <div>
    <InstallPwaHeader v-if="!pwaStore.isInstalled" />
    <UpdatePwaHeader v-else-if="needRefresh" />
  </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { usePwaStore } from '../stores/pwa';
import InstallPwaHeader from './InstallPwaHeader.vue';
import UpdatePwaHeader from './UpdatePwaHeader.vue';

const { needRefresh } = useRegisterSW();
const pwaStore = usePwaStore();
</script>