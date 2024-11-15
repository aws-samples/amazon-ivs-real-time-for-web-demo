<template>
  <div class="video-container flex size-full justify-center overflow-hidden">
    <ParticipantVideo :video-stream="props.videoStream" class="host-video w-full h-full bg-surfaceAlt3" />
    <ParticipantAudio :audio-stream="props.audioStream" />
  </div>
  <div class="absolute z-10 top-4 right-4 w-28 sm:w-36 aspect-[9/16] rounded-2xl overflow-hidden shadow-xl shadow-black/50 transform origin-top-right transition">
    <div class="w-full h-full bg-black rounded-2xl flex items-center justify-center">
      <ParticipantVideo :video-stream="props.guestVideoStream" class="w-full h-full object-cover rounded-2xl" />
      <ParticipantAudio :audio-stream="props.guestAudioStream" />
    </div>
  </div>
</template>

<script setup>
import ParticipantVideo from '../components/ParticipantVideo.vue';
import ParticipantAudio from '../components/ParticipantAudio.vue';

const props = defineProps(['videoStream', 'audioStream', 'guestVideoStream', 'guestAudioStream']);
</script>