<script setup>
  const { data: status } = await useLazyFetch('/api/status')
</script>
<template>
  <div class="min-h-screen w-screen bg-gray-900 p-3 text-white">
    <nuxt-link to="/" class="font-bold py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700">Go back</nuxt-link>
    <pre>{{ status }}</pre>
  </div>
</template>