import { realpathSync } from 'node:fs'
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
  // In a git worktree node_modules can be a link to another checkout; let the dev server read the fonts through it.
  server: { port: 5184, strictPort: true, fs: { allow: ['..', realpathSync(fileURLToPath(new URL('../node_modules', import.meta.url)))] } },
})
