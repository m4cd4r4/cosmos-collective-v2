// Loads the baked LOLA layers and builds one mesh per layer, draped on the lunar sphere.
// World frame: origin at the target, +Y up, +X along the direction of travel.

import * as THREE from 'three'
import { MOON_RADIUS } from '../sim/physics'

interface LayerMeta {
  name: string
  x0: number
  y1: number
  size: number
}

interface TerrainMeta {
  heightMinM: number
  heightStepM: number
  grid: number
  layers: LayerMeta[]
  target: { x: number; y: number; heightM: number; latitudeDeg: number; longitudeDeg: number }
  sun: { elevationDeg: number; x: number; y: number }
  approach: { x: number; y: number }
}

interface Layer extends LayerMeta {
  heights: Uint16Array
}

export interface Terrain {
  group: THREE.Group
  meta: TerrainMeta
  /** Unit vector towards the Sun in world space. */
  sunDirection: THREE.Vector3
  /** Ground height above the target's elevation, at a point on the approach track. */
  heightAt(along: number, across?: number): number
  /** Ground slope in degrees at a point on the approach track, over a 10 m baseline. */
  slopeAt(along: number): number
}

const BASE = `${import.meta.env.BASE_URL}terrain/`

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vDistance;
  void main() {
    vUv = uv;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vDistance = -view.z;
    gl_Position = projectionMatrix * view;
  }
`

const FRAGMENT = /* glsl */ `
  uniform sampler2D shade;
  uniform vec4 hole; // uv rectangle covered by the next finer layer
  varying vec2 vUv;
  varying float vDistance;
  void main() {
    if (vUv.x > hole.x && vUv.x < hole.z && vUv.y > hole.y && vUv.y < hole.w) discard;
    float s = texture2D(shade, vUv).r;
    float light = s * s; // the bake stores the square root
    // Regolith: a warm grey. Shadowed ground keeps a trace of light scattered off nearby slopes.
    vec3 lit = vec3(0.86, 0.83, 0.78) * light * 3.2;
    vec3 shadow = vec3(0.012, 0.014, 0.02);
    vec3 colour = shadow + lit;
    gl_FragColor = vec4(pow(min(colour, vec3(1.0)), vec3(1.0 / 2.2)), 1.0);
  }
`

export async function loadTerrain(reducedDetail: boolean): Promise<Terrain> {
  const meta: TerrainMeta = await (await fetch(`${BASE}terrain.json`)).json()
  const loader = new THREE.TextureLoader()
  const layers: Layer[] = await Promise.all(
    meta.layers.map(async (layer) => ({
      ...layer,
      heights: new Uint16Array(await (await fetch(`${BASE}${layer.name}-height.bin`)).arrayBuffer()),
    })),
  )
  const n = meta.grid
  const a = meta.approach
  const { target } = meta

  const heightIn = (layer: Layer, sx: number, sy: number): number | null => {
    const u = ((sx - layer.x0) / layer.size) * (n - 1)
    const v = ((layer.y1 - sy) / layer.size) * (n - 1)
    if (u < 0 || v < 0 || u > n - 1 || v > n - 1) return null
    const i = Math.min(n - 2, Math.floor(u))
    const j = Math.min(n - 2, Math.floor(v))
    const fu = u - i
    const fv = v - j
    const h = layer.heights
    const top = h[j * n + i] * (1 - fu) + h[j * n + i + 1] * fu
    const bottom = h[(j + 1) * n + i] * (1 - fu) + h[(j + 1) * n + i + 1] * fu
    return meta.heightMinM + (top * (1 - fv) + bottom * fv) * meta.heightStepM
  }

  const finestFirst = [...layers].reverse()
  const stereoHeight = (sx: number, sy: number): number => {
    for (const layer of finestFirst) {
      const h = heightIn(layer, sx, sy)
      if (h !== null) return h
    }
    return 0
  }
  // Track coordinates (metres along the direction of travel, metres to the right) to map metres.
  const toStereo = (along: number, across: number): [number, number] => [
    target.x + along * a.x + across * a.y,
    target.y + along * a.y - across * a.x,
  ]
  const heightAt = (along: number, across = 0) => stereoHeight(...toStereo(along, across)) - target.heightM

  // Map metres to world space: flat offset from the target, wrapped onto the sphere.
  const datum = MOON_RADIUS + target.heightM
  const toWorld = (sx: number, sy: number, h: number, out: Float32Array, k: number) => {
    const dx = sx - target.x
    const dy = sy - target.y
    const along = dx * a.x + dy * a.y
    const across = dx * a.y - dy * a.x
    const d = Math.hypot(along, across) || 1
    const theta = d / MOON_RADIUS
    const radial = MOON_RADIUS + h
    const flat = (radial * Math.sin(theta)) / d
    out[k] = along * flat
    out[k + 1] = radial * Math.cos(theta) - datum
    out[k + 2] = across * flat
  }

  const group = new THREE.Group()
  const stride = reducedDetail ? 2 : 1
  const m = Math.floor((n - 1) / stride) + 1
  layers.forEach((layer, index) => {
    const positions = new Float32Array(m * m * 3)
    const uvs = new Float32Array(m * m * 2)
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < m; i++) {
        const gi = Math.min(n - 1, i * stride)
        const gj = Math.min(n - 1, j * stride)
        const sx = layer.x0 + (gi / (n - 1)) * layer.size
        const sy = layer.y1 - (gj / (n - 1)) * layer.size
        const h = meta.heightMinM + layer.heights[gj * n + gi] * meta.heightStepM
        toWorld(sx, sy, h, positions, (j * m + i) * 3)
        uvs[(j * m + i) * 2] = gi / (n - 1)
        uvs[(j * m + i) * 2 + 1] = 1 - gj / (n - 1)
      }
    }
    const indices = new Uint32Array((m - 1) * (m - 1) * 6)
    let k = 0
    for (let j = 0; j < m - 1; j++) {
      for (let i = 0; i < m - 1; i++) {
        const p = j * m + i
        indices.set([p, p + m, p + 1, p + 1, p + m, p + m + 1], k)
        k += 6
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))

    const texture = loader.load(`${BASE}${layer.name}-shade.webp`)
    texture.anisotropy = 8
    const inner = layers[index + 1]
    // Shrink the hole slightly so the finer layer always overlaps its edge.
    const pad = inner ? inner.size * 0.01 : 0
    const hole = inner
      ? new THREE.Vector4(
          (inner.x0 + pad - layer.x0) / layer.size,
          1 - (layer.y1 - (inner.y1 - inner.size + pad)) / layer.size,
          (inner.x0 + inner.size - pad - layer.x0) / layer.size,
          1 - (layer.y1 - (inner.y1 - pad)) / layer.size,
        )
      : new THREE.Vector4(2, 2, 2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { shade: { value: texture }, hole: { value: hole } },
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    group.add(mesh)
  })

  const el = (meta.sun.elevationDeg * Math.PI) / 180
  const sunAlong = meta.sun.x * a.x + meta.sun.y * a.y
  const sunAcross = meta.sun.x * a.y - meta.sun.y * a.x
  const sunDirection = new THREE.Vector3(sunAlong * Math.cos(el), Math.sin(el), sunAcross * Math.cos(el)).normalize()

  return {
    group,
    meta,
    sunDirection,
    heightAt,
    slopeAt: (along) => {
      const dx = (heightAt(along + 5) - heightAt(along - 5)) / 10
      const dz = (heightAt(along, 5) - heightAt(along, -5)) / 10
      return (Math.atan(Math.hypot(dx, dz)) * 180) / Math.PI
    },
  }
}
