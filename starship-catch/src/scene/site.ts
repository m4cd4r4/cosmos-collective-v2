// The launch site: baked aerial photographs for the ground, and plain models of the tower,
// its two catch arms, the launch mount and the tank farm. Shapes and sizes are representative:
// SpaceX publishes no drawings, so no dimension of the tower appears on screen as a number.

import * as THREE from 'three'
import { TUNING } from '../sim/flight'

export interface Site {
  group: THREE.Group
  /** 0 = arms open, 1 = closed round the booster. */
  setArms(closed: number): void
  /** The date the ground photograph was flown, ISO, or null. */
  flown: string | null
}

interface GroundMeta {
  flown: string | null
  layers: { name: string; metres: number; file: string }[]
}

const TOWER_WIDTH = 12
const TOWER_X = TUNING.towerFace - TOWER_WIDTH / 2
/** Height of the top of the launch mount, m. The booster stands on it before liftoff. */
export const MOUNT_HEIGHT = 18
/** The arms meet the booster just below its grid fins. */
const ARM_HEIGHT = TUNING.catchHeight + 62
const ARM_LENGTH = 40
const BOOSTER_RADIUS = 4.5

/** A square of cross-braced steelwork with see-through gaps, tiled up the tower. */
function latticeTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const c = canvas.getContext('2d') as CanvasRenderingContext2D
  c.strokeStyle = '#ffffff'
  c.lineWidth = 12
  c.strokeRect(0, 0, size, size)
  c.lineWidth = 7
  c.beginPath()
  c.moveTo(0, 0)
  c.lineTo(size, size)
  c.moveTo(size, 0)
  c.lineTo(0, size)
  c.stroke()
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function lattice(width: number, height: number, depth: number, colour: number, across: number, up: number): THREE.Mesh {
  const map = latticeTexture()
  map.repeat.set(across, up)
  const material = new THREE.MeshStandardMaterial({ color: colour, map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8, metalness: 0.2 })
  return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
}

export async function loadSite(): Promise<Site> {
  const base = `${import.meta.env.BASE_URL}ground/`
  const meta = (await (await fetch(`${base}ground.json`)).json()) as GroundMeta
  const loader = new THREE.TextureLoader()
  const group = new THREE.Group()

  // Beyond the photographs: flat land to the west and the Gulf to the east. Colours sampled from the wide photograph.
  const far = 3_000_000
  const land = new THREE.Mesh(new THREE.PlaneGeometry(far, far), new THREE.MeshBasicMaterial({ color: 0x8f8a74 }))
  land.rotation.x = -Math.PI / 2
  land.position.set(-far / 2 + 400, -1, 0)
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(far, far), new THREE.MeshBasicMaterial({ color: 0x6f9c96 }))
  sea.rotation.x = -Math.PI / 2
  sea.position.set(far / 2 + 400, -1, 0)
  group.add(land, sea)

  // Photographs, widest first. Each is centred on the tower base and has north at the top.
  const layers = [...meta.layers].sort((a, b) => b.metres - a.metres)
  await Promise.all(
    layers.map(async (layer, i) => {
      const map = await loader.loadAsync(base + layer.file)
      map.colorSpace = THREE.SRGBColorSpace
      map.anisotropy = 8
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(layer.metres, layer.metres), new THREE.MeshBasicMaterial({ map, color: 0xfff1de }))
      plane.rotation.x = -Math.PI / 2
      plane.position.set(TOWER_X, -0.5 + i * 0.25, 0)
      plane.renderOrder = i
      group.add(plane)
    }),
  )

  const steel = new THREE.MeshStandardMaterial({ color: 0x8b9096, roughness: 0.7, metalness: 0.3 })
  const black = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.7, metalness: 0.3 })
  const white = new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.6, metalness: 0.1 })

  // Tower: a grey lattice column with a solid core, so it reads against the sky.
  const tower = lattice(TOWER_WIDTH, TUNING.towerHeight, TOWER_WIDTH, 0x9a9fa6, 1, 12)
  tower.position.set(TOWER_X, TUNING.towerHeight / 2, 0)
  const core = new THREE.Mesh(new THREE.BoxGeometry(5, TUNING.towerHeight - 2, 5), steel)
  core.position.copy(tower.position)
  const cap = new THREE.Mesh(new THREE.BoxGeometry(TOWER_WIDTH + 2, 5, TOWER_WIDTH + 2), steel)
  cap.position.set(TOWER_X, TUNING.towerHeight + 2.5, 0)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 14, 6), steel)
  mast.position.set(TOWER_X, TUNING.towerHeight + 12, 0)
  group.add(tower, core, cap, mast)

  // Catch arms: two black trusses hinged on a carriage on the tower's east face.
  const carriage = new THREE.Mesh(new THREE.BoxGeometry(4, 10, TOWER_WIDTH + 6), black)
  carriage.position.set(TUNING.towerFace + 1.5, ARM_HEIGHT - 1, 0)
  group.add(carriage)
  const arms = [-1, 1].map((side) => {
    const hinge = new THREE.Group()
    hinge.position.set(TUNING.towerFace + 2, ARM_HEIGHT, side * (BOOSTER_RADIUS + 1.4))
    const beam = lattice(ARM_LENGTH, 5, 2.6, 0x23262c, 7, 1)
    beam.position.x = ARM_LENGTH / 2
    const rail = new THREE.Mesh(new THREE.BoxGeometry(ARM_LENGTH, 0.8, 2.8), black)
    rail.position.set(ARM_LENGTH / 2, 2.6, 0)
    hinge.add(beam, rail)
    group.add(hinge)
    return { hinge, side }
  })
  const setArms = (closed: number) => {
    for (const { hinge, side } of arms) hinge.rotation.y = -side * (1 - closed) * 0.42
  }
  setArms(0)

  // Launch mount: a ring table on six legs, beside the tower and under the arms.
  const table = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 4, 32, 1, true), steel)
  table.position.y = MOUNT_HEIGHT - 2
  const deck = new THREE.Mesh(new THREE.RingGeometry(BOOSTER_RADIUS + 0.4, 9, 32), steel)
  deck.rotation.x = -Math.PI / 2
  deck.position.y = MOUNT_HEIGHT
  group.add(table, deck)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.3
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, MOUNT_HEIGHT - 3, 10), steel)
    leg.position.set(Math.cos(angle) * 8, (MOUNT_HEIGHT - 3) / 2, Math.sin(angle) * 8)
    group.add(leg)
  }

  // Tank farm: white vertical tanks north-east of the tower, where the photograph shows them.
  for (let i = 0; i < 8; i++) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 28, 20), white)
    tank.position.set(45 + (i % 4) * 14, 14, -95 - Math.floor(i / 4) * 16)
    group.add(tank)
  }

  return { group, setArms, flown: meta.flown }
}
