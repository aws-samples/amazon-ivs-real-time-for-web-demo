import { defineStore } from 'pinia';
import {
  Stage,
  LocalStageStream,
  StageConnectionState,
  StageParticipantPublishState,
  StageEvents,
  StreamType,
} from 'amazon-ivs-web-broadcast';
import Strategy from '../utils/StageStrategy';
import {
  createParticipant,
  isLocalParticipant,
  getRemovedStreams,
} from '../utils/stage';
import { ref } from 'vue';

export const useStageStore = defineStore('stage', () => {
  const stage = ref(null);
  const stageJoined = ref(false);
  const stageConnection = ref();
  const onStage = ref(false);

  const stageStrategy = ref(null);

  const localVideoStream = ref(null);
  const localVideoTrack = ref(null);
  const localVideoDeviceId = ref(null);

  const localAudioStream = ref(null);
  const localAudioTrack = ref(null);
  const localAudioDeviceId = ref(null);

  const participants = ref(new Map());
  const localParticipant = ref(null);

  const localStreams = ref([]);

  function getParticipantByUserId(userId) {
    if (localParticipant.value.userId === userId) return localParticipant.value;

    for (const [key, value] of participants.value.entries()) {
      if (value['userId'] === userId) {
        return value;
      }
    }

    return null;
  }

  function refreshStageStrategy() {
    if (stage.value && stageJoined.value) {
      stage.value.refreshStrategy();
    }
  }

  function destroyLocalStreams() {
    if (localVideoTrack.value) {
      localVideoTrack.value.stop();
    }
    if (localAudioTrack.value) {
      localAudioTrack.value.stop();
    }
  }

  function createLocalStream(track, deviceId = undefined) {
    if (!track) {
      console.warn('tried to set local media with a null track');
      return;
    }
    const stream = new LocalStageStream(track, {
      simulcast: { enabled: true },
    });
    if (stream.streamType === StreamType.VIDEO) {
      stream.setMuted(
        localVideoStream.value ? localVideoStream.value.isMuted : false
      );
      localVideoStream.value = stream;
      localVideoTrack.value = track;
      localVideoDeviceId.value = deviceId;
    } else {
      stream.setMuted(
        localVideoStream.value ? localVideoStream.value.isMuted : false
      );
      localAudioStream.value = stream;
      localAudioTrack.value = track;
      localAudioDeviceId.value = deviceId;
    }
    return stream;
  }

  function handleParticipantJoin(participant) {
    if (isLocalParticipant(participant)) {
      localParticipant.value = participant;
    } else {
      const newParticipant = createParticipant(participant);

      // Set a new Map to trigger reactivity
      participants.value = new Map(
        participants.value?.set(newParticipant.id, newParticipant)
      );
    }
    refreshStageStrategy();
  }

  function handleParticipantLeave(participant) {
    if (isLocalParticipant(participant)) {
      localParticipant.value = {};
    } else {
      if (!participants.value.length) return;

      const nextState = participants.value;
      nextState.delete(participant.id);

      // Set a new Map to trigger reactivity
      participants.value = new Map(nextState);
    }
  }

  function handleMediaAdded(participant, streams) {
    if (isLocalParticipant(participant)) {
      localParticipant.value = participant;
      localStreams.value = [...streams, ...localStreams.value];
    } else {
      if (!participants.value.length) {
        handleParticipantJoin(participant);
      }

      const { id } = participant;
      let updatedParticipant = participants?.value.get(id);
      updatedParticipant = {
        ...updatedParticipant,
        streams: [...streams, ...updatedParticipant.streams],
      };
      const nextState = participants.value;

      // Set a new Map to trigger reactivity
      participants.value = new Map(nextState.set(id, updatedParticipant));
    }
  }

  function handleMediaRemoved(participant, streams) {
    if (isLocalParticipant(participant)) {
      localParticipant.value = participant;
      localStreams.value = getRemovedStreams(participant, streams);
    } else {
      if (!participants.value.length) return;

      const { id } = participant;
      let updatedParticipant = participants.value.get(id);
      const newStreams = getRemovedStreams(updatedParticipant, streams);
      updatedParticipant = {
        ...updatedParticipant,
        streams: newStreams,
      };
      const nextState = participants.value;

      // Set a new Map to trigger reactivity
      participants.value = new Map(nextState.set(id, updatedParticipant));
    }
  }

  function handleParticipantMuteChange(participant) {
    if (isLocalParticipant(participant)) {
      localParticipant.value = participant;
    } else {
      const { id } = participantInfo;

      let updatedParticipant = participants.value.get(id);
      updatedParticipant = {
        ...updatedParticipant,
        ...participant,
      };
      const nextState = participants.value;

      // Set a new Map to trigger reactivity
      participants.value = new Map(nextState.set(id, updatedParticipant));
    }
  }

  function handleConnectionStateChange(state) {
    stageConnection.value = state;
    switch (state) {
      case StageConnectionState.DISCONNECTED:
        stageJoined.value = false;
        break;
      case StageConnectionState.CONNECTING:
        stageJoined.value = false;
        break;
      case StageConnectionState.CONNECTED:
        stageJoined.value = true;
        break;
      case StageConnectionState.ERRORED:
        // Reset stage
        stage.value.leave();
        stage.value.removeAllListeners();
        // Display error
        console.error(
          'Error: Could not connect to the session. Refresh the page to try again.'
        );
        break;
      default:
        break;
    }
  }

  function handleParticipantPublishStateChange(participantInfo, state) {
    if (state === StageParticipantPublishState.ERRORED) {
      console.error('Error publishing to stage');
    }
  }

  function handleParticipantSubscribeStateChange(participantInfo, state) {
    if (state === StageParticipantPublishState.ERRORED) {
      console.error('Error subscribing to stage');
    }
  }

  function attachStageHandlers(stage) {
    stage.on(
      StageEvents.STAGE_CONNECTION_STATE_CHANGED,
      handleConnectionStateChange
    );
    stage.on(StageEvents.STAGE_PARTICIPANT_JOINED, handleParticipantJoin);
    stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, handleParticipantLeave);
    stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, handleMediaAdded);
    stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, handleMediaRemoved);
    stage.on(
      StageEvents.STAGE_PARTICIPANT_PUBLISH_STATE_CHANGED,
      handleParticipantPublishStateChange
    );
    stage.on(
      StageEvents.STAGE_PARTICIPANT_SUBSCRIBE_STATE_CHANGED,
      handleParticipantSubscribeStateChange
    );
    stage.on(
      StageEvents.STAGE_STREAM_MUTE_CHANGED,
      handleParticipantMuteChange
    );
  }

  async function createStage(token) {
    try {
      stageStrategy.value = new Strategy();
      stage.value = new Stage(token, stageStrategy.value);
      attachStageHandlers(stage.value);
    } catch (err) {
      console.error('Error: Could not create stage', err);
    }
  }

  async function connectToStage(token) {
    if (!stage.value) await createStage(token);
    try {
      await stage.value.join();
      localParticipant.value = stage.value.localParticipant;
      refreshStageStrategy();
    } catch (err) {
      console.error('Failed to join stage:', err);
    }
  }

  function leaveStage() {
    if (stage.value) {
      destroyLocalStreams();

      participants.value = new Map();
      localParticipant.value = null;

      stage.value.leave();
      stage.value = null;
    }
  }

  return {
    stage,
    stageStrategy,
    onStage,
    localVideoStream,
    localVideoTrack,
    localVideoDeviceId,
    localAudioStream,
    localAudioTrack,
    localAudioDeviceId,
    localStreams,
    stageJoined,
    createLocalStream,
    destroyLocalStreams,
    participants,
    localParticipant,
    getParticipantByUserId,
    connectToStage,
    leaveStage,
    refreshStageStrategy,
    stageConnection,
  };
});
