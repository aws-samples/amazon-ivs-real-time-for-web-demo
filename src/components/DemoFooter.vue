<template>
  <footer class='absolute left-0 px-2 bottom-0 w-full h-12 grid grid-cols-[48px_minmax(0,1fr)_48px] grid-rows-1 gap-2 grow-0 shrink-0'>
    <figure class="flex p-1 justify-start items-center">
      <UserAvatar :title="true" />
    </figure>
    <div class="flex justify-center items-center">
      <ChatInput v-if="!props.replaceInput" />
      <slot v-else></slot>
    </div>
    <div class="flex justify-end items-center relative">
      <div class="absolute inset-0">
        <EmojiTrigger ref="emojiTriggerRef"></EmojiTrigger>
      </div>
      <button class="relative z-20 bg-surfaceAlt/80 active:bg-surfaceAlt3 backdrop-blur p-3 rounded-full size-full" @click="handleHeartSelect">
        <div ref="heartIconRef" :class="[{ 'text-red-500 animate-liked-heart': liked, 'text-current': !liked }]">
          <PhHeart size="100%" :weight="liked ? 'fill' : 'regular'" class="text-current" />
        </div>
      </button>
    </div>
  </footer>
  <div class="w-full h-12 shrink-0 pointer-events-none"></div>
</template>

<script setup>
import UserAvatar from "./UserAvatar.vue";
import { PhHeart } from '@phosphor-icons/vue';
import { ref } from "vue";
import EmojiTrigger from "./EmojiTrigger.vue";
import ChatInput from "./ChatInput.vue";
import { restartCssAnimation } from '../utils/animation';

const emojiTriggerRef = ref();
const heartIconRef = ref();

const props = defineProps({
  username: String,
  replaceInput: {
    type: Boolean,
    default: false,
  }
});

const liked = ref(false);

const handleHeartSelect = () => {
  if (liked.value) {
    restartCssAnimation(heartIconRef.value);
  } else {
    liked.value = true;
  }
  emojiTriggerRef.value.addRandomEmoji()
}
</script>

<style>
.animate-liked-heart {
  animation: scale-in 0.5s ease-in-out forwards,
    beat 1s ease-in-out forwards 3;
  animation-delay: 0s, 0.5s;
}

@keyframes scale-in {
  0% {
    transform: scale(0);
  }

  60%,
  64% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes beat {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>