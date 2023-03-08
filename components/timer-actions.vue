<script setup lang="ts">
interface TimerActionsComponent {
  currentCueId: Cue['id']
  database: Database,
  secondsRemaining: Timer['remaining']
  timer: Timer,
}

const props = defineProps<TimerActionsComponent>()
const timer = computed(() => props.timer)
const database = computed(() => props.database)
const secondsRemaining = computed(() => props.secondsRemaining)
const currentCueId = computed(() => props.currentCueId)

// const database = useDatabase()

const {
  stopCue,
  pauseCue,
  startCue,
  startNextCue,
  startPreviousCue
} = database

</script>
<template>
  <div class="flex justify-evenly justify-items-stretch bg-gray-800 text-white rounded-md overflow-hidden">
    <button>
      {{ currentCueId }}
      {{ secondsRemaining }}
    </button>
    <button
      :aria-label="`Next.`"
      title="next"
      @click="startPreviousCue(timer)"
    >
      <timer-icons href="prev" />
      prev
    </button>
    <button
      :aria-label="`Stop.`"
      title="stop"
      @click="stopCue(currentCueId)"
    >
      <timer-icons href="stop" />
      stop
    </button>
    <button
      :aria-label="`Pause.`"
      title="pause"
      @click="pauseCue(currentCueId, secondsRemaining)"
    >
      <timer-icons href="pause" />
      pause
    </button>
    <button
      :aria-label="`Resume.`"
      title="resume"
      @click="startCue(currentCueId, secondsRemaining)"
    >
      <timer-icons href="play" />
      play
    </button>
    <button
      :aria-label="`Reset.`"
      title="reset"
      @click="stopCue(currentCueId)"
    >
      <timer-icons href="reset" />
      reset
    </button>
    <button
      :aria-label="`Next.`"
      title="next"
      @click="startNextCue(timer)"
    >
      <timer-icons href="next" />
      next
    </button>
  </div>
</template>
<style scoped lang="scss">
button {
  @apply flex flex-col grow items-center p-[10px];
  &:hover {
    @apply bg-gray-700;
  }
  & + & {
    @apply border-l-2 border-gray-700
  }
  svg {
    @apply mb-[4px]
  }
}
</style>
