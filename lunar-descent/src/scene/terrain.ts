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
  uniform sampler2D fill;
  uniform vec4 hole; // uv rectangle covered by the next finer layer
  varying vec2 vUv;
  varying float vDistance;
  void main() {
    if (vUv.x > hole.x && vUv.x < hole.z && vUv.y > hole.y && vUv.y < hole.w) discard;
    float s = texture2D(shade, vUv).r;
    float light = s * s; // the bake stores the square root
    // Regolith: a warm grey. Shadowed ground is lit faintly by sunlight scattered off the
    // sunlit slopes, which lie down-Sun of it, so it shows its relief. The effect is real;
    // its strength here is a game setting.
    vec3 lit = vec3(0.86, 0.83, 0.78) * light * 3.2;
    float f = texture2D(fill, vUv).r;
    vec3 shadow = vec3(0.012, 0.014, 0.02) * (0.25 + 2.6 * f * f);
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

  // How squarely each patch of ground faces the scattered light: a low, broad source in
  // the direction away from the Sun. Worked out from the same LOLA heights, per layer.
  const FILL_ELEVATION = (25 * Math.PI) / 180
  const fillTexture = (layer: Layer): THREE.DataTexture => {
    const data = new Uint8Array(n * n)
    const spacing = layer.size / (n - 1)
    const lx = -meta.sun.x * Math.cos(FILL_ELEVATION)
    const ly = -meta.sun.y * Math.cos(FILL_ELEVATION)
    const lz = Math.sin(FILL_ELEVATION)
    const h = (i: number, j: number) => layer.heights[Math.min(n - 1, Math.max(0, j)) * n + Math.min(n - 1, Math.max(0, i))] * meta.heightStepM
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        // Row 0 is the north (largest y) edge.
        const gx = (h(i + 1, j) - h(i - 1, j)) / (2 * spacing)
        const gy = (h(i, j - 1) - h(i, j + 1)) / (2 * spacing)
        const facing = (-gx * lx - gy * ly + lz) / Math.hypot(gx, gy, 1)
        // Stored bottom row first, which is how the mesh's uv reads it.
        data[(n - 1 - j) * n + i] = Math.round(255 * Math.min(1, Math.max(0, 0.5 + 0.5 * facing)))
      }
    }
    const texture = new THREE.DataTexture(data, n, n, THREE.RedFormat)
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }

  const group = new THREE.Group()
  const stride = reducedDetail ? 2 : 1
  const m = Math.floor((n - 1) / stride) + 1
  layers.forEach((layer, index) => {
    // A finer layer does not meet the coarser one at the same height, and the gap showed as
    // thin black lines. Each finer layer gets a skirt: its edge repeated, dropped below the ground.
    const skirt = index > 0 ? 4 * (m - 1) : 0
    const positions = new Float32Array((m * m + skirt) * 3)
    const uvs = new Float32Array((m * m + skirt) * 2)
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < m; i++) {
        const gi = Math.min(n - 1, i * stride)
        const gj = Math.min(n - 1, j * stride)
        const sx = layer.x0 + (gi / (n - 1)) * layer.size
        const sy = layer.y1 - (gj / (n - 1)) * layer.size
        let h = meta.heightMinM + layer.heights[gj * n + gi] * meta.heightStepM
        if (index > 0) {
          // Ease the outer band of a finer layer on to the coarser one, so the two meet
          // without a step. Drawn ground only; the flight rules read the fine heights.
          const inset = Math.min(gi, gj, n - 1 - gi, n - 1 - gj) / (n - 1)
          const t = Math.min(1, inset / 0.05)
          const outer = heightIn(layers[index - 1], sx, sy)
          if (t < 1 && outer !== null) h = outer + (h - outer) * t * t * (3 - 2 * t)
        }
        toWorld(sx, sy, h, positions, (j * m + i) * 3)
        uvs[(j * m + i) * 2] = gi / (n - 1)
        uvs[(j * m + i) * 2 + 1] = 1 - gj / (n - 1)
      }
    }
    const indices = new Uint32Array(((m - 1) * (m - 1) + skirt) * 6)
    let k = 0
    for (let j = 0; j < m - 1; j++) {
      for (let i = 0; i < m - 1; i++) {
        const p = j * m + i
        indices.set([p, p + m, p + 1, p + 1, p + m, p + m + 1], k)
        k += 6
      }
    }
    if (skirt) {
      // Walk the edge once round: top row, right column, bottom row back, left column up.
      const edge: number[] = []
      for (let i = 0; i < m - 1; i++) edge.push(i)
      for (let j = 0; j < m - 1; j++) edge.push(j * m + m - 1)
      for (let i = m - 1; i > 0; i--) edge.push((m - 1) * m + i)
      for (let j = m - 1; j > 0; j--) edge.push(j * m)
      const drop = layer.size * 0.04
      edge.forEach((p, e) => {
        const q = m * m + e
        positions.set([positions[p * 3], positions[p * 3 + 1] - drop, positions[p * 3 + 2]], q * 3)
        uvs.set([uvs[p * 2], uvs[p * 2 + 1]], q * 2)
        const next = (e + 1) % skirt
        indices.set([p, q, edge[next], edge[next], q, m * m + next], k)
        k += 6
      })
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
      uniforms: { shade: { value: texture }, fill: { value: fillTexture(layer) }, hole: { value: hole } },
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
