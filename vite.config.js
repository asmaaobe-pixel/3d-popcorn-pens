import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    port: 1577,
    strictPort: true,
    host: true,
    open: true,
  },
})
