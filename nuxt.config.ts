import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  typescript: {
    shim: false
  },
  modules: ['@nuxtjs/tailwindcss'],
  serverMiddleware: [
    { path: "/server-api", handler: "~/server-middleware/api.ts" },
  ],
})
