/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const GAS_PATH =
  '/macros/s/AKfycbxgvZpi4-KjYWERHKXFxwyS--3m2XR3_RaPLfXCN287YtxcGkiL27w5nq5vEzoUHw4Cyg/exec'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  return {
    plugins: [react()],
    // dev = '/', build = '/Vote/' ตามชื่อ repo ใหม่
    base: isBuild ? '/Vote/' : '/',
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: {
        '/gas': {
          target: 'https://script.google.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/gas/, GAS_PATH),
        },
      },
    },
  }
}) // 👈 ปิดด้วย "})" เท่านั้น
