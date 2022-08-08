import { defineNuxtConfig } from 'nuxt'
import eslintPlugin from 'vite-plugin-eslint'

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' }
      ],
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Stage Clock' },
        { name: 'application-name', content: 'Stage Clock' },
        { name: 'msapplication-TileColor', content: '#da532c' },
        { name: 'theme-color', content: '#1e293b' }
      ],
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      title: 'Stage Clock'
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  serverMiddleware: [
    { path: '/api', handler: '~/api' }
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
    plugins: [
      eslintPlugin()
    ]
  }
})
