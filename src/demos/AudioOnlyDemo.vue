<template>
  <div class="p-2 grow shrink">
    <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">

      <!-- Audio grid -->
      <div class="flex flex-col gap-2 justify-start w-full h-full grow-[3] shrink-[2]">
        <div class="w-full h-full grid">
          <div class="w-full h-full grid grid-cols-2 grid-rows-2 gap-2">
            <div v-for="(slot, index) in slots" :key="index" :class="['w-full h-full rounded-xl flex grow items-center justify-center relative transition duration-200 has-[:active]:bg-secondary/40 will-change-transform transform scale-100 has-[:active]:scale-90', {
              'bg-secondary/10': !slot?.participant,
              'ring-0 ring-transparent bg-surfaceAlt': !slot?.isSpeaking,
              'ring-2 ring-secondary bg-secondary/10': slot?.isSpeaking
            }]">
              <template v-if="slot?.participant">
                <div class="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                  <div class="absolute w-16 h-16 bg-white rounded-full transition-transform duration-[45ms] linear" :style="{ transform: `scale(${1 + slot.audioLevel * 2})` }">
                  </div>
                  <div class="absolute w-16 h-16 bg-secondary/5 rounded-full transition-transform duration-[45ms] linear" :style="{ transform: `scale(${1 + slot.audioLevel * 4})` }">
                  </div>
                  <div class="absolute w-16 h-16 rounded-full">
                    <UserAvatar :size="64" :name="slot.participant.attributes.username || slot.participant.userId" />
                  </div>
                </div>
                <div class="absolute bottom-2 inset-x-2 text-center text-sm font-semibold">
                  <span class="inline-block max-w-full px-2 py-1 rounded-full bg-black/50 text-white truncate">{{ slot.participant.attributes.username ||
                    slot.participant.userId
                    }}</span>
                </div>
                <ParticipantAudio :audioStream="slot.audioStream" />
              </template>
              <button v-else @click="handleGridSelect(index)" class="size-full flex items-center justify-center text-white text-3xl" :disabled="slotsLoading">
                <div class="size-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center">
                  <PhPlus v-if="stageStore.stageJoined" weight="bold" :size="24" />
                  <div v-else class="size-6">
                    <LoadingSpinner />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex h-full grow-[2] shrink-[3] overflow-hidden gradient-mask-t-80">
        <ChatMessages v-if="stageStore.stageJoined" />
      </div>
      <DemoFooter :username="usernameStore.username" :replace-input="onStage">
        <LeaveButton @click="leaveSlot" />
      </DemoFooter>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useUsernameStore } from '../stores/usernameStore';
import { usePopoverStore } from '../stores/popover';
import { useStageStore } from '../stores/stage';
import { StageEvents, StreamType } from 'amazon-ivs-web-broadcast';
import { fetchDemoToken } from '../utils/stage';
import { createAudioContext, destroyAudioContext, getNormalizedGain } from '../utils/audio';
import ParticipantAudio from '../components/ParticipantAudio.vue';
import UserAvatar from "../components/UserAvatar.vue";
import DemoFooter from '../components/DemoFooter.vue';
import { PhPlus } from '@phosphor-icons/vue';
import ChatMessages from '../components/ChatMessages.vue';
import LeaveButton from '../components/LeaveButton.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const usernameStore = useUsernameStore();
const popoverStore = usePopoverStore();
const stageStore = useStageStore();

const onStage = ref(false);
const slots = ref([null, null, null, null]);
const localParticipantSlotIndex = ref(-1);
const slotsLoading = ref(false);
const localAudioStream = ref();

const createLocalParticipant = (username) => {
  return {
    audioStream: null,
    isLocal: true,
    id: username,
    userId: username,
    attributes: {
      username: username
    },
  };
}

const handleGridSelect = async (index) => {
  if (onStage.value) {
    changePosition(localParticipantSlotIndex.value, index);
  }
  else {
    popoverStore.getUserPermission(() => joinStage(index));
  }
}

const changePosition = async (currIndex, nextIndex) => {
  slotsLoading.value = true;
  const nextTemp = slots.value[nextIndex];

  await destroyAudioContext(slots.value[currIndex].audioCtx);
  slots.value[currIndex].audioCtx = null;

  slots.value[nextIndex] = slots.value[currIndex];
  slots.value[currIndex] = nextTemp;
  localParticipantSlotIndex.value = nextIndex;

  // Audio levels based on mic
  const ctx = createAudioContext();
  slots.value[nextIndex].audioCtx = ctx;
  slots.value[nextIndex].audioLevel = 0;

  const source = ctx.createMediaStreamSource(localAudioStream.value);
  const analyser = ctx.createAnalyser();
  source.connect(analyser);

  updateAudioLevel(nextIndex, analyser);
  slotsLoading.value = false;
}

const joinStage = async (slotIndex) => {
  if (!slotIndex) {
    slotsLoading.value = false;
    throw new Error('Error: No slot index provided');
  }

  localAudioStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });

  slotsLoading.value = true;
  await stageStore.connectToStage();
  slotsLoading.value = false;
  onStage.value = true;

  localParticipantSlotIndex.value = slotIndex;
  slots.value[slotIndex] = {};
  slots.value[slotIndex].participant = createLocalParticipant(usernameStore.username);

  // Audio levels based on mic
  const ctx = createAudioContext();
  slots.value[slotIndex].audioCtx = ctx;
  slots.value[slotIndex].audioLevel = 0;

  const source = ctx.createMediaStreamSource(localAudioStream.value);
  const analyser = ctx.createAnalyser();
  source.connect(analyser);

  updateAudioLevel(slotIndex, analyser);
  slotsLoading.value = false;
}

const leaveSlot = async () => {
  if (onStage.value) {
    onStage.value = false;
    const index = localParticipantSlotIndex.value;
    if (slots.value[index].audioCtx) {
      await destroyAudioContext(slots.value[index].audioCtx);
      slots.value[index].audioCtx = null;
    }
    slots.value[index] = null;
    localParticipantSlotIndex.value = -1;
    releaseMic();
  }
};

const updateAudioLevel = (index = 0, analyser, recursive = true) => {
  const gain = getNormalizedGain(analyser);
  const audioLevelExists = slots.value[index]?.audioLevel !== undefined;

  if (!audioLevelExists) return;

  slots.value[index].audioLevel = gain;
  slots.value[index].isSpeaking = gain > 0.005;

  if (recursive) requestAnimationFrame(() => updateAudioLevel(index, analyser, recursive));
};

const getFirstFreeSlot = () => {
  return slots.value.findIndex(elem => elem === null);
}

const releaseMic = () => {
  if (!localAudioStream.value) return;
  const tracks = localAudioStream.value.getAudioTracks();
  tracks.forEach((track) => {
    track.stop();
  });
}

onMounted(async () => {
  if (!stageStore.stage) {
    const token = await fetchDemoToken(usernameStore.username, 'AUDIO');
    await stageStore.connectToStage(token);
  }

  if (!stageStore.stage) return;

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, (participant) => {
    let index = slots.value.findIndex(p => p && p?.participant && p?.participant.id === participant.id);
    if (index !== -1) {
      if (slots.value[index].audioCtx.state !== 'closed') {
        destroyAudioContext(slots.value[index].audioCtx).then(() => {
          slots.value[index].audioCtx = null;
          slots.value[index] = null;
        });
      } else {
        slots.value[index] = null;
      }
    }
  });

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (participant, streams) => {
    if (participant.userId !== 'dealer-0') return;
    streams.forEach(stream => {
      if (stream.streamType === StreamType.AUDIO) {
        let index = slots.value.findIndex(p => p && p?.participant && p?.participant.id === participant.id);
        if (index !== -1) return;

        index = getFirstFreeSlot();
        slots.value[index] = {};
        slots.value[index].participant = participant;

        const audioStream = new MediaStream([stream.mediaStreamTrack]);
        slots.value[index].audioStream = audioStream;

        const ctx = createAudioContext();
        slots.value[index].audioCtx = ctx;
        slots.value[index].audioLevel = 0;

        const source = ctx.createMediaStreamSource(audioStream);
        const analyser = ctx.createAnalyser();

        source.connect(analyser);
        // analyser.connect(ctx.destination);

        updateAudioLevel(index, analyser);
      }
    });
  });
});

onUnmounted(() => {
  releaseMic();
  stageStore.leaveStage();
});
</script>