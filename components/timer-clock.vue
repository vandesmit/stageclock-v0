<script setup>
const emit = defineEmits(['secondsRemaining', 'currentCueId', 'isOverTime'])

const cue = useCue()
const {
  current: currentCue = {},
  lastActiveId: lastActiveCueId,
  hasLongCues,
  sync
} = cue
const clock = useClock()
const timer = useTimer({ cue })

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
  <div class="flex h-[100%] w-[100%] flex-col justify-between bg-gray-900 text-white">
    <div
      v-if="timer"
      class="font-mono text-[20vw] leading-none text-center"
      :class="{
        'text-red-500': timer.overTime,
        'text-gray-800': !currentCue,
      }"
    >
      <span v-show="hasLongCues">{{ timer.hours }}:</span>{{ timer.minutes }}:{{ timer.seconds }}
    </div>
    <div class="text-[5vw] leading-none text-center mt-2">
      {{ currentCue && currentCue.description || '-' }}
    </div>
    <div
      v-if="!clock.isHidden"
      class="font-mono text-[10vw] leading-none text-right text-gray-600 mt-2"
    >
      {{ clock.hours }}:{{ clock.minutes }}:{{ clock.seconds }}
    </div>
  </div>
</template>
