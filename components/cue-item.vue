<script setup lang="ts">
interface CueComponent {
  cue: Cue
}

const props = defineProps<CueComponent>()
const cue = computed(() => props.cue)
</script>
<template>
  <div class="flex bg-gray-800 text-white rounded">
    <pre>{{ cue }}</pre>
    <cue-label :type="cue.type" />
  </div>
</template>
<style scoped lang="scss">
</style>
