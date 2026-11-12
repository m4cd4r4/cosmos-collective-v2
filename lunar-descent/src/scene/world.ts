// Renderer, camera and the per-frame placement of everything in the scene.
// The lander sits at the scene origin and the Moon moves past it, which keeps
// 32-bit vertex maths accurate when the lander is hundreds of kilometres from the target.

import * as THREE from 'three'
import { MOON_RADIUS, type State } from '../sim/physics'
import { BOULDER_HALF_WIDTH, type Prediction } from '../sim/flight'
import { APOLLO_11, LIMITS } from '../data/facts'
import { createLander } from './lander'
import type { Terrain } from './terrain'

export interface View {
  state: State
  pitchDeg: number
  throttle: number
  /** Height of the lander's feet above the ground beneath it, m. */
  radarAltitude: number
  /** Seconds since page load, for animation. */
  clock: number
  /** Where the lander comes down if the controls stay as they are. */
  prediction: Prediction | null
  /** Draw the flying aids: the touchdown marker and the velocity arrow. */
  aids: boolean
}

export interface World {
  render(view: View): void
  resize(): void
  /** 0 to 1: how much of the surface the dust hides right now. */
  dustAmount(view: View): number
}

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t

export function createWorld(canvas: HTMLCanvasElement, terrain: Terrain, stars: THREE.Object3D, reducedMotion: boolean): World {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 5, 2_000_000)

  // Everything fixed to the Moon lives in `moon`, which is moved opposite to the lander.
  const moon = new THREE.Group()
  moon.add(terrain.group)
  scene.add(moon)
  // The world frame keeps the target's vertical, so the stars stay put while the Moon turns beneath.
  scene.add(stars)

  // The landing accuracy NASA requires of the uncrewed demos, drawn on the ground.
  const ringPoints: THREE.Vector3[] = []
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2
    const along = Math.cos(angle) * LIMITS.accuracy.value
    const across = Math.sin(angle) * LIMITS.accuracy.value
    ringPoints.push(new THREE.Vector3(along, terrain.heightAt(along, across) + 1.5, across))
  }
  moon.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints), new THREE.LineBasicMaterial({ color: 0xd4af37 })))

  // Boulders at the target. A game element: the terrain data is 5 m per pixel and shows no rocks.
  const BOULDERS = 70
  const boulders = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ color: 0x9a968e, roughness: 0.95, flatShading: true }),
    BOULDERS,
  )
  let seed = 7
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const placement = new THREE.Object3D()
  for (let i = 0; i < BOULDERS; i++) {
    const along = (random() * 2 - 1) * (BOULDER_HALF_WIDTH - 3)
    const across = (random() * 2 - 1) * 60
    const size = 1.2 + random() ** 2 * 4.5
    placement.position.set(along, terrain.heightAt(along, across) + size * 0.35, across)
    placement.rotation.set(random() * 3, random() * 3, random() * 3)
    placement.scale.set(size, size * (0.6 + random() * 0.4), size)
    placement.updateMatrix()
    boulders.setMatrixAt(i, placement.matrix)
  }
  moon.add(boulders)

  // Touchdown marker: where the lander meets the ground, or stops above it, if the controls stay as they are.
  const INK = 0xf4f1e8
  const RED = 0xff6b6b
  const markerMaterial = new THREE.MeshBasicMaterial({ color: INK, side: THREE.DoubleSide, depthTest: false, transparent: true, opacity: 0.95 })
  const marker = new THREE.Group()
  const markerRing = new THREE.Mesh(new THREE.RingGeometry(5, 6.5, 48), markerMaterial)
  markerRing.rotation.x = -Math.PI / 2
  const markerPost = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 26, 6), markerMaterial)
  markerPost.position.y = 13
  marker.add(markerRing, markerPost)
  marker.renderOrder = 10
  marker.visible = false
  moon.add(marker)

  // Velocity arrow: which way the lander is moving, and how fast.
  const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, INK)
  ;(arrow.line.material as THREE.LineBasicMaterial).depthTest = false
  ;(arrow.cone.material as THREE.MeshBasicMaterial).depthTest = false
  arrow.renderOrder = 10
  arrow.visible = false
  scene.add(arrow)
  const velocity = new THREE.Vector3()
  const markerWorld = new THREE.Vector3()

  const lander = createLander()
  scene.add(lander.group)
  const sun = new THREE.DirectionalLight(0xfff4e0, 3.2)
  scene.add(sun, new THREE.AmbientLight(0x8090b0, 0.12))

  // Dust: a sheet of streaks racing outwards under the engines.
  const dust = new THREE.Mesh(
    new THREE.CircleGeometry(260, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { amount: { value: 0 }, time: { value: 0 } },
      vertexShader: 'varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform float amount; uniform float time; varying vec2 vP;
        void main() {
          float r = length(vP) / 260.0;
          float angle = atan(vP.y, vP.x);
          float streak = 0.55 + 0.45 * sin(angle * 37.0 + sin(angle * 11.0) * 3.0) * sin(r * 40.0 - time * 9.0);
          float a = amount * streak * smoothstep(1.0, 0.25, r) * smoothstep(0.0, 0.06, r);
          gl_FragColor = vec4(vec3(0.62, 0.6, 0.56), a * 0.8);
        }`,
    }),
  )
  dust.rotation.x = -Math.PI / 2
  scene.add(dust)

  const dustAmount = (view: View) =>
    smooth(APOLLO_11.dustAltitude.value, 6, view.radarAltitude) * smooth(0.05, 0.3, view.throttle)

  const up = new THREE.Vector3()
  const forward = new THREE.Vector3()
  const side = new THREE.Vector3(0, 0, 1)
  const eye = new THREE.Vector3()
  const lookAt = new THREE.Vector3()

  function resize() {
    const { clientWidth, clientHeight } = canvas
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    // Keep the horizontal field of view generous on a tall phone screen.
    camera.fov = camera.aspect < 1 ? 68 : 50
    camera.updateProjectionMatrix()
  }
  resize()

  function render(view: View) {
    const { state } = view
    // Lander position relative to the target, on the sphere. Doubles, then one subtraction.
    const theta = state.range / MOON_RADIUS
    const radial = MOON_RADIUS + terrain.meta.target.heightM + state.altitude
    const x = -radial * Math.sin(theta)
    const y = radial * Math.cos(theta) - (MOON_RADIUS + terrain.meta.target.heightM)
    moon.position.set(-x, -y, 0)

    // Local vertical leans back along the track by the angle travelled round the Moon.
    up.set(-Math.sin(theta), Math.cos(theta), 0)
    forward.set(Math.cos(theta), Math.sin(theta), 0)
    lander.group.rotation.z = theta + ((90 - view.pitchDeg) * Math.PI) / 180
    lander.setThrottle(view.throttle)
    sun.position.copy(terrain.sunDirection)

    const amount = dustAmount(view)
    const dustMaterial = dust.material as THREE.ShaderMaterial
    dustMaterial.uniforms.amount.value = amount
    dustMaterial.uniforms.time.value = view.clock
    dust.visible = amount > 0.01
    dust.position.copy(up).multiplyScalar(-view.radarAltitude + 0.8)

    // Chase camera: far behind and above while braking, low and to the sunlit side near the ground.
    const near = 1 - smooth(60, 900, view.radarAltitude)
    // Near the ground the player is choosing a spot, so the view has to hold the lander, the
    // ground under it and the target ring together: look half way to each and back off to fit.
    const reach = near * Math.min(500, Math.max(-250, state.range))
    const drop = near * Math.min(500, view.radarAltitude)
    const zoom = 1 + (Math.abs(reach) + drop) / 260
    const back = mix(330, 150, near) * zoom
    const above = mix(120, 42, near) * zoom
    // A tall screen sees a narrow slice sideways, so the camera sits more nearly behind the lander.
    const portrait = camera.aspect < 1
    const aside = mix(-90, -150, near) * (portrait ? 0.4 : 1) * zoom
    const ahead = mix(420, 0, near) + 0.5 * reach
    eye.copy(forward).multiplyScalar(-back).addScaledVector(up, above).addScaledVector(side, aside)
    lookAt.copy(forward).multiplyScalar(ahead).addScaledVector(up, mix(-70, 24, near) - 0.7 * drop)
    if (!reducedMotion && view.throttle > 0.02) {
      const shake = view.throttle * 0.35
      eye.x += Math.sin(view.clock * 61) * shake
      eye.y += Math.sin(view.clock * 47) * shake
    }
    camera.position.copy(eye)
    camera.up.copy(up)
    camera.lookAt(lookAt)

    const hit = view.aids ? view.prediction : null
    marker.visible = hit !== null
    if (hit) {
      // Same wrap onto the sphere as the terrain mesh, so the marker sits on the ground far out too.
      const along = -hit.range
      const angle = along / MOON_RADIUS
      const datum = MOON_RADIUS + terrain.meta.target.heightM
      const r = datum + terrain.heightAt(along)
      marker.position.set(r * Math.sin(angle), r * Math.cos(angle) - datum + 0.5, 0)
      marker.rotation.z = -angle
      // Hold its apparent size so it reads from high gate and from 50 m.
      marker.getWorldPosition(markerWorld)
      marker.scale.setScalar(Math.max(1, markerWorld.distanceTo(eye) / 330))
      const bad =
        Math.abs(hit.range) < BOULDER_HALF_WIDTH ||
        hit.verticalSpeed > LIMITS.verticalSpeed.value ||
        hit.horizontalSpeed > LIMITS.horizontalSpeed.value
      markerMaterial.color.setHex(bad ? RED : INK)
    }

    velocity.copy(forward).multiplyScalar(state.groundSpeed).addScaledVector(up, state.climbRate)
    const speed = velocity.length()
    arrow.visible = view.aids && speed > 0.5
    if (arrow.visible) {
      const length = Math.min(110, 12 + speed * 1.6)
      arrow.position.copy(up).multiplyScalar(26)
      arrow.setDirection(velocity.divideScalar(speed))
      arrow.setLength(length, Math.min(14, length * 0.3), Math.min(7, length * 0.15))
    }
    renderer.render(scene, camera)
  }

  return { render, resize, dustAmount }
}
