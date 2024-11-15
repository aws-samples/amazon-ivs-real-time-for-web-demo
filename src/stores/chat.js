import { defineStore } from 'pinia';
import { DEFAULT_MESSAGES } from '../constants/messages';
import { ChatRoom, SendMessageRequest } from 'amazon-ivs-chat-messaging';
import { useBackend } from '../composables/useBackend';

export const useChatStore = defineStore('chat', {
  state: () => ({
    room: undefined,
    roomJoined: false,
    messages: [''],
    events: [],
    maxDisplayedMessages: 30,
    inputFocused: false,
    unsubscribeHandlers: [],
  }),
  actions: {
    async createRoom(awsRegion, hostId) {
      const { chatTokenProvider } = useBackend();

      const room = new ChatRoom({
        regionOrUrl: awsRegion,
        tokenProvider: () => chatTokenProvider(hostId),
        logLevel: 'error',
      });

      const unsubscribeOnConnecting = room.addListener('connecting', () => {
        this.roomJoined = false;
      });
      const unsubscribeOnConnected = room.addListener('connect', () => {
        this.roomJoined = true;
        this.messages.push({
          type: 'notice',
          sender: 'SYSTEM',
          content: 'Connected to chat',
        });
      });
      const unsubscribeOnDisconnected = room.addListener('disconnect', () => {
        this.roomJoined = false;
        this.messages = [];
      });
      const unsubscribeOnMessageReceived = room.addListener(
        'message',
        (message) => {
          this.messages.push({
            type: 'text',
            sender: message.sender.attributes?.username,
            senderId: message.sender.userId,
            content: message.content,
          });
        }
      );
      const unsubscribeOnEventReceived = room.addListener('event', (event) => {
        const { eventName } = event;
        if (eventName === 'stage:JOIN') {
          const attributes = JSON.parse(event.attributes?.userAttributes);
          if (!attributes) return;

          const message = `${
            attributes.username || 'Unknown user'
          } joined the stream`;

          // Dedupe messages
          const lastMessage = this.messages[this.messages.length - 1];
          if (lastMessage.content === message) return;

          this.messages.push({
            type: 'notice',
            sender: 'SYSTEM',
            content: message,
          });
        } else if (eventName === 'stage:MODE') {
          const { attributes } = event;
          if (!attributes) return;

          const { mode, notice } = attributes;

          let message = '';
          if (mode === 'GUEST_SPOT') {
            message = notice;
          } else if (mode === 'PK') {
            message = notice;
          } else {
            return;
          }

          // Dedupe messages
          const lastMessage = this.messages[this.messages.length - 1];
          if (lastMessage.content === message) return;

          this.messages.push({
            type: 'notice',
            sender: 'SYSTEM',
            content: message,
          });
        }
        this.events.push(event);
      });
      this.unsubscribeHandlers = [
        unsubscribeOnConnecting,
        unsubscribeOnConnected,
        unsubscribeOnDisconnected,
        unsubscribeOnMessageReceived,
        unsubscribeOnEventReceived,
      ];

      this.room = room;
      return room;
    },
    connectRoom() {
      this.room.connect();
    },
    leaveRoom() {
      if (!this.room) return;
      for (let index = 0; index < this.unsubscribeHandlers.length; index++) {
        this.unsubscribeHandlers[index]();
      }
      this.room.disconnect();
    },
    async sendMessage(message) {
      const request = new SendMessageRequest(message);
      try {
        await this.room.sendMessage(request);
      } catch (err) {
        console.error(err);
      }
    },
    addRandomMessage() {
      const randomMessage = this.getRandomMessage();
      this.messages.push(randomMessage);

      // Keep the array size to maxDisplayedMessages
      if (this.messages.length > this.maxDisplayedMessages) {
        this.messages.shift(); // Remove the oldest message
      }
    },
    addMessage(message) {
      this.messages.push({
        type: 'text',
        sender: 'local',
        content: message,
      });
    },
    getRandomMessage() {
      let randomIndex;
      let randomMessage;
      let attempts = 0;
      do {
        randomIndex = Math.floor(Math.random() * DEFAULT_MESSAGES.length);
        randomMessage = DEFAULT_MESSAGES[randomIndex];
        attempts++;
        // If we've looped too many times (to prevent an infinite loop in case there's not enough diversity in messages)
        if (attempts > 3) {
          break;
        }
      } while (
        this.messages.length > 1 &&
        (randomMessage === this.messages[this.messages.length - 1] ||
          randomMessage === this.messages[this.messages.length - 2])
      );

      return randomMessage;
    },
    clearMessages() {
      this.messages = [''];
    },
  },
});
