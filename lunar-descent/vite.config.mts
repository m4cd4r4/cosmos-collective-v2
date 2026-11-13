import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Standalone app. Its build lands in the Next app's public folder and is served at
// /lunar-descent/, wrapped by the route in src/app/lunar-descent.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/lunar-descent/',
  build: {
    outDir: fileURLToPath(new URL('../public/lunar-descent', import.meta.url)),
    emptyOutDir: true,
    target: 'es2022',
  },
  server: { port: 5183, strictPort: true },
})
