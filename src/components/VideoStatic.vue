<template>
  <canvas ref="canvasRef" :width="width" :height="height" class="w-full h-full"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

const canvasRef = ref(null)
let animationId = null

// Use VueUse's useWindowSize to get reactive window dimensions
const { width, height } = useElementSize(canvasRef);

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  const drawStatic = () => {
    const imageData = ctx.createImageData(width.value || 300, height.value || 300)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const intensity = Math.floor(Math.random() * 256)
      data[i] = intensity     // Red
      data[i + 1] = intensity // Green
      data[i + 2] = intensity // Blue
      data[i + 3] = 255       // Alpha
    }

    ctx.putImageData(imageData, 0, 0)
    animationId = requestAnimationFrame(drawStatic)
  }

  drawStatic()
}

const stopAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
}

onMounted(() => {
  initCanvas()
})

onBeforeUnmount(() => {
  stopAnimation()
})

// Reinitialize canvas when width or height changes
watch([width, height], () => {
  stopAnimation()
  initCanvas()
})
</script>