<template>
  <div class="p-2">
    <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">
      <div class="relative w-full grow flex gap-4 overflow-hidden rounded-xl">
        <div v-if="mainPublisher" :key="mainPublisher.id" class="video-container flex size-full justify-center overflow-hidden">
          <ParticipantVideo :video-stream="mainPublisherVideoStream" class="host-video w-full h-full bg-surfaceAlt3" />
          <ParticipantAudio :audio-stream="mainPublisherAudioStream" />
        </div>
        <div v-else class="bg-surfaceAlt3 w-full h-full flex items-center justify-center text-uiText overflow-hidden">
          <VideoStatic />
        </div>
        <div class="absolute bottom-0 left-2 right-2 h-[50%] gradient-mask-t-80 flex items-end justify-normal">
          <ChatMessages ref="messages" class="pb-4" />
        </div>
      </div>
      <div :class="['absolute top-4 right-4 w-28 sm:w-36 aspect-[9/16] rounded-2xl overflow-hidden shadow-xl shadow-black/50 transform origin-top-right transition', {
        'scale-75': !guestPublisherVideoStream,
        'scale-100': guestPublisherVideoStream,
      }]">
        <div class="w-full h-full bg-black rounded-2xl flex items-center justify-center">
          <ParticipantVideo v-if="inGuestSpot" :video-stream="localPublisherVideoStream" :is-local="true" class="w-full h-full object-cover rounded-2xl" />
          <ParticipantVideo v-else-if="guestPublisherVideoStream" :video-stream="guestPublisherVideoStream" class="w-full h-full object-cover rounded-2xl" />
          <button v-if="!inGuestSpot" @click="handleSpotSelect" class="absolute flex flex-col gap-1 w-full h-full text-white items-center justify-center">
            <span class="absolute bottom-2 inset-x-2 rounded-xl inline-flex items-center justify-center bg-secondary text-white backdrop-blur-sm px-2 py-1.5">
              <span class="inline-flex gap-x-1 items-center drop-shadow-md">
                Replace
              </span>
              <span class="absolute inset-0 ring-2 ring-white/30 rounded-xl mix-blend-screen"></span>
            </span>
          </button>
        </div>
      </div>
      <DemoFooter :username="usernameStore.username" :replace-input="inGuestSpot">
        <LeaveButton @click="leaveGuestSlot" />
      </DemoFooter>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUsernameStore } from '../stores/usernameStore'
import { usePopoverStore } from '../stores/popover';
import { useStageStore } from '../stores/stage';
import { fetchDemoToken } from '../utils/stage';
import ParticipantVideo from '../components/ParticipantVideo.vue';
import { StageEvents, StreamType } from 'amazon-ivs-web-broadcast';
import ParticipantAudio from '../components/ParticipantAudio.vue';
import DemoFooter from '../components/DemoFooter.vue';
import LeaveButton from '../components/LeaveButton.vue';
import ChatMessages from '../components/ChatMessages.vue';
import VideoStatic from '../components/VideoStatic.vue';

const usernameStore = useUsernameStore();
const popoverStore = usePopoverStore();
const stageStore = useStageStore();

const inGuestSpot = ref(false);
const localPublisherVideoStream = ref(null);
const localPublisherAudioStream = ref(null);

const mainPublisher = ref(null);
const mainPublisherVideoStream = ref(null);
const mainPublisherAudioStream = ref(null);

const guestPublisher = ref(null);
const guestPublisherVideoStream = ref(null);
const guestPublisherAudioStream = ref(null);

const isMainPublisher = (participant) => {
  return participant.userId === 'dealer-0';
}

const isGuestPublisher = (participant) => {
  return participant.userId === 'dealer-1';
}

const releaseLocalVideo = () => {
  const tracks = localPublisherVideoStream.value.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  localPublisherVideoStream.value = null;
}

const handleSpotSelect = () => {
  popoverStore.getUserPermission(joinGuestSlot);
}

const joinGuestSlot = async () => {
  const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, facingMode: 'user' });
  localPublisherVideoStream.value = videoStream;
  localPublisherAudioStream.value = null;
  inGuestSpot.value = true;
}

const leaveGuestSlot = () => {
  if (!localPublisherVideoStream.value) return;
  releaseLocalVideo();
  localPublisherAudioStream.value = null;
  inGuestSpot.value = false;
}

onMounted(async () => {
  if (!stageStore.stage) {
    const token = await fetchDemoToken(usernameStore.username, 'GUEST');
    await stageStore.connectToStage(token);
  }

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, (participant) => {
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

onUnmounted(() => {
  leaveGuestSlot();
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