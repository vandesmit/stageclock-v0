<script setup>
const emit = defineEmits(['secondsRemaining', 'currentCueId'])

const listening = ref(0)
const cueList = ref([])

// const cue = computed(() => cueList.value.find(c => c.startedAt) || cueList.value.find(c => c.durationRemaining) || cueList.value[0] || {} )
const cue = computed(() => cueList.value.find(c => c.startedAt))

watch(cue, value => emit('currentCueId', value && value.id))

const now = () => new Date().getTime() / 1000

if (!listening.value && typeof EventSource !== 'undefined') {
  const events = new EventSource('/server-api/sync')

  // watch for events
  events.onmessage = ({ data }) => {
    const messageBag = JSON.parse(data)

    console.log('STREAM: ', messageBag)

    // set new cue list
    if (messageBag.cueList) {
      cueList.value = messageBag.cueList
    }

    if (messageBag.log) {
      console.log(messageBag.log)
    }
  }

  listening.value = true
}

const syncCueList = async (data) => {
  await $fetch( '/server-api/cue-list', {
    method: 'POST',
    body: {
      cueList: cueList.value
    }
  })
}

const settings = reactive({
  hideClock: false,
})

const updateCue = async (newCueValues) => {
  const cueKey = newCueValues.id && cueList.value.findIndex(cueListItem => {
    return cueListItem.id === newCueValues.id
  })
  if (typeof cueKey === 'undefined' || cueKey < 0) {
    return
  }
  cueList.value[cueKey] = await {
    ...cueList.value[cueKey],
    ...newCueValues
  }

  syncCueList()
}

const startNextCue = () => {
  secondsRemaining.value = 0 
  timer.overTime = false
  const currentKey = cueList.value.findIndex(item => item.id === cue.value.id)
  const nextKey = currentKey + 1

  const nextCue = cueList.value[nextKey]

  if (nextCue) {
    cueList.value[nextKey].startedAt = now()
    cueList.value[currentKey].startedAt = null
  } else {
    cueList.value[currentKey].type = 'stop'
  }

  syncCueList()
}

// get single digit without sign and return with leading zero
const checkSingleDigit = digit => ('0' + Math.abs(digit)).slice(-2)

const clock = reactive({
  hours: '00',
  minutes: '00',
  seconds: '00',
})

const setClock = (date) => {
  clock.hours = checkSingleDigit(date.getHours())
  clock.minutes = checkSingleDigit(date.getMinutes())
  clock.seconds = checkSingleDigit(date.getSeconds())
}

const secondsRemaining = ref(0)
const timer = reactive({
  hours: '00',
  minutes: '00',
  seconds: '00',
  overTime: false,
})

const setTimer = (date) => {
  const {
    id,
    duration,
    durationRemaining,
    startedAt,
    type,
  } = cue.value || {}

  let calculatedRemaining = durationRemaining || duration || 0
  
  // calculate remaining time in seconds
  if (startedAt) {
    calculatedRemaining = parseInt(startedAt) + parseInt(calculatedRemaining) - parseInt(date.getTime() / 1000)
  }

  // check if remaining time changed
  if (calculatedRemaining === secondsRemaining.value) {
    return
  }
  secondsRemaining.value = calculatedRemaining

  // if over time
  if (duration && startedAt && secondsRemaining.value <= 0) {
    switch(type) {
      case 'negative':
        timer.overTime = true
        break
      case 'stop':
        updateCue({
          id,
          startedAt: 0,
          durationRemaining: 0,
        })
        break
      case 'continue':
        updateCue({
          id,
          startedAt: 0,
          durationRemaining: 0,
        })
        startNextCue()
        break
      default:
        timer.overTime = true
        break
    }
  } else {
    timer.overTime = false
  }
  emit('secondsRemaining', secondsRemaining.value)

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
</script>
<template>
<div class="flex h-[100%] w-[100%] flex-col justify-between bg-gray-900 text-white">
  <div
    v-if="timer"
    class="font-mono text-[20vw] leading-none text-center"
    :class="{
      'text-red-500': timer.overTime,
      'text-gray-800': !cue,
    }"
  >{{ timer.hours }}:{{ timer.minutes }}:{{ timer.seconds }}</div>
  <div class="text-[5vw] leading-none text-center mt-2">
    {{ cue && cue.description && cue.description || '-' }}
  </div>
  <div
    v-if="clock && !settings.hideClock"
    class="font-mono text-[10vw] leading-none text-right text-gray-600 mt-2"
  >{{ clock.hours }}:{{ clock.minutes }}:{{ clock.seconds }}</div>
</div>
</template>