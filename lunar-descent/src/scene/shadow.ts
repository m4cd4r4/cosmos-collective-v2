// The lander's shadow, cast by the game's Sun on to the real terrain. With the Sun 1.5
// degrees up, a 50 m lander throws a shadow about 1.9 km long, and a lander 10 m up
// throws it 380 m to one side: it only reaches the lander's feet at touchdown.

import * as THREE from 'three'
import { MOON_RADIUS, type State } from '../sim/physics'
import { STARSHIP_HLS } from '../data/facts'
import type { Terrain } from './terrain'

export const LANDER_HEIGHT = STARSHIP_HLS.height.value
export const LANDER_RADIUS = 4.5

const SHADOW_POINTS = 96
/** Shadows starting further than this from the lander are not drawn, m. */
const SHADOW_REACH = 6_000

/** Track coordinates and height above the target's elevation, to the Moon frame. */
type Place = (along: number, across: number, height: number, out: THREE.Vector3) => THREE.Vector3

export interface Shadow {
  mesh: THREE.Mesh
  /** True when nothing stands between this point and the Sun. Height is above the target's elevation. */
  sunlit(along: number, height: number): boolean
  /**
   * Lay the shadow of the lander's axis on the ground. `poseDeg` is the axis angle above the
   * horizon, as pitch is. Returns false when the shadow falls beyond `SHADOW_REACH`.
   */
  cast(state: State, radarAltitude: number, poseDeg: number): boolean
}

export function createShadow(terrain: Terrain, place: Place): Shadow {
  const sunElevation = Math.asin(terrain.sunDirection.y)
  const tanSun = Math.tan(sunElevation)
  const awayAlong = -terrain.sunDirection.x / Math.cos(sunElevation)
  const awayAcross = -terrain.sunDirection.z / Math.cos(sunElevation)
  const positions = new THREE.BufferAttribute(new Float32Array(SHADOW_POINTS * 2 * 3), 3)
  const alpha = new THREE.BufferAttribute(new Float32Array(SHADOW_POINTS * 2), 1)
  const index: number[] = []
  for (let i = 0; i < SHADOW_POINTS - 1; i++) index.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 2, 2 * i + 1, 2 * i + 3)
  const mesh = new THREE.Mesh(
    new THREE.BufferGeometry().setAttribute('position', positions).setAttribute('alpha', alpha).setIndex(index),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      vertexShader: 'attribute float alpha; varying float vAlpha; void main() { vAlpha = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying float vAlpha; void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, vAlpha); }',
    }),
  )
  mesh.frustumCulled = false
  mesh.visible = false
  const point = new THREE.Vector3()

  function sunlit(along: number, height: number): boolean {
    for (let d = 20; d < 40_000; d *= 1.06) {
      const ray = height + d * tanSun + (d * d) / (2 * MOON_RADIUS)
      if (ray > 9_000) return true
      if (ray < terrain.heightAt(along - awayAlong * d, -awayAcross * d)) return false
    }
    return true
  }

  function cast(state: State, radarAltitude: number, poseDeg: number): boolean {
    const pose = (poseDeg * Math.PI) / 180
    const lean = -Math.cos(pose)
    const rise = Math.sin(pose)
    const near = (Math.max(0, radarAltitude) / tanSun) * 0.7
    if (near > SHADOW_REACH) return false
    const far = Math.min(SHADOW_REACH, ((radarAltitude + LANDER_HEIGHT) / tanSun) * 1.3 + 60)
    const along0 = -state.range
    for (let i = 0; i < SHADOW_POINTS; i++) {
      const d = near + ((far - near) * i) / (SHADOW_POINTS - 1)
      // Which point of the axis, `s` metres from the base, shades the ground this far away:
      // its height must equal the ground height plus the rise of a ray to the Sun over `d`.
      let s = 0
      let ground = 0
      for (let pass = 0; pass < 3; pass++) {
        ground = terrain.heightAt(along0 + lean * s + awayAlong * d, awayAcross * d)
        const need = ground + d * tanSun + (d * d) / (2 * MOON_RADIUS) - state.altitude
        s = Math.abs(rise) > 0.05 ? need / rise : need > 0 ? LANDER_HEIGHT + 10 : -10
        s = Math.min(LANDER_HEIGHT + 10, Math.max(-10, s))
      }
      const along = along0 + lean * s + awayAlong * d
      const acrossTrack = awayAcross * d
      // The Sun's disc is half a degree wide, so the shadow softens with distance.
      const sharp = (2 * LANDER_RADIUS) / (2 * LANDER_RADIUS + 0.0093 * d)
      const inside = Math.min(1, Math.max(0, s / 2)) * Math.min(1, Math.max(0, (LANDER_HEIGHT - s) / 2))
      for (const edge of [-1, 1]) {
        const k = 2 * i + (edge + 1) / 2
        place(along - awayAcross * edge * LANDER_RADIUS, acrossTrack + awayAlong * edge * LANDER_RADIUS, ground + 0.4, point)
        positions.setXYZ(k, point.x, point.y, point.z)
        alpha.setX(k, 0.88 * sharp * inside)
      }
    }
    positions.needsUpdate = true
    alpha.needsUpdate = true
    return true
  }

  return { mesh, sunlit, cast }
}
