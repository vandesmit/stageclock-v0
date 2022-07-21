<script setup>
const listening = ref(0)

const now = () => new Date().getTime() / 1000

if (!listening.value) {
  const events = new EventSource('http://localhost:3005/api/messages');
  console.log('listening')

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

const sendAction = async (data) => {
    await $fetch( 'http://localhost:3005/api/message', {
      method: 'POST',
      body: data
  } );
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

const startCue = () => {
  sendAction({ cue: { startedAt: now() } })
  // cue.value.startedAt = now()
}

const pauseCue = () => {
  sendAction({
    cue: { startedAt: 0 },
    pausedRemaining: secondsRemaining.value
  })
  // cue.value.startedAt = 0
  // pausedRemaining.value = secondsRemaining.value
}

const resumeCue = () => {
  sendAction({ cue: { startedAt: now() } })
  // cue.value.startedAt = now()
}

const cancelCue = () => {
  sendAction({
    cue: { startedAt: 0 },
    pausedRemaining: 0
  })
  // cue.value.startedAt = 0
  // pausedRemaining.value = null
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
      class="font-mono text-[20vw] leading-none text-center"
      :class="{
        'text-red-500': timer.overTime
      }"
    >{{ timer.hours }}:{{ timer.minutes }}:{{ timer.seconds }}</div>
    <div class="text-[5vw] leading-none text-center">{{ cue.description }}</div>
    <div class="flex justify-between content-end">
      <div>
        <div class="grid gap-4 content-end text-2xl">
          Current Cue info
          <input
            v-model="cue.duration"
            type="number"
            class="text-black rounded-lg px-4"
            placeholder="Duration"
          >
          <input 
            v-model="cue.description"
            type="text"
            class="text-black rounded-lg px-4"
            placeholder="Description"
          >
          <div>When cue is finished:</div>
          <div class="flex">
            <input
              v-model="cue.whenFinished"
              type="radio"
              id="one"
              value="negative"
              class="m-3"
            />
            <label for="one">Continue negative</label>
          </div>
          <div class="flex">
            <input
              v-model="cue.whenFinished"
              type="radio"
              id="two"
              value="stop"
              class="m-3"
            />
            <label for="two">Stop cue</label>
          </div>
          <div class="flex">
            <input
              v-model="cue.whenFinished"
              type="radio"
              id="three"
              value="continue"
              class="m-3"
            />
            <label for="three">Auto continue next cue</label>
          </div>
          <div class="flex flex-row justify-between text-xl">
            <button
              @click="cancelCue"
              class="rounded-full border-2 h-24 w-24"
              :class="[
                pausedRemaining || cue.startedAt ? 'bg-gray-800 text-gray-100 border-gray-400' : 'bg-gray-500 text-gray-400 border-gray-400'
              ]"
            >
              Cancel
            </button>
            <button
              v-if="!pausedRemaining && !cue.startedAt"
              @click="startCue"
              class="rounded-full border-2 h-24 w-24 bg-green-800 text-green-100 border-green-400"
            >
              Start
            </button>
            <button
              v-if="cue.startedAt"
              @click="pauseCue"
              class="rounded-full border-2 h-24 w-24 bg-orange-800 text-orange-100 border-orange-400"
            >
              Pause
            </button>
            <button
              v-if="!cue.startedAt && pausedRemaining"
              @click="resumeCue"
              class="rounded-full border-2 h-24 w-24 bg-green-800 text-green-100 border-green-400"
            >
              Resume
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="!settings.hideClock"
        class="font-mono text-[10vw] leading-none text-right text-gray-600 flex content-end justify-end"
      >{{ clock.hours }}:{{ clock.minutes }}:{{ clock.seconds }}</div>
    </div>
  </div>
</template>
