import { defineStore } from 'pinia';
import { useUsernameStore } from './usernameStore';
import { useBackend } from '../composables/useBackend';
import { getApiUrlFromDomain } from '../utils/backend';

export const useBackendStore = defineStore('backend', {
  state: () => ({
    domain: '',
    apiKey: '',
    streams: [],
    currentStreamIndex: -1,
    hostStageType: '',
    token: '',
    participantId: '',
    awsRegion: '',
  }),
  actions: {
    async refreshStreams() {
      const { listStreams } = useBackend();
      let streams;
      try {
        const apiKey = this.apiKey;
        const apiUrl = getApiUrlFromDomain(this.domain);
        streams = await listStreams(apiKey, apiUrl);
      } catch (err) {
        console.error(err);
      }
      this.streams = streams;
      return streams;
    },
    updateCurrentStreamIndex(hostId) {
      const index = this.streams.findIndex((elem) => elem.hostId === hostId);
      this.currentStreamIndex = index;
      return index;
    },
    async joinStream(hostId) {
      const { fetchStreamToken } = useBackend();
      try {
        const { token, participantId, region } = await fetchStreamToken(hostId);
        this.token = token;
        this.participantId = participantId;
        this.awsRegion = region;
        return token;
      } catch (err) {
        console.error(err);
      }
    },
    async destroyStream(hostId) {
      const { destroyStream } = useBackend();
      try {
        await destroyStream(hostId);
        this.token = '';
        this.participantId = '';
      } catch (err) {
        console.error(err);
      }
    },
    async updateSeats(seats, hostId) {
      const { updateSeats } = useBackend();
      try {
        await updateSeats(seats, hostId);
      } catch (err) {
        console.error(err);
      }
    },
    async updateMode(mode, hostId) {
      const { updateMode } = useBackend();
      try {
        await updateMode(mode, hostId);
      } catch (err) {
        console.error(err);
      }
    },
    async castVote(vote, hostId) {
      const { castVote } = useBackend();
      try {
        await castVote(vote, hostId);
      } catch (err) {
        console.error(err);
      }
    },
  },
  getters: {
    apiUrl(state) {
      return getApiUrlFromDomain(state.domain);
    },
    isAuthenticated(state) {
      return state.domain !== '' && state.apiKey !== '';
    },
    secretCode(state) {
      return `${state.domain}-${state.apiKey}`;
    },
    streamsExist(state) {
      return !!state.streams.length;
    },
    hasToken(state) {
      return !!state.token;
    },
    hasHostToken(state) {
      return !!state.hostToken;
    },
    hostStreamIndex(state) {
      const usernameStore = useUsernameStore();
      return state.streams.findIndex(
        (elem) => elem.hostId === usernameStore.userId
      );
    },
    currentStageType(state) {
      if (state.currentStreamIndex < 0) return undefined;
      return state.streams[state.currentStreamIndex]?.type;
    },
    currentStageMode(state) {
      if (state.currentStreamIndex < 0) return undefined;
      return state.streams[state.currentStreamIndex]?.mode;
    },
    currentHostName(state) {
      if (state.currentStreamIndex < 0) return undefined;
      return state.streams[state.currentStreamIndex]?.hostAttributes?.username;
    },
    currentStage(state) {
      return state.streams[state.currentStreamIndex];
    },
    nextStage(state) {
      if (state.currentStreamIndex < state.streams.length - 1) {
        return state.streams[state.currentStreamIndex + 1];
      } else {
        return state.streams[0];
      }
    },
    prevStage(state) {
      if (state.currentStreamIndex > 0) {
        return state.streams[state.currentStreamIndex - 1];
      } else {
        return state.streams[state.streams.length - 1];
      }
    },
  },
  persist: {
    pick: ['domain', 'apiKey'],
  },
});
