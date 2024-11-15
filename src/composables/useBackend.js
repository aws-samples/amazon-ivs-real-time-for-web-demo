import axios from 'axios';
import { useBackendStore } from '../stores/backend';
import { useUsernameStore } from '../stores/usernameStore';

export function useBackend() {
  const backendStore = useBackendStore();
  const usernameStore = useUsernameStore();

  const missingApiInfo = () => {
    return !backendStore.domain || !backendStore.apiKey || !backendStore.apiUrl;
  };

  const listStreams = async (apiKey, apiUrl) => {
    if (!apiKey || !apiUrl) throw new Error('Missing API info');

    const { data } = await axios({
      method: 'GET',
      url: apiUrl,
      headers: {
        'X-API-Key': apiKey,
      },
    });

    return data.stages;
  };

  const createStream = async (streamType) => {
    if (missingApiInfo()) throw new Error('Missing API info');

    const { data } = await axios({
      method: 'POST',
      url: `${backendStore.apiUrl}/create`,
      headers: {
        'X-API-Key': backendStore.apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        hostAttributes: {
          username: usernameStore.username,
        },
        hostId: usernameStore.userId,
        type: streamType === 'AUDIO' ? 'AUDIO' : 'VIDEO',
        cid: backendStore.domain,
      },
    });

    return data;
  };

  const destroyStream = async (hostId) => {
    if (missingApiInfo()) throw new Error('Missing API info');

    const { data } = await axios.delete(backendStore.apiUrl, {
      headers: {
        'X-API-Key': backendStore.apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        hostId,
        cid: backendStore.domain,
      },
    });

    return data;
  };

  const fetchStreamToken = async (hostId) => {
    if (missingApiInfo()) throw new Error('Missing API info');

    const { data } = await axios({
      method: 'POST',
      url: `${backendStore.apiUrl}/join`,
      headers: {
        'X-API-Key': backendStore.apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        attributes: {
          username: usernameStore.username,
        },
        userId: usernameStore.userId,
        hostId,
      },
    });

    return data;
  };

  const chatTokenProvider = async (hostId) => {
    if (missingApiInfo()) throw new Error('Missing API info');

    const { data } = await axios({
      method: 'POST',
      url: `${backendStore.apiUrl}/chatToken/create`,
      headers: {
        'X-API-Key': backendStore.apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        attributes: {
          username: usernameStore.username,
        },
        userId: usernameStore.userId,
        hostId,
      },
    });

    return data;
  };

  const updateSeats = async (seats, hostId) => {
    if (missingApiInfo()) throw new Error('Missing API info');

    const { data } = await axios({
      method: 'PUT',
      url: `${backendStore.apiUrl}/update/seats`,
      headers: {
        'X-API-Key': backendStore.apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        seats,
        hostId,
        userId: usernameStore.userId,
      },
    });

    return data;
  };

  const updateMode = async (mode, hostId) => {
    if (missingApiInfo()) throw new Error('Missing API info');

    const { data } = await axios({
      method: 'PUT',
      url: `${backendStore.apiUrl}/update/mode`,
      headers: {
        'X-API-Key': backendStore.apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        mode,
        hostId,
        userId: usernameStore.userId,
      },
    });

    return data;
  };

  const castVote = async (vote, hostId) => {
    if (missingApiInfo()) throw new Error('Missing API info');

    const { data } = await axios({
      method: 'POST',
      url: `${backendStore.apiUrl}/castVote`,
      headers: {
        'X-API-Key': backendStore.apiKey,
        'Content-Type': 'application/json',
      },
      data: {
        vote,
        hostId,
      },
    });

    return data;
  };

  return {
    listStreams,
    createStream,
    destroyStream,
    fetchStreamToken,
    chatTokenProvider,
    updateSeats,
    updateMode,
    castVote,
  };
}
