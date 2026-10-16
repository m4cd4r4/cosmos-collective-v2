/**
 * Satellite catalogue: turns GP rows into SGP4 records and propagates them.
 *
 * Scene frame: Earth-fixed (ECEF), Earth radius = 1 unit, three.js Y-up.
 * ECEF (X, Y, Z) maps to scene (X, Z, -Y), which matches how a three.js
 * SphereGeometry lays out an equirectangular texture (lon 0 at +X, 90E at -Z).
 * Holding the Earth still and moving everything else keeps the texture,
 * the day/night shader and the satellites in one consistent frame.
 */

import {
  json2satrec,
  propagate,
  gstime,
  eciToEcf,
  eciToGeodetic,
  degreesLat,
  degreesLong,
  type SatRec,
} from 'satellite.js'
import { classifyOrbit, altitudesKm, EARTH_RADIUS_KM, type OrbitClass } from './orbit'
import { expandGp, type CompactGp } from './gp'

export const ORBIT_CLASSES: OrbitClass[] = ['LEO', 'MEO', 'GEO', 'HEO']

export type Constellation =
  | 'Starlink' | 'OneWeb' | 'Kuiper' | 'Qianfan' | 'Iridium' | 'GPS' | 'GLONASS'
  | 'Galileo' | 'BeiDou' | 'Stations' | 'Other'

/** Order matters: first match wins. */
const CONSTELLATION_RULES: Array<[Constellation, RegExp]> = [
  ['Starlink', /^STARLINK/i],
  ['OneWeb', /^ONEWEB/i],
  ['Kuiper', /^(KUIPER|PROJECT KUIPER)/i],
  ['Qianfan', /^(QIANFAN|SPACESAIL)/i],
  ['Iridium', /^IRIDIUM/i],
  ['GPS', /^(GPS |NAVSTAR)/i],
  ['GLONASS', /GLONASS/i],
  ['Galileo', /GALILEO|^GSAT0[0-9]{3}/i],
  ['BeiDou', /^BEIDOU/i],
]

export const CONSTELLATIONS: Constellation[] = [
  'Starlink', 'OneWeb', 'Kuiper', 'Qianfan', 'Iridium', 'GPS', 'GLONASS', 'Galileo', 'BeiDou', 'Stations', 'Other',
]

export const ISS_NORAD = 25544
export const TIANGONG_NORAD = 48274
/** ISS and Chinese Space Station modules, plus visiting craft CelesTrak lists as stations. */
const STATION_NORADS = new Set([ISS_NORAD, TIANGONG_NORAD])

export function constellationOf(name: string, norad: number): Constellation {
  if (STATION_NORADS.has(norad)) return 'Stations'
  for (const [c, re] of CONSTELLATION_RULES) if (re.test(name)) return c
  return 'Other'
}

export interface Catalog {
  count: number
  names: string[]
  norad: Int32Array
  objectId: string[]
  epochMs: Float64Array
  orbitClass: Uint8Array // index into ORBIT_CLASSES
  constellation: Uint8Array // index into CONSTELLATIONS
  meanMotion: Float32Array
  eccentricity: Float32Array
  inclination: Float32Array
  satrecs: SatRec[]
  indexByNorad: Map<number, number>
}

export function buildCatalog(rows: CompactGp[]): Catalog {
  const satrecs: SatRec[] = []
  const names: string[] = []
  const objectId: string[] = []
  const norad: number[] = []
  const epochMs: number[] = []
  const orbitClass: number[] = []
  const constellation: number[] = []
  const meanMotion: number[] = []
  const eccentricity: number[] = []
  const inclination: number[] = []

  for (const row of rows) {
    const gp = expandGp(row)
    let rec: SatRec
    try {
      rec = json2satrec(gp as never)
    } catch {
      continue
    }
    if (rec.error) continue
    satrecs.push(rec)
    names.push(gp.OBJECT_NAME.trim())
    objectId.push(gp.OBJECT_ID)
    norad.push(gp.NORAD_CAT_ID)
    epochMs.push(Date.parse(gp.EPOCH.endsWith('Z') ? gp.EPOCH : `${gp.EPOCH}Z`))
    orbitClass.push(ORBIT_CLASSES.indexOf(classifyOrbit(gp.MEAN_MOTION, gp.ECCENTRICITY)))
    constellation.push(CONSTELLATIONS.indexOf(constellationOf(gp.OBJECT_NAME, gp.NORAD_CAT_ID)))
    meanMotion.push(gp.MEAN_MOTION)
    eccentricity.push(gp.ECCENTRICITY)
    inclination.push(gp.INCLINATION)
  }

  return {
    count: satrecs.length,
    names,
    norad: Int32Array.from(norad),
    objectId,
    epochMs: Float64Array.from(epochMs),
    orbitClass: Uint8Array.from(orbitClass),
    constellation: Uint8Array.from(constellation),
    meanMotion: Float32Array.from(meanMotion),
    eccentricity: Float32Array.from(eccentricity),
    inclination: Float32Array.from(inclination),
    satrecs,
    indexByNorad: new Map(norad.map((n, i) => [n, i])),
  }
}

/** ECEF km to scene units (Earth radius = 1). */
export function ecefToScene(x: number, y: number, z: number, out: Float32Array | number[], o: number) {
  out[o] = x / EARTH_RADIUS_KM
  out[o + 1] = z / EARTH_RADIUS_KM
  out[o + 2] = -y / EARTH_RADIUS_KM
}

/** True when a position pair from satellite.js is a real vector, not an error flag. */
type Propagated = Extract<ReturnType<typeof propagate>, { position: unknown }>
function hasPosition(pv: ReturnType<typeof propagate>): pv is Propagated {
  return !!pv && typeof pv === 'object' && !!(pv as { position?: unknown }).position && typeof (pv as { position: unknown }).position !== 'boolean'
}

/**
 * Write scene positions for every satellite. Failed propagations (decayed
 * or bad elements) are parked at the Earth's centre, hidden by the globe, and
 * flagged false in `valid`.
 */
export function propagateAll(catalog: Catalog, date: Date, out: Float32Array, valid: Uint8Array): void {
  const gmst = gstime(date)
  for (let i = 0; i < catalog.count; i++) {
    const pv = propagate(catalog.satrecs[i], date)
    if (!hasPosition(pv)) {
      out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = 0
      valid[i] = 0
      continue
    }
    const e = eciToEcf(pv.position, gmst)
    ecefToScene(e.x, e.y, e.z, out, i * 3)
    valid[i] = 1
  }
}

export interface LiveState {
  lat: number
  lon: number
  altitudeKm: number
  speedKmS: number
  scene: [number, number, number]
}

/** Full state for one satellite at one instant. */
export function stateOf(catalog: Catalog, index: number, date: Date): LiveState | null {
  const pv = propagate(catalog.satrecs[index], date)
  if (!hasPosition(pv)) return null
  const gmst = gstime(date)
  const geo = eciToGeodetic(pv.position, gmst)
  const e = eciToEcf(pv.position, gmst)
  const scene: [number, number, number] = [0, 0, 0]
  ecefToScene(e.x, e.y, e.z, scene, 0)
  const { x, y, z } = pv.velocity
  return {
    lat: degreesLat(geo.latitude),
    lon: degreesLong(geo.longitude),
    altitudeKm: geo.height,
    speedKmS: Math.sqrt(x * x + y * y + z * z),
    scene,
  }
}

/**
 * One full orbit as a closed ring of scene-space points. The path is the
 * inertial orbit shape, rotated into the Earth-fixed frame at `date`, so it
 * reads as the true ring around the globe (not a drifting ground track).
 */
export function orbitRing(catalog: Catalog, index: number, date: Date, samples = 180): Float32Array {
  const rec = catalog.satrecs[index]
  const periodMs = (24 * 3600 * 1000) / catalog.meanMotion[index]
  const gmstNow = gstime(date)
  const out = new Float32Array(samples * 3)
  let n = 0
  for (let s = 0; s < samples; s++) {
    const t = new Date(date.getTime() + (s / samples) * periodMs)
    const pv = propagate(rec, t)
    if (!hasPosition(pv)) continue
    const e = eciToEcf(pv.position, gmstNow) // ECI rotated by "now" only
    ecefToScene(e.x, e.y, e.z, out, n * 3)
    n++
  }
  return out.subarray(0, n * 3)
}

export function describe(catalog: Catalog, index: number, now: Date) {
  const { perigee, apogee } = altitudesKm(catalog.meanMotion[index], catalog.eccentricity[index])
  return {
    name: catalog.names[index],
    norad: catalog.norad[index],
    objectId: catalog.objectId[index],
    orbitClass: ORBIT_CLASSES[catalog.orbitClass[index]],
    constellation: CONSTELLATIONS[catalog.constellation[index]],
    periodMin: 1440 / catalog.meanMotion[index],
    inclinationDeg: catalog.inclination[index],
    perigeeKm: perigee,
    apogeeKm: apogee,
    elementAgeHours: (now.getTime() - catalog.epochMs[index]) / 3_600_000,
  }
}
