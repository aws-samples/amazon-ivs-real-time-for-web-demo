<template>
  <audio ref="audioElem" autoplay :playsinline="true" />
</template>

<script setup>
import { ref, watchEffect } from 'vue'

const audioElem = ref();
const props = defineProps({
  audioStream: MediaStream
});

watchEffect(() => {
  if (!audioElem.value) return;
  if (!props.audioStream) return;
  audioElem.value.srcObject = props.audioStream;
});
</script>