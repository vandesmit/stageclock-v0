<script setup lang="ts">
const emit = defineEmits(['secondsRemaining', 'currentCueId', 'isOverTime'])

const database = useDatabase()
const {
  currentCue,
  // current: currentCue = {},
  lastActiveId: lastActiveCueId,
  hasLongCues,
  sync
} = database
const clock = useClock()
const timer = useTimer(database)

watch(currentCue, (value) => {
  emit('currentCueId', value && value.id)
  if (value && lastActiveCueId.value !== value.id) {
    lastActiveCueId.value = value.id
    sync()
  }
})

// update clock & timer
setInterval(() => {
  clock.update()
  timer.update()

  emit('isOverTime', timer.overTime)
  emit('secondsRemaining', timer.remaining)
}, 100)
</script>
<template>
  <div class="flex w-full h-full flex-col justify-between bg-gray-800 text-white py-5 px-6 rounded-md">
    <div
      v-if="timer"
      class="font-mono text-3xl text-center"
      :class="{
        'text-red-500': timer.overTime,
        'text-gray-400': !currentCue,
      }"
    >
      <div v-show="hasLongCues" class="inline">
        {{ timer.hours }}
        <span>:</span>
      </div>
      {{ timer.minutes }}
      <span>:</span>
      {{ timer.seconds }}
    </div>
    <div class="text-xl text-center mt-5">
      {{ currentCue && currentCue.description || '-' }}
    </div>
    <div
      v-if="!clock.isHidden"
      class="font-mono text-lg text-right text-gray-400 mt-5"
    >
      {{ clock.hours }}
      <span>:</span>
      {{ clock.minutes }}
      <span>:</span>
      {{ clock.seconds }}
    </div>
  </div>
</template>
