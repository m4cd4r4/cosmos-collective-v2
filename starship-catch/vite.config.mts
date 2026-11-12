import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Standalone app. Its build lands in the Next app's public folder and is served at
// /starship-catch/, wrapped by the route in src/app/starship-catch.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/starship-catch/',
  build: {
    outDir: fileURLToPath(new URL('../public/starship-catch', import.meta.url)),
    emptyOutDir: true,
    target: 'es2022',
  },
  server: { port: 5184, strictPort: true },
})
