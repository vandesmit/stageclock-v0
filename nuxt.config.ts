import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  serverMiddleware: [
    { path: "/server-api", handler: "~/server-middleware/api.ts" },
  ],
  typescript: {
    shim: false
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/database.json']
      }
    },
  },
})
