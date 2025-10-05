// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const GAS_PATH = '/macros/s/AKfycbxgvZpi4-KjYWERHKXFxwyS--3m2XR3_RaPLfXCN287YtxcGkiL27w5nq5vEzoUHw4Cyg/exec'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // ทุกคำขอที่ขึ้นต้นด้วย /gas จะถูกส่งต่อไปยัง Apps Script
      '/gas': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gas/, GAS_PATH),
      },
    },
  },
})
