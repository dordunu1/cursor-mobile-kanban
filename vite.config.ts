import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Preview-only deploy: https://dordunu1.github.io/cursor-mobile-kanban/liquid-glass/
export default defineConfig({
  base: '/cursor-mobile-kanban/liquid-glass/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
