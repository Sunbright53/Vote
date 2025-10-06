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
    base: isBuild ? '/Poll-Vote/' : '/', // ← ชื่อ repo ต้องตรงเป๊ะ
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // ใช้ได้เฉพาะตอน dev
        '/gas': {
          target: 'https://script.google.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/gas/, GAS_PATH),
        },
      },
    },
  }
})
