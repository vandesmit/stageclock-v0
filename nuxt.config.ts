import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  head: {
    link: [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  },
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
