import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
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

// ICO container holding PNG payloads, which every current browser reads
async function favicon(sizes) {
  const pngs = await Promise.all(sizes.map((size) => sharp(svgBuffer).resize(size, size).png().toBuffer()))
  const header = Buffer.alloc(6 + 16 * sizes.length)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(sizes.length, 4)
  let offset = header.length
  sizes.forEach((size, i) => {
    const entry = 6 + 16 * i
    header.writeUInt8(size, entry)
    header.writeUInt8(size, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(pngs[i].length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += pngs[i].length
  })
  writeFileSync(resolve(PUBLIC, 'favicon.ico'), Buffer.concat([header, ...pngs]))
  console.log('  favicon.ico')
}

console.log('Generating PWA icons...')
await iconAny(192, 'icon-192x192.png')
await iconMaskable(192, 'icon-192x192-maskable.png')
await iconAny(512, 'icon-512x512.png')
await iconMaskable(512, 'icon-512x512-maskable.png')
await iconMaskable(96, 'shortcut-jwst.png')
await iconMaskable(96, 'shortcut-skymap.png')
await appleTouch()
await favicon([16, 32, 48])
console.log('Done.')
