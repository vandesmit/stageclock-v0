<script setup lang="ts">
interface CueItemComponent {
  cue: Cue
}

const { readableTime } = useTransform()
const db = useDatabase()
const timer = useTimer(db)

const props = defineProps<CueItemComponent>()
const cue = computed(() => props.cue)
</script>
<template>
  <div class="flex bg-gray-800 text-white rounded-md my-2.5 justify-between py-4 px-6">
    <div class="flex flex-col items-start">
      <div>
        {{ cue.description }}
      </div>
      <cue-label :type="cue.type" class="mt-1" />
    </div>
    <div class="text-right">
      <div>
        {{ readableTime(cue.duration) }}
      </div>
      <div v-if="db.currentCue">
        {{ readableTime(Math.ceil(cue.duration - (db.currentCue.id === cue.id ? timer.remaining : cue.durationRemaining))) }}
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
</style>
