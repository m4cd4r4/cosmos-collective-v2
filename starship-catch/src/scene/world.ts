// Renderer, camera, sky and the per-frame placement of everything in the scene.
// The flight is in the vertical plane running east from the tower: x east, y up, and the
// camera stands to the south looking north, so the Gulf is on the right.

import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { SCALE_HEIGHT, G0 } from '../sim/physics'
import { TUNING, type Flight, type Outcome } from '../sim/flight'
import type { Arrival } from '../sim/predict'
import { BOOSTER_HEIGHT, createBooster, createShip } from './booster'
import { frameShot, pickShot, type Framing, type Shot } from './camera'
import { createEffects } from './effects'
import { MOUNT_HEIGHT, type Site } from './site'
import { createSky } from './sky'

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
  /** A recorded landing played back: shot from the beach. */
  replay: boolean
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

  // Late afternoon: a low warm Sun in the west, fair-weather cloud.
  const skyLow = new THREE.Color(0x7fb2de)
  const skyHigh = new THREE.Color(0x04060c)
  const sky = new THREE.Color()
  const fog = new THREE.Fog(0xb4cbe0, 4_000, 90_000)
  scene.fog = fog
  const heavens = createSky()
  scene.add(heavens.group)
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
  let caughtAt: number | null = null
  let ventDebt = 0
  let lastShot: Shot | null = null
  let baseFov = 46
  const framing: Framing = { shot: 'pad', fixed: true, eye: new THREE.Vector3(), look: new THREE.Vector3(), fov: 0 }
  const offsetEye = new THREE.Vector3()
  const offsetLook = new THREE.Vector3()
  const at = new THREE.Vector3()
  const scratch = new THREE.Vector3()

  function resize() {
    const { clientWidth, clientHeight } = canvas
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    baseFov = camera.fov = camera.aspect < 1 ? 62 : 46
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

  /** After a catch: the booster settles into the arms, swaying, and vents. */
  function settleCatch(view: View, top: THREE.Vector3): number {
    if (caughtAt === null) return 0
    const t = view.clock - caughtAt
    if (t < 3.2 && view.realDt > 0) {
      ventDebt += view.realDt * 14
      for (; ventDebt >= 1; ventDebt--) effects.emit('steam', top, 6)
    }
    if (reducedMotion) return 0
    booster.group.rotation.z += 1.3 * DEG * Math.exp(-t / 1.6) * Math.sin(t * 4.2)
    booster.group.position.y -= 0.8 * (1 - Math.exp(-t * 3))
    return 1.4 * Math.exp(-t * 4)
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
      else if (seen === 'caught') caughtAt = view.clock
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

    const jolt = settleCatch(view, scratch.set(s.x, sceneY + BOOSTER_HEIGHT - 6, 0).clone())

    const shot = pickShot(flight, sceneY, view.replay)
    frameShot(shot, flight, sceneY, { aspect: camera.aspect, fov: baseFov, free, clock: view.clock, reducedMotion }, framing)
    const cut = snap || shot !== lastShot
    lastShot = shot
    if (framing.fixed) {
      // A camera on the site: it stands still and turns to follow.
      camera.position.copy(framing.eye)
      offsetLook.copy(framing.look).sub(at)
      offsetEye.copy(framing.eye).sub(at)
    } else {
      // Stand further back when the HUD leaves less of the screen, so the same scene fits in it.
      framing.eye.sub(framing.look).multiplyScalar(1 / free).add(framing.look)
      framing.eye.y = Math.max(framing.eye.y, 6 - sceneY)
      if (cut) {
        offsetEye.copy(framing.eye)
        offsetLook.copy(framing.look)
      } else {
        // Faster in the landing: the booster arrives at tens of metres a second and must stay in the frame.
        const k = 1 - Math.exp(-view.realDt * (flight.phase === 'landing' ? 6 : 2.2))
        offsetEye.lerp(framing.eye, k)
        offsetLook.lerp(framing.look, k)
      }
      camera.position.copy(at).add(offsetEye)
    }
    snap = false
    const fov = framing.fov || baseFov
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    const distance = camera.position.distanceTo(at)
    if (!reducedMotion && ((level > 0 && !wrecked) || jolt > 0)) {
      // A long lens magnifies the shake as much as it magnifies the booster.
      const zoom = baseFov / camera.fov
      const shake = (Math.min(1.6, (level * Math.sqrt(flight.engines / 33) * 380) / distance) * (1 - thin * 0.7) + jolt) * (framing.fixed ? Math.min(1, 1 / zoom) : 1)
      camera.position.x += Math.sin(view.clock * 61) * shake
      camera.position.y += Math.sin(view.clock * 47) * shake
    }
    camera.lookAt(scratch.copy(at).add(offsetLook))

    // The sky darkens with height; the haze stays below.
    const height = camera.position.y
    const space = smooth(4_000, 42_000, height)
    sky.copy(skyLow).lerp(skyHigh, space)
    renderer.setClearColor(sky)
    heavens.update(camera, space)
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
      ventDebt = 0
      caughtAt = null
      lastShot = null
      separation = null
      effects.clear()
    },
  }
}
