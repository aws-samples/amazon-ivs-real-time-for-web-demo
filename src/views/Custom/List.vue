<template>
  <div class="transform relative h-full flex flex-col pb-safe bg-surfaceAlt">
    <div class="fixed inset-0 bg-surfaceAlt"></div>
    <!-- Header -->
    <header :class="['fixed z-20 flex justify-between items-center mb-8 w-full px-2.5 pt-4 bg-gradient-to-t from-transparent to-white top-0']">
      <div class="w-full max-w-screen-xl mx-auto flex justify-between items-center">
        <div class="flex gap-x-2 items-center">
          <UserAvatar variant="beam" :name="usernameStore.username || 'User'" :title="true" />
          <h1 class="text-lg font-mono">{{ usernameStore.username }}</h1>
        </div>
        <!-- <MobileButton @click="regenerateUsername" class="p-2 rounded-full bg-white shadow">
          <PhShuffle weight="bold" :size="24" />
        </MobileButton> -->
        <router-link custom to="/settings" v-slot="{ navigate }">
          <MobileButton @click="() => handleSettingsSelect(navigate)" class="p-2 rounded-full bg-white shadow">
            <PhGearSix weight="bold" :size="24" />
          </MobileButton>
        </router-link>
      </div>
    </header>

    <!-- List of Actions -->
    <div class="w-full max-w-screen-xl mx-auto relative z-10 px-2.5 pb-3 space-y-4 flex flex-col grow justify-end">
      <MobileButton class="w-full bg-white rounded-xl p-4 shadow flex flex-col items-start gap-5 transition" @click="() => handleCreateSelect()">
        <span class="text-lg">Create</span>
        <PhPlusCircle :size="36" weight="fill" class="text-uiText" />
      </MobileButton>
      <MobileButton class="w-full bg-white rounded-xl p-4 shadow flex flex-col items-start gap-5 transition" @click="() => handleWatchSelect()">
        <span class="text-lg">Watch</span>
        <PhVideoConference :size="36" weight="fill" class="text-uiText" />
      </MobileButton>
    </div>
    <CreateStagePopover v-model:show="showCreatePopoverRef" @create="handleCreate" />
  </div>
</template>

<script setup>
import UserAvatar from "../../components/UserAvatar.vue";
import { onMounted, ref } from 'vue';
import { useBackend } from '../../composables/useBackend';
import { useUsernameStore } from '../../stores/usernameStore';
import { useStageStore } from '../../stores/stage';
import { navigateWithTransition } from '../../stores/navigation';
import MobileButton from '../../components/MobileButton.vue';
import CreateStagePopover from '../../components/CreateStagePopover.vue';
import { PhGearSix, PhPlusCircle, PhVideoConference } from '@phosphor-icons/vue';
import { useBackendStore } from "../../stores/backend";
import { useRouter } from "vue-router";

const { createStream } = useBackend();
const router = useRouter();

const usernameStore = useUsernameStore();
const stageStore = useStageStore();
const backendStore = useBackendStore();

const stageLoading = ref(undefined);
const showCreatePopoverRef = ref(false);

const handleSettingsSelect = (navigate) => {
  navigateWithTransition(navigate);
};

const handleWatchSelect = async (navigate) => {
  stageLoading.value = true;

  // Leave any existing stages
  if (stageStore.stage) stageStore.leaveStage();

  // Refresh streams
  await backendStore.refreshStreams();

  // Start with the first stream, if it exists
  if (backendStore.streamsExist) {
    backendStore.currentStreamIndex = 0;
  } else {
    backendStore.currentStreamIndex = -1;
  }

  // Set the hostId to the id of the first stream, if it exists
  const hostId = backendStore.streams.length < 1 ? '' : backendStore.streams[0].hostId;

  // Get token, if a stage exists
  const token = hostId ? await backendStore.joinStream(hostId) : '';

  // Connect to the stage
  if (token) await stageStore.connectToStage(token);

  // Navigate to the stream
  navigateWithTransition(() => {
    router.push({ path: `/custom/watch/${hostId}` });
  });
  stageLoading.value = false;
}

const fetchStreamList = () => {
  backendStore.refreshStreams();
}

const handleCreateSelect = () => {
  showCreatePopoverRef.value = true;
}

const handleCreate = async (streamType) => {
  try {
    stageLoading.value = true;

    // Leave any existing stages
    if (stageStore.stage) stageStore.leaveStage();

    // Create the stream
    const { hostParticipantToken, region } = await createStream(streamType);

    // Set the host participant token
    backendStore.token = hostParticipantToken.token;
    backendStore.awsRegion = region;
    backendStore.participantId = hostParticipantToken.participantId;

    // Set the stream type
    backendStore.streamType = streamType;

    // Refresh streams
    await backendStore.refreshStreams();

    // Set the current stream index
    backendStore.currentStreamIndex = backendStore.hostStreamIndex;

    // Connect to the stage
    await stageStore.connectToStage(hostParticipantToken.token);

    // Navigate to the state
    navigateWithTransition(() => {
      router.push({ path: `/custom/${usernameStore.userId}` });
    })

    stageLoading.value = false;
  } catch (err) {
    console.error(err);
  }
}

onMounted(async () => {
  if (stageStore.stage) {
    stageStore.leaveStage();
  }
  fetchStreamList();
})
</script>