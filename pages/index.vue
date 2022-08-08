<template>
  <div class="min-h-screen w-screen bg-gray-900 grid place-content-center">
    <div class="grid grid-cols-2 gap-4 place-content-center">
      <nuxt-link
        to="/admin"
        class="btn btn-green"
      >
        Admin panel
      </nuxt-link>
      <nuxt-link
        to="/display"
        class="btn btn-green"
      >
        Stage display
      </nuxt-link>
    </div>
  </div>
</template>
<style scoped lang="scss">
.btn {
  @apply font-bold py-2 px-4 bg-blue-500 text-white rounded;

  &:hover {
    @apply bg-blue-700;
  }

  &-green {
    @apply bg-green-800 text-green-100;

    &:hover {
      @apply bg-green-700;
    }
  }

  &-orange {
    @apply bg-orange-800 text-orange-100;

    &:hover {
      @apply bg-orange-700;
    }
  }
}
</style>
