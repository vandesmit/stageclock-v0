<script setup>
const listening = ref(0)

const now = () => new Date().getTime() / 1000

if (!listening.value && typeof EventSource !== 'undefined') {
  const events = new EventSource('/server-api/messages')

  events.onmessage = (event) => {
    const message = JSON.parse(event.data)
    console.log({ message })
    if ('cue' in message) {
        cue.value = {
          ...cue.value,
          ...message.cue
        }
    }
    if ('pausedRemaining' in message) {
      pausedRemaining.value = message.pausedRemaining
    }
  }

  listening.value = true
}

const settings = reactive({
  hideClock: false,
})

const clock = reactive({
  hours: '00',
  minutes: '00',
  seconds: '00',
})

// settings for current timer
const cue = ref({
  duration: 85296,
  startedAt: 0,
  description: 'THE FIRST CUE',
  whenFinished: 'continue',
})

const timer = reactive({
  hours: '00',
  minutes: '00',
  seconds: '00',
  overTime: false,
})

const startNextCue = () => {
  secondsRemaining.value = null
  timer.overTime = false

  cue.value = {
    duration: 30,
    startedAt: now(),
    description: 'THE SECOND CUE',
    whenFinished: 'negative',
  }
}

const secondsRemaining = ref(0)
const pausedRemaining = ref(0)

// get single digit without sign and return with leading zero
const checkSingleDigit = digit => ('0' + Math.abs(digit)).slice(-2)

const setClock = (date) => {
  clock.hours = checkSingleDigit(date.getHours())
  clock.minutes = checkSingleDigit(date.getMinutes())
  clock.seconds = checkSingleDigit(date.getSeconds())
}

const setTimer = (date) => {
  const {
    duration = 0,
    startedAt,
    whenFinished
  } = cue.value

  secondsRemaining.value = pausedRemaining.value || duration || 0
  
  // calculate remaining time in seconds
  if (startedAt) {
    secondsRemaining.value = parseInt(startedAt) + parseInt(pausedRemaining.value || duration) - parseInt(date.getTime() / 1000)
  }

  // if over time
  if (duration && startedAt && secondsRemaining.value <= 0) {
    switch(whenFinished) {
      case 'negative':
        timer.overTime = true
        break
      case 'stop':
        secondsRemaining.value = 0
        break
      case 'continue':
        secondsRemaining.value = 0
        startNextCue()
        break
      default:
        timer.overTime = true
        break
    }
  } else {
    timer.overTime = false
  }

  // calculate seperate times
  const hours = parseInt(secondsRemaining.value / 3600)
  const minutes = parseInt(secondsRemaining.value / 60) - hours * 60
  const seconds = parseInt(secondsRemaining.value) - minutes * 60 - hours * 3600

  // set times
  timer.hours = checkSingleDigit(hours)
  timer.minutes = checkSingleDigit(minutes)
  timer.seconds = checkSingleDigit(seconds)
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
<div class="flex h-[100%] w-[100%] flex-col justify-between bg-gray-900 text-white">
  <div
    class="font-mono text-[20vw] leading-none text-center"
    :class="{
      'text-red-500': timer.overTime
    }"
  >{{ timer.hours }}:{{ timer.minutes }}:{{ timer.seconds }}</div>
  <div class="text-[5vw] leading-none text-center mt-2">{{ cue.description }}</div>
  <div
    v-if="!settings.hideClock"
    class="font-mono text-[10vw] leading-none text-right text-gray-600 mt-2"
  >{{ clock.hours }}:{{ clock.minutes }}:{{ clock.seconds }}</div>
</div>
</template>