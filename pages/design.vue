<script setup lang="ts">
// https://www.figma.com/file/lyQeWSxuePTZHPwXhNl6J0/Stage-Clock?node-id=0%3A1

const db = useDatabase()
const timer = useTimer(db)

const secondsRemaining = ref(null)
const currentCueId = ref(null)
// const isOverTime = ref(false)

const changeSecondsRemaining = seconds => (secondsRemaining.value = seconds)
const setCurrentCueId = id => (currentCueId.value = id)
// const setIsOverTime = (overTime: Timer['overTime']) => (isOverTime.value = overTime)
</script>
<template>
  <div>
    <timer-clock
      @seconds-remaining="changeSecondsRemaining"
      @current-cue-id="setCurrentCueId"
    />
    <timer-actions
      class="mt-5"
      :timer="timer"
      :database="db"
      :seconds-remaining="secondsRemaining"
      :current-cue-id="currentCueId"
    />
    <cue-list class="mt-5" />
    <cue-form class="mt-5" />
    <div class="text-gray-100 mt-[30px]">
      <h2 class="text-md">
        How to use stage clock
      </h2>
      <ul class="text-sm list-disc pl-3">
        <li>Press a cue to start or continue it</li>
        <li>Swipe left on a cue to remove cue</li>
        <li>Swipe right on a cue to edit cue</li>
        <li>Hold and drag to reorder cues</li>
      </ul>
    </div>
  </div>
</template>
