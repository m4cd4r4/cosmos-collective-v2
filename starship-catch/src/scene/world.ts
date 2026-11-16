// Renderer, sky and the per-frame placement of everything in the scene.
// The flight is in the vertical plane running east from the tower: x east, y up, and the
// camera stands to the south looking north, so the Gulf is on the right.

import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { SCALE_HEIGHT } from '../sim/physics'
import { TUNING, type Flight, type Outcome } from '../sim/flight'
import type { Arrival } from '../sim/predict'
import { BOOSTER_HEIGHT, createBooster } from './booster'
import { frameShot, type Framing } from './camera'
import { ARM_HEIGHT } from './site'
import { createEffects } from './effects'
import type { Site } from './site'
import { createSky } from './sky'

export interface View {
  flight: Flight
  /** The Assist marker, or null when Assist is off. */
  arrival: Arrival | null
  /** Real seconds since page load, and simulated seconds advanced this frame. */
  clock: number
  simDt: number
  realDt: number
}

export interface World {
  render(view: View): void
  resize(): void
  /** A new run: clear the smoke and snap the camera. */
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
const CRASHES: Outcome[] = ['hard-catch', 'tower-strike', 'ground', 'no-propellant', 'no-burn']

export function createWorld(canvas: HTMLCanvasElement, site: Site, reducedMotion: boolean): World {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 2, 4_000_000)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55

  // The Sun stands where it stood when the ground photograph was flown (NAIP, 14 October 2024,
  // mid-morning): in the east-south-east, about 33 degrees up, measured from the Pad 1 tower's
  // 228 m shadow and its bearing. So the shadows in the photograph agree with the models.
  const skyLow = new THREE.Color(0x7fb2de)
  const skyHigh = new THREE.Color(0x04060c)
  const sky = new THREE.Color()
  const fog = new THREE.Fog(0xb4cbe0, 4_000, 90_000)
  scene.fog = fog
  const heavens = createSky()
  scene.add(heavens.group)
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.8)
  const sunBearing = 119 * DEG
  const sunElevation = 33 * DEG
  const toSun = new THREE.Vector3(Math.sin(sunBearing) * Math.cos(sunElevation), Math.sin(sunElevation), -Math.cos(sunBearing) * Math.cos(sunElevation))
  sun.position.copy(toSun).multiplyScalar(600)
  scene.add(sun, sun.target, new THREE.HemisphereLight(0xbcd4ee, 0x8a7f6a, 0.9))
  // Only the booster casts a shadow in real time; the ground photograph already holds the site's own.
  const phone = Math.min(window.innerWidth, window.innerHeight) < 600
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  sun.castShadow = true
  sun.shadow.mapSize.setScalar(phone ? 1024 : 2048)
  const shadowBox = sun.shadow.camera
  shadowBox.left = shadowBox.bottom = -120
  shadowBox.right = shadowBox.top = 120
  shadowBox.near = 1
  shadowBox.far = 1_400
  sun.shadow.bias = -0.0005
  sun.shadow.normalBias = 0.5

  scene.add(site.group)
  const booster = createBooster()
  const effects = createEffects()
  scene.add(booster.group, effects.group)
  booster.group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && !((o as THREE.Mesh).material as THREE.Material).transparent) o.castShadow = true
  })

  const ring = (colour: number) => {
    // A fat tube: the camera is low, so the ring is seen nearly edge-on.
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.7, 8, 48), new THREE.MeshBasicMaterial({ color: colour, depthTest: false, transparent: true, fog: false }))
    mesh.rotation.x = Math.PI / 2
    mesh.renderOrder = 10
    scene.add(mesh)
    return mesh
  }
  // The target: the gap between the arms. From high up it grows so it can still be seen.
  const targetRing = ring(GOLD)
  const arrivalRing = ring(INK)

  // When the camera pulls back to hold the tower too, a thin bracket keeps the small booster easy to find.
  const tag = document.createElement('div')
  tag.className = 'booster-tag'
  tag.hidden = true
  document.body.append(tag)
  const top = new THREE.Vector3()
  const base = new THREE.Vector3()
  const marker = document.createElement('div')
  marker.className = 'tower-marker'
  const markerText = document.createElement('span')
  const markerArrow = document.createElement('b')
  marker.append(markerText, markerArrow)
  marker.hidden = true
  document.body.append(marker)

  let snap = true
  let seen: Outcome | null = null
  let endedAt = 0
  let emitDebt = 0
  let ventDebt = 0
  let litSeen = false
  let kick = 0
  let wantTop = 0
  let wantBottom = 0
  let insetTop = 0
  let insetBottom = 0
  let baseFov = 46
  const framing: Framing = { eye: new THREE.Vector3(), look: new THREE.Vector3(), fov: 46 }
  /** Camera and aim point as offsets from the base of the booster. */
  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()
  const at = new THREE.Vector3()
  const scratch = new THREE.Vector3()

  function resize() {
    const { clientWidth, clientHeight } = canvas
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    baseFov = camera.fov = camera.aspect < 1 ? 60 : 46
    camera.updateProjectionMatrix()
  }
  resize()

  function render(view: View) {
    const { flight } = view
    const s = flight.state
    at.set(s.x, s.y, 0)

    // How the booster hangs after the run: still in the arms, toppling after a crash, settling in the sea.
    let lean = flight.tiltDeg
    let sink = 0
    const since = flight.outcome ? view.clock - endedAt : 0
    if (flight.outcome !== seen) {
      seen = flight.outcome
      endedAt = view.clock
      onOutcome(flight)
    }
    if (flight.outcome && CRASHES.includes(flight.outcome)) {
      const away = s.x >= TUNING.towerFace ? 1 : -1
      lean = flight.tiltDeg + away * Math.min(78, 60 * since * since)
    } else if (flight.outcome === 'sea') {
      lean = flight.tiltDeg + Math.min(70, 30 * since)
      sink = Math.min(BOOSTER_HEIGHT * 0.5, 9 * since)
    } else if (flight.outcome === 'caught' && !reducedMotion) {
      // A slow sway in the arms.
      lean += 1.2 * Math.exp(-since / 1.6) * Math.sin(since * 4.2)
    }
    booster.group.position.set(s.x, s.y - sink, 0)
    booster.group.rotation.z = -lean * DEG
    // The shadow box follows the booster down: no shadow while it is high, one on the pad once it is low.
    sun.target.position.set(s.x, 0, 0)
    sun.position.copy(toSun).multiplyScalar(600).add(sun.target.position)

    const thin = 1 - Math.exp(-s.y / SCALE_HEIGHT)
    const firing = flight.thrustAccel > 0 && !flight.outcome
    booster.plume.set(firing ? Math.max(0.4, flight.throttle * flight.spool) : 0, flight.engines, thin, view.clock)
    if (flight.lit && !litSeen) {
      litSeen = true
      kick = 1
    }

    site.setArms(flight.outcome === 'caught' ? 1 : 0)

    // Dust wherever the exhaust reaches the ground.
    if (firing && s.y < 260) {
      emitDebt += view.simDt * 30 * Math.sqrt(flight.engines / 13) * (1 - s.y / 300)
      const ground = scratch.set(s.x, 1, 0)
      for (; emitDebt >= 1; emitDebt--) effects.emit('dust', ground, 18 + 20 * flight.throttle)
    }
    if (flight.outcome === 'caught' && since < 3 && view.realDt > 0) {
      ventDebt += view.realDt * 12
      for (; ventDebt >= 1; ventDebt--) effects.emit('steam', scratch.set(s.x, s.y + BOOSTER_HEIGHT - 8, 0), 6)
    }
    effects.update(view.realDt)

    // Slide the picture into the part of the screen the HUD leaves clear.
    const ease = snap ? 1 : 1 - Math.exp(-view.realDt * 4)
    insetTop += (wantTop - insetTop) * ease
    insetBottom += (wantBottom - insetBottom) * ease
    const { clientWidth, clientHeight } = canvas
    const free = Math.max(0.3, 1 - (insetTop + insetBottom) / clientHeight)
    camera.setViewOffset(clientWidth, clientHeight, 0, (insetBottom - insetTop) / 2, clientWidth, clientHeight)

    frameShot(flight, s.y, { aspect: camera.aspect, fov: baseFov, free, clock: view.clock, reducedMotion }, framing)
    // Ride with the booster exactly; ease only the framing around it, so it never slides out of shot.
    framing.eye.sub(at)
    framing.look.sub(at)
    if (snap) {
      eye.copy(framing.eye)
      look.copy(framing.look)
    } else {
      const k = 1 - Math.exp(-view.realDt * (flight.outcome ? 1.6 : 6))
      eye.lerp(framing.eye, k)
      look.lerp(framing.look, k)
    }
    snap = false
    camera.position.copy(eye).add(at)
    if (Math.abs(camera.fov - framing.fov) > 0.01) {
      camera.fov = framing.fov
      camera.updateProjectionMatrix()
    }
    camera.lookAt(scratch.copy(look).add(at))
    // A small kick on ignition and on impact. Camera only, never the ground, and none with reduced motion.
    if (!reducedMotion && kick > 0.01) {
      camera.rotateX(Math.sin(view.clock * 53) * 0.0025 * kick)
      camera.rotateY(Math.sin(view.clock * 41) * 0.0025 * kick)
      kick *= Math.exp(-view.realDt * 3)
    }

    // Development only: a fixed camera for screenshots of the site, set from the console as window.__cam.
    if (import.meta.env.DEV) {
      ;(window as unknown as { __renderer: THREE.WebGLRenderer }).__renderer = renderer
      const debug = (window as unknown as { __cam?: { eye: [number, number, number]; look: [number, number, number]; fov?: number } }).__cam
      if (debug) {
        camera.position.set(...debug.eye)
        camera.fov = debug.fov ?? baseFov
        camera.updateProjectionMatrix()
        camera.lookAt(...debug.look)
      }
    }

    // The sky darkens with height; the haze stays below.
    const height = camera.position.y
    const space = smooth(4_000, 42_000, height)
    sky.copy(skyLow).lerp(skyHigh, space)
    renderer.setClearColor(sky)
    heavens.update(camera, space)
    // Push the haze back when the camera stands far off, so the booster and the tower never fade out.
    const reach = camera.position.distanceTo(at)
    fog.near = 4_000 + height + reach
    fog.far = 90_000 + height * 5 + reach * 2

    // Rings keep a readable size on screen however far away they are.
    const grow = (mesh: THREE.Mesh) => mesh.scale.setScalar(Math.max(1, camera.position.distanceTo(mesh.position) / 260))
    targetRing.visible = !flight.outcome
    targetRing.position.set(0, TUNING.catchHeight, 0)
    grow(targetRing)
    const arrival = flight.outcome ? null : view.arrival
    arrivalRing.visible = arrival !== null && !arrival.hover
    if (arrival && !arrival.hover) {
      arrivalRing.position.set(arrival.x, Math.max(TUNING.catchHeight, arrival.y), 0)
      grow(arrivalRing)
      const good = arrival.outcome === null || arrival.outcome === 'caught'
      ;(arrivalRing.material as THREE.MeshBasicMaterial).color.setHex(good ? INK : RED)
    }
    renderer.render(scene, camera)

    top.set(s.x, s.y + BOOSTER_HEIGHT, 0).project(camera)
    base.set(s.x, s.y, 0).project(camera)
    const tall = ((top.y - base.y) / 2) * clientHeight
    tag.hidden = !!flight.outcome || tall > 70 || top.z > 1
    if (!tag.hidden) {
      const x = ((top.x + 1) / 2) * clientWidth
      const y = ((1 - (top.y + base.y) / 2) / 2) * clientHeight
      const h = Math.max(tall, 14) + 18
      tag.style.transform = `translate(${(x - 12).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px)`
      tag.style.height = `${h.toFixed(0)}px`
    }
    placeMarker(flight, clientWidth, clientHeight)
  }

  /** A label on the arms when they are in view; an arrow on the edge of the view pointing to them when not. */
  function placeMarker(flight: Flight, width: number, height: number) {
    marker.hidden = !!flight.outcome
    if (marker.hidden) return
    const p = top.set(0, ARM_HEIGHT, 0).project(camera)
    let x = ((p.x + 1) / 2) * width
    let y = ((1 - p.y) / 2) * height
    const behind = p.z > 1
    const pad = 28
    const minY = insetTop + pad
    const maxY = height - insetBottom - pad
    const onScreen = !behind && x > pad && x < width - pad && y > minY && y < maxY
    if (onScreen) {
      markerText.textContent = 'Catch arms'
      markerArrow.hidden = true
      marker.style.transform = `translate(${(x + 14).toFixed(1)}px, ${(y - 11).toFixed(1)}px)`
      return
    }
    // Off screen: from the middle of the clear view towards the arms, stopped at its edge.
    const cx = width / 2
    const cy = (minY + maxY) / 2
    let dx = x - cx
    let dy = y - cy
    if (behind) {
      dx = -dx
      dy = -dy
    }
    const scale = Math.min((width / 2 - pad) / Math.max(1e-6, Math.abs(dx)), ((maxY - minY) / 2) / Math.max(1e-6, Math.abs(dy)))
    x = cx + dx * scale
    y = cy + dy * scale
    const off = Math.abs(flight.state.x)
    markerText.textContent = off < 30 ? 'Tower below' : `Tower ${off >= 1_000 ? `${(off / 1_000).toFixed(1)} km` : `${Math.round(off)} m`}`
    markerArrow.hidden = false
    markerArrow.style.transform = `rotate(${Math.atan2(dy, dx).toFixed(3)}rad)`
    // Keep the label inside the view: to the left of the arrow on the right edge, and so on.
    const labelWidth = 110
    const left = x > width / 2 ? x - labelWidth - 10 : x - 6
    marker.style.transform = `translate(${Math.max(4, left).toFixed(1)}px, ${(y - 11).toFixed(1)}px)`
    marker.style.flexDirection = x > width / 2 ? 'row' : 'row-reverse'
  }

  function onOutcome(flight: Flight) {
    const outcome = flight.outcome
    if (!outcome || outcome === 'caught') return
    const s = flight.state
    if (outcome === 'sea') {
      effects.burst('spray', at, 50, 40)
      kick = 0.6
      return
    }
    const mid = scratch.set(s.x, s.y + 20, 0).clone()
    effects.burst('flash', mid, 7, 20)
    effects.burst('fire', mid, 46, 60)
    effects.burst('smoke', mid, 36, 34)
    kick = 1
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
      emitDebt = 0
      ventDebt = 0
      litSeen = false
      kick = 0
      effects.clear()
    },
  }
}
