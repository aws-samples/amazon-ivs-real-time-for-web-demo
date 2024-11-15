<template>
  <div ref="emojiContainer" class="relative pointer-events-none">
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const reactions = [
  '<img src="https://rt.ivs.rocks/assets/images/hundred_points_3d.png" alt="100" class="floating-emoji">',
  '<img src="https://rt.ivs.rocks/assets/images/red_heart_3d.png" alt="heart" class="floating-emoji">',
  '<img src="https://rt.ivs.rocks/assets/images/hand_with_index_finger_and_thumb_crossed_3d_default.png" alt="finger heart" class="floating-emoji">',
];

const emojiContainer = ref(null);
const timeouts = [];

const addRandomEmoji = () => {
  if (!emojiContainer.value) {
    // Guard against the emojiContainer being null
    return;
  }

  const randomIndex = Math.floor(Math.random() * reactions.length);
  const emojiHTML = reactions[randomIndex];

  const emojiDiv = document.createElement('div');
  emojiDiv.innerHTML = emojiHTML;
  emojiDiv.classList.add('emoji', 'absolute', 'z-10');

  if (emojiContainer.value) {
    const randomLeft = Math.random() * (emojiContainer.value.offsetWidth - 50);
    emojiDiv.style.left = `${randomLeft}px`;
    emojiContainer.value.appendChild(emojiDiv);
  }

  // Schedule removal of emoji and store the timeout id for cleanup
  const timeoutId = setTimeout(() => {
    if (emojiContainer.value && emojiContainer.value.contains(emojiDiv)) {
      emojiContainer.value.removeChild(emojiDiv);
    }
  }, 2000); // Adjust time based on your animation duration
  timeouts.push(timeoutId);
};


const addEmojiBurst = () => {
  const burstSize = Math.floor(Math.random() * 3) + 1; // Random burst size
  for (let i = 0; i < burstSize; i++) {
    setTimeout(addRandomEmoji, i * 250); // 250ms stagger between each emoji
  }
};

let intervalId;
let burstIntervalId;

onMounted(() => {
  intervalId = setInterval(addRandomEmoji, Math.random() * 2000 + 1000); // Random interval between 1 to 3 seconds
  burstIntervalId = setInterval(addEmojiBurst, Math.random() * 4000 + 1000); // Random burst interval between 1 to 5 seconds
});

onUnmounted(() => {
  clearInterval(intervalId);
  clearInterval(burstIntervalId);

  // Clear any pending timeouts for emoji removal
  timeouts.forEach(clearTimeout);
  // Optionally reset the timeouts array
  timeouts.length = 0;
});

defineExpose({ addRandomEmoji, addEmojiBurst });
</script>

<style>
@keyframes floatFade {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  50% {
    transform: translateY(-150px) scale(110%);
    opacity: 0.9;
  }

  100% {
    transform: translateY(-220px) scale(130%);
    opacity: 0;
  }
}

@keyframes wiggle {
  0% {
    transform: translateX(0px);
  }

  50% {
    transform: translateX(20px);
  }

  100% {
    transform: translateX(-20px);
  }
}

.emoji {
  @apply absolute size-10;
  animation: floatFade 3s linear forwards;
}

.floating-emoji {
  position: absolute;
  animation: wiggle 3s ease-in-out infinite;
}
</style>