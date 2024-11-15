<template>
  <div class="p-2">
    <div v-if="stageStore.stageConnection === StageConnectionState.CONNECTED" class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">
      <!-- Participants -->
      <div class="relative w-full grow flex gap-4 overflow-hidden rounded-xl">
        <SingleVideo v-if="stageMode === 'NONE'" :video-stream="computedMainVideo" :audio-stream="computedMainAudio" />
        <GuestSpot v-else-if="stageMode === 'GUEST_SPOT'" :video-stream="computedMainVideo" :audio-stream="computedMainAudio" :guest-video-stream="computedGuestVideo"
          :guest-audio-stream="computedGuestAudio" />
        <PkMode v-else-if="stageMode === 'PK'" v-model:red-votes="redVotes" v-model:timer="timer" v-model:timer-interval="timerInterval" :video-stream="computedMainVideo"
          :audio-stream="computedMainAudio" :guest-video-stream="computedGuestVideo" :guest-audio-stream="computedGuestAudio" :last-vote="lastVote" />

        <!-- Chat overlay -->
        <div class="absolute bottom-0 left-2 right-2 h-[50%] gradient-mask-t-80 flex items-end justify-normal">
          <ChatMessages v-if="stageStore.stageJoined" ref="messages" class="pb-4" :demo-mode="false" :host-id="props.hostId" @created="handleRoomCreate" />
        </div>
      </div>

      <!-- Footer -->
      <DemoFooter :username="usernameStore.username" :replace-input="true">
        <div class='inline-flex gap-x-1 w-full h-full'>
          <template v-if="stageMode === 'PK'">
            <ChatInput v-if="showChatRef" ref="chatInputRef" @blur="showChatRef = false" />
            <template v-else-if="showVotesRef">
              <MobileButton
                class="@container grow shrink overflow-hidden inline-flex gap-x-2 items-center justify-center w-full py-3 rounded-r-lg rounded-l-3xl appearance-none text-rose-500 font-bold"
                @click="() => handleVote('left')">
                <div class="flex gap-x-1" ref="leftStarRef" :class="[{ 'flex': lastVote === 'left' }]">
                  <PhShootingStar :size="24" weight="fill" />
                  <span class="hidden @[5rem]:inline">Vote</span>
                </div>
              </MobileButton>

              <MobileButton
                class="grow-0 shrink-0 overflow-hidden inline-flex gap-x-2 items-center justify-center w-auto py-3 px-4 rounded-lg appearance-none text-destruct bg-destruct/10 active:bg-destruct/20 active:text-destructAlt font-bold"
                @click="showVotesRef = false">
                <PhX :size="24" weight="fill" />
              </MobileButton>

              <MobileButton
                class="grow shrink overflow-hidden inline-flex gap-x-2 items-center justify-center w-full py-3 rounded-r-3xl rounded-l-lg appearance-none text-indigo-500 font-bold @container"
                @click="() => handleVote('right')">
                <div class="flex gap-x-1" ref="rightStarRef" :class="[{ 'flex': lastVote === 'right' }]">
                  <span class="hidden @[5rem]:inline">Vote</span>
                  <PhShootingStar :size="24" weight="fill" class="transform -scale-x-100" />
                </div>
              </MobileButton>
            </template>
            <template v-else>
              <ShowChatButton @click="handleShowChatInput">
                <PhChatCircle :size="24" weight="fill" />
              </ShowChatButton>
              <MobileButton @click="showVotesRef = true" class="w-full h-full px-4 py-2 rounded-full bg-positive/10 active:bg-positiveAlt/20 transition text-positive active:text-positiveAlt">
                <span class="font-bold">Vote</span>
              </MobileButton>

              <LeaveButton v-if="stageStore.onStage" @click="handleLeave">
                <PhHandWaving :size="24" weight="fill" />
              </LeaveButton>
            </template>
          </template>
          <template v-else>
            <ChatInput v-if="showChatRef" ref="chatInputRef" @blur="showChatRef = false" />
            <template v-else>
              <ShowChatButton @click="handleShowChatInput" />
              <template v-if="stageStore.onStage">
                <LeaveButton @click="handleLeave">
                  <span v-if="props.isHost" class="font-bold">End</span>
                  <span v-else class="font-bold">Leave</span>
                  <PhHandWaving :size="24" weight="fill" />
                </LeaveButton>
              </template>
              <template v-else>
                <MobileButton class="w-full h-full px-4 py-2 rounded-full bg-positive/10 active:bg-positiveAlt/20 transition text-positive active:text-positiveAlt" @click="showModeSelectRef = true">
                  <span class="font-bold">Join</span>
                </MobileButton>
              </template>
            </template>
          </template>
        </div>
      </DemoFooter>
    </div>

    <div v-else-if="stageStore.stageConnection === StageConnectionState.CONNECTING" class="min-h-0 w-full h-full grow shrink touch-none transform">
      <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">
        <div class="relative w-full grow flex items-center justify-center gap-4 overflow-hidden rounded-xl bg-surfaceAlt">
          <div class="flex flex-col items-center justify-center">
            <div class="flex flex-col items-center justify-center pb-4 mb-4 border-b border-surfaceAlt2/10">
              <LoadingSpinner class="relative size-6" />
              <h3 class="text-xl text-uiText font-bold">Loading stage</h3>
              <p class="text text-uiTextAlt2">Loading stage</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="stageStore.stageConnection === StageConnectionState.DISCONNECTED" class="min-h-0 w-full h-full grow shrink touch-none transform">
      <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">
        <div class="relative w-full grow flex items-center justify-center gap-4 overflow-hidden rounded-xl bg-surfaceAlt">
          <div class="flex flex-col items-center justify-center">
            <div class="flex flex-col items-center justify-center pb-4 mb-4 border-b border-surfaceAlt2/10">
              <PhEmpty weight="light" :size="64" class="transform text-uiTextAlt2 mb-2" />
              <h3 class="text-xl text-uiText font-bold">Disconnected</h3>
              <p class="text text-uiTextAlt2">You have been disconnected from the stage.</p>
            </div>
            <MobileButton @click="() => router.go()" class="text-lg bg-secondary active:bg-secondaryAlt font-bold rounded-full text-white px-6 py-2">Retry</MobileButton>
          </div>
        </div>
      </div>
    </div>
    <SelectModePopover v-model="showModeSelectRef" @join="handleJoin" />
    <WinnerDialog v-model:show="showWinnerRef" :winner="winnerRef" :currentUserId="stageStore.localParticipant?.userId" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { useUsernameStore } from '../stores/usernameStore'
import { usePopoverStore } from '../stores/popover';
import { useStageStore } from '../stores/stage';
import { useBackendStore } from '../stores/backend';
import { useChatStore } from '../stores/chat';
import { isLocalParticipant } from '../utils/stage';
import { spawnConfetti } from '../utils/confetti';
import { restartCssAnimation } from '../utils/animation';
import { StageConnectionState, StageEvents, StreamType } from 'amazon-ivs-web-broadcast';
import DemoFooter from '../components/DemoFooter.vue';
import LeaveButton from '../components/LeaveButton.vue';
import ChatMessages from '../components/ChatMessages.vue';
import SelectModePopover from '../components/SelectModePopover.vue';
import SingleVideo from './SingleVideo.vue';
import GuestSpot from './GuestSpot.vue';
import PkMode from './PkMode.vue';
import MobileButton from '../components/MobileButton.vue';
import ShowChatButton from '../components/ShowChatButton.vue';
import ChatInput from '../components/ChatInput.vue';
import WinnerDialog from '../components/WinnerDialog.vue';
import { PhChatCircle, PhEmpty, PhHandWaving, PhShootingStar, PhX } from '@phosphor-icons/vue';
import { useThrottleFn } from '@vueuse/core'
import { useRouter } from 'vue-router';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const props = defineProps(['hostId', 'isHost']);
const emit = defineEmits(['leave']);

const router = useRouter();
const usernameStore = useUsernameStore();
const stageStore = useStageStore();
const backendStore = useBackendStore();
const chatStore = useChatStore();

const showModeSelectRef = ref(false);
const stageMode = ref(backendStore.currentStageMode || 'NONE');

const chatInputRef = ref();
const showChatRef = ref(false);

const localVideoStream = ref(null);
const localAudioStream = ref(null);

const mainPublisher = ref(null);
const mainPublisherVideoStream = ref(null);
const mainPublisherAudioStream = ref(null);

const guestPublisher = ref(null);
const guestPublisherVideoStream = ref(null);
const guestPublisherAudioStream = ref(null);

const lastVote = ref(null);
const redVotes = ref(0);
const leftStarRef = ref();
const rightStarRef = ref();
const showVotesRef = ref(false);
const timerInterval = ref();
const timer = ref(30); // 30 seconds
const showWinnerRef = ref(false);
const winnerRef = ref();
const resultsRef = ref();

const computedMainVideo = computed(() => {
  if (stageStore.onStage && props.isHost) return localVideoStream.value;
  return mainPublisherVideoStream.value;
})

const computedMainAudio = computed(() => {
  if (stageStore.onStage && props.isHost) return undefined;
  return mainPublisherAudioStream.value;
})

const computedGuestVideo = computed(() => {
  if (stageStore.onStage && !props.isHost) return localVideoStream.value;
  return guestPublisherVideoStream.value;
});

const computedGuestAudio = computed(() => {
  if (stageStore.onStage && !props.isHost) return undefined;
  return guestPublisherAudioStream.value;
})

const throttledCastVote = useThrottleFn((voteId, hostId) => {
  backendStore.castVote(voteId, hostId);
}, 500)

const handleVote = (position) => {
  lastVote.value = position;
  spawnConfetti(position);
  if (position === 'left') {
    // Vote for host
    throttledCastVote(props.hostId, props.hostId);
    restartCssAnimation(leftStarRef.value);
  } else if (position === 'right') {
    // Vote for guest
    throttledCastVote(guestPublisher.value.userId, props.hostId);
    restartCssAnimation(rightStarRef.value);
  }
}

const beginPublish = (audioMedia, videoMedia) => {
  // Publish to the stage
  const audioStream = stageStore.createLocalStream(audioMedia.getAudioTracks()[0]);
  const videoStream = stageStore.createLocalStream(videoMedia.getVideoTracks()[0]);
  stageStore.stageStrategy.updateMedia(audioStream, videoStream);
  stageStore.stageStrategy.updatePublish(true);
  stageStore.refreshStageStrategy();
}

const endPublish = () => {
  stageStore.stageStrategy.updateMedia(undefined, undefined);
  stageStore.stageStrategy.updatePublish(false);
  stageStore.refreshStageStrategy();
}

const initMic = async () => {
  // Get user mic
  const audioMedia = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Cache mic for later use
  localAudioStream.value = audioMedia;
  return audioMedia
}

const initCam = async () => {
  const videoMedia = await navigator.mediaDevices.getUserMedia({ video: true, facingMode: 'user' });

  // Cache video for later use
  localVideoStream.value = videoMedia;
  return videoMedia;
}

const releaseMic = () => {
  if (!localAudioStream.value) return;
  const tracks = localAudioStream.value.getAudioTracks();
  tracks.forEach((track) => {
    track.stop();
  });
}

const releaseCam = () => {
  if (!localVideoStream.value) return;
  const tracks = localVideoStream.value.getVideoTracks();
  tracks.forEach((track) => {
    track.stop();
  });
}

const handleJoin = async (mode) => {
  // Set the stage mode
  await backendStore.updateMode(mode, props.hostId);

  // Begin publishing
  const audioMedia = await initMic();
  const videoMedia = await initCam();
  beginPublish(audioMedia, videoMedia);
}

const handleLeave = async () => {
  if (props.isHost) {
    emit('leave');
  } else if (stageStore.onStage) {
    // Stop publishing
    endPublish();

    // Reset the stage mode
    await backendStore.updateMode('NONE', props.hostId);

    // Release devices
    await releaseMic();
    await releaseCam();

    // Mark as off stage
    stageStore.onStage = false;
  }
}

const isMainPublisher = (participant) => {
  return participant.userId === props.hostId;
}

const isGuestPublisher = (participant) => {
  return participant.userId !== props.hostId;
}

const handleShowChatInput = async () => {
  showChatRef.value = true;
  await nextTick();
  try {
    if (!chatInputRef?.value) return;
    chatInputRef.value?.inputElemRef.focus();
  } catch (err) {
    console.error(err);
  }
}

const handleVoteUpdate = (votes) => {
  let hostVotes = 0;
  let guestVotes = 0;
  let hostId;
  let guestId;
  for (var userId in votes) {
    if (!votes.hasOwnProperty(userId)) continue;

    if (userId === props.hostId) {
      hostVotes = Number(votes[userId]) * 0.5;
      hostId = userId;
    } else {
      guestVotes = Number(votes[userId]) * 0.5;
      guestId = userId;
    }
  }

  const total = hostVotes - guestVotes;
  redVotes.value = total;

  let results = {};
  if (total >= 0) {
    results.winnerId = hostId
    results.loserId = guestId
  } else {
    results.winnerId = guestId
    results.loserId = hostId
  }

  return results;
}

const handleVoteEnd = (votes) => {
  showWinnerRef.value = false;
  winnerRef.value = undefined;
  resultsRef.value = votes;

  const results = handleVoteUpdate(votes);
  winnerRef.value = stageStore.getParticipantByUserId(results.winnerId);
  showWinnerRef.value = true;
}

const handleVoteStart = () => {
  timer.value = 30;
}

const handleRoomCreate = () => {
  chatStore.room.addListener('event', (event) => {
    if (event.eventName !== 'stage:MODE') return;

    // Set the stage mode
    const { mode } = event.attributes;
    stageMode.value = mode;
  });

  chatStore.room.addListener('event', (event) => {
    if (event.eventName !== 'stage:VOTE') return;

    // Set the stage vote
    const votes = event.attributes;
    let hostVotes = 0;
    let guestVotes = 0;
    for (var userId in votes) {
      if (!votes.hasOwnProperty(userId)) continue;

      if (userId === props.hostId) {
        hostVotes = Number(votes[userId]) * 0.5;
      } else {
        guestVotes = Number(votes[userId]) * 0.5;
      }
    }

    redVotes.value = hostVotes - guestVotes;
  });

  chatStore.room.addListener('event', (event) => {
    switch (event.eventName) {
      case 'stage:VOTE':
        // Set the stage vote
        handleVoteUpdate(event.attributes)
        break;
      case 'stage:VOTE_END':
        // Set the vote end
        handleVoteEnd(event.attributes);
        break;
      case 'stage:VOTE_START':
        // Set the vote end
        handleVoteStart();
        break;

      default:
        break;
    }
  });
}

watch(redVotes, (oldVal, newVal) => {
  // Red lost votes
  if (oldVal < newVal) {
    lastVote.value = 'right';
    spawnConfetti('right');
  } else {
    lastVote.value = 'left';
    spawnConfetti('left');
  }
})

onMounted(async () => {
  if (!stageStore.stage) {
    const token = await backendStore.joinStream(props.hostId);
    await stageStore.connectToStage(token);
  }

  // If the user is the host, start publishing
  if (props.isHost) {
    const audioMedia = await navigator.mediaDevices.getUserMedia({ audio: true });
    const videoMedia = await navigator.mediaDevices.getUserMedia({ video: true, facingMode: 'user' });
    localVideoStream.value = videoMedia;

    const audioStream = stageStore.createLocalStream(audioMedia.getAudioTracks()[0]);
    const videoStream = stageStore.createLocalStream(videoMedia.getVideoTracks()[0]);

    stageStore.stageStrategy.updateMedia(audioStream, videoStream);
    stageStore.stageStrategy.updatePublish(true);
    stageStore.refreshStageStrategy();

    stageStore.onStage = true;
  }

  stageMode.value = backendStore.currentStageMode;

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, (participant) => {
    if (isLocalParticipant(participant)) stageStore.onStage = false;

    if (isMainPublisher(participant)) {
      mainPublisher.value = null;
      mainPublisherAudioStream.value = null;
      mainPublisherVideoStream.value = null;
    } else if (isGuestPublisher(participant)) {
      guestPublisher.value = null;
      guestPublisherAudioStream.value = null;
      guestPublisherVideoStream.value = null;
    }
  });

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (participant, streams) => {
    if (isLocalParticipant(participant)) stageStore.onStage = true;

    if (isMainPublisher(participant)) {
      mainPublisher.value = participant;
      streams.forEach(stream => {
        if (stream.streamType === StreamType.AUDIO) {
          mainPublisherAudioStream.value = new MediaStream([stream.mediaStreamTrack]);;
        } else if (stream.streamType === StreamType.VIDEO) {
          mainPublisherVideoStream.value = new MediaStream([stream.mediaStreamTrack]);;
        }
      });
    } else if (isGuestPublisher(participant)) {
      guestPublisher.value = participant;
      streams.forEach(stream => {
        if (stream.streamType === StreamType.AUDIO) {
          guestPublisherAudioStream.value = new MediaStream([stream.mediaStreamTrack]);;
        } else if (stream.streamType === StreamType.VIDEO) {
          guestPublisherVideoStream.value = new MediaStream([stream.mediaStreamTrack]);;
        }
      });
    }
  });
});

onUnmounted(async () => {
  await handleLeave();
  stageStore.leaveStage();
})
</script>

<style scoped>
.video-container {
  container: video-player / size;
}

.host-video {
  object-fit: cover;
}

@container video-player (aspect-ratio > 0.7) {
  .host-video {
    object-fit: contain;
  }
}
</style>