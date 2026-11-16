// Models of the Super Heavy booster and the ship. Proportions from published heights and
// diameter; engine counts from SpaceX (33 on the booster: 13 in the centre, 20 round the edge;
// 6 on the ship, 3 sea-level and 3 vacuum). Bare stainless steel on the booster; black hexagonal
// tiles on the ship's windward side only. No logos or livery. Grid fins, chines, the hot-staging
// ring, the raceway, weld rings and the frost band are representative shapes from public photos,
// not drawings.

import * as THREE from 'three'
import { ENGINES, SHIP_ENGINES, VEHICLE } from '../data/facts'
import { noiseTexture } from './sky'

const RADIUS = VEHICLE.diameter.value / 2
export const BOOSTER_HEIGHT = VEHICLE.boosterHeight.value
const SHIP_HEIGHT = VEHICLE.shipHeight.value
/** Height of one rolled steel ring, m, as built. Representative. */
const RING = 1.83

export interface Plume {
  group: THREE.Group
  /** `level` 0 to 1 is the throttle, `engines` how many are lit, `thin` 0 at sea level to 1 in vacuum. */
  set(level: number, engines: number, thin: number, clock: number): void
}

export interface Vehicle {
  group: THREE.Group
  plume: Plume
}

let seed = 1
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

/**
 * The booster's skin, drawn once: weld lines between rings with one vertical seam each, faint
 * streaks, soot round the engines and the hot-staging ring, and frost where the cold propellant
 * still sits low in the oxygen tank on the way down. `rough` is the roughness map.
 */
function boosterSkin(): { colour: THREE.CanvasTexture; rough: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const w = 512
  const h = 2048
  const make = () => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    return [canvas, canvas.getContext('2d') as CanvasRenderingContext2D] as const
  }
  const [cc, c] = make()
  const [rc, r] = make()
  const [bc, b] = make()
  const row = (metres: number) => (1 - metres / BOOSTER_HEIGHT) * h
  seed = 5
  c.fillStyle = '#c4c6c8'
  c.fillRect(0, 0, w, h)
  r.fillStyle = 'rgb(92,92,92)'
  r.fillRect(0, 0, w, h)
  b.fillStyle = 'rgb(128,128,128)'
  b.fillRect(0, 0, w, h)
  for (let y0 = 0; y0 < BOOSTER_HEIGHT; y0 += RING) {
    const top = row(y0 + RING)
    const bottom = row(y0)
    // Each sheet takes the light a little differently.
    const shade = 188 + Math.round(random() * 22)
    c.fillStyle = `rgb(${shade},${shade + 1},${shade + 3})`
    c.fillRect(0, top, w, bottom - top)
    const gloss = 60 + Math.round(random() * 28)
    r.fillStyle = `rgb(${gloss},${gloss},${gloss})`
    r.fillRect(0, top, w, bottom - top)
    // The weld: a raised, duller, darker bead.
    c.fillStyle = 'rgba(70,66,60,0.55)'
    c.fillRect(0, bottom - 2, w, 3)
    r.fillStyle = 'rgb(150,150,150)'
    r.fillRect(0, bottom - 2, w, 3)
    b.fillStyle = 'rgb(200,200,200)'
    b.fillRect(0, bottom - 2, w, 3)
    const seam = Math.floor(random() * w)
    c.fillStyle = 'rgba(80,76,70,0.45)'
    c.fillRect(seam, top, 2, bottom - top)
    b.fillRect(seam, top, 2, bottom - top)
  }
  // Streaks down the barrel.
  for (let i = 0; i < 260; i++) {
    const x = random() * w
    const y = random() * h
    const len = 40 + random() * 300
    c.fillStyle = random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(40,36,30,0.06)'
    c.fillRect(x, y, 1 + random() * 2, len)
  }
  // Frost over the bottom of the oxygen tank, patchy at its top edge.
  const frostTop = row(21)
  const frostBottom = row(8.5)
  const frost = c.createLinearGradient(0, frostTop, 0, frostBottom)
  frost.addColorStop(0, 'rgba(236,239,243,0)')
  frost.addColorStop(0.35, 'rgba(236,239,243,0.32)')
  frost.addColorStop(1, 'rgba(236,239,243,0.5)')
  c.fillStyle = frost
  c.fillRect(0, frostTop, w, frostBottom - frostTop)
  r.fillStyle = 'rgba(205,205,205,0.55)'
  r.fillRect(0, frostTop + (frostBottom - frostTop) * 0.2, w, (frostBottom - frostTop) * 0.8)
  for (let i = 0; i < 1800; i++) {
    const x = random() * w
    const y = frostTop + (random() ** 0.5) * (frostBottom - frostTop) - 20
    const size = 1.5 + random() * 4
    const blob = c.createRadialGradient(x, y, 0, x, y, size)
    blob.addColorStop(0, `rgba(246,248,250,${0.18 + random() * 0.25})`)
    blob.addColorStop(1, 'rgba(246,248,250,0)')
    c.fillStyle = blob
    c.fillRect(x - size, y - size, size * 2, size * 2)
  }
  // Soot: heavy on the aft skirt, lighter on the hot-staging ring at the top.
  const soot = (from: number, to: number, alpha: number) => {
    const g = c.createLinearGradient(0, row(from), 0, row(to))
    g.addColorStop(0, `rgba(52,40,30,${alpha})`)
    g.addColorStop(1, 'rgba(52,40,30,0)')
    c.fillStyle = g
    c.fillRect(0, Math.min(row(from), row(to)), w, Math.abs(row(to) - row(from)))
  }
  soot(0, 7, 0.75)
  soot(BOOSTER_HEIGHT, BOOSTER_HEIGHT - 6, 0.45)
  const texture = (canvas: HTMLCanvasElement, colour: boolean) => {
    const t = new THREE.CanvasTexture(canvas)
    if (colour) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }
  return { colour: texture(cc, true), rough: texture(rc, false), bump: texture(bc, false) }
}

/** Black hexagonal tiles with pale gaps between them, to be repeated over the windward side. */
function tileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  const cols = 16
  const rows = 18
  const size = 512 / cols / Math.sqrt(3)
  // A whole number of tile rows, so the pattern repeats without a seam.
  canvas.width = 512
  canvas.height = Math.round(rows * size * 1.5)
  const c = canvas.getContext('2d') as CanvasRenderingContext2D
  c.fillStyle = '#3c3c3c'
  c.fillRect(0, 0, canvas.width, canvas.height)
  seed = 9
  for (let row = -1; row <= rows; row++) {
    for (let col = -1; col <= cols; col++) {
      const x = col * size * Math.sqrt(3) + (row % 2 ? (size * Math.sqrt(3)) / 2 : 0)
      const y = row * size * 1.5
      const v = 22 + Math.round(random() * 14)
      c.fillStyle = `rgb(${v},${v},${v + 2})`
      c.beginPath()
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k + Math.PI / 6
        c.lineTo(x + Math.cos(a) * size * 0.93, y + Math.sin(a) * size * 0.93)
      }
      c.fill()
    }
  }
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

const bellMaterial = () => new THREE.MeshStandardMaterial({ color: 0x3b3029, metalness: 0.85, roughness: 0.45, side: THREE.DoubleSide })
const darkSteel = () => new THREE.MeshStandardMaterial({ color: 0x5a5c60, metalness: 0.9, roughness: 0.5 })
const finMaterial = () => new THREE.MeshStandardMaterial({ color: 0x8f9296, metalness: 0.9, roughness: 0.42 })

/** A Raptor nozzle: bell profile from the throat down to the exit, origin at the throat, opening downwards. */
function bellGeometry(exit: number, length: number): THREE.LatheGeometry {
  const points: THREE.Vector2[] = []
  for (let i = 0; i <= 10; i++) {
    const t = i / 10
    points.push(new THREE.Vector2(exit * (0.32 + 0.68 * Math.sqrt(t)), -length * t))
  }
  return new THREE.LatheGeometry(points, 24)
}

/** A grid fin: a frame round a lattice of slats at 45 degrees, in one geometry. Span along x, height along y. */
function gridFin(span: number, height: number, depth: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  const bar = (length: number, x: number, y: number, angle: number, thick: number) => {
    const g = new THREE.BoxGeometry(length, thick, depth)
    g.rotateZ(angle)
    g.translate(x, y, 0)
    parts.push(g)
  }
  const frame = 0.14
  bar(span, 0, height / 2, 0, frame)
  bar(span, 0, -height / 2, 0, frame)
  bar(height, -span / 2, 0, Math.PI / 2, frame)
  bar(height, span / 2, 0, Math.PI / 2, frame)
  // Diagonal slats, clipped to the frame by keeping each inside it.
  const pitch = 0.42
  for (const dir of [1, -1]) {
    for (let k = -height - span; k <= height + span; k += pitch) {
      // Line y = dir * x + k, clipped to the rectangle.
      const xs: number[] = []
      for (const x of [-span / 2, span / 2]) {
        const y = dir * x + k
        if (Math.abs(y) <= height / 2) xs.push(x)
      }
      for (const y of [-height / 2, height / 2]) {
        const x = (y - k) / dir
        if (Math.abs(x) <= span / 2) xs.push(x)
      }
      if (xs.length < 2) continue
      const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
      const length = (x1 - x0) * Math.SQRT2
      if (length < 0.05) continue
      const mx = (x0 + x1) / 2
      bar(length, mx, dir * mx + k, (dir * Math.PI) / 4, 0.05)
    }
  }
  return mergeGeometries(parts)
}

/** Merges non-indexed copies of simple geometries into one. */
function mergeGeometries(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const flat = parts.map((g) => (g.index ? g.toNonIndexed() : g))
  const count = flat.reduce((n, g) => n + g.attributes.position.count, 0)
  const position = new Float32Array(count * 3)
  const normal = new Float32Array(count * 3)
  let offset = 0
  for (const g of flat) {
    position.set(g.attributes.position.array as Float32Array, offset * 3)
    normal.set(g.attributes.normal.array as Float32Array, offset * 3)
    offset += g.attributes.position.count
  }
  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(position, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
  return merged
}

interface EngineSpot {
  x: number
  z: number
  exit: number
}

/** The booster's engines, in lighting order: the 3 inner, the 10 round them (13 can steer and relight), then the 20 round the edge. */
function boosterEngines(): EngineSpot[] {
  const spots: EngineSpot[] = []
  const ring = (count: number, radius: number, phase: number) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + phase
      spots.push({ x: Math.cos(a) * radius, z: Math.sin(a) * radius, exit: 0.64 })
    }
  }
  ring(ENGINES.inner, 0.86, Math.PI / 2)
  ring(ENGINES.centre - ENGINES.inner, 2.45, 0)
  ring(ENGINES.outer, 3.82, Math.PI / ENGINES.outer)
  return spots
}

/** The plume: a bright core from each lit engine and one glowing envelope round them all. Additive light. */
function createPlume(spots: EngineSpot[]): Plume {
  const group = new THREE.Group()
  const noise = noiseTexture()
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 20, 16, true).translate(0, -0.5, 0)
  const material = (core: boolean) =>
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        plumeLength: { value: 1 },
        r0: { value: 1 },
        r1: { value: 1 },
        strength: { value: 0 },
        thin: { value: 0 },
        time: { value: 0 },
        noise: { value: noise },
      },
      vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>
uniform float plumeLength;
uniform float r0;
uniform float r1;
varying float vAlong;
varying float vFace;
varying float vAngle;
void main() {
  float along = -position.y;
  // The jet leaves each nozzle as a column and opens out downstream: wider the thinner the air.
  float radius = mix(r0, r1, pow(along, 0.75));
  vec3 p = vec3(position.x * radius, -along * plumeLength, position.z * radius);
  vec4 local = vec4(p, 1.0);
#ifdef USE_INSTANCING
  local = instanceMatrix * local;
#endif
  vec4 mv = modelViewMatrix * local;
  vec3 n = normalize(normalMatrix * vec3(position.x, 0.0, position.z));
  vFace = abs(dot(n, normalize(-mv.xyz)));
  vAlong = along;
  vAngle = atan(position.z, position.x);
  gl_Position = projectionMatrix * mv;
#include <logdepthbuf_vertex>
}`,
      fragmentShader: `
#include <logdepthbuf_pars_fragment>
uniform float strength;
uniform float thin;
uniform float time;
uniform sampler2D noise;
varying float vAlong;
varying float vFace;
varying float vAngle;
void main() {
#include <logdepthbuf_fragment>
  float a = vAlong;
  ${
    core
      ? `// Shock diamonds in dense air, washing out as the air thins.
  float diamonds = mix(0.55 + 0.45 * cos(a * 6.2832 * 5.0), 1.0, thin);
  float fall = pow(1.0 - a, 2.2);
  vec3 colour = mix(vec3(0.95, 0.9, 1.0), vec3(1.0, 0.72, 0.38), smoothstep(0.0, 0.7, a));
  float k = strength * fall * diamonds * (0.15 + 0.85 * vFace * vFace);`
      : `// The glowing envelope round the jets, turbulent and orange, fading downstream.
  float n = texture2D(noise, vec2(vAngle * 0.32 + a * 0.4, a * 1.6 - time * 1.8)).r;
  float fall = pow(1.0 - a, 1.4) * smoothstep(0.0, 0.06, a);
  vec3 colour = mix(vec3(1.0, 0.66, 0.32), vec3(0.95, 0.38, 0.14), a);
  float k = strength * fall * (0.45 + 0.9 * n) * pow(vFace, 1.5);`
  }
  gl_FragColor = vec4(colour * k, 1.0);
}`,
    })
  const coreMaterial = material(true)
  const cores = new THREE.InstancedMesh(geometry, coreMaterial, spots.length)
  cores.frustumCulled = false
  const at = new THREE.Object3D()
  spots.forEach((s, i) => {
    at.position.set(s.x, -1.2, s.z)
    at.updateMatrix()
    cores.setMatrixAt(i, at.matrix)
  })
  const envelopeMaterial = material(false)
  const envelope = new THREE.Mesh(geometry, envelopeMaterial)
  envelope.position.y = -1.2
  envelope.frustumCulled = false
  envelope.renderOrder = 2
  cores.renderOrder = 3
  // The inside of each lit bell, glowing.
  const glow = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1, 20).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.78, 0.55), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }),
    spots.length,
  )
  spots.forEach((s, i) => {
    at.position.set(s.x, -0.9, s.z)
    at.scale.setScalar(s.exit * 0.85)
    at.updateMatrix()
    glow.setMatrixAt(i, at.matrix)
  })
  glow.frustumCulled = false
  group.add(envelope, cores, glow)

  return {
    group,
    set(level, engines, thin, clock) {
      group.visible = level > 0.01 && engines > 0
      if (!group.visible) return
      const n = Math.min(engines, spots.length)
      cores.count = glow.count = n
      // The lit engines' spread: the 3 inner sit within about 1.5 m of the axis, the 13 within about 3 m.
      let spread = 0
      for (let i = 0; i < n; i++) spread = Math.max(spread, Math.hypot(spots[i].x, spots[i].z) + spots[i].exit)
      const flicker = 1 + Math.sin(clock * 53) * 0.03 + Math.sin(clock * 31) * 0.02
      const share = Math.sqrt(n / ENGINES.centre)
      const length = (22 + 70 * share) * (0.45 + 0.55 * level) * flicker * (1 + thin * 0.8)
      // Half-angle of the opening jet: narrow at sea level, opening out as ambient pressure drops.
      const spreadAngle = (6 + 34 * thin ** 1.2) * (Math.PI / 180)
      const c = coreMaterial.uniforms
      c.plumeLength.value = length * (0.42 - 0.12 * thin)
      c.r0.value = spots[0].exit * 0.9
      c.r1.value = spots[0].exit * (1.3 + 3 * thin)
      c.strength.value = (0.9 + 0.5 * level) * (1 - thin * 0.4)
      c.thin.value = thin
      const e = envelopeMaterial.uniforms
      e.plumeLength.value = length
      e.r0.value = spread
      e.r1.value = spread + length * Math.tan(spreadAngle)
      e.strength.value = (0.35 + 0.35 * level) * (0.6 + 0.4 * share) * (1 - thin * 0.35)
      e.time.value = clock
      e.thin.value = thin
    },
  }
}

/** Origin at the centre of the base, nose along +y. */
export function createBooster(): Vehicle {
  const group = new THREE.Group()
  const skin = boosterSkin()
  const steel = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: skin.colour,
    metalness: 1,
    roughness: 1,
    roughnessMap: skin.rough,
    bumpMap: skin.bump,
    bumpScale: 0.6,
  })
  const body = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS, RADIUS, BOOSTER_HEIGHT - 2, 96, 1, true), steel)
  body.position.y = BOOSTER_HEIGHT / 2 - 1
  group.add(body)

  // Hot-staging ring: a vented band on top, open between its posts, with a shield over the dome.
  const hsrHeight = 2
  const hsr = new THREE.Group()
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS - 0.35, RADIUS - 0.35, hsrHeight, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x1b1a19, metalness: 0.5, roughness: 0.8 }))
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, hsrHeight, 0.32), darkSteel(), 36)
  const at = new THREE.Object3D()
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2
    at.position.set(Math.cos(a) * (RADIUS - 0.12), 0, Math.sin(a) * (RADIUS - 0.12))
    at.rotation.set(0, -a, 0)
    at.updateMatrix()
    posts.setMatrixAt(i, at.matrix)
  }
  const band = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 0.03, RADIUS + 0.03, 0.3, 96, 1, true), darkSteel())
  band.position.y = hsrHeight / 2 - 0.15
  const lid = new THREE.Mesh(new THREE.SphereGeometry(RADIUS - 0.2, 48, 12, 0, Math.PI * 2, 0, Math.PI * 0.18), new THREE.MeshStandardMaterial({ color: 0x4a4744, metalness: 0.7, roughness: 0.6 }))
  lid.scale.y = 0.6
  lid.position.y = hsrHeight / 2 - RADIUS * 0.6 + 0.9
  hsr.add(inner, posts, band, lid)
  hsr.position.y = BOOSTER_HEIGHT - hsrHeight / 2
  group.add(hsr)

  // Four grid fins near the top, in two pairs, folded out flat.
  const finGeometry = gridFin(3.1, 4.4, 0.5)
  const fins = finMaterial()
  for (const centre of [0, Math.PI]) {
    for (const side of [-1, 1]) {
      const angle = centre + (side * Math.PI) / 6
      const fin = new THREE.Mesh(finGeometry, fins)
      const out = RADIUS + 1.75
      fin.position.set(Math.cos(angle) * out, BOOSTER_HEIGHT - 6.2, Math.sin(angle) * out)
      fin.rotation.y = -angle
      group.add(fin)
      // The actuator housing the fin hangs from.
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.6, 1.6), darkSteel())
      housing.position.set(Math.cos(angle) * (RADIUS + 0.3), BOOSTER_HEIGHT - 6.2, Math.sin(angle) * (RADIUS + 0.3))
      housing.rotation.y = -angle
      group.add(housing)
    }
  }

  // Chines low on the barrel, and the raceway running up one side.
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    const chine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 15, 1.4), steel)
    chine.position.set(Math.cos(angle) * (RADIUS + 0.35), 10.5, Math.sin(angle) * (RADIUS + 0.35))
    chine.rotation.y = -angle
    group.add(chine)
  }
  const raceway = new THREE.Mesh(new THREE.BoxGeometry(0.35, BOOSTER_HEIGHT - 14, 0.7), darkSteel())
  raceway.position.set(0, BOOSTER_HEIGHT / 2, RADIUS + 0.2)
  group.add(raceway)

  // The aft skirt and the engine bay under it: a sooted shield plate with 33 bells through it.
  const plate = new THREE.Mesh(new THREE.CircleGeometry(RADIUS, 64).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x24201c, metalness: 0.4, roughness: 0.85, side: THREE.DoubleSide }))
  plate.position.y = 0.05
  group.add(plate)
  const spots = boosterEngines()
  const bells = new THREE.InstancedMesh(bellGeometry(0.64, 1.6), bellMaterial(), spots.length)
  spots.forEach((s, i) => {
    at.position.set(s.x, 0.4, s.z)
    at.rotation.set(0, 0, 0)
    at.updateMatrix()
    bells.setMatrixAt(i, at.matrix)
  })
  group.add(bells)

  const plume = createPlume(spots)
  group.add(plume.group)
  return { group, plume }
}

/** The ship, standing, origin at its base. Not flown in the final approach; drawn for the opening to come. */
export function createShip(): Vehicle {
  const group = new THREE.Group()
  const barrel = SHIP_HEIGHT - 16
  const profile: THREE.Vector2[] = [new THREE.Vector2(RADIUS, 0), new THREE.Vector2(RADIUS, barrel)]
  for (let i = 1; i <= 20; i++) {
    const t = i / 20
    profile.push(new THREE.Vector2(Math.max(0.01, RADIUS * Math.cos((t * Math.PI) / 2) ** 0.75), barrel + 16 * Math.sin((t * Math.PI) / 2)))
  }
  const skin = boosterSkin()
  const steel = new THREE.MeshStandardMaterial({ color: 0xffffff, map: skin.colour, metalness: 1, roughness: 1, roughnessMap: skin.rough })
  group.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 96), steel))
  // Heat shield: tiles over the windward half, barrel and nose, standing just proud of the steel.
  const tiles = tileTexture()
  tiles.repeat.set(3, 11)
  const tileMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tiles, metalness: 0, roughness: 0.85 })
  const shieldProfile = profile.map((p) => new THREE.Vector2(p.x + 0.05, p.y))
  // Windward faces south (+z) here.
  const shield = new THREE.Mesh(new THREE.LatheGeometry(shieldProfile, 64, 0, Math.PI), tileMaterial)
  shield.rotation.y = -Math.PI / 2
  group.add(shield)
  // Flaps: two large aft, two small forward, on the edges of the tiled side, tiled on their windward face.
  for (const [y, length, span] of [
    [8, 11, 4.2],
    [barrel + 4, 7, 2.6],
  ]) {
    for (const side of [-1, 1]) {
      const flap = new THREE.Group()
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(span, length, 0.4), steel)
      const face = new THREE.Mesh(new THREE.PlaneGeometry(span, length), tileMaterial)
      face.position.z = 0.21
      flap.add(sheet, face)
      flap.position.set(side * (RADIUS + span / 2 - 0.2), y + length / 2, 0.6)
      group.add(flap)
    }
  }
  // Six engines: three sea-level in the middle, three wide vacuum bells round them.
  const bells = bellMaterial()
  for (let i = 0; i < SHIP_ENGINES.seaLevel; i++) {
    const a = (i / SHIP_ENGINES.seaLevel) * Math.PI * 2
    const b = new THREE.Mesh(bellGeometry(0.64, 1.6), bells)
    b.position.set(Math.cos(a) * 0.95, 0.3, Math.sin(a) * 0.95)
    group.add(b)
  }
  for (let i = 0; i < SHIP_ENGINES.vacuum; i++) {
    const a = (i / SHIP_ENGINES.vacuum) * Math.PI * 2 + Math.PI / 3
    const b = new THREE.Mesh(bellGeometry(1.15, 2.8), bells)
    b.position.set(Math.cos(a) * 2.95, 0.6, Math.sin(a) * 2.95)
    group.add(b)
  }
  const plate = new THREE.Mesh(new THREE.CircleGeometry(RADIUS, 64).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x24201c, metalness: 0.4, roughness: 0.85, side: THREE.DoubleSide }))
  plate.position.y = 0.05
  group.add(plate)
  const spots: EngineSpot[] = Array.from({ length: SHIP_ENGINES.seaLevel }, (_, i) => {
    const a = (i / SHIP_ENGINES.seaLevel) * Math.PI * 2
    return { x: Math.cos(a) * 0.95, z: Math.sin(a) * 0.95, exit: 0.64 }
  })
  const plume = createPlume(spots)
  group.add(plume.group)
  return { group, plume }
}
