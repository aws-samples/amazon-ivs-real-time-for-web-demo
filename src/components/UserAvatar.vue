<template>
  <Avatar variant="beam" :name="props.name?.replace(/\s+/g, '-') || usernameStore.username || 'User'" :title="true" :colors="colors" class="shrink-0" />
</template>

<script setup>
import Avatar from "vue-boring-avatars";
import { useUsernameStore } from '../stores/usernameStore';

const props = defineProps(['name'])

const colors = ['#4200DB', '#7598FF', '#1B232D', '#008559', '#00A4BD', '#FFD000'];

const usernameStore = useUsernameStore();
</script>