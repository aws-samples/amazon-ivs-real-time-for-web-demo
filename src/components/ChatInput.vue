<template>
  <input ref="inputElemRef" class="w-full h-full bg-surfaceAlt rounded-full px-4 text-[16px] ring-2 ring-transparent focus:ring-secondary" placeholder="Say something..." v-model="message"
    @keyup.enter="handleSend" @focus="() => { chatStore.inputFocused = true; $emit('focus') }" @blur="() => { chatStore.inputFocused = false; $emit('blur') }" enterkeyhint="send" />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useChatStore } from '../stores/chat'

const emit = defineEmits(['send', 'focus', 'blur'])
const message = ref('');
const inputElemRef = ref();
const chatStore = useChatStore();

const handleSend = () => {
  const trimmedMessage = String(message.value).trim()

  if (!trimmedMessage.length) {
    message.value = '';
    return;
  };

  emit('send', trimmedMessage)

  if (chatStore.roomJoined) chatStore.sendMessage(trimmedMessage);
  else chatStore.addMessage(trimmedMessage);

  message.value = ''
};

onMounted(() => {
  inputElemRef.value.focus();
})

defineExpose({ inputElemRef })
</script>