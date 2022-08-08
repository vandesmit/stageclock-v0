<script setup>
import { nanoid } from "nanoid"

const listening = ref(0)
const isEditable = ref(false)
const isClockVisible = ref(true)
const cueDefaults = {
  description: 'cue item',
  duration: 0,
  type: 'negative',
}
const cueTypeOptions = {
  'continue': 'Continue',
  'negative': 'Go negative',
  'stop': 'Stop',
}

const now = () => new Date().getTime() / 1000

// Start listening for new events
if (!listening.value && typeof EventSource !== 'undefined') {
  const events = new EventSource('/api/sync')

  // set callback for events
  events.onmessage = ({ data }) => {
    const messageBag = JSON.parse(data)

    // set new cue list
    if (messageBag.cueList) {
      cueList.value = messageBag.cueList
    }

    // log message if requested
    if (messageBag.log) {
      console.log(messageBag.log)
    }
  }

  listening.value = true
}

// sync cue list with server-side
const sync = async () => {
  await $fetch( '/api/cue-list', {
    method: 'POST',
    body: {
      cueList: cueList.value
    }
  })
}

const cueList = ref([])

// Add a cue to the cue list
const createCue = (cue) => {
  cueList.value.push({
    id: nanoid(48),
    ...cueDefaults,
    ...cue,
  })
  sync()
}

// update a cue from the cue list
const updateCue = (cue) => {
  const cueKey = cue.id && cueList.value.findIndex(cueListItem => cueListItem.id === cue.id)

  if (typeof cueKey === 'undefined' || cueKey < 0) {
    console.warn('didn\'t find cue by key to update, so adding new cue')
    createCue(cue)
  }
  cueList.value[cueKey] = {
    ...cueList.value[cueKey],
    ...cue
  }

  sync()
}

// delete a cue from the cue list
const deleteCue = (id) => {
  if (confirm('Are you sure you want to delete a cue?')) {
    cueList.value = cueList.value.filter(cue => cue.id !== id)
  }
}

// start timer with new cue
const startCue = (id) => {
  // get start time
  const startedAt = now()

  // Pause all cues (fallback mechanism)
  cueList.value.forEach((value, key) => {
    if (value.startedAt) {
      cueList.value[key].startedAt = null
      cueList.value[key].durationRemaining = secondsRemaining.value
    }
  })

  // start cue
  updateCue({
    id,
    startedAt,
  })
}

// pause timer for current cue
const pauseCue = id => updateCue({
  id,
  startedAt: 0,
  durationRemaining: secondsRemaining.value
})

// stop timer for current cue
const stopCue = id => updateCue({
  id,
  startedAt: 0,
  durationRemaining: null,
})

const secondsRemaining = ref(0)
const currentCueId = ref(null)
const isOverTime = ref(false)

const changeSecondsRemaining = seconds => secondsRemaining.value = seconds
const setCurrentCueId = id => currentCueId.value = id
const setIsOverTime = overTime => isOverTime.value = overTime
const toggleIsEditable = () => isEditable.value = !isEditable.value

const getCuePercentage = (cue) => {
  const remaining = cue.id === currentCueId.value && cue.startedAt ? secondsRemaining.value : cue.durationRemaining
  const percentage = (cue.duration - remaining) / cue.duration * 100
  // console.log(cue.description, { percentage, remaining, typeof: typeof remaining })

  if (percentage > 100) return 100
  if (!percentage || typeof remaining !== 'number') return 0
  return percentage
}

const checkSingleDigit = digit => ('0' + Math.abs(digit)).slice(-2)

const getHours = (seconds = 0) => (parseInt(parseInt(seconds) / 3600))
const getMinutes = (seconds = 0) => (parseInt(parseInt(seconds) / 60) - parseInt(parseInt(seconds) / 3600) * 60)
const getSeconds = (seconds = 0) => (parseInt(seconds) - (parseInt(parseInt(seconds) / 60) - parseInt(parseInt(seconds) / 3600) * 60) * 60 - parseInt(parseInt(seconds) / 3600) * 3600)

const convertSecondsToTime = (value) => {
  if (typeof value !== 'number') return `00:00`
  const hours = parseInt(value / 3600)
  const minutes = parseInt(value / 60) - hours * 60
  const seconds = parseInt(value) - minutes * 60 - hours * 3600
  let text = hours ? `${checkSingleDigit(hours)}:` : ''
  return `${text}${checkSingleDigit(minutes)}:${checkSingleDigit(seconds)}`
}

const changeHours = (x, y = 0, z = 0) => { cueList.value[x].duration = parseInt(cueList.value[x].duration) + ((parseInt(y) - parseInt(z)) * 3600) }
const changeMinutes = (x, y = 0, z = 0) => { cueList.value[x].duration = parseInt(cueList.value[x].duration) + ((parseInt(y) - parseInt(z)) * 60) }
const changeSeconds = (x, y = 0, z = 0) => { cueList.value[x].duration = parseInt(cueList.value[x].duration) + parseInt(y) - parseInt(z) }

</script>
<template>
  <div class="min-h-screen w-screen bg-gray-900">
    <div class="pb-12 flex flex-col items-center">
      <Clock
        v-show="isClockVisible"
        @seconds-remaining="changeSecondsRemaining"
        @current-cue-id="setCurrentCueId"
        @is-over-time="setIsOverTime"
      />
      <template v-if="isEditable">
        <div class="cue-list divide-y divide-slate-700 mt-8 w-full max-w-sm">
          <div v-for="(cue, key) in cueList" :key="`edit-${cue.id}`" class="py-3 w-full">
            <div class="flex flex-wrap -mx-3 mb-0">
              <div class="w-2/3 px-3">
                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="description">
                  Description
                </label>
                <input
                  v-model="cueList[key].description"
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-grey-200 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  id="description"
                  type="text"
                  placeholder="Cue name"
                >
              </div>
              <div class="w-1/3 px-3">
                <div class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">
                  Actions
                </div>
                <div class="relative">
                  <button @click="deleteCue(cue.id)" class="btn rounded">Delete</button>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap -mx-3 mb-0">
              <div class="w-1/2 px-3 mb-2 md:mb-0">
                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="duration-hours">
                  Duration
                </label>
                <input
                  :value="getHours(cue.duration)"
                  @input="(e) => changeHours(key, e.target.value, getHours(cue.duration))"
                  class="w-12 text-right appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-0 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number">
                <span class="text-white"> : </span>
                <input
                  :value="getMinutes(cue.duration)"
                  @input="e => changeMinutes(key, e.target.value, getMinutes(cue.duration))"
                  class="w-12 text-right appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-0 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number">
                <span class="text-white"> : </span>
                <input
                  :value="getSeconds(cue.duration)"
                  @input="e => changeSeconds(key, e.target.value, getSeconds(cue.duration))"
                  class="w-12 text-right appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-0 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number">

              </div>
              <div class="w-1/2 px-3 mb-2 md:mb-0">
                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="type">
                  When finished
                </label>
                <div class="relative">
                  <select
                    v-model="cueList[key].type"
                    class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="type"
                  >
                    <option v-for="(value, key) in cueTypeOptions" :key="key" :value="key">{{ value }}</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="py-3 w-full">
            <button
              @click="createCue"
              class="btn"
            >
              Add a cue
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-if="cueList.length"
          class="cue-list divide-y divide-slate-700 mt-8 text-white"
          :class="{
            'over-time': isOverTime,
          }"
        >
          <div
            v-for="cue in cueList"
            :key="cue.id"
            class="flex py-3 px-1 cue"
            :class="{
              'current': cue.id === currentCueId,
              'active': cue.id === currentCueId && cue.startedAt,
            }"
            :style="{
              '--background-width': `${ getCuePercentage(cue) }%`,
            }"
          >
            <div class="flex grow space-x-4">
              <div class="grow">{{ cue.description }}</div>
              <div>{{ cueTypeOptions[cue.type] && cueTypeOptions[cue.type] }}</div>
              <div>{{ convertSecondsToTime(cue.duration) }}</div>
            </div>
            <div>
              <template v-if="!cue.startedAt">
                <button
                  v-if="!cue.durationRemaining"
                  @click="startCue(cue.id)"
                  class="btn btn-green btn-icon btn-icon--fat rounded ml-10"
                  :aria-label="`${cue.durationRemaining === 0 ? 'Restart' : 'Start'} ${cue.description}.`"
                  :title="cue.durationRemaining === 0 ? 'restart' : 'start'"
                >
                  <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M134.996 68.6548C145.864 74.2324 145.864 89.7676 134.996 95.3452L47.8488 140.069C37.8669 145.192 26 137.944 26 126.724L26 37.276C26 26.0563 37.8668 18.808 47.8488 23.9308L134.996 68.6548Z" stroke="currentColor" stroke-width="8"/>
                  </svg>
                </button>
                <template v-else>
                  <div class="inline-flex">
                    <button
                      @click="stopCue(cue.id)"
                      class="btn btn-orange btn-icon btn-icon--fat rounded-l"
                      :aria-label="`Reset ${cue.description}.`"
                      title="reset"
                    >
                      <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M60.6047 70.0799C52.7454 76.0834 52.7454 87.9166 60.6047 93.9201L118.394 138.064C128.266 145.605 142.5 138.566 142.5 126.144L142.5 37.8556C142.5 25.4339 128.266 18.3951 118.394 25.9355L60.6047 70.0799Z" stroke="currentColor" stroke-width="8"/>
                        <rect x="24" y="22" width="30" height="120" rx="15" stroke="currentColor" stroke-width="8"/>
                      </svg>
                    </button>
                    <button
                      @click="startCue(cue.id)"
                      class="btn btn-green btn-icon btn-icon--fat rounded-r"
                      :aria-label="`Resume ${cue.description}.`"
                      title="resume"
                    >
                      <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M147.395 70.0799C155.255 76.0834 155.255 87.9166 147.395 93.9201L89.6055 138.064C79.7343 145.605 65.5 138.566 65.5 126.144L65.5 37.8556C65.5 25.4339 79.7343 18.3951 89.6055 25.9355L147.395 70.0799Z" stroke="currentColor" stroke-width="8"/>
                        <rect x="13" y="22" width="30" height="120" rx="15" stroke="currentColor" stroke-width="8"/>
                      </svg>
                    </button>
                  </div>
                </template>
              </template>
              <template v-else>
                <div class="inline-flex">
                  <button 
                    @click="stopCue(cue.id)"
                    class="btn btn-orange btn-icon btn-icon--fat rounded-l"
                    :aria-label="`Stop ${cue.description}.`"
                    title="stop"
                  >
                    <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="27" y="27" width="110" height="110" rx="15" stroke="currentColor" stroke-width="8"/>
                    </svg>
                  </button>
                  <button
                    @click="pauseCue(cue.id)"
                    class="btn btn-orange btn-icon btn-icon--fat rounded-r"
                    :aria-label="`Pause ${cue.description}.`"
                    title="pause"
                  >
                    <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="96" y="17" width="45" height="130" rx="15" stroke="currentColor" stroke-width="8"/>
                      <rect x="24" y="17" width="43.3333" height="130" rx="15" stroke="currentColor" stroke-width="8"/>
                    </svg>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="bg-gray-900">
      <button
        v-if="isEditable"
        @click="() => {toggleIsEditable(); sync()}"
        class="btn btn-icon btn-icon--lg w-[100%] rounded-t text-center"
        aria-label="Save cue list and go back."
        title="save and go back"
      >
        Done editing
        <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg" class="-mt-2">
          <rect x="44" y="51" width="87" height="87" rx="15" stroke="currentColor" stroke-width="8"/>
          <rect x="58.7798" y="71.306" width="8" height="48" rx="4" transform="rotate(-32.7755 58.7798 71.306)" fill="currentColor" stroke="currentColor" stroke-width="8"/>
          <rect x="142.536" y="33.1998" width="8" height="96" rx="4" transform="rotate(39.4617 142.536 33.1998)" fill="currentColor" stroke="currentColor" stroke-width="8"/>
        </svg>
      </button>
      <button
        v-else
        @click="toggleIsEditable"
        class="btn btn-icon btn-icon--lg w-[100%] rounded-t text-center"
        aria-label="Edit the cue list."
        title="edit cue list"
      >
        Edit
        <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg" class="-mt-2">
          <rect x="26" y="51" width="110" height="87" rx="15" stroke="currentColor" stroke-width="8"/>
          <path d="M121.137 23.5736C122.129 21.5999 124.534 20.8046 126.508 21.7971V21.7971C128.481 22.7897 129.277 25.1942 128.284 27.1678L89.6455 103.999L86.0719 102.202C84.0983 101.21 83.303 98.805 84.2955 96.8314L121.137 23.5736Z" fill="currentColor" stroke="currentColor" stroke-width="8"/>
        </svg>
      </button>
    </div>
  </div>
</template>
<style scoped lang="scss">
.btn {
  @apply font-bold py-2 px-4 bg-blue-500 text-white;

  &:hover {
    @apply bg-blue-700;
  }

  svg {
    display: inline;
    height: 1em;
    width: 1em;
  }

  &-icon--lg {
    svg {
      height: 2em;
      width: 2em;
      line-height: 1;
    }
  }
  &-icon--fat {
    svg > * {
      stroke-width: 16;
    }
  }

  &-icon {
    @apply p-3;
    line-height: 1;
  }

  &-gray {
    @apply bg-gray-300 hover:bg-gray-400 text-gray-800;

    &:hover {
      @apply bg-gray-400;
    }
  }

  &-action {
    @apply rounded-full w-24
  }

  &-green {
    @apply bg-green-800 text-green-100;

    &:hover {
      @apply bg-green-700;
    }
  }

  &-orange {
    @apply bg-orange-800 text-orange-100;

    &:hover {
      @apply bg-orange-700;
    }
  }
}
.cue {
  position: relative;
  z-index: 1;

  &:before {
    content: '';
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
    height: 100%;
    width: var(--background-width);
    @apply bg-gray-800
  }

  &.current:before {
    @apply bg-gray-600
  }

  &.active:before {
    -webkit-transition: width 1s linear 0s;
    -moz-transition: width 1s linear 0s;
    -o-transition: width 1s linear 0s;
    transition: width 1s linear 0s;
  }

      // 'text-red-500': timer.overTime,
      // 'text-gray-800': !cue,
  // &.blink:before {
	// 	animation: blinkingBackground 1s infinite;
	// }
}
.cue-list.over-time .cue.active:before {
  animation: blinkingBackground 1s infinite;
}
@keyframes blinkingBackground{
  // 0%		{ background-color: #10c018;}
  // 25%		{ background-color: #1056c0;}
  // 50%		{ background-color: #ef0a1a;}
  // 75%		{ background-color: #254878;}
  // 100%	{ background-color: #04a1d5;}
  0%    { @apply bg-gray-600 }
  // 20%   { @apply bg-gray-600 }
  50%   { @apply bg-red-500 }
  // 80%   { @apply bg-gray-600 }
  100%  { @apply bg-gray-600 }
}
</style>
