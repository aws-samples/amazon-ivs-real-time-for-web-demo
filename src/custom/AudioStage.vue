<template>
  <div class="p-2 grow shrink" @mousedown="startAudioContexts" @touchstart="startAudioContexts">
    <div v-if="stageStore.stageConnection === StageConnectionState.CONNECTED" class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2 justify-center">

      <!-- Audio grid -->
      <div class="flex flex-col gap-2 justify-start w-full h-full grow-[3] shrink-[2]">
        <div class="w-full h-full grid">
          <div class="w-full h-full grid grid-cols-2 grid-rows-2 gap-2">
            <div v-for="(pId, index) in slots" :key="`${index}-${pId}`" :class="['w-full h-full rounded-xl flex grow items-center justify-center relative transition duration-200 has-[:active]:bg-secondary/40 will-change-transform transform scale-100 has-[:active]:scale-90', {
              'bg-secondary/10': !pId,
              'ring-0 ring-transparent bg-surfaceAlt': !isSpeakingRef[index],
              'ring-2 ring-secondary bg-secondary/10': isSpeakingRef[index]
            }]">
              <template v-if="!!pId">
                <div class="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                  <div class="absolute w-16 h-16 bg-white rounded-full transition-transform duration-[45ms] linear" :style="{ transform: `scale(${1 + audioVolumeRef[index] * 2})` }">
                  </div>
                  <div class="absolute w-16 h-16 bg-secondary/5 rounded-full transition-transform duration-[45ms] linear" :style="{ transform: `scale(${1 + audioVolumeRef[index] * 4})` }">
                  </div>
                  <div class="absolute w-16 h-16 rounded-full">
                    <UserAvatar :size="64" :name="getParticipantUsername(pId)" />
                  </div>
                </div>
                <div class="absolute bottom-2 inset-x-2 text-center text-sm font-semibold">
                  <span class="inline-block max-w-full px-2 py-1 rounded-full bg-black/50 text-white truncate">{{ pId === stageStore.localParticipant.id ? `You (${getParticipantUsername(pId)})` :
                    getParticipantUsername(pId)
                    }}</span>
                </div>
                <ParticipantAudio v-if="!props.isHost" :audioStream="getParticipantAudioStream(pId)" />
              </template>
              <button v-else @click="handleGridSelect(index)" class="size-full flex items-center justify-center text-white text-3xl disabled:opacity-40 disabled:pointer-events-none"
                :disabled="slotsLoading">
                <div class="size-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center">
                  <PhPlus v-if="!slotsLoading" weight="bold" :size="24" />
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
        <ChatMessages v-if="stageStore.stageJoined" :demo-mode="false" :host-id="props.hostId" @created="handleRoomCreate" />
      </div>
      <DemoFooter :username="usernameStore.username" :replace-input="true">
        <div class='inline-flex gap-x-1 w-full h-full'>
          <template v-if="stageStore.onStage">
            <ChatInput v-if="showChatRef" ref="chatInputRef" @blur="showChatRef = false" />
            <ShowChatButton v-if="!showChatRef" @click="handleShowChatInput" />
            <LeaveButton v-if="!showChatRef" @click="handleLeave">
              <span v-if="props.isHost" class="font-bold">End</span>
              <span v-else class="font-bold">Leave</span>
              <PhHandWaving :size="24" weight="fill" />
            </LeaveButton>
          </template>
          <ChatInput v-else />
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useUsernameStore } from '../stores/usernameStore';
import { useStageStore } from '../stores/stage';
import { useBackendStore } from '../stores/backend';
import { useChatStore } from '../stores/chat';
import { StageEvents, StreamType, StageParticipantPublishState, StageConnectionState } from 'amazon-ivs-web-broadcast';
import { isLocalParticipant } from '../utils/stage';
import { createAudioContext, destroyAudioContext, getNormalizedGain } from '../utils/audio';
import ParticipantAudio from '../components/ParticipantAudio.vue';
import UserAvatar from "../components/UserAvatar.vue";
import DemoFooter from '../components/DemoFooter.vue';
import { PhEmpty, PhHandWaving, PhPlus } from '@phosphor-icons/vue';
import ChatMessages from '../components/ChatMessages.vue';
import LeaveButton from '../components/LeaveButton.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ChatInput from '../components/ChatInput.vue';
import ShowChatButton from '../components/ShowChatButton.vue';
import { useRouter } from 'vue-router';
import MobileButton from '../components/MobileButton.vue';

const props = defineProps(['hostId', 'isHost']);
const emit = defineEmits(['leave']);

const router = useRouter();
const usernameStore = useUsernameStore();
const stageStore = useStageStore();
const backendStore = useBackendStore();
const chatStore = useChatStore();

const slots = ref(['', '', '', '']);
const localParticipantSlotIndex = ref(-1);
const slotsLoading = ref(false);

const localAudioStream = ref();

const showChatRef = ref(false);

const audioCtxMapRef = ref(new Map());
const audioStartedRef = ref(false);
const audioVolumeRef = ref([0, 0, 0, 0]);
const isSpeakingRef = ref([false, false, false, false]);
const computedParticipantSlotIndexMap = computed(() => {
  const nextState = new Map();
  slots.value.map((id, index) => {
    nextState.set(id, index);
  })
  return nextState;
});

const handleLeave = () => {
  if (props.isHost) {
    emit('leave');
  } else {
    leaveStage();
  }
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

const getParticipantUsername = (id) => {
  if (id === stageStore.localParticipant.id) return usernameStore.username;
  return stageStore.participants.get(id)?.attributes?.username ||
    stageStore.participants.get(id)?.userId;
}

const getParticipantAudioStream = (id) => {
  if (id === stageStore.localParticipant.id) return new MediaStream([stageStore.localAudioStream.mediaStreamTrack]);

  const p = stageStore.participants.get(id);
  if (!p) return undefined;

  let audioStream;
  p.streams.forEach(stream => {
    if (stream.streamType === StreamType.AUDIO) {
      audioStream = new MediaStream([stream.mediaStreamTrack]);
    }
  });
  return audioStream;
}

const handleGridSelect = async (index) => {
  if (stageStore.onStage) {
    changePosition(localParticipantSlotIndex.value, index);
  }
  else {
    joinStage(index);
  }
}

const changePosition = async (currIndex, nextIndex) => {
  slotsLoading.value = true;

  // Swap array items
  const newArr = slots.value.slice(0);
  const nextTemp = newArr[nextIndex];
  newArr[nextIndex] = newArr[currIndex];
  newArr[currIndex] = nextTemp;

  // Send update to server
  // The UI will update once the server confirms
  backendStore.updateSeats(newArr, props.hostId);
}

const joinStage = async (slotIndex) => {
  const audioMedia = await initMic();
  beginPublish(audioMedia);
  joinSlot(slotIndex, stageStore.localParticipant.id, audioMedia);

  // Send update to server
  // The UI will update once the server confirms
  backendStore.updateSeats(slots.value, props.hostId);
}

const leaveStage = async () => {
  await leaveSlot();
  await endPublish();

  // Send update to server
  // The UI will update once the server confirms
  backendStore.updateSeats(slots.value, props.hostId);
}

const joinSlot = async (slotIndex, pId, audioStream) => {
  addToSlot(slotIndex, pId, audioStream);
  localParticipantSlotIndex.value = slotIndex;
}

const leaveSlot = async () => {
  if (localParticipantSlotIndex.value) {
    await removeFromSlot(localParticipantSlotIndex.value)
    localParticipantSlotIndex.value = -1;
    releaseMic();
  }
};

const addToSlot = async (slotIndex, pId, audioStream) => {
  slotsLoading.value = true;

  slots.value[slotIndex] = pId;

  // If this participant already has an audioContext finish loading and return
  if (audioCtxMapRef.value.has(pId)) {
    slotsLoading.value = false;
    return;
  }

  // Create and store the audioContext
  const ctx = createAudioContext();
  audioCtxMapRef.value.set(pId, ctx)

  const source = ctx.createMediaStreamSource(audioStream);
  const analyser = ctx.createAnalyser();
  source.connect(analyser);

  monitorGain(pId, analyser);
}

const removeFromSlot = async (index) => {
  slotsLoading.value = true;

  const pId = slots.value[index];
  const audioCtx = audioCtxMapRef.value.get(pId);
  if (audioCtx) {
    await destroyAudioContext(audioCtx);
    audioCtxMapRef.value.delete(pId)
  }

  slots.value[index] = '';
  isSpeakingRef.value[index] = false;
  audioVolumeRef.value[index] = 0;

  slotsLoading.value = false;
};

const updateSlots = async (seats = backendStore.currentStage?.seats) => {
  // Update UI
  slots.value = seats.slice(0, 4); // Only support 4 seats

  // Loop through the updated seats
  for (let index = 0; index < seats.length; index++) {
    const seatParticipantId = seats[index];

    // If the slot is the local participant, update the local participant's slot index
    if (seatParticipantId === stageStore.localParticipant.id) localParticipantSlotIndex.value = index;

    // If the slot is empty, reset the slot and continue
    if (seatParticipantId === '') {
      isSpeakingRef.value[index] = false;
      audioVolumeRef.value[index] = 0;
      continue;
    }

    // If the participant already has an audioContext, continue
    if (audioCtxMapRef.value.get(seatParticipantId)) {
      continue;
    }

    const participantToAdd = stageStore.participants.get(seatParticipantId);
    let audioStream;
    if (props.isHost) {
      audioStream = new MediaStream([stageStore.localAudioStream.mediaStreamTrack]);
    } else {
      participantToAdd?.streams.forEach(stream => {
        if (stream.streamType === StreamType.AUDIO) {
          audioStream = new MediaStream([stream.mediaStreamTrack]);
        }
      });
    }

    // Create and store the audioContext
    const ctx = createAudioContext();
    audioCtxMapRef.value.set(seatParticipantId, ctx)

    const source = ctx.createMediaStreamSource(audioStream);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);

    try {
      monitorGain(seatParticipantId, analyser);
    } catch (err) {
      console.error(err);
    }
  }
}

const monitorGain = (seatParticipantId, analyser, recursive = true) => {
  const gain = getNormalizedGain(analyser);
  const participantIndex = computedParticipantSlotIndexMap.value.get(seatParticipantId);

  if (participantIndex === undefined) throw new Error('Participant not found', seatParticipantId);

  audioVolumeRef.value[participantIndex] = gain;
  isSpeakingRef.value[participantIndex] = gain > 0.005;

  if (recursive) requestAnimationFrame(() => monitorGain(seatParticipantId, analyser, recursive));
};

const releaseMic = () => {
  if (!localAudioStream.value) return;
  const tracks = localAudioStream.value.getAudioTracks();
  tracks.forEach((track) => {
    track.stop();
  });
}

const handleRoomCreate = () => {
  const unsubscribeOnChatEventReceived = chatStore.room.addListener('event', (event) => {
    if (event.eventName !== 'stage:SEATS') return;

    // Get the first 4 seats in the array
    const seatArray = JSON.parse(event.attributes.seats);
    slotsLoading.value = true;
    updateSlots(seatArray);
    slotsLoading.value = false;
  });
  chatStore.unsubscribeHandlers.push(unsubscribeOnChatEventReceived);
}

const initMic = async () => {
  // Get user mic
  const audioMedia = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Cache mic for later use
  localAudioStream.value = audioMedia;
  return audioMedia
}

const beginPublish = (audioMedia) => {
  // Publish to the stage
  const audioStream = stageStore.createLocalStream(audioMedia.getAudioTracks()[0]);
  stageStore.stageStrategy.updateMedia(audioStream, undefined);
  stageStore.stageStrategy.updatePublish(true);
  stageStore.refreshStageStrategy();
}

const endPublish = () => {
  stageStore.stageStrategy.updateMedia(undefined, undefined);
  stageStore.stageStrategy.updatePublish(false);
  stageStore.refreshStageStrategy();
}

const startAudioContexts = () => {
  if (audioStartedRef.value) return;

  audioCtxMapRef.value.forEach((value, key) => {
    if (!slots.value.includes(key)) return;
    if (value.state === 'suspended') {
      // Resume the audio context
      value.resume();
    }
  })
  audioStartedRef.value = true;
}

onMounted(async () => {
  // debugger;
  if (!stageStore.stage) {
    const token = await backendStore.joinStream(props.hostId);
    await stageStore.connectToStage(token);
  }

  // If the user is the host, start publishing
  if (props.isHost) {
    const audioMedia = await initMic();
    beginPublish(audioMedia);
    joinSlot(0, stageStore.localParticipant.id, audioMedia);
  }

  stageStore.stage.on(
    StageEvents.STAGE_PARTICIPANT_PUBLISH_STATE_CHANGED,
    (participantInfo, state) => {
      switch (state) {
        case StageParticipantPublishState.PUBLISHED:
          // Set local participant details when publish starts
          if (participantInfo.id === stageStore.localParticipant.id) {
            slotsLoading.value = false;
            stageStore.onStage = true;
          }
          break;
        case StageParticipantPublishState.NOT_PUBLISHED:
          // Set local participant details when publish stops
          if (participantInfo.id === stageStore.localParticipant.id) {
            stageStore.onStage = false;
          }
          break;
        default:
          break;
      }
    }
  );

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (participant, streams) => {
    // Don't do anything if the local user joins
    if (isLocalParticipant(participant)) return;

    // Don't do anything if the participant is already in the slots
    if (computedParticipantSlotIndexMap.value.get(participant.id) !== undefined) return;

    updateSlots(backendStore.currentStage.slots);
  })

  stageStore.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, (participant, streams) => {
    // Don't do anything if the local user leaves
    if (isLocalParticipant(participant)) return;

    // Don't do anything if the participant is already not in the slots
    const participantIndex = computedParticipantSlotIndexMap.value.get(participant.id);
    if (participantIndex === undefined) return;

    updateSlots(backendStore.currentStage.slots);
  })
});

onUnmounted(async () => {
  await leaveStage();
  stageStore.leaveStage();
});
</script>