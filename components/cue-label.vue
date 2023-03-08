<script setup lang="ts">
interface LabelComponent {
  type: Label['key']
}

const props = defineProps<LabelComponent>()

const runtimeConfig = useRuntimeConfig()
const { cueTypeOptions } = runtimeConfig.public

const type = cueTypeOptions.find(o => o.key === props.type)
</script>
<template>
  <div :class="type.key" class="flex flex-row items-center rounded py-px px-1.5">
    <timer-icons :href="type.icon" />
    <span class="text-xs">{{ type.label }}</span>
  </div>
</template>
<style scoped lang="scss">
svg {
  fill: currentColor;
  display: inline;
  height: 10px;
  margin: 3px;
}
.continue {
  @apply bg-brown-500;
}
.negative {
  @apply bg-blue-500;
}
.stop {
  @apply bg-red-500;
}
</style>
