<template>
  <div ref="messagesEl" :class='containerClass'>
    <div class="messages-container flex flex-col justify-end justify-self-end">
      <div class="relative flex flex-col gap-2 justify-end">
        <template v-for="(message, index) in chatStore.messages" :key="index">
          <div v-if="message.type === 'notice'" class="relative flex items-center flex-wrap gap-x-1.5 gap-y-1">
            <div :class="twMerge(['max-w-[80%] text-xs px-2 py-1 inline-flex rounded-2xl self-start transition-opacity ease-in-out duration-300 bg-surfaceAlt3/80 text-uiTextAlt2/80'])">
              {{ message.content }}
            </div>
          </div>
          <div v-if="message.type === 'text'" class="relative flex items-center flex-wrap gap-x-1.5 gap-y-1">
            <div :class="twMerge(['max-w-[80%] text-lg px-4 py-2 inline-flex rounded-2xl self-start transition-opacity ease-in-out duration-300',
              message.sender === 'local' || message.senderId === usernameStore.userId ? 'bg-gradient-to-t from-secondary/90 to-secondary text-white' : 'bg-gradient-to-t from-surfaceAlt/90 to-surfaceAlt text-uiText'
            ])">
              {{ message.content }}
            </div>
            <div v-if="message.sender === 'local'" class="shrink-0 px-2 py-1 inline-flex gap-x-1 text-uiText/50 bg-surfaceAlt3/70 backdrop-blur rounded-full">
              <PhEyeSlash weight="fill" :size="16" />
              <span class="text-xs">Only visible to you</span>
            </div>
          </div>
          <img v-else-if="message.type === 'image'" :src="message.content" :class="twMerge(['text-lg px-4 py-2 inline-flex rounded-2xl self-start transition-opacity ease-in-out duration-300 w-28',
            message.sender === 'local' || message.senderId === usernameStore.userId ? 'bg-gradient-to-t from-secondary/90 to-secondary text-white' : 'bg-gradient-to-t from-surfaceAlt/90 to-surfaceAlt text-uiText'
          ])" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, useAttrs } from 'vue';
import { useScroll, useElementVisibility } from '@vueuse/core'
import { useChatStore } from '../stores/chat'
import { useBackendStore } from '../stores/backend'
import { useUsernameStore } from '../stores/usernameStore'
import { twMerge } from 'tailwind-merge';
import { PhEyeSlash } from '@phosphor-icons/vue';

const props = defineProps({
  messageClasses: {
    type: String,
    default: 'bg-gradient-to-t from-surfaceAlt/90 to-surfaceAlt text-lg px-4 py-2 inline-flex rounded-full self-start'
  },
  maxDisplayedMessages: {
    type: Number,
    default: 30
  },
  demoMode: {
    type: Boolean,
    default: true,
  },
  hostId: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['connected', 'created'])

const chatStore = useChatStore();
const usernameStore = useUsernameStore();
const backendStore = useBackendStore();

let messageInterval;
let timeout;
const scrollToElem = ref();
const messagesEl = ref(null);
const attrs = useAttrs();

const { y, isScrolling } = useScroll(messagesEl);
const chatBottomVisible = useElementVisibility(scrollToElem)
const scrollToBottom = () => {
  if (!messagesEl.value) return;
  y.value = messagesEl.value.scrollHeight;
}

const containerClass = twMerge('w-full flex flex-col max-h-full grow-1 shrink-0 self-end justify-end relative min-h-0 overflow-hidden', attrs.class)

const delayedScrollTobottom = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(scrollToBottom, 10);
}

// Auto-scroll to the bottom when new messages are added
watch(chatStore.messages, (oldVal, newVal) => {
  // Auto-scroll when the user sends a message
  if (newVal.at(-1).sender === 'local') {
    delayedScrollTobottom();
    return;
  }
  // Auto-scroll if the user isn't scrolling or near the bottom
  if (chatBottomVisible.value || !isScrolling.value) {
    delayedScrollTobottom();
    return;
  }
}, { deep: true })

onMounted(() => {
  chatStore.clearMessages();

  if (props.demoMode) {
    // Add an initial message, if demo mode is active
    chatStore.addRandomMessage();
    // Add messages at a set interval
    if (messageInterval) clearInterval(messageInterval);
    messageInterval = setInterval(chatStore.addRandomMessage, Math.random() * 2000 + 1000);
  } else {
    chatStore.createRoom(backendStore.awsRegion, props.hostId);
    emit('created');
    chatStore.connectRoom();
    emit('connected');
  }
});

onUnmounted(() => {
  chatStore.clearMessages();
  chatStore.leaveRoom();
  if (messageInterval) clearInterval(messageInterval);
});
</script>
