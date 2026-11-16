import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { TUNING } from '../sim/flight'
import { materials } from './kit'
import { ARM_HEIGHT, PAD1_X, createPads } from './pads'

describe('site models', () => {
  it('stands the Pad 1 tower where the sim puts it', () => {
    expect(PAD1_X).toBe(TUNING.towerFace - TUNING.towerWidth / 2)
    const { pad1 } = createPads()
    expect(pad1.group.position.x).toBe(PAD1_X)
    expect(pad1.group.position.z).toBeCloseTo(0)
    pad1.group.updateMatrixWorld(true)
    // The east face of the lattice is the sim's tower face; the corner columns are 1.6 m thick.
    const box = new THREE.Box3().setFromObject(pad1.group.children[0])
    expect(box.max.x).toBeCloseTo(TUNING.towerFace + 0.8, 1)
    expect(box.max.y).toBeGreaterThanOrEqual(TUNING.towerHeight)
  })

  it('puts the closed catch rails at the arm height and as far out as the sim reaches', () => {
    const { pad1 } = createPads()
    pad1.setArms(1)
    pad1.group.updateMatrixWorld(true)
    const rails = new THREE.Box3()
    pad1.group.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.material === materials.stainless) rails.expandByObject(mesh)
    })
    expect(rails.max.y).toBeCloseTo(ARM_HEIGHT, 0)
    expect(rails.max.x).toBeGreaterThan(TUNING.armReach - 4)
    expect(rails.max.x).toBeLessThanOrEqual(TUNING.armReach)
  })
})
