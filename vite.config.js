import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({

  base: './',
  plugins: [vue({
      script: {
        defineModel: true
      }
    }
  )],
  server: {
    port: 4000,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api': {
        target: 'https://frp-rib.com:49157/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      }
    },
  }
})

