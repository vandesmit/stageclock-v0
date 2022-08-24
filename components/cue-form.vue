<script setup lang="ts">
const isEditing = ref(false)
const cue = ref({
  description: 'test',
  duration: 600,
  durationRemaining: 0,
  id: '123-456-789',
  startedAt: null,
  type: 'negative'
})
const cueTypeOptions = {
  continue: {
    label: 'Auto continue',
    icon: 'continue'
  },
  negative: {
    label: 'Go negative',
    icon: 'negative'
  },
  stop: {
    label: 'Stop',
    icon: 'stop2'
  }
}
const title = computed(() => isEditing.value ? `Update cue '${cue.value.description}'` : 'Create a new cue')

</script>
<template>
  <div>
    <h2 class="text-md text-white">
      {{ title }}
    </h2>
    <div class="flex flex-col bg-gray-800 text-white rounded-md mt-[20px] p-[10px] text-sm">
      <input
        v-model="cue.description"
        type="text"
        placeholder="Cue Name"
        class="grow py-[10px] px-[8px] bg-gray-500 border-1 border-gray-700 rounded placeholder:text-gray-300"
      >
      <div class="flex mx-[-5px] mt-[5px]">
        <input
          type="text"
          placeholder="Hours"
          class="m-[5px] grow py-[10px] px-[8px] bg-gray-500 border-1 border-gray-700 rounded placeholder:text-gray-300"
        >
        <input
          type="text"
          placeholder="Minutes"
          class="m-[5px] grow py-[10px] px-[8px] bg-gray-500 border-1 border-gray-700 rounded placeholder:text-gray-300"
        >
        <input
          type="text"
          placeholder="Seconds"
          class="m-[5px] grow py-[10px] px-[8px] bg-gray-500 border-1 border-gray-700 rounded placeholder:text-gray-300"
        >
      </div>
      <div class="flex mt-[10px] rounded overflow-hidden">
        <div class="grid grid-rows-1 grid-flow-col mx-[-1px]">
          <button
            v-for="(option, key) in cueTypeOptions"
            :key="key"
            :class="[
              'flex flex-col items-center py-[10px] px-[8px] bg-gray-500 border-1 border-gray-700 focus:bg-gray-700 mx-[1px]',
              cue.type === key ? 'bg-blue-900 focus:bg-blue-700' : 'bg-gray-500 focus:bg-gray-700'
            ]"
          >
            <timer-icons :href="option.icon" />
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="relative mt-[10px]">
        <select
          id="type"
          class="block appearance-none w-full py-2 px-4 pr-8 bg-gray-500 border-1 border-gray-700 rounded leading-tight focus:outline-none focus:bg-gray-500 focus:border-gray-700"
        >
          <option v-for="(option, key) in cueTypeOptions" :key="key" :value="key">
            {{ option.label }}
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
</template>
<style scoped lang="scss">
</style>
