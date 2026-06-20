import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'dobble.png'],
      manifest: {
        name: 'Dobble Trainer',
        short_name: 'Dobble',
        description: 'Speed-training app for the Dobble card game. Works fully offline.',
        theme_color: '#3498db',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        // base is /dobble-trainer/, so scope/start are scoped under it
        scope: '/dobble-trainer/',
        start_url: '/dobble-trainer/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the full app shell AND every card image so the game
        // works with no network after the first visit.
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/dobble-trainer/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  base: '/dobble-trainer/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
