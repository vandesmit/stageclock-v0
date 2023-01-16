<script setup lang="ts">
const {
  cueList
} = useDatabase()
</script>
<template>
  <div>
    <cue-item v-for="cue in cueList" :key="cue.id" :cue="cue" />
  </div>
</template>
<style scoped lang="scss">
</style>
