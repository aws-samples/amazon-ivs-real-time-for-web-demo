<template>
  <div class="relative flex flex-col gap-2 justify-start w-full h-1/2 min-h-0 grow shrink">
    <!-- PK Progress Bar -->
    <div class="h-4 bg-gray-200 rounded-full relative shrink-0">
      <div class="h-full flex relative rounded-full overflow-hidden">
        <div class="bar-left absolute inset-0 bg-gradient-to-r from-rose-700 via-rose-600 to-pink-500 transition-all duration-300 overflow-hidden"
          :style="{ transform: `scaleX(${redProgress / 100})`, transformOrigin: 'left' }">
          <div class="pk-pulse-animate-l w-full h-full">
            <div class="bg-gradient-to-r w-10 h-full from-transparent via-white/40 to-transparent mix-blend-overlay"></div>
          </div>
        </div>
        <div class="bar-right absolute inset-0 bg-gradient-to-l from-indigo-700 via-indigo-600 to-cyan-400 transition-all duration-300 overflow-hidden"
          :style="{ transform: `scaleX(${(100 - redProgress) / 100})`, transformOrigin: 'right' }">
          <div class="pk-pulse-animate-r w-full h-full">
            <div class="bg-gradient-to-r w-10 h-full from-transparent via-white/40 to-transparent mix-blend-overlay"></div>
          </div>
        </div>
      </div>
      <div class="absolute w-full h-full top-0">
        <div class="absolute left-0 right-0 h-full transition duration-300" :style="{ transform: `translateX(${redProgress}%)` }">
          <div class="absolute size-6 -top-1 -left-3 text-purple-600">
            <span class="pk-particle-tl absolute inset-0 opacity-75 rounded-full">
              <div class="size-2 rounded-full bg-current relative top-2 left-2"></div>
            </span>
            <span class="pk-particle-tr !animation-delay-[1000ms] absolute inset-0 opacity-75 rounded-full">
              <div class="size-2 rounded-full bg-current relative top-2 left-2"></div>
            </span>
            <span class="pk-particle-bl !animation-delay-[1500ms] absolute inset-0 opacity-75 rounded-full">
              <div class="size-2 rounded-full bg-current relative top-2 left-2"></div>
            </span>
            <span class="pk-particle-br !animation-delay-[2000ms] absolute inset-0 opacity-75 rounded-full">
              <div class="size-2 rounded-full bg-current relative top-2 left-2"></div>
            </span>
            <div class="absolute top-1 bottom-1 gradient-mask-l-50 transform" :class="[{ 'left-0 -scale-x-100': props.lastVote === 'right' }, { '-left-5 scale-x-100': props.lastVote !== 'right' }]">
              <AnimatedComet class="relative top-0 left-0 w-[41px] h-[16px]" />
              <CometEye class="absolute top-[2px] right-1 w-[9px] h-[11px]" :class="[{ 'text-indigo-400': props.lastVote === 'right' }, { 'text-rose-400': props.lastVote !== 'right' }]" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Participants -->
    <div class="w-full min-h-0 h-full relative flex grow shrink justify-center mb-4">
      <div class="video-container w-1/2 h-full bg-surfaceAlt3 rounded-l-lg rounded-r-none overflow-hidden relative flex justify-center">
        <ParticipantVideo :video-stream="props.videoStream" class="w-full h-full pk-video" />
        <ParticipantAudio :audio-stream="props.audioStream" />
      </div>
      <div class="video-container w-1/2 h-full bg-surfaceAlt3 rounded-r-lg rounded-l-none overflow-hidden relative flex justify-center">
        <ParticipantVideo :video-stream="props.guestVideoStream" class="w-full h-full pk-video" />
        <ParticipantAudio :audio-stream="props.guestAudioStream" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ParticipantVideo from '../components/ParticipantVideo.vue';
import ParticipantAudio from '../components/ParticipantAudio.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import AnimatedComet from '../components/AnimatedComet.vue';
import CometEye from '../components/CometEye.vue';

const props = defineProps(['videoStream', 'audioStream', 'guestVideoStream', 'guestAudioStream', 'lastVote']);
const redVotes = defineModel('redVotes');
const timer = defineModel('timer');
const timerInterval = defineModel('timerInterval');

const redProgress = computed(() => {
  return 50 + redVotes.value
});

const startCountdown = () => {
  // Start timer countdown
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

onMounted(() => {
  // startSim();
  startCountdown();
});

onUnmounted(() => {
  clearInterval(timerInterval.value);
});
</script>

<style lang="css" scoped>
.video-container {
  container: video-player / size;
}

.pk-video {
  object-fit: cover;
}

@container video-player (aspect-ratio > 0.9) {
  .pk-video {
    object-fit: contain;
  }
}

.pk-pulse-animate-l {
  will-change: transform;
  animation: slideRight 1200ms infinite;
}

.pk-pulse-animate-r {
  will-change: transform;
  animation: slideLeft 1200ms infinite;
}

.pk-particle-tl {
  animation: fadeUpLeft 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.pk-particle-tr {
  animation: fadeUpRight 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.pk-particle-bl {
  animation: fadeDownLeft 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.pk-particle-br {
  animation: fadeDownRight 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes slideLeft {
  from {
    transform: translateX(-100%);
    opacity: 1;
  }

  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes slideRight {
  from {
    transform: translateX(100%);
    opacity: 1;
  }

  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes fadeUpLeft {

  25%,
  100% {
    transform: translateX(-16px) translateY(-16px);
    opacity: 0;
  }
}

@keyframes fadeUpRight {

  25%,
  100% {
    transform: translateX(16px) translateY(-16px);
    opacity: 0;
  }
}

@keyframes fadeDownLeft {

  25%,
  100% {
    transform: translateX(-16px) translateY(16px);
    opacity: 0;
  }
}

@keyframes fadeDownRight {

  25%,
  100% {
    transform: translateX(16px) translateY(16px);
    opacity: 0;
  }
}

@keyframes disappear {

  25%,
  100% {
    transform: scale(0.5);
    opacity: 0;
  }
}
</style>