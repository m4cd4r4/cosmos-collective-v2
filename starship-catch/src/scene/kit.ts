// Small building blocks for the site models: straight members between two points, merged
// into one mesh per material so a whole lattice tower is a handful of draw calls.

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type V3 = [number, number, number]

const UP = new THREE.Vector3(0, 1, 0)
const a = new THREE.Vector3()
const b = new THREE.Vector3()
const mid = new THREE.Vector3()
const dir = new THREE.Vector3()
const turn = new THREE.Quaternion()
const scale = new THREE.Vector3(1, 1, 1)
const matrix = new THREE.Matrix4()

/** A square-section member from `from` to `to`, `size` m across. */
export function member(from: V3, to: V3, size: number, depth = size): THREE.BufferGeometry {
  a.set(...from)
  b.set(...to)
  const length = a.distanceTo(b)
  const geometry = new THREE.BoxGeometry(size, length, depth)
  mid.addVectors(a, b).multiplyScalar(0.5)
  dir.subVectors(b, a).normalize()
  turn.setFromUnitVectors(UP, dir)
  matrix.compose(mid, turn, scale)
  geometry.applyMatrix4(matrix)
  return geometry
}

/** A box with its centre at `at`. */
export function block(at: V3, size: V3): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(...size)
  geometry.translate(...at)
  return geometry
}

/** A cylinder along y, base at `at`. */
export function drum(at: V3, radius: number, height: number, segments = 24, open = false): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments, 1, open)
  geometry.translate(at[0], at[1] + height / 2, at[2])
  return geometry
}

/** A horizontal tank with domed ends, lying along x, centre at `at`. */
export function horizontalTank(at: V3, radius: number, length: number, segments = 18): THREE.BufferGeometry {
  const barrel = Math.max(0.1, length - radius)
  const parts: THREE.BufferGeometry[] = [new THREE.CylinderGeometry(radius, radius, barrel, segments, 1, true)]
  for (const side of [-1, 1]) {
    const cap = new THREE.SphereGeometry(radius, segments, 6, 0, Math.PI * 2, 0, Math.PI / 2)
    cap.scale(1, 0.5, 1)
    if (side < 0) cap.rotateX(Math.PI)
    cap.translate(0, (side * barrel) / 2, 0)
    parts.push(cap)
  }
  const geometry = merge(parts.map((p) => p.toNonIndexed()))
  geometry.rotateZ(Math.PI / 2)
  geometry.translate(...at)
  return geometry
}

/** Merges geometries that share one material. Drops uvs where only some have them. */
export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const flat = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name)
    return g
  })
  const merged = mergeGeometries(flat, false)
  if (!merged) throw new Error('merge failed')
  merged.computeBoundingSphere()
  return merged
}

export const materials = {
  /** Weathered structural steel: the towers and the arms. */
  tower: new THREE.MeshStandardMaterial({ color: 0x3f434a, roughness: 0.72, metalness: 0.45 }),
  /** The far view of a tower: darker, because from a distance the dense lattice reads as one dark mass. */
  towerFar: new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.8, metalness: 0.3 }),
  arms: new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: 0.6, metalness: 0.5 }),
  /** Bright stainless: tank shells and the catch rails. */
  stainless: new THREE.MeshStandardMaterial({ color: 0xd9dcdf, roughness: 0.28, metalness: 0.85 }),
  /** Painted white tanks and cladding. */
  white: new THREE.MeshStandardMaterial({ color: 0xe9e8e3, roughness: 0.55, metalness: 0.05 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xbdb7aa, roughness: 0.95, metalness: 0 }),
  scorched: new THREE.MeshStandardMaterial({ color: 0x3a3836, roughness: 0.9, metalness: 0.2 }),
  pipe: new THREE.MeshStandardMaterial({ color: 0x8d9298, roughness: 0.5, metalness: 0.6 }),
  shadow: new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 1, metalness: 0 }),
}

export function mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material)
  m.matrixAutoUpdate = false
  m.updateMatrix()
  return m
}
