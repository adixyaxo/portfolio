import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/wakatime': {
        target: 'https://wakatime.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wakatime/, '/api/v1'),
      },
    },
  },
})
