<script setup>
import { nanoid } from "nanoid"
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

const sendAction = async (data) => {
    await $fetch( '/server-api/message', {
      method: 'POST',
      body: data
  } );
}

// const cueList = ref([])
const cueList = ref([
  {
    id: nanoid(48),
    description: 'Cue item 1',
    duration: 15,
    type: 'continue',
  },
  { 
    id: nanoid(48),
    description: 'Cue item 2',
    duration: 10,
    type: 'negative',
  },
  { 
    id: nanoid(48),
    description: 'Cue item 3',
    duration: 5,
    type: 'stop',
  }
])

const addCue = cue => cueList.value.push({
  description: 'Cue item',
  duration: 300,
  type: 'continue',
  ...cue
})

// settings for current timer
const cue = ref({
  description: 'THE FIRST CUE',
  duration: 85296,
  startedAt: 0,
  type: 'continue',
})

const secondsRemaining = ref(0)
const pausedRemaining = ref(0)

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
  <div class="flex min-h-screen w-screen flex-col bg-gray-900 text-white p-2">
    <Clock />
    <div v-if="cueList.length" class="cue-list divide-y divide-slate-700 mt-8">
      <div v-for="cue in cueList" :key="cue.id" class="cue flex">
        <div class="flex grow flex-col">
          <div class="cue-name">{{ cue.description }}</div>
          <div class="cue-type">{{ cue.type }}</div>
        </div>
        <div class="cue-duration">{{ cue.duration }}</div>
      </div>
    </div>
    <div class="flex flex-row justify-between text-xl mt-8">
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
              v-model="cue.type"
              type="radio"
              id="one"
              value="negative"
              class="m-3"
            />
            <label for="one">Continue negative</label>
          </div>
          <div class="flex">
            <input
              v-model="cue.type"
              type="radio"
              id="two"
              value="stop"
              class="m-3"
            />
            <label for="two">Stop cue</label>
          </div>
          <div class="flex">
            <input
              v-model="cue.type"
              type="radio"
              id="three"
              value="continue"
              class="m-3"
            />
            <label for="three">Auto continue next cue</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
