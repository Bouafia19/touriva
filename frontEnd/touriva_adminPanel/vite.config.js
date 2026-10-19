import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 2025,
  },
  base: process.env.VITE_BASE_PATH || '/', 
  build: {
    outDir: process.env.VITE_OUT_DIR || 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vuetify')) {
              return 'vuetify'; // Separate Vuetify into its own chunk
            }
            if (id.includes('vue')) {
              return 'vue'; // Separate Vue into its own chunk
            }
            return 'vendor'; // Group other third-party dependencies
          }
        }
      }
    }
  }
})
