<script setup>
useHead({
  title: 'Stage Clock',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit = no',
})

const fullscreen = ref(false)
const fullscreenContainer = ref(null)

const enterFullscreen = () => {
  const element = fullscreenContainer.value
  fullscreen.value = true

  element.requestFullscreen
    ? element.requestFullscreen()
    : element.msRequestFullscreen
    ? element.msRequestFullscreen()
    : element.mozRequestFullScreen
    ? element.mozRequestFullScreen()
    : element.webkitRequestFullscreen
    ? element.webkitRequestFullscreen()
    : (fullscreen.value = false)
}

const exitFullscreen = () => {
  fullscreen.value = false
  document.exitFullscreen()
}

const toggleFullscreen = () => fullscreen.value ? exitFullscreen() : enterFullscreen()
</script>
<template>
  <div
    ref="fullscreenContainer"
    class="h-screen w-screen bg-gray-900 text-white p-2"
    @click="toggleFullscreen"
  >
    <Clock />
  </div>
</template>
