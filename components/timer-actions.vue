<script setup lang="ts">

</script>
<template>
  <div class="flex justify-evenly justify-items-stretch bg-gray-800 text-white rounded-md overflow-hidden">
    <button>
      <timer-icons href="prev" />
      prev
    </button>
    <button>
      <timer-icons href="stop" />
      stop
    </button>
    <button>
      <timer-icons href="pause" />
      pause
    </button>
    <button>
      <timer-icons href="play" />
      play
    </button>
    <button>
      <timer-icons href="reset" />
      reset
    </button>
    <button>
      <timer-icons href="next" />
      next
    </button>
  </div>
</template>
<style scoped lang="scss">
button {
  @apply flex flex-col grow items-center p-[10px];
  &:hover {
    @apply bg-gray-700;
  }
  & + & {
    @apply border-l-2 border-gray-700
  }
  svg {
    @apply mb-[4px]
  }
}
</style>
