import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '5173-icvhzthrwli207dw94h2y-3c428613.manusvm.computer',
      '5174-icvhzthrwli207dw94h2y-3c428613.manusvm.computer',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      clientPort: 5173
    }
  }
})
