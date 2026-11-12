// Bakes NASA LOLA elevation models of the lunar south pole into the game's terrain assets.
//
// Sources (neither file is committed; download them, then run this script):
//   1. Shackleton rim, 5 m/pixel, 16 km square. NASA Goddard PGDA product 78, Site04.
//      https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site04/Site04_final_adj_5mpp_surf.tif
//      Barker et al. 2021, Planetary and Space Science 203, 105119.
//   2. South pole to 75 S, 240 m/pixel. LOLA gridded data record, PDS Geosciences Node.
//      https://imbrium.mit.edu/DATA/LOLA_GDR/POLAR/IMG/LDEM_75S_240M.IMG
//
//   node lunar-descent/scripts/bake-terrain.mjs <Site04 .tif> <LDEM_75S_240M.IMG>
// Needs the `geotiff` package (npm i --no-save geotiff) and the repo's `sharp`.
//
// Every layer is a square in south polar stereographic metres (Moon radius 1737.4 km,
// heights relative to that sphere). Outputs, in lunar-descent/public/terrain/:
//   <layer>-height.bin  512 x 512 uint16 heights
//   <layer>-shade.webp  baked sunlight: sqrt(Lambert x cast shadow)
//   terrain.json        extents, height scale, Sun, target and approach track

import { fromFile } from 'geotiff'
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const [TIF, IMG] = process.argv.slice(2)
if (!TIF || !IMG) throw new Error('usage: bake-terrain.mjs <Site04 .tif> <LDEM_75S_240M.IMG>')
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/terrain')
const R = 1_737_400
const SUN_ELEVATION_DEG = 1.5 // at the target
const GRID = 512

// ---- Source rasters. Row 0 is the north (largest y) edge in both.
const tiff = await fromFile(TIF)
const image = await tiff.getImage()
const [fineData] = await image.readRasters()
const [fx0, fy0, fx1, fy1] = image.getBoundingBox()
const fine = { n: image.getWidth(), px: 5, x0: fx0, y1: fy1, get: (i) => fineData[i] }

const imgBuf = await readFile(IMG)
const regionData = new Int16Array(imgBuf.buffer, imgBuf.byteOffset, imgBuf.byteLength / 2)
const RN = 3812
const region = { n: RN, px: 240, x0: -(RN / 2) * 240, y1: (RN / 2) * 240, get: (i) => regionData[i] * 0.5 }

function sample(src, x, y) {
  const i = Math.floor((x - src.x0) / src.px)
  const j = Math.floor((src.y1 - y) / src.px)
  if (i < 0 || j < 0 || i >= src.n || j >= src.n) return null
  return src.get(j * src.n + i)
}
function bilinear(src, x, y) {
  const u = (x - src.x0) / src.px - 0.5
  const v = (src.y1 - y) / src.px - 0.5
  const i = Math.floor(u)
  const j = Math.floor(v)
  if (i < 0 || j < 0 || i >= src.n - 1 || j >= src.n - 1) return null
  const a = u - i
  const b = v - j
  const k = j * src.n + i
  return (src.get(k) * (1 - a) + src.get(k + 1) * a) * (1 - b) + (src.get(k + src.n) * (1 - a) + src.get(k + src.n + 1) * a) * b
}
const heightAt = (x, y) => sample(fine, x, y) ?? bilinear(region, x, y) ?? 0
const inFine = (x, y) => x > fx0 && x < fx1 && y > fy0 && y < fy1

function slopeDeg(x, y, d) {
  const gx = (heightAt(x + d, y) - heightAt(x - d, y)) / (2 * d)
  const gy = (heightAt(x, y + d) - heightAt(x, y - d)) / (2 * d)
  return (Math.atan(Math.hypot(gx, gy)) * 180) / Math.PI
}

// ---- Target: the flattest 100 m patch on the high ground of the rim tile.
// A game target. NASA has not selected a landing site.
const heights = []
for (let i = 0; i < fineData.length; i += 97) heights.push(fineData[i])
heights.sort((a, b) => a - b)
const highGround = heights[Math.floor(heights.length * 0.85)]
let target = null
for (let y = fy0 + 2500; y < fy1 - 2500; y += 50) {
  for (let x = fx0 + 2500; x < fx1 - 2500; x += 50) {
    if (heightAt(x, y) < highGround) continue
    let worst = 0
    for (let b = -50; b <= 50 && worst < 5; b += 25) for (let a = -50; a <= 50; a += 25) worst = Math.max(worst, slopeDeg(x + a, y + b, 5))
    if (!target || worst < target.slope) target = { x, y, slope: worst, h: heightAt(x, y) }
  }
}

// ---- Sunlight. Rays are parallel, so the Sun's elevation changes with position on the
// sphere: higher towards the Sun, below the horizon far enough away from it.
const E0 = (SUN_ELEVATION_DEG * Math.PI) / 180
const elevationAt = (x, y, sun) => E0 + ((x - target.x) * sun.x + (y - target.y) * sun.y) / R

function litFraction(x, y, sun) {
  const el = elevationAt(x, y, sun)
  if (el < -0.03) return 0
  const tanEl = Math.tan(el)
  const z0 = heightAt(x, y) + 2
  let worst = Infinity
  for (let d = inFine(x, y) ? 5 : 240; ; d *= 1.03) {
    // The ground curves away from the tangent plane by d^2 / 2R.
    const ray = z0 + d * tanEl + (d * d) / (2 * R)
    if (ray > 9000) break // above the highest terrain in the map
    const clearance = ray - heightAt(x + sun.x * d, y + sun.y * d)
    if (clearance < worst) worst = clearance
    if (worst < -30) return 0
  }
  const soft = inFine(x, y) ? 15 : 60 // the Sun's disc is about half a degree wide
  return Math.min(1, Math.max(0, worst / soft + 0.5))
}

function shade(x, y, d, sun) {
  const lit = litFraction(x, y, sun)
  if (lit === 0) return 0
  const gx = (heightAt(x + d, y) - heightAt(x - d, y)) / (2 * d)
  const gy = (heightAt(x, y + d) - heightAt(x, y - d)) / (2 * d)
  const el = elevationAt(x, y, sun)
  const lambert = (-gx * sun.x * Math.cos(el) - gy * sun.y * Math.cos(el) + Math.sin(el)) / Math.hypot(gx, gy, 1)
  return Math.max(0, lambert) * lit
}

let sun = null
for (let az = 0; az < 360; az += 15) {
  const s = { x: Math.cos((az * Math.PI) / 180), y: Math.sin((az * Math.PI) / 180), azimuthDeg: az }
  let lit = 0
  for (let b = -100; b <= 100; b += 50) for (let a = -100; a <= 100; a += 50) lit += litFraction(target.x + a, target.y + b, s)
  if (!sun || lit > sun.lit) sun = { ...s, lit }
}

// ---- Approach track: the direction, at right angles to the Sun, with the most real
// terrain behind it, so shadows fall across the view during the whole descent.
const reach = (dx, dy) => {
  let d = 0
  while (sample(region, target.x - dx * (d + 5000), target.y - dy * (d + 5000)) !== null) d += 5000
  return d
}
const sides = [{ x: -sun.y, y: sun.x }, { x: sun.y, y: -sun.x }].map((v) => ({ ...v, reachM: reach(v.x, v.y) }))
const approach = sides[0].reachM > sides[1].reachM ? sides[0] : sides[1]

// ---- Layers.
const NEAR_SIZE = 2560
const layers = [
  { name: 'region', x0: region.x0, y1: region.y1, size: RN * 240, shadePx: 2048, grad: 240 },
  { name: 'rim', x0: fx0, y1: fy1, size: fx1 - fx0, shadePx: 2048, grad: 5 },
  { name: 'near', x0: target.x - NEAR_SIZE / 2, y1: target.y + NEAR_SIZE / 2, size: NEAR_SIZE, shadePx: 1024, grad: 5 },
]
const H_MIN = -9000
const H_STEP = 0.3 // metres per uint16 count: covers -9,000 m to +10,660 m

await mkdir(OUT, { recursive: true })
for (const layer of layers) {
  const grid = new Uint16Array(GRID * GRID)
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const x = layer.x0 + (i / (GRID - 1)) * layer.size
      const y = layer.y1 - (j / (GRID - 1)) * layer.size
      grid[j * GRID + i] = Math.round((heightAt(x, y) - H_MIN) / H_STEP)
    }
  }
  await writeFile(path.join(OUT, `${layer.name}-height.bin`), Buffer.from(grid.buffer))

  const n = layer.shadePx
  const buf = Buffer.alloc(n * n)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = layer.x0 + ((i + 0.5) / n) * layer.size
      const y = layer.y1 - ((j + 0.5) / n) * layer.size
      buf[j * n + i] = Math.round(Math.sqrt(Math.min(1, shade(x, y, layer.grad, sun))) * 255)
    }
  }
  await sharp(buf, { raw: { width: n, height: n, channels: 1 } }).webp({ quality: 80 }).toFile(path.join(OUT, `${layer.name}-shade.webp`))
  console.log('baked', layer.name)
}

const rho = Math.hypot(target.x, target.y)
const meta = {
  heightMinM: H_MIN,
  heightStepM: H_STEP,
  grid: GRID,
  layers: layers.map(({ name, x0, y1, size }) => ({ name, x0, y1, size })),
  target: {
    x: target.x,
    y: target.y,
    heightM: Number(target.h.toFixed(1)),
    slopeDeg: Number(target.slope.toFixed(2)),
    latitudeDeg: Number((-90 + (2 * Math.atan(rho / (2 * R)) * 180) / Math.PI).toFixed(3)),
    longitudeDeg: Number(((Math.atan2(target.x, target.y) * 180) / Math.PI).toFixed(1)),
  },
  sun: { elevationDeg: SUN_ELEVATION_DEG, x: sun.x, y: sun.y },
  approach: { x: approach.x, y: approach.y, realTerrainM: approach.reachM },
}
await writeFile(path.join(OUT, 'terrain.json'), JSON.stringify(meta, null, 2))
console.log(meta)
