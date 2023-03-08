<script setup>
const isEditable = ref(false)
const isClockVisible = ref(true)

const cueTypeOptions = {
  continue: 'Auto continue',
  negative: 'Go negative',
  stop: 'Stop'
}

const database = useDatabase()

const {
  createCue,
  deleteCue,
  stopCue,
  pauseCue,
  startCue,
  cueList,
  currentCue,
  startNextCue,
  startPreviousCue,
  sync
} = database
const { readableTime } = useTransform()
const timer = useTimer(database)

const secondsRemaining = ref(0)
const currentCueId = ref(null)
const isOverTime = ref(false)

const changeSecondsRemaining = seconds => (secondsRemaining.value = seconds)
const setCurrentCueId = id => (currentCueId.value = id)
const setIsOverTime = overTime => (isOverTime.value = overTime)
const toggleIsEditable = () => (isEditable.value = !isEditable.value)

const getCuePercentage = ({ id, startedAt, duration, durationRemaining }) => {
  const remaining = id === currentCueId.value && startedAt ? secondsRemaining.value : durationRemaining
  const percentage = ((duration - remaining) / duration) * 100

  if (percentage > 100) {
    return 100
  }
  if (!percentage || typeof remaining !== 'number') {
    return 0
  }
  return percentage
}

const getHours = (seconds = 0) => Math.floor(seconds / 3600)
const getMinutes = (seconds = 0) => Math.floor(seconds / 60) - getHours(seconds) * 60
const getSeconds = (seconds = 0) => seconds - getMinutes(seconds) * 60 - getHours(seconds) * 3600

const changeHours = (x, newValue = 0, oldValue = 0) => {
  cueList.value[x].duration = (cueList.value[x].duration || 0) + (parseInt(newValue) - oldValue) * 3600
}
const changeMinutes = (x, newValue = 0, oldValue = 0) => {
  cueList.value[x].duration = (cueList.value[x].duration || 0) + (parseInt(newValue) - oldValue) * 60
}
const changeSeconds = (x, newValue = '0', oldValue = 0) => {
  cueList.value[x].duration = (cueList.value[x].duration || 0) + parseInt(newValue) - oldValue
}
</script>
<template>
  <div class="min-h-full w-full">
    <div class="pb-12 flex flex-col items-center">
      <timer-clock
        v-show="isClockVisible"
        @seconds-remaining="changeSecondsRemaining"
        @current-cue-id="setCurrentCueId"
        @is-over-time="setIsOverTime"
      />
      <div
        v-if="currentCue"
        class="grid grid-cols-5 w-full bg-gray-800 text-white rounded-md m-2.5 mt-5 overflow-hidden"
      >
        <button
          class="btn btn--actionbar"
          :aria-label="`Next.`"
          title="next"
          @click="startPreviousCue(timer)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M459.5 71.41l-171.5 142.9v83.45l171.5 142.9C480.1 457.7 512 443.3 512 415.1V96.03C512 68.66 480.1 54.28 459.5 71.41zM203.5 71.41L11.44 231.4c-15.25 12.87-15.25 36.37 0 49.24l192 159.1c20.63 17.12 52.51 2.749 52.51-24.62v-319.9C255.1 68.66 224.1 54.28 203.5 71.41z" /></svg>
          Previous
        </button>
        <button
          v-if="!currentCue.startedAt"
          class="btn btn--actionbar"
          :aria-label="`Resume ${currentCue.description}.`"
          title="resume"
          @click="startCue(currentCue.id, secondsRemaining)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z" /></svg>
          Play
        </button>
        <button
          v-else
          class="btn btn--actionbar"
          :aria-label="`Pause ${currentCue.description}.`"
          title="pause"
          @click="pauseCue(currentCue.id, secondsRemaining)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M52.51 71.41C31.88 54.28 0 68.66 0 96.03v319.9c0 27.37 31.88 41.74 52.51 24.62l192-159.1c15.25-12.87 15.25-36.37 0-49.24L52.51 71.41zM352 64c-17.67 0-32.03 14.33-32.03 32v320c0 17.67 14.33 32 32 32C369.6 448 384 433.7 384 416V96C384 78.33 369.7 64 352 64zM480 64c-17.67 0-32.03 14.33-32.03 32v320c0 17.67 14.33 32 32 32C497.6 448 512 433.7 512 416V96C512 78.33 497.7 64 480 64z" /></svg>
          Pause
        </button>
        <button
          class="btn btn--actionbar"
          :aria-label="`Stop ${currentCue.description}.`"
          title="stop"
          @click="stopCue(currentCue.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M384 128v255.1c0 35.35-28.65 64-64 64H64c-35.35 0-64-28.65-64-64V128c0-35.35 28.65-64 64-64H320C355.3 64 384 92.65 384 128z" /></svg>
          Stop
        </button>
        <button
          class="btn btn--actionbar"
          :aria-label="`Next.`"
          title="next"
          @click="startNextCue(timer)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M52.51 440.6l171.5-142.9V214.3L52.51 71.41C31.88 54.28 0 68.66 0 96.03v319.9C0 443.3 31.88 457.7 52.51 440.6zM308.5 440.6l192-159.1c15.25-12.87 15.25-36.37 0-49.24l-192-159.1c-20.63-17.12-52.51-2.749-52.51 24.62v319.9C256 443.3 287.9 457.7 308.5 440.6z" /></svg>
          Next
        </button>
        <button
          class="btn btn--actionbar"
          :aria-label="`Stop ${currentCue.description}.`"
          title="stop"
          @click="stopCue(currentCue.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M468.9 32.11c13.87 0 27.18 10.77 27.18 27.04v145.9c0 10.59-8.584 19.17-19.17 19.17h-145.7c-16.28 0-27.06-13.32-27.06-27.2c0-6.634 2.461-13.4 7.96-18.9l45.12-45.14c-28.22-23.14-63.85-36.64-101.3-36.64c-88.09 0-159.8 71.69-159.8 159.8S167.8 415.9 255.9 415.9c73.14 0 89.44-38.31 115.1-38.31c18.48 0 31.97 15.04 31.97 31.96c0 35.04-81.59 70.41-147 70.41c-123.4 0-223.9-100.5-223.9-223.9S132.6 32.44 256 32.44c54.6 0 106.2 20.39 146.4 55.26l47.6-47.63C455.5 34.57 462.3 32.11 468.9 32.11z" /></svg>
          Reset
        </button>
      </div>
      <template v-if="isEditable">
        <div class="cue-list divide-y divide-slate-700 mt-8 w-full max-w-sm">
          <div v-for="({ id, duration }, key) in cueList" :key="`edit-${id}`" class="py-3 w-full">
            <div class="flex flex-wrap -mx-3 mb-0">
              <div class="w-2/3 px-3">
                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="description">
                  Description
                </label>
                <input
                  id="description"
                  v-model="cueList[key].description"
                  class="appearance-none block w-full bg-gray-200 text-gray-700 border border-grey-200 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  type="text"
                  placeholder="Cue name"
                >
              </div>
              <div class="w-1/3 px-3">
                <div class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">
                  Actions
                </div>
                <div class="relative">
                  <button class="btn rounded" @click="deleteCue(id)">
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap -mx-3 mb-0">
              <div class="w-1/2 px-3 mb-2 md:mb-0">
                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="duration-hours">
                  Duration
                </label>
                <input
                  :value="getHours(duration)"
                  class="w-12 text-right appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-0 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number"
                  @input="
                    (e) =>
                      changeHours(key, e.target.value, getHours(duration))
                  "
                >
                <span class="text-white"> : </span>
                <input
                  :value="getMinutes(duration)"
                  class="w-12 text-right appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-0 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number"
                  @input="
                    (e) =>
                      changeMinutes(
                        key,
                        e.target.value,
                        getMinutes(duration)
                      )
                  "
                >
                <span class="text-white"> : </span>
                <input
                  :value="getSeconds(duration)"
                  class="w-12 text-right appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-0 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number"
                  @input="
                    (e) =>
                      changeSeconds(
                        key,
                        e.target.value,
                        getSeconds(duration)
                      )
                  "
                >
              </div>
              <div class="w-1/2 px-3 mb-2 md:mb-0">
                <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1" for="type">
                  When finished
                </label>
                <div class="relative">
                  <select
                    id="type"
                    v-model="cueList[key].type"
                    class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  >
                    <option v-for="(label, value) in cueTypeOptions" :key="value" :value="value">
                      {{ label }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="py-3 w-full">
            <button class="btn" @click="createCue">
              Add a cue
            </button>
          </div>
        </div>
      </template>
      <template v-else-if="cueList.length">
        <div
          v-for="c in cueList"
          :key="c.id"
          class="flex cue overflow-hidden justify-between w-full bg-gray-800 text-white py-[20px] px-[24px] rounded-md m-2.5"
          :class="{
            current: c.id === currentCueId,
            active: c.id === currentCueId && c.startedAt,
            'over-time': isOverTime,
          }"
          :style="{
            '--background-width': `${getCuePercentage(c)}%`,
          }"
          @click="startCue(c.id, secondsRemaining)"
        >
          <div>
            <div>
              {{ c.description }}
            </div>
            <cue-label :type="c.type" />
          </div>
          <div class="text-right">
            <div>
              {{ readableTime(c.duration) }}
            </div>
            <div>
              {{ readableTime(Math.ceil(c.duration - (currentCueId === c.id ? secondsRemaining : c.durationRemaining))) }}
            </div>
          </div>
        </div>
        <div
          class="cue-list divide-y divide-slate-700 mt-8 text-white"
          :class="{
            'over-time': isOverTime,
          }"
        >
          <b>old cue system</b>
          <div class="flex py-3 px-1">
            <div class="w-[90px] pl-[10px] text-right">
              Actions
            </div>
            <div class="grow">
              Cue for
            </div>
            <div class="w-[115px] pl-[10px]">
              When finished
            </div>
            <div class="w-[80px] pl-[10px] text-right">
              Duration
            </div>
          </div>
          <div
            v-for="c in cueList"
            :key="c.id"
            class="flex py-3 px-1 cue"
            :class="{
              current: c.id === currentCueId,
              active: c.id === currentCueId && c.startedAt,
            }"
            :style="{
              '--background-width': `${getCuePercentage(c)}%`,
            }"
          >
            <div class="w-[90px]">
              <template v-if="!c.startedAt">
                <button
                  v-if="!c.durationRemaining"
                  class="btn btn-green btn-icon btn-icon--fat rounded ml-10"
                  :aria-label="`${c.durationRemaining === 0 ? 'Restart' : 'Start'
                  } ${c.description}.`"
                  :title="c.durationRemaining === 0 ? 'restart' : 'start'"
                  @click="startCue(c.id, secondsRemaining)"
                >
                  <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M134.996 68.6548C145.864 74.2324 145.864 89.7676 134.996 95.3452L47.8488 140.069C37.8669 145.192 26 137.944 26 126.724L26 37.276C26 26.0563 37.8668 18.808 47.8488 23.9308L134.996 68.6548Z"
                      stroke="currentColor"
                      stroke-width="8"
                    />
                  </svg>
                </button>
                <template v-else>
                  <div class="inline-flex">
                    <button
                      class="btn btn-orange btn-icon btn-icon--fat rounded-l"
                      :aria-label="`Reset ${c.description}.`"
                      title="reset"
                      @click="stopCue(c.id)"
                    >
                      <svg
                        width="164"
                        height="164"
                        viewBox="0 0 164 164"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M60.6047 70.0799C52.7454 76.0834 52.7454 87.9166 60.6047 93.9201L118.394 138.064C128.266 145.605 142.5 138.566 142.5 126.144L142.5 37.8556C142.5 25.4339 128.266 18.3951 118.394 25.9355L60.6047 70.0799Z"
                          stroke="currentColor"
                          stroke-width="8"
                        />
                        <rect
                          x="24"
                          y="22"
                          width="30"
                          height="120"
                          rx="15"
                          stroke="currentColor"
                          stroke-width="8"
                        />
                      </svg>
                    </button>
                    <button
                      class="btn btn-green btn-icon btn-icon--fat rounded-r"
                      :aria-label="`Resume ${c.description}.`"
                      title="resume"
                      @click="startCue(c.id, secondsRemaining)"
                    >
                      <svg
                        width="164"
                        height="164"
                        viewBox="0 0 164 164"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M147.395 70.0799C155.255 76.0834 155.255 87.9166 147.395 93.9201L89.6055 138.064C79.7343 145.605 65.5 138.566 65.5 126.144L65.5 37.8556C65.5 25.4339 79.7343 18.3951 89.6055 25.9355L147.395 70.0799Z"
                          stroke="currentColor"
                          stroke-width="8"
                        />
                        <rect
                          x="13"
                          y="22"
                          width="30"
                          height="120"
                          rx="15"
                          stroke="currentColor"
                          stroke-width="8"
                        />
                      </svg>
                    </button>
                  </div>
                </template>
              </template>
              <template v-else>
                <div class="inline-flex">
                  <button
                    class="btn btn-orange btn-icon btn-icon--fat rounded-l"
                    :aria-label="`Stop ${c.description}.`"
                    title="stop"
                    @click="stopCue(c.id)"
                  >
                    <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect
                        x="27"
                        y="27"
                        width="110"
                        height="110"
                        rx="15"
                        stroke="currentColor"
                        stroke-width="8"
                      />
                    </svg>
                  </button>
                  <button
                    class="btn btn-orange btn-icon btn-icon--fat rounded-r"
                    :aria-label="`Pause ${c.description}.`"
                    title="pause"
                    @click="pauseCue(c.id, secondsRemaining)"
                  >
                    <svg width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect
                        x="96"
                        y="17"
                        width="45"
                        height="130"
                        rx="15"
                        stroke="currentColor"
                        stroke-width="8"
                      />
                      <rect
                        x="24"
                        y="17"
                        width="43.3333"
                        height="130"
                        rx="15"
                        stroke="currentColor"
                        stroke-width="8"
                      />
                    </svg>
                  </button>
                </div>
              </template>
            </div>
            <div class="grow">
              {{ c.description }}
            </div>
            <div class="w-[115px] pl-[10px]">
              {{ cueTypeOptions[c.type] && cueTypeOptions[c.type] }}
            </div>
            <div class="w-[80px] text-right">
              {{ readableTime(c.duration) }}
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="bg-gray-900">
      <button
        v-if="isEditable"
        class="btn btn-icon btn-icon--lg w-[100%] rounded-t text-center"
        aria-label="Save cue list and go back."
        title="save and go back"
        @click="
          () => {
            toggleIsEditable();
            sync();
          }
        "
      >
        Done editing
        <svg
          width="164"
          height="164"
          viewBox="0 0 164 164"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="-mt-2"
        >
          <rect
            x="44"
            y="51"
            width="87"
            height="87"
            rx="15"
            stroke="currentColor"
            stroke-width="8"
          />
          <rect
            x="58.7798"
            y="71.306"
            width="8"
            height="48"
            rx="4"
            transform="rotate(-32.7755 58.7798 71.306)"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="8"
          />
          <rect
            x="142.536"
            y="33.1998"
            width="8"
            height="96"
            rx="4"
            transform="rotate(39.4617 142.536 33.1998)"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="8"
          />
        </svg>
      </button>
      <button
        v-else
        class="btn btn-icon btn-icon--lg w-[100%] rounded-t text-center"
        aria-label="Edit the cue list."
        title="edit cue list"
        @click="toggleIsEditable"
      >
        Edit
        <svg
          width="164"
          height="164"
          viewBox="0 0 164 164"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="-mt-2"
        >
          <rect
            x="26"
            y="51"
            width="110"
            height="87"
            rx="15"
            stroke="currentColor"
            stroke-width="8"
          />
          <path
            d="M121.137 23.5736C122.129 21.5999 124.534 20.8046 126.508 21.7971V21.7971C128.481 22.7897 129.277 25.1942 128.284 27.1678L89.6455 103.999L86.0719 102.202C84.0983 101.21 83.303 98.805 84.2955 96.8314L121.137 23.5736Z"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="8"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
<style scoped lang="scss">
.btn {
  @apply font-bold p-2.5 text-[11px] bg-gray-800 hover:bg-gray-700 active:bg-blue-900 text-white;

  svg {
    display: inline;
    height: 1em;
    width: 1em;
    fill: currentColor;
  }

  &--actionbar {
    @apply flex grow flex-col items-center justify-end;
  }
  &--actionbar + &--actionbar {
    @apply border-l border-gray-700;
  }

  &-icon--lg {
    svg {
      height: 2em;
      width: 2em;
      line-height: 1;
    }
  }

  &-icon--fat {
    svg>* {
      stroke-width: 16;
    }
  }

  &-icon {
    @apply p-3;
    line-height: 1;
  }

  &-gray {
    @apply bg-gray-300 text-gray-800;

    &:hover {
      @apply bg-gray-400;
    }
  }

  &-action {
    @apply rounded-full w-24;
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
    content: "";
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
    height: 100%;
    width: var(--background-width);
    @apply bg-gray-800;
  }

  &.current:before {
    @apply bg-gray-600;
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
  //  animation: blinkingBackground 1s infinite;
  // }
}

.cue.over-time.active:before,
.cue-list.over-time .cue.active:before {
  animation: blinkingBackground 1s infinite;
}

@keyframes blinkingBackground {

  // 0% { background-color: #10c018;}
  // 25% { background-color: #1056c0;}
  // 50% { background-color: #ef0a1a;}
  // 75% { background-color: #254878;}
  // 100% { background-color: #04a1d5;}
  0% {
    @apply bg-gray-600;
  }

  // 20% { @apply bg-gray-600 }
  50% {
    @apply bg-red-500;
  }

  // 80% { @apply bg-gray-600 }
  100% {
    @apply bg-gray-600;
  }
}
</style>
