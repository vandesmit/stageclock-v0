<script setup>
const clock = reactive({
  hours: '00',
  minutes: '00',
  seconds: '00',
})

// settings for current timer
const cue = reactive({
  // duration: 45296, // 12:34:56
  duration: null,
  startedAt: 0,
})

const timer = reactive({
  hours: '00',
  minutes: '00',
  seconds: '00',
  overTime: false,
})

// get single digit without sign and return with leading zero
const checkSingleDigit = digit => ('0' + Math.abs(digit)).slice(-2)

const setClock = (date) => {
  clock.hours = checkSingleDigit(date.getHours())
  clock.minutes = checkSingleDigit(date.getMinutes())
  clock.seconds = checkSingleDigit(date.getSeconds())
}

const setTimer = (date) => {
  const duration = parseInt(cue.duration || 0)
  const startedAt = cue.startedAt

  // // calculate remaining time in seconds
  // const secondsRemaining = !startedAt ? (duration || 0) : (startedAt + duration - parseInt(date.getTime() / 1000))

  let secondsRemaining = duration || 0
  
  // calculate remaining time in seconds
  if (startedAt) {
    secondsRemaining = parseInt(startedAt.getTime() / 1000) + duration - parseInt(date.getTime() / 1000)
  }

  // calculate seperate times
  const hours = parseInt(secondsRemaining / 3600)
  const minutes = parseInt(secondsRemaining / 60) - hours * 60
  const seconds = parseInt(secondsRemaining) - minutes * 60 - hours * 3600

  // set times
  timer.hours = checkSingleDigit(hours)
  timer.minutes = checkSingleDigit(minutes)
  timer.seconds = checkSingleDigit(seconds)
  timer.overTime = duration && startedAt && secondsRemaining <= 0
}

const startCue = () => {
  cue.startedAt = new Date()
}

// update clock & timer
setInterval(() => {
  const date = new Date()
  setClock(date)
  setTimer(date)
}, 100)

/**
 * NOTES
 * 
 * Timers
 * - name
 * - duration
 * - start time
 * - when finished
 *    0 - go negative
 *    1 - stop
 *    2 - auto continue
 * 
 * Interface
 * - Show clock
 * 
 * Features
 * * re-order
 * * default list
 */

</script>
<template>
  <div class="relative flex h-screen min-h-[1080px] w-screen min-w-[1920px] flex-col justify-between overflow-hidden bg-gray-900 text-white p-2">
    <div
      class="font-mono text-[380px] leading-none text-center"
      :class="{
        'text-red-500': timer.overTime
      }"
    >{{ timer.hours }}:{{ timer.minutes }}:{{ timer.seconds }}</div>
    <div class="text-[100px] leading-none text-center">Worship</div>
    <div class="flex justify-between">
      <div class="grid grid-cols-2 gap-4 content-end text-[50px]">
        <input v-model="cue.duration" type="number" class="text-black" placeholder="cue duration">
        <button @click="startCue">Start cue</button>
      </div>
      <div class="font-mono text-[200px] leading-none text-right text-gray-600">{{ clock.hours }}:{{ clock.minutes }}:{{ clock.seconds }}</div>
    </div>
  </div>
</template>
