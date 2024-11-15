import { DEMO_API_URL } from '../../constants';

export const fetchDemoToken = async (userId = '', publish = false, demo) => {
  const body = JSON.stringify({ userId, publish, demo });
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  const response = await fetch(`${DEMO_API_URL}/join`, {
    method: 'POST',
    headers,
    body,
  });
  const result = await response.text();
  const { token: _token } = JSON.parse(result);
  return _token;
};

export const isLocalParticipant = (info) => {
  return info.isLocal;
};

export const createParticipant = (participantInfo) => {
  return {
    ...participantInfo,
    streams: [],
  };
};

export const getRemovedStreams = (participant, updatedStreams) => {
  if (!participant) return [];
  if (!participant.streams?.length) return [];
  return participant.streams?.filter(
    (existingStream) =>
      !updatedStreams.find(
        (removedStream) => existingStream.id === removedStream.id
      )
  );
};
