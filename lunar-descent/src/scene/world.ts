// Renderer, camera and the per-frame placement of everything in the scene.
// The lander sits at the scene origin and the Moon moves past it, which keeps
// 32-bit vertex maths accurate when the lander is hundreds of kilometres from the target.

import * as THREE from 'three'
import { MOON_RADIUS, type State } from '../sim/physics'
import { BOULDER_HALF_WIDTH, type Prediction } from '../sim/flight'
import { APOLLO_11, LIMITS } from '../data/facts'
import { createLander } from './lander'
import { LANDER_HEIGHT, LANDER_RADIUS, createShadow } from './shadow'
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
  /** Set once the lander is down: seconds since it touched, and whether it came down too hard. */
  settle: { hard: boolean; seconds: number } | null
}

export interface World {
  render(view: View): void
  resize(): void
  /** Where the touchdown marker was drawn, in CSS pixels from the canvas corner. Null when it is off screen or hidden. */
  markerScreen(): { x: number; y: number } | null
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

  // Track coordinates and height above the target's elevation, to the Moon frame. The same
  // wrap onto the sphere as the terrain mesh, so things sit on the ground far out too.
  const datum = MOON_RADIUS + terrain.meta.target.heightM
  const place = (along: number, across: number, height: number, out: THREE.Vector3) => {
    const d = Math.hypot(along, across) || 1
    const flat = ((datum + height) * Math.sin(d / MOON_RADIUS)) / d
    return out.set(along * flat, (datum + height) * Math.cos(d / MOON_RADIUS) - datum, across * flat)
  }
  const point = new THREE.Vector3()

  // Ground track: a line from the lander straight down, then along the ground to the marker.
  const TRACK_POINTS = 24
  const trackPositions = new THREE.BufferAttribute(new Float32Array((TRACK_POINTS + 2) * 3), 3)
  const track = new THREE.Line(
    new THREE.BufferGeometry().setAttribute('position', trackPositions),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.4, depthTest: false }),
  )
  track.frustumCulled = false
  track.renderOrder = 9
  track.visible = false
  moon.add(track)

  // Velocity arrow: which way the lander is moving, and how fast. A flat shape turned to
  // face the camera; a cone read as a blob on a stick from most angles.
  const arrowPositions = new THREE.BufferAttribute(new Float32Array(27), 3)
  const arrow = new THREE.Mesh(
    new THREE.BufferGeometry().setAttribute('position', arrowPositions),
    new THREE.MeshBasicMaterial({ color: INK, side: THREE.DoubleSide, depthTest: false }),
  )
  arrow.frustumCulled = false
  arrow.renderOrder = 10
  arrow.visible = false
  scene.add(arrow)
  const velocity = new THREE.Vector3()
  const across = new THREE.Vector3()
  const tail = new THREE.Vector3()
  const neck = new THREE.Vector3()
  const tip = new THREE.Vector3()
  const markerWorld = new THREE.Vector3()
  let markerAt: { x: number; y: number } | null = null

  const lander = createLander()
  scene.add(lander.group)
  const SUN_INTENSITY = 3.2
  const sun = new THREE.DirectionalLight(0xfff4e0, SUN_INTENSITY)
  scene.add(sun, new THREE.AmbientLight(0x8090b0, 0.12))

  const shadow = createShadow(terrain, place)
  moon.add(shadow.mesh)

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

  // After touchdown the dust thins out over the pause instead of vanishing with the throttle.
  const dustAmount = (view: View) =>
    Math.max(
      smooth(APOLLO_11.dustAltitude.value, 6, view.radarAltitude) * smooth(0.05, 0.3, view.throttle),
      view.settle ? (view.settle.hard ? 0.8 : 0.55) * Math.exp(-view.settle.seconds * 1.1) : 0,
    )

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
    // A hard landing ends with the lander going over: a game effect, falling the way it was moving.
    let poseDeg = view.pitchDeg
    let lift = 0
    if (view.settle?.hard) {
      const fall = Math.min(1, view.settle.seconds / 1.6) ** 2
      poseDeg = mix(view.pitchDeg, state.groundSpeed >= 0 ? 176 : 4, fall)
      lift = LANDER_RADIUS * fall
    }
    lander.group.rotation.z = theta + ((90 - poseDeg) * Math.PI) / 180
    lander.group.position.copy(up).multiplyScalar(lift)
    lander.setThrottle(view.throttle)
    sun.position.copy(terrain.sunDirection)

    // Real shadows both ways: the lander goes dark when the terrain hides the Sun from it,
    // and throws its own shadow when it is in the light.
    const lit = shadow.sunlit(-state.range, state.altitude + LANDER_HEIGHT / 2)
    sun.intensity = lit ? SUN_INTENSITY : 0
    shadow.mesh.visible = lit && shadow.cast(state, view.radarAltitude, poseDeg)

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
    // From high up the point below the lander is far out of frame, and the line read as noise.
    const trackOpacity = 0.45 * smooth(900, 400, view.radarAltitude)
    track.visible = hit !== null && trackOpacity > 0.01
    ;(track.material as THREE.LineBasicMaterial).opacity = trackOpacity
    markerAt = null
    if (hit) {
      const along = -hit.range
      place(along, 0, terrain.heightAt(along) + 0.5, marker.position)
      marker.rotation.z = -along / MOON_RADIUS
      place(-state.range, 0, state.altitude, point)
      trackPositions.setXYZ(0, point.x, point.y, point.z)
      for (let i = 0; i <= TRACK_POINTS; i++) {
        const a = mix(-state.range, along, i / TRACK_POINTS)
        place(a, 0, terrain.heightAt(a) + 0.5, point)
        trackPositions.setXYZ(i + 1, point.x, point.y, point.z)
      }
      trackPositions.needsUpdate = true
      // Hold its apparent size so it reads from high gate and from 50 m.
      marker.getWorldPosition(markerWorld)
      marker.scale.setScalar(Math.max(1, markerWorld.distanceTo(eye) / 330))
      const bad =
        Math.abs(hit.range) < BOULDER_HALF_WIDTH ||
        hit.verticalSpeed > LIMITS.verticalSpeed.value ||
        hit.horizontalSpeed > LIMITS.horizontalSpeed.value
      markerMaterial.color.setHex(bad ? RED : INK)
      camera.updateMatrixWorld()
      markerWorld.project(camera)
      if (markerWorld.z < 1 && Math.abs(markerWorld.x) < 1 && Math.abs(markerWorld.y) < 1) {
        markerAt = {
          x: canvas.offsetLeft + ((markerWorld.x + 1) / 2) * canvas.clientWidth,
          y: canvas.offsetTop + ((1 - markerWorld.y) / 2) * canvas.clientHeight,
        }
      }
    }

    velocity.copy(forward).multiplyScalar(state.groundSpeed).addScaledVector(up, state.climbRate)
    const speed = velocity.length()
    arrow.visible = view.aids && speed > 0.5
    if (arrow.visible) {
      const length = Math.min(110, 12 + speed * 1.6)
      const head = Math.min(14, length * 0.3)
      velocity.divideScalar(speed)
      // Sideways on screen: at right angles to both the arrow and the line of sight.
      across.crossVectors(velocity, eye)
      if (across.lengthSq() < 1e-6) across.copy(side)
      across.normalize()
      const shaft = eye.length() / 420
      tail.copy(up).multiplyScalar(26)
      tip.copy(tail).addScaledVector(velocity, length)
      neck.copy(tip).addScaledVector(velocity, -head)
      const corners = [
        [tail, -shaft], [tail, shaft], [neck, shaft],
        [tail, -shaft], [neck, shaft], [neck, -shaft],
        [neck, -head * 0.45], [neck, head * 0.45], [tip, 0],
      ] as const
      corners.forEach(([at, offset], i) => arrowPositions.setXYZ(i, at.x + across.x * offset, at.y + across.y * offset, at.z + across.z * offset))
      arrowPositions.needsUpdate = true
    }
    renderer.render(scene, camera)
  }

  return { render, resize, dustAmount, markerScreen: () => markerAt }
}
