<script setup>
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
    class="h-full w-full bg-gray-900 text-white p-2"
    @click="toggleFullscreen"
  >
    <timer-clock />
  </div>
</template>
