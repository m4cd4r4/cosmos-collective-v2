import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')
const ICONS_DIR = resolve(PUBLIC, 'icons')

mkdirSync(ICONS_DIR, { recursive: true })

const svgBuffer = readFileSync(resolve(PUBLIC, 'icon.svg'))
const BG = { r: 10, g: 14, b: 26, alpha: 1 } // #0a0e1a

async function iconAny(size, filename) {
  await sharp(svgBuffer).resize(size, size).png().toFile(resolve(ICONS_DIR, filename))
  console.log(`  icons/${filename}`)
}

async function iconMaskable(size, filename) {
  const pad = Math.round(size * 0.12)
  const inner = size - pad * 2
  const svg = await sharp(svgBuffer).resize(inner, inner).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: svg, top: pad, left: pad }])
    .png()
    .toFile(resolve(ICONS_DIR, filename))
  console.log(`  icons/${filename}`)
}

async function appleTouch() {
  const inner = 140
  const pad = 20
  const svg = await sharp(svgBuffer).resize(inner, inner).png().toBuffer()
  await sharp({ create: { width: 180, height: 180, channels: 4, background: BG } })
    .composite([{ input: svg, top: pad, left: pad }])
    .png()
    .toFile(resolve(PUBLIC, 'apple-touch-icon.png'))
  console.log('  apple-touch-icon.png')
}

console.log('Generating PWA icons...')
await iconAny(192, 'icon-192x192.png')
await iconMaskable(192, 'icon-192x192-maskable.png')
await iconAny(512, 'icon-512x512.png')
await iconMaskable(512, 'icon-512x512-maskable.png')
await iconMaskable(96, 'shortcut-jwst.png')
await iconMaskable(96, 'shortcut-skymap.png')
await appleTouch()
console.log('Done.')
