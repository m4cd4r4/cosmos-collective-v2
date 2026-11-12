// Renderer, camera, sky and the per-frame placement of everything in the scene.
// The flight is in the vertical plane running east from the tower: x east, y up, and the
// camera stands to the south looking north, so the Gulf is on the right.

import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { SCALE_HEIGHT, G0 } from '../sim/physics'
import { TUNING, type Flight, type Outcome } from '../sim/flight'
import type { Arrival } from '../sim/predict'
import { BOOSTER_HEIGHT, createBooster, createShip } from './booster'
import { createEffects } from './effects'
import { MOUNT_HEIGHT, type Site } from './site'

export interface View {
  flight: Flight
  throttle: number
  arrival: Arrival | null
  /** Real seconds since page load, and simulated seconds advanced this frame. */
  clock: number
  simDt: number
  realDt: number
  /** Draw the flying aids: the impact ring, the gold target and the arrival ring. */
  aids: boolean
}

export interface World {
  render(view: View): void
  resize(): void
  /** A new run or a retry: clear the smoke and snap the camera. */
  reset(): void
  /** CSS pixels the HUD covers at the top and the bottom. The view is framed in what is left. */
  setInsets(top: number, bottom: number): void
}

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
const DEG = Math.PI / 180
const INK = 0xf4f1e8
const RED = 0xff6b6b
const GOLD = 0xd4af37
const VIOLENT: Outcome[] = ['missed', 'no-burn', 'hard-catch', 'tower-strike', 'on-land', 'hard-splashdown', 'breakup']

export function createWorld(canvas: HTMLCanvasElement, site: Site, reducedMotion: boolean): World {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 2, 4_000_000)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55

  // Late afternoon: a low warm Sun in the west, clear sky.
  const skyLow = new THREE.Color(0x7fb2de)
  const skyHigh = new THREE.Color(0x04060c)
  const sky = new THREE.Color()
  const fog = new THREE.Fog(0xb4cbe0, 4_000, 90_000)
  scene.fog = fog
  // The sky: pale haze at the horizon deepening overhead. High up it thins to a band on the horizon.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(3_000_000, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false,
      uniforms: { space: { value: 0 }, horizon: { value: new THREE.Color(0xb4cbe0) }, zenith: { value: new THREE.Color(0x3f7fc4) }, dark: { value: skyHigh } },
      vertexShader: 'varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
uniform float space;
uniform vec3 horizon;
uniform vec3 zenith;
uniform vec3 dark;
varying vec3 vDir;
void main() {
  float h = max(0.0, normalize(vDir).y);
  vec3 day = mix(horizon, zenith, pow(h, 0.6));
  vec3 high = mix(dark, horizon, exp(-h * 14.0));
  gl_FragColor = vec4(mix(day, high, space), 1.0);
#include <colorspace_fragment>
}`,
    }),
  )
  dome.renderOrder = -1
  dome.frustumCulled = false
  scene.add(dome)
  const sun = new THREE.DirectionalLight(0xffe0b8, 2.6)
  sun.position.set(-0.75, 0.38, 0.55)
  scene.add(sun, new THREE.HemisphereLight(0xbcd4ee, 0x8a7f6a, 0.9))

  scene.add(site.group)
  const booster = createBooster()
  const ship = createShip()
  const effects = createEffects()
  scene.add(booster.group, ship.group, effects.group)

  const ring = (colour: number) => {
    // A fat tube: the camera is low, so the ring is seen nearly edge-on.
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.7, 8, 48),new THREE.MeshBasicMaterial({ color: colour, depthTest: false, transparent: true, fog: false }))
    mesh.rotation.x = Math.PI / 2
    mesh.renderOrder = 10
    scene.add(mesh)
    return mesh
  }
  const targetRing = ring(GOLD)
  const arrivalRing = ring(INK)
  const impactRing = new THREE.Mesh(new THREE.RingGeometry(1, 1.22, 64), new THREE.MeshBasicMaterial({ color: INK, depthTest: false, transparent: true, side: THREE.DoubleSide, fog: false }))
  impactRing.rotation.x = -Math.PI / 2
  impactRing.renderOrder = 10
  scene.add(impactRing)

  let lean = 0
  let snap = true
  let seen: Outcome | null = null
  let wrecked = false
  let emitDebt = 0
  let wantTop = 0
  let wantBottom = 0
  let insetTop = 0
  let insetBottom = 0
  /** The share of the screen height the HUD leaves clear. */
  let free = 1
  let separation: { at: THREE.Vector3; velocity: THREE.Vector3; axis: THREE.Vector3; time: number } | null = null
  const offsetEye = new THREE.Vector3()
  const offsetLook = new THREE.Vector3()
  const wantEye = new THREE.Vector3()
  const wantLook = new THREE.Vector3()
  const at = new THREE.Vector3()
  const scratch = new THREE.Vector3()

  function resize() {
    const { clientWidth, clientHeight } = canvas
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    camera.fov = camera.aspect < 1 ? 62 : 46
    camera.updateProjectionMatrix()
  }
  resize()

  /** Which way the nose points, degrees from vertical towards the east. */
  function wantedLean(flight: Flight): number {
    const s = flight.state
    if (flight.phase === 'ascent') return flight.thrustAngleDeg
    if (flight.phase === 'staging') return flight.events.hotStaging === undefined ? lean : -90
    if (flight.phase === 'boostback') return -90
    if (flight.lit) return flight.thrustAngleDeg
    if (flight.phase === 'ended') return flight.outcome === 'splashdown' ? 84 : lean
    // Coasting and falling: engines first, nose trailing.
    return Math.atan2(-s.vx, -s.vy) / DEG
  }

  function placeShip(flight: Flight, top: THREE.Vector3, axis: THREE.Vector3, clock: number) {
    const staged = flight.events.hotStaging
    if (staged === undefined) {
      separation = null
      ship.group.visible = true
      ship.group.position.copy(top)
      ship.group.rotation.z = booster.group.rotation.z
      ship.plume.set(0, 0, 0, clock)
      return
    }
    const t = flight.state.time - staged
    if (!separation) {
      const velocity = new THREE.Vector3(flight.state.vx, flight.state.vy, 0)
      separation = { at: top.clone().addScaledVector(velocity, -t), velocity, axis: axis.clone(), time: staged }
    }
    ship.group.visible = t < 16 && flight.phase !== 'landing' && flight.phase !== 'ended'
    if (!ship.group.visible) return
    // The ship pulls away on its 6 engines while both fall together under gravity.
    ship.group.position.copy(separation.at).addScaledVector(separation.velocity, t).addScaledVector(separation.axis, 0.5 * 14 * t * t)
    ship.group.position.y -= 0.5 * G0 * t * t
    ship.plume.set(1, 6, 1, clock)
  }

  function frameCamera(flight: Flight, sceneY: number) {
    const s = flight.state
    const tanV = Math.tan((camera.fov * DEG) / 2)
    const landing = flight.phase === 'landing' || (flight.phase === 'ended' && s.y < 2_500)
    if (flight.phase === 'ascent' || flight.phase === 'staging') {
      // Low and looking up the stack at the pad. The camera is left behind as the stack climbs,
      // so the tower, the steam and the flame stay in the picture, then it follows from below.
      const distance = (camera.aspect < 1 ? 430 : 300) + Math.min(1_500, sceneY * 0.6)
      wantLook.set(0, 50, 0)
      wantEye.set(-0.22 * distance, Math.max(8 - sceneY, 24 - Math.min(0.8 * sceneY, 600)), distance)
    } else if (!landing) {
      wantLook.set(0, 35, 0)
      wantEye.set(120, 70, 430)
    } else {
      // Hold the booster and the tower in one frame, closing in as it comes down.
      const near = smooth(2_600, 900, s.y)
      const left = Math.min(s.x, TUNING.towerFace - 14) - 30
      const right = Math.max(s.x, 34) + 30
      const bottom = Math.min(sceneY, 0) - 6
      const top = Math.max(sceneY + BOOSTER_HEIGHT, TUNING.towerHeight + 16) + 12
      const fit = Math.max((top - bottom) / (2 * tanV), (right - left) / (2 * tanV * camera.aspect)) * 1.25
      const cx = (left + right) / 2 - s.x
      const cy = (top + bottom) / 2 - sceneY
      const chase = 430
      const distance = chase + (fit - chase) * near
      wantLook.set(cx * near, 35 + (cy - 35) * near, 0)
      // Camera low, so the tower and the booster stand tall against the sky.
      wantEye.set(wantLook.x - 0.12 * distance * near + 120 * (1 - near), Math.max(6 - sceneY, wantLook.y - 0.16 * distance * near + 70 * (1 - near)), distance)
    }
    // Stand further back when the HUD leaves less of the screen, so the same scene fits in it.
    wantEye.sub(wantLook).multiplyScalar(1 / free).add(wantLook)
    wantEye.y = Math.max(wantEye.y, 6 - sceneY)
  }

  function render(view: View) {
    const { flight } = view
    const s = flight.state
    // Before liftoff the booster stands on the launch mount, which the flight model leaves out.
    const sceneY = s.y + (flight.phase === 'ascent' || flight.phase === 'staging' ? MOUNT_HEIGHT : 0)
    at.set(s.x, sceneY, 0)

    const want = wantedLean(flight)
    const turn = 40 * view.simDt
    lean = snap ? want : lean + Math.min(turn, Math.max(-turn, want - lean))
    booster.group.position.copy(at)
    booster.group.rotation.z = -lean * DEG

    const thin = 1 - Math.exp(-s.y / SCALE_HEIGHT)
    const firing = flight.thrustAccel > 0 || (flight.phase === 'staging' && flight.events.hotStaging === undefined)
    const level = !firing ? 0 : flight.phase === 'ascent' || flight.phase === 'landing' ? Math.max(0.4, view.throttle) : flight.phase === 'staging' ? 0.5 : 1
    booster.plume.set(level, flight.engines, thin, view.clock)

    const axis = scratch.set(Math.sin(lean * DEG), Math.cos(lean * DEG), 0)
    placeShip(flight, at.clone().addScaledVector(axis, BOOSTER_HEIGHT), axis, view.clock)

    // Outcomes: fire for a loss, spray for the sea, the arms for a catch.
    if (flight.outcome !== seen) {
      seen = flight.outcome
      if (seen && VIOLENT.includes(seen)) {
        wrecked = true
        const mid = at.clone().addScaledVector(axis, 25)
        effects.burst('flash', mid, 7, 20)
        effects.burst('fire', mid, 46, 70)
        effects.burst('smoke', mid, 36, 38)
        if (seen === 'hard-splashdown') effects.burst('spray', at, 40, 45)
      } else if (seen === 'splashdown') effects.burst('spray', at, 50, 30)
    }
    booster.group.visible = !wrecked
    if (wrecked) ship.group.visible = false

    const closing = flight.committed && (flight.phase === 'landing' || flight.outcome === 'caught')
    site.setArms(flight.outcome === 'caught' ? 1 : closing ? smooth(150, 6, s.y - TUNING.catchHeight) : 0)

    // Steam, then dust, wherever the exhaust reaches the ground.
    if (level > 0 && !wrecked && sceneY < 240) {
      emitDebt += view.simDt * 34 * level * Math.sqrt(flight.engines / 33) * (1 - sceneY / 300)
      const kind = flight.phase === 'ascent' && s.time < 7 ? 'steam' : 'dust'
      const ground = scratch.set(s.x - Math.sin(lean * DEG) * sceneY, 1, 0)
      for (; emitDebt >= 1; emitDebt--) effects.emit(kind, ground, 22 + 30 * level)
    }
    // Smoke drifts in real time, whatever the time compression, so it lingers on screen.
    effects.update(view.simDt > 0 ? view.realDt : 0)

    // Slide the picture into the part of the screen the HUD leaves clear.
    const ease = snap ? 1 : 1 - Math.exp(-view.realDt * 4)
    insetTop += (wantTop - insetTop) * ease
    insetBottom += (wantBottom - insetBottom) * ease
    const { clientWidth, clientHeight } = canvas
    free = Math.max(0.3, 1 - (insetTop + insetBottom) / clientHeight)
    camera.setViewOffset(clientWidth, clientHeight, 0, (insetBottom - insetTop) / 2, clientWidth, clientHeight)

    frameCamera(flight, sceneY)
    if (snap) {
      offsetEye.copy(wantEye)
      offsetLook.copy(wantLook)
    } else {
      // Faster in the landing: the booster arrives at tens of metres a second and must stay in the frame.
      const k = 1 - Math.exp(-view.realDt * (flight.phase === 'landing' ? 6 : 2.2))
      offsetEye.lerp(wantEye, k)
      offsetLook.lerp(wantLook, k)
    }
    snap = false
    camera.position.copy(at).add(offsetEye)
    const distance = offsetEye.length()
    if (!reducedMotion && level > 0 && !wrecked) {
      const shake = Math.min(1.6, (level * Math.sqrt(flight.engines / 33) * 380) / distance) * (1 - thin * 0.7)
      camera.position.x += Math.sin(view.clock * 61) * shake
      camera.position.y += Math.sin(view.clock * 47) * shake
    }
    camera.lookAt(scratch.copy(at).add(offsetLook))

    // The sky darkens with height; the haze stays below.
    const height = camera.position.y
    const space = smooth(4_000, 42_000, height)
    sky.copy(skyLow).lerp(skyHigh, space)
    renderer.setClearColor(sky)
    dome.position.copy(camera.position)
    ;(dome.material as THREE.ShaderMaterial).uniforms.space.value = space
    fog.near = 4_000 + height
    fog.far = 90_000 + height * 5

    const descending = flight.phase === 'coast' || flight.phase === 'landing'
    targetRing.visible = view.aids && flight.committed && descending
    targetRing.position.set(0, TUNING.catchHeight, 0)
    const arrival = view.aids ? view.arrival : null
    arrivalRing.visible = arrival !== null
    if (arrival) {
      arrivalRing.position.set(arrival.x, arrival.y, 0)
      const good = !arrival.hover && (arrival.outcome === 'caught' || arrival.outcome === 'splashdown')
      ;(arrivalRing.material as THREE.MeshBasicMaterial).color.setHex(good ? INK : RED)
    }
    impactRing.visible = view.aids && !flight.lit && (flight.phase === 'boostback' || descending) && s.y < 60_000
    if (impactRing.visible) {
      impactRing.position.set(flight.impactX, 1.5, 0)
      impactRing.scale.setScalar(Math.max(9, camera.position.distanceTo(impactRing.position) / 45))
    }
    renderer.render(scene, camera)
  }

  return {
    render,
    resize,
    setInsets(top, bottom) {
      wantTop = top
      wantBottom = bottom
    },
    reset() {
      snap = true
      seen = null
      wrecked = false
      emitDebt = 0
      separation = null
      effects.clear()
    },
  }
}
