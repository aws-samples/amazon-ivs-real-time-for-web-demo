import { SubscribeType } from 'amazon-ivs-web-broadcast';

export default class Strategy {
  _videoStream = undefined;
  _audioStream = undefined;
  _subscribeType = SubscribeType.NONE;
  _shouldPublish = undefined;

  constructor(
    audioStream = null,
    videoStream = null,
    subscribeType = SubscribeType.AUDIO_VIDEO
  ) {
    this._videoStream = videoStream;
    this._audioStream = audioStream;
    this._subscribeType = subscribeType;
  }

  updateMedia(audioStream, videoStream) {
    this._audioStream = audioStream;
    this._videoStream = videoStream;
  }

  updatePublish(shouldPublish) {
    this._shouldPublish = shouldPublish;
  }

  stageStreamsToPublish() {
    return [this._videoStream, this._audioStream];
  }

  // eslint-disable-next-line no-unused-vars
  shouldPublishParticipant(participantInfo) {
    return this._shouldPublish;
  }

  shouldSubscribeToParticipant(participantInfo) {
    // Only subscribe to the stream with the publisher role
    return SubscribeType.AUDIO_VIDEO;
  }
}
