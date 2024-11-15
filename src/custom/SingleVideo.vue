<template>
  <div class="video-container flex size-full justify-center overflow-hidden">
    <ParticipantVideo :video-stream="props.videoStream" class="host-video w-full h-full bg-surfaceAlt3" />
    <ParticipantAudio :audio-stream="props.audioStream" />
  </div>
</template>

<script setup>
import ParticipantVideo from '../components/ParticipantVideo.vue';
import ParticipantAudio from '../components/ParticipantAudio.vue';

const props = defineProps(['videoStream', 'audioStream']);
</script>