/// <reference types="node" />

// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const GAS_PATH =
  '/macros/s/AKfycbxgvZpi4-KjYWERHKXFxwyS--3m2XR3_RaPLfXCN287YtxcGkiL27w5nq5vEzoUHw4Cyg/exec'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // ✅ ใช้ import แบบ "@/..." ได้
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/gas': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gas/, GAS_PATH),
      },
    },
  },
})
