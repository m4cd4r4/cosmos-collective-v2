'use client'

/**
 * Interactive satellite globe.
 *
 * Earth is fixed at the origin (radius 1) and everything else moves in the
 * Earth-fixed frame described in lib/satellites/catalog.ts. Thousands of
 * satellites are one Points draw call; positions are re-propagated once a
 * second, while the few "hero" craft (ISS, Tiangong, the selected one) are
 * propagated every frame so they glide.
 *
 * The scene is built once on mount. Everything React-side (filters, selection,
 * earth look) reaches the render loop through refs, so a parent re-render never
 * rebuilds the WebGL context.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  ORBIT_CLASSES,
  ISS_NORAD,
  TIANGONG_NORAD,
  propagateAll,
  stateOf,
  orbitRing,
  type Catalog,
} from '@/lib/satellites/catalog'
import { ORBIT_CLASS_INFO } from '@/lib/satellites/orbit'
import { sunSceneDirection } from '@/lib/satellites/sun'
import { buildEarth, type EarthMode, type EarthHandle } from './earth'

export interface GlobeFilters {
  classVisible: boolean[]
  constellationVisible: boolean[]
  showClassRings: boolean
}

export interface SatelliteGlobeProps {
  catalog: Catalog | null
  earthMode: EarthMode
  filters: GlobeFilters
  selected: number | null
  follow: boolean
  onSelect: (index: number | null) => void
  onHover: (hover: { index: number; x: number; y: number } | null) => void
  onFollowBroken: () => void
  onReady?: () => void
}

const BULK_INTERVAL_MS = 1000
const PICK_RADIUS_MOUSE = 12
const PICK_RADIUS_TOUCH = 22
const TAP_SLOP_PX = 6

const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aVis;
  attribute vec3 aColor;
  uniform float uPix;
  varying vec3 vColor;
  varying float vVis;
  void main() {
    vColor = aColor;
    vVis = aVis;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPix * aVis;
  }
`
const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vVis;
  uniform float uAlpha;
  void main() {
    if (vVis < 0.5) discard;
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(vColor, core * uAlpha);
  }
`

function pointMaterial(pix: number, alpha = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uPix: { value: pix }, uAlpha: { value: alpha } },
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    transparent: true,
    depthWrite: false,
  })
}

function colorOf(hex: string) {
  const c = new THREE.Color(hex)
  return [c.r, c.g, c.b] as const
}

/** Ray from camera c to point p crosses the unit sphere first: the Earth hides p. */
function occludedByEarth(c: THREE.Vector3, px: number, py: number, pz: number) {
  const dx = px - c.x, dy = py - c.y, dz = pz - c.z
  const a = dx * dx + dy * dy + dz * dz
  const b = 2 * (c.x * dx + c.y * dy + c.z * dz)
  const cc = c.x * c.x + c.y * c.y + c.z * c.z - 1
  const disc = b * b - 4 * a * cc
  if (disc <= 0) return false
  const t = (-b - Math.sqrt(disc)) / (2 * a)
  return t > 0 && t < 1
}

export function SatelliteGlobe(props: SatelliteGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef(props)
  propsRef.current = props
  // Imperative hooks the prop-driven effects below call into the scene through.
  const apiRef = useRef<{
    setCatalog: (c: Catalog | null) => void
    setEarth: (m: EarthMode) => void
    refreshFilters: () => void
    refreshSelection: () => void
    refreshRings: () => void
  } | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    } catch {
      mount.setAttribute('data-webgl', 'unavailable')
      return
    }
    const pix = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(pix)
    renderer.setClearColor(0x0a0e1a, 1)
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 400)
    camera.position.set(1.6, 1.1, 3.4)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = !reduced
    controls.dampingFactor = 0.08
    controls.minDistance = 1.12
    controls.maxDistance = 60
    controls.zoomSpeed = 0.8
    controls.rotateSpeed = 0.7
    controls.screenSpacePanning = true
    controls.zoomToCursor = false

    // Stars: the same Milky Way equirect the landing hero uses, small file.
    const loader = new THREE.TextureLoader()
    const stars = loader.load('/solar-system/textures/stars_milky_way.jpg')
    stars.colorSpace = THREE.SRGBColorSpace
    stars.mapping = THREE.EquirectangularReflectionMapping
    scene.background = stars
    scene.backgroundIntensity = 0.55

    // ── Earth ────────────────────────────────────────────────────────────────
    let earth: EarthHandle | null = null
    const setEarth = (mode: EarthMode) => {
      if (earth) {
        scene.remove(earth.group)
        earth.dispose()
      }
      earth = buildEarth(mode, loader, renderer.capabilities.getMaxAnisotropy())
      earth.setSun(sunSceneDirection(new Date()))
      scene.add(earth.group)
    }
    setEarth(propsRef.current.earthMode)

    // ── Class reference rings (equatorial) ───────────────────────────────────
    const ringGroup = new THREE.Group()
    const RING_ALT_KM: Record<string, number> = { LEO: 550, MEO: 20200, GEO: 35786 }
    for (const cls of ['LEO', 'MEO', 'GEO'] as const) {
      const r = 1 + RING_ALT_KM[cls] / 6378.137
      const n = Math.max(90, Math.round(r * 160))
      const pos = new Float32Array(n * 3)
      const col = new Float32Array(n * 3)
      const [cr, cg, cb] = colorOf(ORBIT_CLASS_INFO[cls].color)
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2
        pos[k * 3] = Math.cos(a) * r
        pos[k * 3 + 1] = 0
        pos[k * 3 + 2] = Math.sin(a) * r
        col[k * 3] = cr; col[k * 3 + 1] = cg; col[k * 3 + 2] = cb
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
      g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n).fill(2.2), 1))
      g.setAttribute('aVis', new THREE.BufferAttribute(new Float32Array(n).fill(1), 1))
      ringGroup.add(new THREE.Points(g, pointMaterial(pix, 0.55)))
    }
    ringGroup.visible = propsRef.current.filters.showClassRings
    scene.add(ringGroup)

    // ── Bulk satellites ─────────────────────────────────────────────────────
    let userMoved = false
    let catalog: Catalog | null = null
    let positions = new Float32Array(0)
    let valid = new Uint8Array(0)
    let visibleMask = new Uint8Array(0)
    let bulk: THREE.Points | null = null
    let lastBulk = -Infinity

    const disposeBulk = () => {
      if (!bulk) return
      scene.remove(bulk)
      bulk.geometry.dispose()
      ;(bulk.material as THREE.Material).dispose()
      bulk = null
    }

    const isVisible = (i: number) => {
      const f = propsRef.current.filters
      return !!f.classVisible[catalog!.orbitClass[i]] && !!f.constellationVisible[catalog!.constellation[i]]
    }

    const refreshFilters = () => {
      if (!catalog || !bulk) return
      const vis = bulk.geometry.getAttribute('aVis') as THREE.BufferAttribute
      for (let i = 0; i < catalog.count; i++) {
        const v = isVisible(i) ? 1 : 0
        visibleMask[i] = v
        vis.setX(i, v)
      }
      vis.needsUpdate = true
      ringGroup.visible = propsRef.current.filters.showClassRings
    }

    const setCatalog = (c: Catalog | null) => {
      disposeBulk()
      catalog = c
      if (!c) return
      positions = new Float32Array(c.count * 3)
      valid = new Uint8Array(c.count)
      visibleMask = new Uint8Array(c.count)
      const colors = new Float32Array(c.count * 3)
      const sizes = new Float32Array(c.count)
      const vis = new Float32Array(c.count)
      for (let i = 0; i < c.count; i++) {
        const cls = ORBIT_CLASSES[c.orbitClass[i]]
        const [r, g, b] = colorOf(ORBIT_CLASS_INFO[cls].color)
        colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b
        sizes[i] = cls === 'LEO' ? 2.4 : 3.6
      }
      propagateAll(c, new Date(), positions, valid)
      const geo = new THREE.BufferGeometry()
      const posAttr = new THREE.BufferAttribute(positions, 3)
      posAttr.setUsage(THREE.DynamicDrawUsage)
      geo.setAttribute('position', posAttr)
      geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
      geo.setAttribute('aVis', new THREE.BufferAttribute(vis, 1))
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000) // positions move; never cull
      bulk = new THREE.Points(geo, pointMaterial(pix, 0.95))
      bulk.frustumCulled = false
      scene.add(bulk)
      lastBulk = performance.now()
      refreshFilters()

      // First sight of the data: look at the ISS.
      const iss = c.indexByNorad.get(ISS_NORAD)
      if (iss !== undefined && valid[iss]) lookAt(positions[iss * 3], positions[iss * 3 + 1], positions[iss * 3 + 2])
    }

    function lookAt(x: number, y: number, z: number) {
      const d = camera.position.length()
      const dir = new THREE.Vector3(x, y, z).normalize()
      camera.position.copy(dir.multiplyScalar(Math.max(d, 2.6)))
      controls.target.set(0, 0, 0)
      controls.update()
    }

    // ── Hero craft: ISS, Tiangong, selected (propagated every frame) ────────
    const HERO_MAX = 3
    const heroGeo = new THREE.BufferGeometry()
    const heroPos = new Float32Array(HERO_MAX * 3)
    const heroCol = new Float32Array(HERO_MAX * 3)
    const heroSize = new Float32Array(HERO_MAX)
    const heroVis = new Float32Array(HERO_MAX)
    heroGeo.setAttribute('position', new THREE.BufferAttribute(heroPos, 3))
    heroGeo.setAttribute('aColor', new THREE.BufferAttribute(heroCol, 3))
    heroGeo.setAttribute('aSize', new THREE.BufferAttribute(heroSize, 1))
    heroGeo.setAttribute('aVis', new THREE.BufferAttribute(heroVis, 1))
    heroGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000)
    const heroPoints = new THREE.Points(heroGeo, pointMaterial(pix, 1))
    heroPoints.frustumCulled = false
    heroPoints.renderOrder = 5
    scene.add(heroPoints)

    const labelLayer = document.createElement('div')
    labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'
    mount.appendChild(labelLayer)
    const labels: HTMLDivElement[] = []
    for (let k = 0; k < HERO_MAX; k++) {
      const el = document.createElement('div')
      el.className = 'sat-label'
      el.style.cssText =
        'position:absolute;left:0;top:0;white-space:nowrap;font:600 11px/1 var(--font-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#f3e3a0;text-shadow:0 0 6px #000,0 0 2px #000;will-change:transform;display:none'
      labelLayer.appendChild(el)
      labels.push(el)
    }
    let heroIdx: number[] = []

    // ── Orbit ring for the selected satellite ───────────────────────────────
    let ringPoints: THREE.Points | null = null
    const disposeRing = () => {
      if (!ringPoints) return
      scene.remove(ringPoints)
      ringPoints.geometry.dispose()
      ;(ringPoints.material as THREE.Material).dispose()
      ringPoints = null
    }
    let ringFor = -1
    let ringBuiltAt = 0
    const buildRing = (i: number) => {
      disposeRing()
      if (!catalog) return
      const pts = orbitRing(catalog, i, new Date(), 260)
      const n = pts.length / 3
      // Gold-white so the ring reads against the same-coloured shell of satellites around it.
      const [r, g, b] = colorOf('#ffe9a8')
      const col = new Float32Array(n * 3)
      for (let k = 0; k < n; k++) { col[k * 3] = r; col[k * 3 + 1] = g; col[k * 3 + 2] = b }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pts.slice(), 3))
      geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
      geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n).fill(4), 1))
      geo.setAttribute('aVis', new THREE.BufferAttribute(new Float32Array(n).fill(1), 1))
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000)
      ringPoints = new THREE.Points(geo, pointMaterial(pix, 1))
      ringPoints.renderOrder = 4
      ringPoints.frustumCulled = false
      scene.add(ringPoints)
      ringFor = i
      ringBuiltAt = performance.now()
    }

    const refreshSelection = () => {
      const sel = propsRef.current.selected
      if (sel === null || !catalog) {
        disposeRing()
        ringFor = -1
      } else if (sel !== ringFor) {
        buildRing(sel)
      }
      const set = new Set<number>()
      for (const n of [ISS_NORAD, TIANGONG_NORAD]) {
        const i = catalog?.indexByNorad.get(n)
        if (i !== undefined) set.add(i)
      }
      if (sel !== null) set.add(sel)
      heroIdx = [...set].slice(0, HERO_MAX)
    }

    const refreshRings = () => { ringGroup.visible = propsRef.current.filters.showClassRings }

    apiRef.current = { setCatalog, setEarth, refreshFilters, refreshSelection, refreshRings }

    // ── Sizing ───────────────────────────────────────────────────────────────
    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // A portrait viewport needs the camera further back for the globe to fit its width.
      if (!userMoved) camera.position.setLength(Math.max(3.4, 3.0 / Math.max(camera.aspect, 0.3)))
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // ── Picking ──────────────────────────────────────────────────────────────
    const pvMatrix = new THREE.Matrix4()
    const pickAt = (clientX: number, clientY: number, radius: number): number | null => {
      if (!catalog) return null
      const rect = renderer.domElement.getBoundingClientRect()
      const sx = clientX - rect.left
      const sy = clientY - rect.top
      camera.updateMatrixWorld()
      pvMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
      const e = pvMatrix.elements
      const hw = rect.width / 2
      const hh = rect.height / 2
      let best = -1
      let bestD = radius * radius
      const cam = camera.position
      for (let i = 0; i < catalog.count; i++) {
        if (!visibleMask[i] || !valid[i]) continue
        const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2]
        const w = e[3] * x + e[7] * y + e[11] * z + e[15]
        if (w <= 0) continue
        const nx = (e[0] * x + e[4] * y + e[8] * z + e[12]) / w
        const ny = (e[1] * x + e[5] * y + e[9] * z + e[13]) / w
        const dx = (nx + 1) * hw - sx
        const dy = (1 - ny) * hh - sy
        const d2 = dx * dx + dy * dy
        if (d2 >= bestD) continue
        if (occludedByEarth(cam, x, y, z)) continue
        bestD = d2
        best = i
      }
      return best >= 0 ? best : null
    }

    const el = renderer.domElement
    let down: { x: number; y: number; id: number; touch: boolean } | null = null
    const onPointerDown = (ev: PointerEvent) => {
      userMoved = true
      down = { x: ev.clientX, y: ev.clientY, id: ev.pointerId, touch: ev.pointerType !== 'mouse' }
      // A drag takes the camera back from follow mode.
      if (propsRef.current.follow) propsRef.current.onFollowBroken()
    }
    const onPointerUp = (ev: PointerEvent) => {
      if (!down || ev.pointerId !== down.id) return
      const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y)
      const wasTouch = down.touch
      down = null
      if (moved > TAP_SLOP_PX) return
      const hit = pickAt(ev.clientX, ev.clientY, wasTouch ? PICK_RADIUS_TOUCH : PICK_RADIUS_MOUSE)
      propsRef.current.onSelect(hit)
    }
    let hoverRaf = 0
    let lastHoverIdx: number | null = null
    const onPointerMove = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse' || ev.buttons !== 0 || hoverRaf) return
      const { clientX, clientY } = ev
      hoverRaf = requestAnimationFrame(() => {
        hoverRaf = 0
        const hit = pickAt(clientX, clientY, PICK_RADIUS_MOUSE)
        el.style.cursor = hit === null ? 'grab' : 'pointer'
        if (hit === lastHoverIdx && hit === null) return
        lastHoverIdx = hit
        propsRef.current.onHover(hit === null ? null : { index: hit, x: clientX, y: clientY })
      })
    }
    const onPointerLeave = () => {
      lastHoverIdx = null
      propsRef.current.onHover(null)
    }
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', onPointerLeave)
    el.style.cursor = 'grab'

    // ── Frame loop ───────────────────────────────────────────────────────────
    const tmp = new THREE.Vector3()
    const HERO_ISS = colorOf('#ffe27a')
    let raf = 0
    let running = true

    const frame = () => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      const now = new Date()
      const t = performance.now()

      if (catalog && bulk && t - lastBulk >= BULK_INTERVAL_MS) {
        propagateAll(catalog, now, positions, valid)
        ;(bulk.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
        lastBulk = t
        earth?.setSun(sunSceneDirection(now))
      }

      // Hero craft, every frame
      const rect = renderer.domElement.getBoundingClientRect()
      camera.updateMatrixWorld()
      for (let k = 0; k < HERO_MAX; k++) {
        const idx = heroIdx[k]
        if (catalog === null || idx === undefined) { heroVis[k] = 0; labels[k].style.display = 'none'; continue }
        const st = stateOf(catalog, idx, now)
        if (!st) { heroVis[k] = 0; labels[k].style.display = 'none'; continue }
        heroPos[k * 3] = st.scene[0]; heroPos[k * 3 + 1] = st.scene[1]; heroPos[k * 3 + 2] = st.scene[2]
        const isSel = idx === propsRef.current.selected
        const [r, g, b] = isSel ? colorOf('#ffffff') : HERO_ISS
        heroCol[k * 3] = r; heroCol[k * 3 + 1] = g; heroCol[k * 3 + 2] = b
        heroSize[k] = isSel ? 11 : 8
        heroVis[k] = 1
        // Keep the bulk point in step so picking agrees with what is drawn.
        positions[idx * 3] = st.scene[0]; positions[idx * 3 + 1] = st.scene[1]; positions[idx * 3 + 2] = st.scene[2]

        tmp.set(st.scene[0], st.scene[1], st.scene[2])
        const hidden = occludedByEarth(camera.position, tmp.x, tmp.y, tmp.z)
        tmp.project(camera)
        if (hidden || tmp.z > 1 || !isVisible(idx)) {
          labels[k].style.display = 'none'
        } else {
          labels[k].style.display = 'block'
          const nr = catalog.norad[idx]
          labels[k].textContent = nr === TIANGONG_NORAD ? 'Tiangong' : nr === ISS_NORAD ? 'ISS' : catalog.names[idx]
          labels[k].style.transform = `translate(${((tmp.x + 1) / 2) * rect.width + 10}px, ${((1 - tmp.y) / 2) * rect.height - 6}px)`
        }
      }
      ;(heroGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
      ;(heroGeo.getAttribute('aColor') as THREE.BufferAttribute).needsUpdate = true
      ;(heroGeo.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true
      ;(heroGeo.getAttribute('aVis') as THREE.BufferAttribute).needsUpdate = true

      // The ring is the inertial orbit rotated by "now"; refresh it as the Earth turns.
      if (ringFor >= 0 && t - ringBuiltAt > 30_000) buildRing(ringFor)

      // Follow the selected craft
      const p = propsRef.current
      if (p.follow && p.selected !== null && catalog) {
        const k = heroIdx.indexOf(p.selected)
        if (k >= 0 && heroVis[k]) {
          tmp.set(heroPos[k * 3], heroPos[k * 3 + 1], heroPos[k * 3 + 2]).normalize()
          const dist = camera.position.length()
          const target = tmp.multiplyScalar(dist)
          camera.position.lerp(target, reduced ? 1 : 0.06)
          camera.position.setLength(dist)
          controls.target.set(0, 0, 0)
        }
      }

      earth?.update(now, camera)
      controls.update()
      renderer.render(scene, camera)
    }

    setCatalog(propsRef.current.catalog)
    refreshSelection()
    frame()
    mount.setAttribute('data-ready', 'true')
    propsRef.current.onReady?.()

    return () => {
      running = false
      cancelAnimationFrame(raf)
      cancelAnimationFrame(hoverRaf)
      ro.disconnect()
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerLeave)
      controls.dispose()
      disposeBulk()
      disposeRing()
      earth?.dispose()
      heroGeo.dispose()
      ;(heroPoints.material as THREE.Material).dispose()
      ringGroup.children.forEach((c) => {
        const pts = c as THREE.Points
        pts.geometry.dispose()
        ;(pts.material as THREE.Material).dispose()
      })
      stars.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      if (labelLayer.parentNode === mount) mount.removeChild(labelLayer)
      apiRef.current = null
      mount.removeAttribute('data-ready')
    }
  }, [])

  useEffect(() => { apiRef.current?.setCatalog(props.catalog); apiRef.current?.refreshSelection() }, [props.catalog])
  useEffect(() => { apiRef.current?.setEarth(props.earthMode) }, [props.earthMode])
  useEffect(() => { apiRef.current?.refreshFilters(); apiRef.current?.refreshRings() }, [props.filters])
  useEffect(() => { apiRef.current?.refreshSelection() }, [props.selected])

  return <div ref={mountRef} className="absolute inset-0" data-testid="satellite-globe" />
}

