import { defineStore } from 'pinia';
import { isVirtualKeyboardOpen } from '../utils/keyboard';
import {
  getAvailableDevices,
  getIdealDevice,
  getCameraTrack,
  getMicrophoneTrack,
  isMobileBrowser,
  isSafari,
  isFirefox,
} from '../utils/Devices';

export const useDeviceStore = defineStore('device', {
  state: () => ({
    virtualKeyboardOpen: false,
    videoDevice: null,
    videoTrack: null,
    audioDevice: null,
    audioTrack: null,
    videoDeviceList: [],
    audioDeviceList: [],
    permissions: false,
  }),
  actions: {
    // Updates gUM permissions and populates the list of audio and video devices
    async updateDeviceList() {
      const { videoDevices, audioDevices, permissions } =
        await getAvailableDevices({
          savedAudioDeviceId: this.audioDevice,
          savedVideoDeviceId: this.videoDevice,
        });

      this.videoDeviceList = videoDevices;
      this.audioDeviceList = audioDevices;
      this.permissions = permissions;
    },
    // Sets the current audio device, or the first available device, if the provided device is not available
    setAudioDevice(deviceId) {
      const _deviceId = deviceId || this.audioDevice;
      this.audioDevice = getIdealDevice(_deviceId, this.audioDeviceList);
      return this.audioDevice;
    },
    // Sets the current video device, or the first available device, if the provided device is not available
    setVideoDevice(deviceId) {
      const _deviceId = deviceId || this.videoDevice;
      this.videoDevice = getIdealDevice(_deviceId, this.videoDeviceList);
      return this.videoDevice;
    },
    // Sets the current audio track
    setAudioTrack(deviceId) {
      this.audioTrack = getMicrophoneTrack(deviceId || this.audioDevice);
      return this.audioTrack;
    },
    // Sets the current video track
    setVideoTrack(deviceId) {
      this.videoTrack = getCameraTrack(deviceId || this.videoDevice);
      return this.videoTrack;
    },
    updateVirtualKeyboardState() {
      this.virtualKeyboardOpen = isVirtualKeyboardOpen();
    },
  },
  getters: {
    isMobileBrowser() {
      return isMobileBrowser();
    },
    isSafariBrowser() {
      return isSafari();
    },
    isFirefoxBrowser() {
      return isFirefox();
    },
    isChromiumBrowser() {
      return !!window.chrome;
    },
  },
  persist: true,
});
