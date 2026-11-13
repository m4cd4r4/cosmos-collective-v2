// Bakes the ground under the launch site from USDA NAIP aerial imagery, served by the
// USGS National Map (public domain). Run by hand when the imagery should be refreshed:
//
//   node starship-catch/scripts/bake-ground.mjs
//
// Writes two square photographs centred on the Pad 1 launch tower and a small JSON file
// that records where they are and when they were flown. No dependencies.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SERVICE = 'https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer'
const OUT = fileURLToPath(new URL('../public/ground/', import.meta.url))

// The base of the Pad 1 launch tower, read off the imagery itself.
const TOWER = { lat: 25.99623, lon: -97.15464 }
const LAYERS = [
  { name: 'near', metres: 1_600, pixels: 2048 },
  { name: 'wide', metres: 16_000, pixels: 2048 },
]

const METRES_PER_DEG_LAT = 110_800
const METRES_PER_DEG_LON = 111_320 * Math.cos((TOWER.lat * Math.PI) / 180)

async function get(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response
}

await fs.mkdir(OUT, { recursive: true })

for (const layer of LAYERS) {
  const dLat = layer.metres / 2 / METRES_PER_DEG_LAT
  const dLon = layer.metres / 2 / METRES_PER_DEG_LON
  const bbox = [TOWER.lon - dLon, TOWER.lat - dLat, TOWER.lon + dLon, TOWER.lat + dLat].map((v) => v.toFixed(6)).join(',')
  const url = `${SERVICE}/exportImage?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=${layer.pixels},${layer.pixels}&format=jpg&compressionQuality=82&f=image`
  const image = Buffer.from(await (await get(url)).arrayBuffer())
  await fs.writeFile(path.join(OUT, `${layer.name}.jpg`), image)
  console.log(`${layer.name}.jpg ${(image.length / 1024).toFixed(0)} kB`)
}

// When the photograph under the tower was flown.
const query = new URLSearchParams({
  geometry: `${TOWER.lon},${TOWER.lat}`,
  geometryType: 'esriGeometryPoint',
  inSR: '4326',
  spatialRel: 'esriSpatialRelIntersects',
  outFields: 'Year,acquisition_date,Category',
  returnGeometry: 'false',
  f: 'json',
})
const catalogue = await (await get(`${SERVICE}/query?${query}`)).json()
const primary = catalogue.features.map((f) => f.attributes).filter((a) => a.Category === 1 && a.acquisition_date)
primary.sort((a, b) => b.acquisition_date - a.acquisition_date)
const flown = primary[0] ? new Date(primary[0].acquisition_date).toISOString().slice(0, 10) : null

const meta = {
  tower: TOWER,
  flown,
  layers: LAYERS.map(({ name, metres }) => ({ name, metres, file: `${name}.jpg` })),
}
await fs.writeFile(path.join(OUT, 'ground.json'), JSON.stringify(meta, null, 2) + '\n')
console.log(`flown ${flown}`)
