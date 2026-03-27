'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { StarSystem, Planet } from './types'
import { tempToColor, tempToRGB, PLANET_COLORS } from './utils'
import { PlanetScaleCard } from './PlanetScaleCard'
import { TransitAnimation } from './TransitAnimation'

interface Props {
  star: StarSystem
}

const SPEED_OPTIONS = [0.1, 1, 10, 100] as const
const DEFAULT_TIMESCALE = 500

function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex)
}

function logSceneR(smaxAU: number): number {
  return 5 + Math.log10(Math.max(smaxAU, 0.01) * 10) * 12
}

function hzBounds(slum: number | null): { inner: number; outer: number } | null {
  if (!slum || slum <= 0) return null
  return {
    inner: Math.sqrt(slum / 1.1),
    outer: Math.sqrt(slum / 0.53),
  }
}

export function ExoplanetSystemViewer({ star }: Props) {
  const mountRef  = useRef<HTMLDivElement>(null)
  const sceneRef  = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const frameRef  = useRef<number>(0)
  const clockRef  = useRef(new THREE.Clock())
  const anglesRef = useRef<number[]>([])
  const meshesRef = useRef<THREE.Mesh[]>([])
  const hoveredRef = useRef<THREE.Mesh | null>(null)
  const timeScaleRef = useRef(DEFAULT_TIMESCALE)
  const pausedRef = useRef(false)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  const [paused, setPaused]           = useState(false)
  const [speedIdx, setSpeedIdx]       = useState(1) // 1× is index 1
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [tooltipPlanet, setTooltipPlanet]   = useState<Planet | null>(null)
  const [tooltipPos, setTooltipPos]         = useState({ x: 0, y: 0 })

  // Keep refs in sync with state
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => {
    const base = SPEED_OPTIONS[speedIdx] as number
    timeScaleRef.current = DEFAULT_TIMESCALE * base
  }, [speedIdx])

  const togglePause = useCallback(() => {
    setPaused(p => !p)
    clockRef.current.getDelta() // flush dt so resume doesn't jump
  }, [])

  // ── Build / rebuild Three.js scene when star changes ──────────────────────
  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020408)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000)
    camera.position.set(0, 20, 35)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.minDistance = 5
    controls.maxDistance = 200
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controlsRef.current = controls

    // Lights
    const ambient = new THREE.AmbientLight(0x334466, 0.5)
    scene.add(ambient)
    const [sr, sg, sb] = tempToRGB(star.teff)
    const starLight = new THREE.PointLight(
      new THREE.Color(sr / 255, sg / 255, sb / 255),
      2.0
    )
    starLight.position.set(0, 0, 0)
    scene.add(starLight)

    // Star sphere
    const starColor = hexToThreeColor(tempToColor(star.teff))
    const starGeo = new THREE.SphereGeometry(2.5, 32, 32)
    const starMat = new THREE.MeshBasicMaterial({ color: starColor })
    const starMesh = new THREE.Mesh(starGeo, starMat)
    scene.add(starMesh)

    // Star glow sprite
    const glowTexture = (() => {
      const size = 128
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')!
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
      grad.addColorStop(0, `rgba(${sr},${sg},${sb},0.9)`)
      grad.addColorStop(0.3, `rgba(${sr},${sg},${sb},0.4)`)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size, size)
      return new THREE.CanvasTexture(canvas)
    })()
    const glowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const glow = new THREE.Sprite(glowMat)
    glow.scale.set(14, 14, 1)
    scene.add(glow)

    // HZ ring
    const hz = hzBounds(star.slum)
    if (hz) {
      const hzInR = logSceneR(hz.inner)
      const hzOutR = logSceneR(hz.outer)
      const hzGeo = new THREE.RingGeometry(hzInR, hzOutR, 128)
      const hzMat = new THREE.MeshBasicMaterial({
        color: 0x44ff88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
      })
      const hzMesh = new THREE.Mesh(hzGeo, hzMat)
      hzMesh.rotation.x = -Math.PI / 2
      scene.add(hzMesh)

      // HZ ring edge line (inner)
      const hzEdgeInGeo = new THREE.RingGeometry(hzInR, hzInR + 0.1, 128)
      const hzEdgeMat = new THREE.MeshBasicMaterial({
        color: 0x44ff88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      })
      const hzEdgeIn = new THREE.Mesh(hzEdgeInGeo, hzEdgeMat)
      hzEdgeIn.rotation.x = -Math.PI / 2
      scene.add(hzEdgeIn)
    }

    // Planets
    const sortedPlanets = [...star.planets].sort((a, b) => (a.smax ?? 99) - (b.smax ?? 99))
    const planetMeshes: THREE.Mesh[] = []
    const initAngles: number[] = []

    for (let i = 0; i < sortedPlanets.length; i++) {
      const planet = sortedPlanets[i]
      const smax = planet.smax ?? (0.1 + i * 0.15)
      const sceneR = logSceneR(smax)

      // Orbit line
      const orbitPoints: THREE.Vector3[] = []
      for (let j = 0; j <= 128; j++) {
        const a = (j / 128) * Math.PI * 2
        orbitPoints.push(new THREE.Vector3(Math.cos(a) * sceneR, 0, Math.sin(a) * sceneR))
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints)
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.15,
      })
      scene.add(new THREE.Line(orbitGeo, orbitMat))

      // Planet sphere
      const rade = planet.rade ?? 1
      const pr = Math.max(0.15, Math.min(0.8, rade * 0.15))
      const colorHex = PLANET_COLORS[planet.cat]
      const pColor = hexToThreeColor(colorHex)

      const pGeo = new THREE.SphereGeometry(pr, 24, 24)
      const pMat = new THREE.MeshStandardMaterial({
        color: pColor,
        roughness: 0.7,
        metalness: 0.1,
        emissive: pColor,
        emissiveIntensity: 0.15,
      })
      const pMesh = new THREE.Mesh(pGeo, pMat)

      // Spread initial angles
      const startAngle = (i / sortedPlanets.length) * Math.PI * 2
      pMesh.position.set(Math.cos(startAngle) * sceneR, 0, Math.sin(startAngle) * sceneR)
      pMesh.userData = { planet, sceneR, index: i }

      scene.add(pMesh)
      planetMeshes.push(pMesh)
      initAngles.push(startAngle)
    }

    meshesRef.current = planetMeshes
    anglesRef.current = [...initAngles]

    // Reset clock and selected planet
    clockRef.current = new THREE.Clock()
    setSelectedPlanet(null)
    setTooltipPlanet(null)

    // Animation loop
    function animate() {
      frameRef.current = requestAnimationFrame(animate)
      const dt = clockRef.current.getDelta()

      if (!pausedRef.current) {
        const meshes = meshesRef.current
        for (let i = 0; i < meshes.length; i++) {
          const m = meshes[i]
          const { planet, sceneR } = m.userData as { planet: Planet; sceneR: number }
          const period = planet.period ?? 365
          const angularSpeed = (2 * Math.PI / period) * timeScaleRef.current
          anglesRef.current[i] += angularSpeed * dt
          const a = anglesRef.current[i]
          m.position.set(Math.cos(a) * sceneR, 0, Math.sin(a) * sceneR)
        }
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const resizeObs = new ResizeObserver(onResize)
    resizeObs.observe(mount)

    return () => {
      cancelAnimationFrame(frameRef.current)
      resizeObs.disconnect()
      controls.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [star])

  // Mouse move — raycasting for hover tooltip
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const mount = mountRef.current
    const renderer = rendererRef.current
    const camera = cameraRef.current
    if (!mount || !renderer || !camera) return

    const rect = mount.getBoundingClientRect()
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(mouseRef.current, camera)
    const hits = raycasterRef.current.intersectObjects(meshesRef.current)

    if (hits.length > 0) {
      const mesh = hits[0].object as THREE.Mesh
      if (hoveredRef.current !== mesh) {
        // Reset previous
        if (hoveredRef.current) {
          hoveredRef.current.scale.set(1, 1, 1)
        }
        mesh.scale.set(1.4, 1.4, 1.4)
        hoveredRef.current = mesh
      }
      const { planet } = mesh.userData as { planet: Planet }
      setTooltipPlanet(planet)
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    } else {
      if (hoveredRef.current) {
        hoveredRef.current.scale.set(1, 1, 1)
        hoveredRef.current = null
      }
      setTooltipPlanet(null)
    }
  }, [])

  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const mount = mountRef.current
    const camera = cameraRef.current
    if (!mount || !camera) return

    const rect = mount.getBoundingClientRect()
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycasterRef.current.setFromCamera(mouseRef.current, camera)
    const hits = raycasterRef.current.intersectObjects(meshesRef.current)

    if (hits.length > 0) {
      const { planet } = (hits[0].object as THREE.Mesh).userData as { planet: Planet }
      setSelectedPlanet(prev => prev?.name === planet.name ? null : planet)
    } else {
      setSelectedPlanet(null)
    }
  }, [])

  const hasHZ = star.planets.some(p => p.hz) || !!hzBounds(star.slum)

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* 3D Viewport */}
      <div className="relative rounded-lg overflow-hidden border border-[rgba(74,144,226,0.15)]" style={{ height: 320 }}>
        <div
          ref={mountRef}
          className="w-full h-full"
          onMouseMove={onMouseMove}
          onClick={onClick}
          style={{ cursor: tooltipPlanet ? 'pointer' : 'default' }}
        />

        {/* Play/Pause + speed */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {SPEED_OPTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setSpeedIdx(i)}
              className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                i === speedIdx
                  ? 'bg-[rgba(74,144,226,0.3)] border-[rgba(74,144,226,0.6)] text-[#a0c4ff]'
                  : 'border-[rgba(74,144,226,0.15)] text-[#4a5580] hover:border-[rgba(74,144,226,0.3)]'
              }`}
            >
              {s}×
            </button>
          ))}
          <button
            onClick={togglePause}
            className="ml-1 text-[10px] px-2 py-0.5 rounded border border-[rgba(74,144,226,0.25)] text-[#8090b0] hover:text-white hover:border-[rgba(74,144,226,0.5)] transition-colors"
          >
            {paused ? '▶' : '⏸'}
          </button>
        </div>

        {/* HZ legend */}
        {hasHZ && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 pointer-events-none">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(68,255,136,0.25)', border: '1px solid rgba(68,255,136,0.5)' }} />
            <span className="text-[11px] text-[#44ff88]">Habitable zone</span>
          </div>
        )}

        {/* Hover tooltip */}
        {tooltipPlanet && (
          <div
            className="absolute pointer-events-none bg-[rgba(4,6,18,0.9)] border border-[rgba(74,144,226,0.3)] rounded px-2 py-1 text-[10px] backdrop-blur-sm"
            style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 8 }}
          >
            <div className="font-bold" style={{ color: PLANET_COLORS[tooltipPlanet.cat] }}>
              {tooltipPlanet.name}
            </div>
            {tooltipPlanet.rade && <div className="text-[#8090b0]">{tooltipPlanet.rade.toFixed(2)} R⊕</div>}
            {tooltipPlanet.period && <div className="text-[#8090b0]">{tooltipPlanet.period.toFixed(1)} d period</div>}
          </div>
        )}
      </div>

      {/* Selected planet details */}
      {selectedPlanet && (
        <div className="flex flex-col gap-2">
          <PlanetScaleCard planet={selectedPlanet} starName={star.name} />
          <TransitAnimation planet={selectedPlanet} star={star} />
        </div>
      )}
    </div>
  )
}
