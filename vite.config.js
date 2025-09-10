import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({
      script: {
        defineModel: true
      }
    }
  )],
  server: {
    port: 4000,
    open: false,
  }
})

