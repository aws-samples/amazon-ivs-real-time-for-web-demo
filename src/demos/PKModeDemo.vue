<template>
  <div class="px-2">
    <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">
      <div class="relative flex flex-col gap-2 justify-start w-full h-4/6 min-h-0 grow shrink">
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
                <div class="absolute top-1 bottom-1 gradient-mask-l-50 transform" :class="[{ 'left-0 -scale-x-100': lastVote === 'right' }, { '-left-5 scale-x-100': lastVote !== 'right' }]">
                  <AnimatedComet class="relative top-0 left-0 w-[41px] h-[16px]" />
                  <CometEye class="absolute top-[2px] right-1 w-[9px] h-[11px]" :class="[{ 'text-indigo-400': lastVote === 'right' }, { 'text-rose-400': lastVote !== 'right' }]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Participants -->
        <div class="w-full min-h-0 h-full relative flex grow shrink justify-center mb-4">
          <div class="video-container w-1/2 h-full bg-surfaceAlt3 rounded-l-lg rounded-r-none overflow-hidden relative flex justify-center">
            <ParticipantVideo :video-stream="leftParticipant?.videoStream" class="w-full h-full pk-video" />
          </div>
          <div class="video-container w-1/2 h-full bg-surfaceAlt3 rounded-r-lg rounded-l-none overflow-hidden relative flex justify-center">
            <ParticipantVideo :video-stream="rightParticipant?.videoStream" :class="['w-full h-full pk-video', {
              'rounded-l-lg rounded-r-none': userPosition === 'right',
              'rounded-r-lg rounded-l-none': userPosition !== 'right'
            }]" :is-local="userPosition === 'right'" />
            <button v-if="userPosition !== 'right'" class="absolute inset-0 flex items-center justify-center" @click="handleJoinSelect">
              <span class="absolute bottom-6 rounded-xl inline-flex items-center justify-center bg-secondary text-white backdrop-blur-sm px-4 py-1.5">
                <span class="inline-flex gap-x-1 items-center drop-shadow-md">
                  Replace
                </span>
                <span class="absolute inset-0 ring-2 ring-white/30 rounded-xl mix-blend-screen"></span>
              </span>
            </button>
          </div>
          <!-- Timer -->
          <div class="absolute text-center mb-4 text-lg font-mono font-bold text-white bg-black/50 backdrop-blur px-4 rounded-b-lg">{{ formatTime(timer) }}</div>
        </div>
      </div>
      <div class="flex grow shrink min-h-0 h-2/6 overflow-hidden gradient-mask-t-80">
        <ChatMessages class="pb-4" />
      </div>
      <DemoFooter :username="usernameStore.username" :replace-input="true">
        <LeaveButton v-if="userPosition" @click="leaveSlot" />
        <div v-else class="w-full flex gap-x-1">
          <MobileButton class="grow shrink overflow-hidden inline-flex gap-x-2 items-center justify-center w-full py-3 rounded-r-lg rounded-l-3xl backdrop-blur appearance-none text-rose-500 font-bold"
            @click="() => handleVote('left')">
            <div class="flex gap-x-1" ref="leftStarRef" :class="[{ 'flex': lastVote === 'left' }]">
              <PhShootingStar :size="24" weight="fill" /> Vote
            </div>
          </MobileButton>
          <MobileButton
            class="grow shrink overflow-hidden inline-flex gap-x-2 items-center justify-center w-full py-3 rounded-r-3xl rounded-l-lg backdrop-blur appearance-none text-indigo-500 font-bold"
            @click="() => handleVote('right')">
            <div class="flex gap-x-1" ref="rightStarRef" :class="[{ 'flex': lastVote === 'right' }]">
              Vote
              <PhShootingStar :size="24" weight="fill" class="transform -scale-x-100" />
            </div>
          </MobileButton>
        </div>
      </DemoFooter>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUsernameStore } from '../stores/usernameStore';
import { usePopoverStore } from '../stores/popover';
import { useStageStore } from '../stores/stage';
import { StreamType, StageEvents } from 'amazon-ivs-web-broadcast';
import DemoFooter from '../components/DemoFooter.vue';
import ParticipantVideo from '../components/ParticipantVideo.vue';
import { fetchDemoToken } from '../utils/stage';
import AnimatedComet from '../components/AnimatedComet.vue';
import CometEye from '../components/CometEye.vue';
import ChatMessages from '../components/ChatMessages.vue';
import { PhShootingStar } from '@phosphor-icons/vue';
import LeaveButton from '../components/LeaveButton.vue';
import confetti from 'canvas-confetti';
import AWS_COLORS from '../constants/colors';
import { restartCssAnimation } from '../utils/animation';
import MobileButton from '../components/MobileButton.vue';

const usernameStore = useUsernameStore();
const popoverStore = usePopoverStore();
const stageStore = useStageStore();

const redProgress = ref(50);
const timer = ref(300); // 5 minutes in seconds

const lastVote = ref(null);
const leftStarRef = ref();
const rightStarRef = ref();

const userPosition = ref(null);
const leftParticipant = ref(null);
const rightParticipant = ref(null);

const localVideoStream = ref();
const leftRemoteParticipant = ref();
const rightRemoteParticipant = ref();

const progressInterval = ref();
const timerInterval = ref();

const handleJoinSelect = () => {
  popoverStore.getUserPermission(joinSlot);
}

const handleVote = (position) => {
  lastVote.value = position;
  spawnConfetti(position);
  if (position === 'left') {
    restartCssAnimation(leftStarRef.value);
    redProgress.value += 0.5;
  } else if (position === 'right') {
    restartCssAnimation(rightStarRef.value);
    redProgress.value -= 0.5;
  }
}

const spawnConfetti = (position) => {
  let x = 0;
  let colors = [AWS_COLORS.rose[500], AWS_COLORS.rose[600], AWS_COLORS.orange[500], AWS_COLORS.yellow[500]];
  let spread = 45;
  if (position === 'right') {
    x = 1;
    colors = [AWS_COLORS.indigo[500], AWS_COLORS.indigo[600], AWS_COLORS.violet[600], AWS_COLORS.blue[500]]
    spread = -45;
  }

  confetti({
    colors,
    particleCount: 20,
    startVelocity: 40,
    spread,
    angle: 90,
    ticks: 50,
    shapes: ['star', 'circle'],
    origin: {
      x,
      // since they fall down, start a bit higher than random
      y: Math.random() * (0.7 - 0.5) + 0.5
    }
  });
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getLocalVideoStream = async () => {
  return navigator.mediaDevices.getUserMedia({ video: true, facingMode: 'user' });
}

const releaseLocalVideo = () => {
  const tracks = localVideoStream.value.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  localVideoStream.value = null;
}

const joinSlot = async (slot = 'right') => {
  if (!localVideoStream.value) localVideoStream.value = await getLocalVideoStream();
  if (slot === 'left') {
    leftParticipant.value = stageStore.localParticipant;
    leftParticipant.value.videoStream = localVideoStream.value
    userPosition.value = 'left';
  } else {
    rightParticipant.value = stageStore.localParticipant;
    rightParticipant.value.videoStream = localVideoStream.value
    userPosition.value = 'right';
  }
}

const leaveSlot = () => {
  lastVote.value = null;
  if (userPosition.value === 'left') {
    leftParticipant.value = leftRemoteParticipant.value;
    leftParticipant.value.videoStream = leftRemoteParticipant.value.videoStream
  } else {
    rightParticipant.value = rightRemoteParticipant.value;
    rightParticipant.value.videoStream = rightRemoteParticipant.value.videoStream
  }

  releaseLocalVideo();
  userPosition.value = null;
}

const startSim = () => {
  // Start progress updates
  progressInterval.value = setInterval(() => {
    // Simulate vote changes
    redProgress.value += (Math.random() - 0.5) * 4;
    redProgress.value = Math.max(0, Math.min(100, redProgress.value));
  }, 1000);
}

const startCountdown = () => {
  // Start timer countdown
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

const isLeftPublisher = (participant) => {
  return participant.userId === 'rtmps-participant';
}

const isRightPublisher = (participant) => {
  return participant.userId === 'rtmps-participant-b';
}

onMounted(async () => {
  if (!stageStore.stage) {
    const token = await fetchDemoToken(usernameStore.username, false, 'pk');
    await stageStore.connectToStage(token);
  }

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (participant, streams) => {
    streams.forEach(stream => {
      if (stream.streamType !== StreamType.VIDEO) return;
      if (isLeftPublisher(participant)) {
        leftRemoteParticipant.value = participant;
        leftRemoteParticipant.value.videoStream = new MediaStream([stream.mediaStreamTrack]);

        leftParticipant.value = leftRemoteParticipant.value;
        leftParticipant.value.videoStream = leftRemoteParticipant.value.videoStream
      }

      if (isRightPublisher(participant)) {
        rightRemoteParticipant.value = participant;
        rightRemoteParticipant.value.videoStream = new MediaStream([stream.mediaStreamTrack]);

        rightParticipant.value = rightRemoteParticipant.value;
        rightParticipant.value.videoStream = rightRemoteParticipant.value.videoStream;
      }
    })
  });

  startSim();
  startCountdown();
});

onUnmounted(() => {
  clearInterval(progressInterval.value);
  clearInterval(timerInterval.value);
  if (localVideoStream.value) releaseLocalVideo();
  stageStore.leaveStage();
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