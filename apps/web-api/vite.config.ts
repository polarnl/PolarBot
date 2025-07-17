import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['@hono/node-server', '@polarbot/database', 'dotenv/config']
    }
  },
  esbuild: {
    target: 'esnext'
  }
})
