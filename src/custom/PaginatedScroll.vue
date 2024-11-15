<template>
  <div class="h-full w-full overflow-x-hidden overflow-y-scroll relative" @wheel="handleScroll" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <slot :page="currentPage" :goTo="goToPage" :scrollAmount="translateY"></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  pages: {
    type: Number,
    required: true
  },
  scrollThreshhold: {
    type: Number,
    default: 100,
  },
  suppressScroll: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['navigate'])
const loadStreamModel = defineModel('loadStream');

const currentPage = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);
const translateY = ref(0);

const isUnderThreshhold = (value) => {
  return Math.abs(value) < (props.scrollThreshhold + (props.scrollThreshhold * 1.25));
}

const handleScroll = (event) => {
  if (props.suppressScroll) return;

  const newVal = translateY.value + event.deltaY;
  if (isUnderThreshhold(newVal)) translateY.value = newVal;
  resetTranslate();
};

const handleTouchStart = (event) => {
  if (props.suppressScroll) return;
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = (event) => {
  if (props.suppressScroll) return;
  touchEndY.value = event.touches[0].clientY;

  const newVal = touchStartY.value - touchEndY.value;
  if (isUnderThreshhold(newVal)) translateY.value = newVal;
};

const handleTouchEnd = () => {
  // Reset the translate Y value to 0 after a short timeout
  resetTranslate();
};

let translateTimeout;
const resetTranslate = () => {
  if (translateTimeout) clearTimeout(translateTimeout);
  translateTimeout = setTimeout(() => {
    if (loadStreamModel.value) {
      emit('navigate', loadStreamModel.value);
    }
    translateY.value = 0;
  }, 500);
}

watch(translateY, (newVal, oldVal) => {
  if (newVal > props.scrollThreshhold) {
    loadStreamModel.value = 'NEXT';
  } else if (newVal < props.scrollThreshhold * -1) {
    loadStreamModel.value = 'PREV';
  } else {
    loadStreamModel.value = undefined;
  }
});

const goToPage = (pageIndex) => {
  currentPage.value = pageIndex;
};

onMounted(() => {
  document.body.style.overflow = 'hidden';
});
</script>