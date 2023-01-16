<script setup lang="ts">
interface LabelComponent {
  type: Label['key']
}

const props = defineProps<LabelComponent>()

const runtimeConfig = useRuntimeConfig()
const { cueTypeOptions } = runtimeConfig.public

const label = cueTypeOptions.find(o => o.type === props.type)
</script>
<template>
  <div>
    <pre>{{ label }}</pre>
  </div>
</template>
<style scoped lang="scss">
</style>
