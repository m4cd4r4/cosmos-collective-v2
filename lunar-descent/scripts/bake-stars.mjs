// Bakes the Yale Bright Star Catalogue into the game's star field.
//
// Source (not committed; download it, then run this script):
//   Bright Star Catalogue, 5th Revised Ed. (Hoffleit and Warren 1991), CDS catalogue V/50.
//   https://cdsarc.cds.unistra.fr/ftp/cats/V/50/catalog.gz
//   Mirror: https://vizier.cfa.harvard.edu/ftp/cats/V/50/catalog.gz
//
//   node lunar-descent/scripts/bake-stars.mjs <catalog.gz>
//
// Output, lunar-descent/public/sky/stars.bin: five little-endian int16 per star.
//   x, y, z   J2000 unit vector, times 32767
//   Vmag      visual magnitude, times 1000
//   B-V       colour index, times 1000 (0 where the catalogue has none)

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const [CATALOGUE] = process.argv.slice(2)
if (!CATALOGUE) throw new Error('usage: bake-stars.mjs <catalog.gz>')
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/sky')

// Byte ranges are from the catalogue's ReadMe, counted from 1.
const field = (line, from, to) => line.slice(from - 1, to).trim()
const rows = []
for (const line of gunzipSync(await readFile(CATALOGUE)).toString('latin1').split('\n')) {
  const hours = field(line, 76, 77)
  const magnitude = field(line, 103, 107)
  // Fourteen entries are novae and non-stellar objects with no position.
  if (!hours || !magnitude) continue
  const ra = (Number(hours) + Number(field(line, 78, 79)) / 60 + Number(field(line, 80, 83)) / 3600) * 15
  const sign = field(line, 84, 84) === '-' ? -1 : 1
  const dec = sign * (Number(field(line, 85, 86)) + Number(field(line, 87, 88)) / 60 + Number(field(line, 89, 90)) / 3600)
  const a = (ra * Math.PI) / 180
  const d = (dec * Math.PI) / 180
  rows.push([Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d), Number(magnitude), Number(field(line, 110, 114)) || 0])
}

const out = new Int16Array(rows.length * 5)
rows.forEach(([x, y, z, magnitude, colour], i) => {
  out.set([Math.round(x * 32767), Math.round(y * 32767), Math.round(z * 32767), Math.round(magnitude * 1000), Math.round(colour * 1000)], i * 5)
})
await mkdir(OUT, { recursive: true })
await writeFile(path.join(OUT, 'stars.bin'), Buffer.from(out.buffer))
const brightest = rows.reduce((a, b) => (b[3] < a[3] ? b : a))
console.log(`baked ${rows.length} stars; brightest magnitude ${brightest[3]}`)
