<script setup lang="ts">
defineProps<{
  list: Cue[]
}>()
</script>
<template>
  <div>
    <cue-item v-for="cue in list" :key="cue.id" :cue="cue" />
  </div>
</template>
<style scoped lang="scss">
</style>
