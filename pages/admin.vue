<script setup>
import { nanoid } from "nanoid"

const listening = ref(0)
const isEditable = ref(false)
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
  const events = new EventSource('/server-api/sync')

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
  await $fetch( '/server-api/cue-list', {
    method: 'POST',
    body: {
      cueList: cueList.value
    }
  })
}

const cueList = ref([])

// Add a cue to the cue list
const addCue = (cue) => {
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
    addCue(cue)
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

// timer value in seconds (can be negative)
const secondsRemaining = ref(0)

// current timer cue id
const currentCueId = ref(null)

const setSecondsRemaining = seconds => secondsRemaining.value = seconds
const setCurrentCueId = id => currentCueId.value = id
const toggleIsEditable = () => isEditable.value = !isEditable.value

/**
 * NOTES
 * 
 * 
 * Features
 * * re-order
 * * default list
 */
</script>
<template>
  <div class="min-h-screen w-screen bg-gray-900">
    <div class="p-2 pb-12">
      <Clock
        @seconds-remaining="setSecondsRemaining"
        @current-cue-id="setCurrentCueId"
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
          @click="addCue"
          class="btn"
        >
          ADD CUE
        </button>
      </template>
      <template v-else>
        <div v-if="cueList.length" class="cue-list divide-y divide-slate-700 mt-8  text-white">
          <div v-for="cue in cueList" :key="cue.id" class="flex py-3 px-1">
            <div class="flex grow flex-col">
              <div class="cue-name">{{ cue.description }}</div>
              <div class="flex justify-items-stretch">
                <div class="basis-1/3">{{ cueTypeOptions[cue.type] && cueTypeOptions[cue.type] }}</div>
                <div class="basis-1/3">{{ cue.duration }}</div>
                <div class="basis-1/3">{{ cue.durationRemaining }}</div>
              </div>
            </div>
            <div>
              <button
                v-if="!cue.startedAt && !cue.durationRemaining"
                @click="startCue(cue.id)"
                class="btn btn-green btn-action"
              >
                {{ cue.durationRemaining === 0 ? 'Restart' : 'Start' }}
              </button>
              <button 
                v-else
                @click="stopCue(cue.id)"
                class="btn btn-orange btn-action"
              >
                {{ cue.startedAt ? 'Stop' : 'Reset' }}
              </button>
              <button
                v-if="!cue.startedAt && cue.durationRemaining > 0"
                @click="startCue(cue.id)"
                class="btn btn-green btn-action"
              >
                Resume
              </button>
              <button
                v-else-if="cue.startedAt"
                @click="pauseCue(cue.id)"
                class="btn btn-orange btn-action"
              >
                Pause
              </button>
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
</style>
