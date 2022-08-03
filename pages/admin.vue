<script setup>
import { nanoid } from "nanoid"
const listening = ref(0)
const isEditable = ref(true)

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

const cueList = ref([])

const addCue = (cue) => {
  cueList.value.push({
    id: nanoid(48),
    description: 'New item',
    duration: 300,
    type: 'continue',
    ...cue
  })
  syncCueList()
}

const updateCue = async (cue) => {
  const cueKey = cue.id && cueList.value.findIndex(cueListItem => {
    return cueListItem.id === cue.id
  })
  if (typeof cueKey === 'undefined' || cueKey < 0) {
    console.warn('didn\'t find cue by key to update, so adding new cue')
    addCue(cue)
  }
  cueList.value[cueKey] = await {
    ...cueList.value[cueKey],
    ...cue
  }

  syncCueList()
}

const startCue = (id) => {
  // get start time
  const startedAt = now()

  // Pause all cues
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
const pauseCue = (id) => {
  updateCue({
    id,
    startedAt: 0,
    durationRemaining: secondsRemaining.value
  })
}

const stopCue = (id) => {
  updateCue({
    id,
    startedAt: 0,
    durationRemaining: 0,
  })
}

const secondsRemaining = ref(0)
const currentCueId = ref(null)

const setSecondsRemaining = seconds => secondsRemaining.value = seconds

const setCurrentCueId = (id) => {
  currentCueId.value = id
  console.log('setCurrentCueId', id)
}

const toggleEditShow = () => isEditable.value = !isEditable.value

/**
 * NOTES
 * 
 * 
 * Features
 * * re-order
 * * default list
 * * save and load list in local json 
 */
</script>
<template>
  <div>
    <div class="flex min-h-screen w-screen flex-col bg-gray-900 text-white p-2 pb-12">
      <!-- :cue-list="cueList" -->
      <Clock
        :cue-list="cueList"
        @seconds-remaining="setSecondsRemaining"
        @current-cue-id="setCurrentCueId"
      />

      <div v-if="cueList.length" class="cue-list divide-y divide-slate-700 mt-8">
        <div v-for="cue in cueList" :key="cue.id" class="flex py-3 px-1">
          <div class="flex grow flex-col">
            <div class="cue-name">{{ cue.description }}</div>
            <div class="flex justify-items-stretch">
              <div class="basis-1/3">{{ cue.type }}</div>
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
              v-else-if="!cue.startedAt && cue.durationRemaining > 0"
              @click="startCue(cue.id)"
              class="btn btn-green btn-action"
            >
              Resume
            </button>
            <button
              v-else-if="cue.startedAt && secondsRemaining >= 0"
              @click="pauseCue(cue.id)"
              class="btn btn-orange btn-action"
            >
              Pause
            </button>
            <button
              v-else
              @click="stopCue(cue.id)"
              class="btn btn-orange btn-action"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
      <template v-if="isEditable">
        <button
          @click="addCue"
          class="btn"
        >
          ADD CUE
        </button>
      </template>
    </div>
    <button
      @click="toggleEditShow"
      class="btn sticky bottom-0 w-[100%]"
    >
      {{ isEditable ? 'STOP EDITING' : 'START EDITING'}}
    </button>
  </div>
</template>
<style scoped lang="scss">
.btn {
  @apply font-bold py-2 px-4 rounded bg-blue-500 text-white;

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
