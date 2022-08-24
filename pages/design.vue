<script setup lang="ts">
// https://www.figma.com/file/lyQeWSxuePTZHPwXhNl6J0/Stage-Clock?node-id=0%3A1
const {
  list: cueList
} = useCue()
</script>
<template>
  <div>
    <timer-clock />
    <timer-actions class="mt-[20px]" />
    <cue-list class="mt-[10px]" :list="cueList" />
    <cue-form class="mt-[20px]" />
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
