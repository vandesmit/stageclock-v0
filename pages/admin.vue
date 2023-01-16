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
  <div class="min-h-full w-full bg-gray-900 p-2">
    <div class="pb-12 flex flex-col items-center">
      <timer-clock
        v-show="isClockVisible"
        @seconds-remaining="changeSecondsRemaining"
        @current-cue-id="setCurrentCueId"
        @is-over-time="setIsOverTime"
      />
      <div
        v-if="currentCue"
        class="flex items-end w-full bg-gray-800 text-white py-[20px] px-[24px] rounded-md m-[20px]"
      >
        <button
          class="flex grow flex-col items-center btn btn-icon btn-icon--fat"
          :aria-label="`Next.`"
          title="next"
          @click="startPreviousCue(timer)"
        >
          Previous
        </button>
        <template v-if="!currentCue.startedAt">
          <button
            class="flex grow flex-col items-center btn btn-icon btn-icon--fat"
            :aria-label="`Stop ${currentCue.description}.`"
            title="stop"
            @click="stopCue(currentCue.id)"
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
            Reset
          </button>
          <button
            class="flex grow flex-col items-center btn btn-icon btn-icon--fat"
            :aria-label="`Resume ${currentCue.description}.`"
            title="resume"
            @click="startCue(currentCue.id, secondsRemaining)"
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
            Play
          </button>
        </template>
        <template v-else>
          <button
            class="flex grow flex-col items-center btn btn-icon btn-icon--fat"
            :aria-label="`Stop ${currentCue.description}.`"
            title="stop"
            @click="stopCue(currentCue.id)"
          >
            <svg
              width="164"
              height="164"
              viewBox="0 0 164 164"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            Stop
          </button>
          <button
            class="flex grow flex-col items-center btn btn-icon btn-icon--fat"
            :aria-label="`Pause ${currentCue.description}.`"
            title="pause"
            @click="pauseCue(currentCue.id, secondsRemaining)"
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
            Pause
          </button>
        </template>
        <button
          class="flex grow flex-col items-center btn btn-icon btn-icon--fat"
          :aria-label="`Next.`"
          title="next"
          @click="startNextCue(timer)"
        >
          Next
        </button>
        <!-- <div>Reset</div> -->
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
          class="flex py-3 px-1 cue"
          :class="{
            'overflow-hidden flex justify-between w-full bg-gray-800 text-white py-[20px] px-[24px] rounded-md m-[20px]': true,
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
            <div>
              {{ cueTypeOptions[c.type] && cueTypeOptions[c.type] }}
            </div>
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
