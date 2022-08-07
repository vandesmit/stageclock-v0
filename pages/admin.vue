<script setup>
import { nanoid } from "nanoid"

const listening = ref(0)
const isEditable = ref(false)
const isClockVisible = ref(true)
const cueDefaults = {
  description: 'New item',
  duration: 300,
  type: 'continue',
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

const setSecondsRemaining = seconds => secondsRemaining.value = seconds
const setCurrentCueId = id => currentCueId.value = id
const setIsOverTime = overTime => isOverTime.value = overTime
const toggleIsEditable = () => isEditable.value = !isEditable.value

const getCuePercentage = (cue) => {
  const remaining = cue.id === currentCueId.value && cue.startedAt ? secondsRemaining.value : cue.durationRemaining
  const percentage = (cue.duration - remaining) / cue.duration * 100
  console.log(cue.description, { percentage, remaining, typeof: typeof remaining })

  if (percentage > 100) return 100
  if (!percentage || typeof remaining !== 'number') return 0
  return percentage
}
</script>
<template>
  <div class="min-h-screen w-screen bg-gray-900">
    <div class="p-2 pb-12">
      <Clock
        v-show="isClockVisible"
        @seconds-remaining="setSecondsRemaining"
        @current-cue-id="setCurrentCueId"
        @is-over-time="setIsOverTime"
      />
      <template v-if="isEditable">
        <div v-if="cueList.length" class="cue-list divide-y divide-slate-700 mt-8">
          <div v-for="(cue, key) in cueList" :key="`edit-${cue.id}`" class="flex py-3 px-1">
            <div class="flex flex-col">
              <input v-model="cueList[key].description"/>
              <div class="flex">
                <select v-model="cueList[key].type">
                  <option v-for="(key, value) in cueTypeOptions" :key="key" :value="value">{{ value }}</option>
                </select>
                <input v-model="cueList[key].duration" type="number">
                <input v-model="cueList[key].durationRemaining" type="number">
              </div>
            </div>
            <button @click="deleteCue(cue.id)">DEL</button>
          </div>
        </div>
        <button
          @click="createCue"
          class="btn"
        >
          ADD CUE
        </button>
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
              <div>{{ cue.duration }}</div>
              <div>{{ cue.durationRemaining }}</div>
            </div>
            <div>
              <template v-if="!cue.startedAt">
                <button
                  v-if="!cue.durationRemaining"
                  @click="startCue(cue.id)"
                  class="btn btn-green btn-action"
                >
                  {{ cue.durationRemaining === 0 ? 'Restart' : 'Start' }}
                </button>
                <template v-else>
                  <button
                    @click="stopCue(cue.id)"
                    class="btn btn-orange btn-action"
                  >
                    Reset
                  </button>
                  <button
                    @click="startCue(cue.id)"
                    class="btn btn-green btn-action"
                  >
                    Resume
                  </button>
                </template>
              </template>
              <template v-else>
                <button 
                  @click="stopCue(cue.id)"
                  class="btn btn-orange btn-action"
                >
                  Stop
                </button>
                <button
                  @click="pauseCue(cue.id)"
                  class="btn btn-orange btn-action"
                >
                  Pause
                </button>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="sticky bg-gray-900 bottom-0">
      <div v-if="currentCueId && secondsRemaining">
        <button
          @click="stopCue(currentCueId)"
          class="btn w-[50%] rounded mb-2"
        >
          STOP
        </button>
        <button
          @click="pauseCue(currentCueId)"
          class="btn w-[50%] rounded mb-2"
        >
          PAUSE
        </button>
      </div>
      <button
        v-if="isEditable"
        @click="() => {toggleIsEditable(); sync()}"
        class="btn w-[100%] rounded-t"
      >
        SAVE & STOP
      </button>
      <button
        v-else
        @click="toggleIsEditable"
        class="btn w-[100%] rounded-t"
      >
        EDIT CUE LIST
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
