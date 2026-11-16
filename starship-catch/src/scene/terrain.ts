// The ground from open data: three NAIP photographs, nested and centred on the Pad 1 tower,
// the inner two laid on USGS 3DEP elevation. Baked by scripts/bake-site.py.
// Beyond the widest photograph, and wherever the survey stops (offshore, south of the
// Rio Grande), the flat land and sea of ground.ts show through.

import * as THREE from 'three'
import { PAD1_X } from './pads'

export interface SiteMeta {
  padHeight: number
  layers: { name: string; metres: number; image: string; flown: Record<string, number>; dem?: string; demPixels?: number }[]
  sources: { imagery: string; elevation: string; lidar: string[] }
}

export interface Terrain {
  group: THREE.Group
  meta: SiteMeta
  /** The newest flight in the photographs, ISO. */
  flown: string | null
  /** Sea level in the game's frame, m. */
  seaLevel: number
  /** A see-through copy of the inner ground that shows only the shadows cast on it. */
  shadows: THREE.Mesh
}

/** Grid cells across each displaced layer. The pad layer's DEM is 4.7 m a pixel, so 255 cells keeps every sample. */
const CELLS: Record<string, number> = { pad: 255, site: 192, area: 128, region: 1 }

function displace(geometry: THREE.PlaneGeometry, heights: Int16Array, pixels: number) {
  const position = geometry.attributes.position as THREE.BufferAttribute
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  const sample = (col: number, row: number) => heights[Math.min(pixels - 1, Math.max(0, row)) * pixels + Math.min(pixels - 1, Math.max(0, col))] / 100
  for (let i = 0; i < position.count; i++) {
    // Row 0 of the DEM is the north edge, where v = 1.
    const fx = uv.getX(i) * (pixels - 1)
    const fy = (1 - uv.getY(i)) * (pixels - 1)
    const x0 = Math.floor(fx)
    const y0 = Math.floor(fy)
    const tx = fx - x0
    const ty = fy - y0
    const h = (sample(x0, y0) * (1 - tx) + sample(x0 + 1, y0) * tx) * (1 - ty) + (sample(x0, y0 + 1) * (1 - tx) + sample(x0 + 1, y0 + 1) * tx) * ty
    // The plane lies in x and -y before it is turned flat, so its z becomes height.
    position.setZ(i, h)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
}

export async function loadTerrain(): Promise<Terrain> {
  const base = `${import.meta.env.BASE_URL}site/`
  const meta = (await (await fetch(`${base}site.json`)).json()) as SiteMeta
  const loader = new THREE.TextureLoader()
  const group = new THREE.Group()
  const seaLevel = -meta.padHeight

  const layers = [...meta.layers].sort((a, b) => b.metres - a.metres)
  const meshes = await Promise.all(
    layers.map(async (layer, i) => {
      const [map, dem] = await Promise.all([
        loader.loadAsync(base + layer.image),
        layer.dem ? fetch(base + layer.dem).then((r) => r.arrayBuffer()) : Promise.resolve(null),
      ])
      map.colorSpace = THREE.SRGBColorSpace
      // three clamps this to what the GPU allows.
      map.anisotropy = 8
      const cells = CELLS[layer.name] ?? 64
      const geometry = new THREE.PlaneGeometry(layer.metres, layer.metres, cells, cells)
      if (dem && layer.demPixels) displace(geometry, new Int16Array(dem), layer.demPixels)
      geometry.rotateX(-Math.PI / 2)
      const material = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })
      material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          // The survey stops offshore and at the border, and the photograph is black beyond it.
          diffuseColor.a *= smoothstep(0.02, 0.07, max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)));
          // Feather the square edge into the layer below, so no straight seam shows.
          vec2 edge = min(vMapUv, 1.0 - vMapUv);
          diffuseColor.a *= smoothstep(0.0, 0.08, min(edge.x, edge.y));`,
        )
      }
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(PAD1_X, dem ? 0 : seaLevel, 0)
      // Widest first, each painted over the last. All before the smoke and the rings.
      mesh.renderOrder = i - 20
      mesh.matrixAutoUpdate = false
      mesh.updateMatrix()
      return { mesh, layer }
    }),
  )
  for (const { mesh } of meshes) group.add(mesh)

  const inner = meshes[meshes.length - 1].mesh
  const shadows = new THREE.Mesh(inner.geometry, new THREE.ShadowMaterial({ opacity: 0.42, depthWrite: false }))
  shadows.position.copy(inner.position).y += 0.08
  shadows.receiveShadow = true
  shadows.renderOrder = -5
  group.add(shadows)

  const dates = meta.layers.flatMap((l) => Object.keys(l.flown)).sort()
  return { group, meta, flown: dates.at(-1) ?? null, seaLevel, shadows }
}
