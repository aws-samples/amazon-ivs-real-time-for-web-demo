<template>
  <video v-if="props.videoStream" ref="videoElem" autoplay playsinline muted :class="['flex', { 'transform -scale-x-100': isLocal }]" />
  <div v-else class="bg-surfaceAlt3 w-full h-full flex grow-[1] shrink-[2] items-center justify-center text-uiText overflow-hidden">
    <VideoStatic />
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import VideoStatic from './VideoStatic.vue';

const videoElem = ref();
const props = defineProps({
  videoStream: MediaStream,
  isLocal: {
    type: Boolean,
    default: false,
  }
});

watchEffect(() => {
  if (!videoElem.value) return;
  if (!props.videoStream) return;
  videoElem.value.srcObject = props.videoStream;
  videoElem.value.play();
});
</script>