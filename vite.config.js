import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    // host: '0.0.0.0',
    // https: true,
    proxy: {
      '/graphrag': {
        target: 'http://192.168.1.57:4000/query_graphrag',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/graphrag/, '')
      }
    }
  },
})
