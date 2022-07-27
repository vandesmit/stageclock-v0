import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  typescript: {
    shim: false
  },
  modules: ['@nuxtjs/tailwindcss'],
  serverMiddleware: [
    // Will register file from project server-middleware directory to handle /server-api/* requests
    { path: "/server-api", handler: "~/server-middleware/api.ts" },
  ],
})
