import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: '/admin/',
  build: {
    outDir: '../DigitalMenu/dist/admin',
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [
    react(
      command === 'serve'
        ? {
            babel: {
              plugins: [['babel-plugin-react-compiler']],
            },
          }
        : undefined
    ),
  ],
}))
