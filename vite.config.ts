import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project at /cursor-mobile-kanban/
export default defineConfig({
  base: '/cursor-mobile-kanban/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
