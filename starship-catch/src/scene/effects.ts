// Steam, dust, fire and spray: a small pool of soft sprites. All of it lives in the 3D scene.

import * as THREE from 'three'

export type Puff = 'steam' | 'dust' | 'flash' | 'fire' | 'smoke' | 'spray'

interface Kind {
  colour: number
  additive: boolean
  life: number
  size: number
  growth: number
  rise: number
  drag: number
  gravity: number
  opacity: number
  /** Colour the puff cools to over its life, and how fast it fades in (higher is faster). */
  cool?: number
  fadeIn?: number
  /** Puffs start scattered within this many metres, so a burst reads as a cloud and not one disc. */
  spread?: number
}

const KINDS: Record<Puff, Kind> = {
  // White deluge steam at liftoff: fast, billowing, soon gone.
  steam: { colour: 0xf4f4f0, additive: false, life: 7, size: 26, growth: 16, rise: 9, drag: 0.9, gravity: 0, opacity: 0.55 },
  // Tan dust: slower, lower, and it lingers.
  dust: { colour: 0xc9a67a, additive: false, life: 16, size: 22, growth: 9, rise: 2.5, drag: 0.7, gravity: 0, opacity: 0.5 },
  // Not additive: 46 additive sprites on a daylight sky saturate to a white disc.
  fire: { colour: 0xffb23c, cool: 0x7a1e08, additive: false, life: 2.6, size: 15, growth: 20, rise: 14, drag: 1.4, gravity: 0, opacity: 1, spread: 16 },
  // The hot core: a few additive puffs only, brief, so it brightens the fire without washing it out.
  flash: { colour: 0xffb060, additive: true, life: 0.9, size: 22, growth: 44, rise: 0, drag: 2, gravity: 0, opacity: 0.42, spread: 8 },
  // Smoke fades in slowly so the fire is seen first.
  smoke: { colour: 0x3a3532, additive: false, life: 14, size: 16, growth: 9, rise: 9, drag: 0.8, gravity: 0, opacity: 0.34, fadeIn: 0.6, spread: 20 },
  spray: { colour: 0xf2f6f6, additive: false, life: 4.5, size: 16, growth: 10, rise: 0, drag: 0.3, gravity: 9.8, opacity: 0.6 },
}

interface Particle {
  sprite: THREE.Sprite
  velocity: THREE.Vector3
  kind: Kind
  age: number
  scale: number
  life: number
}

export interface Effects {
  group: THREE.Group
  /** One puff at `at`, thrown outwards at about `speed` m/s. */
  emit(kind: Puff, at: THREE.Vector3, speed: number): void
  /** Many at once: an explosion or a splash. */
  burst(kind: Puff, at: THREE.Vector3, count: number, speed: number): void
  update(dt: number): void
  clear(): void
}

function softDisc(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const c = canvas.getContext('2d') as CanvasRenderingContext2D
  const fade = c.createRadialGradient(32, 32, 0, 32, 32, 32)
  fade.addColorStop(0, 'rgba(255,255,255,1)')
  fade.addColorStop(0.5, 'rgba(255,255,255,0.55)')
  fade.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = fade
  c.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

const POOL = 220
const coolTo = new THREE.Color()
const jitter = new THREE.Vector3()

export function createEffects(): Effects {
  const group = new THREE.Group()
  const map = softDisc()
  const free: Particle[] = []
  const live: Particle[] = []
  for (let i = 0; i < POOL; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0 }))
    sprite.visible = false
    group.add(sprite)
    free.push({ sprite, velocity: new THREE.Vector3(), kind: KINDS.steam, age: 0, scale: 1, life: 1 })
  }

  function emit(name: Puff, at: THREE.Vector3, speed: number) {
    // When the pool is empty the oldest puff is reused: it is the most faded.
    const p = free.pop() ?? live.shift()
    if (!p) return
    const kind = KINDS[name]
    const angle = Math.random() * Math.PI * 2
    const out = speed * (0.4 + Math.random() * 0.6)
    p.kind = kind
    p.age = 0
    p.life = kind.life * (0.7 + Math.random() * 0.6)
    p.velocity.set(Math.cos(angle) * out, (name === 'spray' || name === 'fire' ? speed * (0.5 + Math.random()) : 0) + kind.rise * Math.random(), Math.sin(angle) * out)
    p.sprite.position.copy(at)
    p.sprite.position.y += Math.random() * 4
    if (kind.spread) p.sprite.position.add(jitter.randomDirection().multiplyScalar(kind.spread * Math.random()))
    p.scale = 0.6 + Math.random() * 0.9
    // Fire is drawn over smoke, whatever the depth sort says.
    p.sprite.renderOrder = name === 'smoke' ? 0 : 1
    p.sprite.material.color.setHex(kind.colour)
    p.sprite.material.blending = kind.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    p.sprite.material.rotation = Math.random() * Math.PI
    p.sprite.visible = true
    live.push(p)
  }

  return {
    group,
    emit,
    burst(name, at, count, speed) {
      for (let i = 0; i < count; i++) emit(name, at, speed)
    },
    update(dt) {
      for (let i = live.length - 1; i >= 0; i--) {
        const p = live[i]
        p.age += dt
        if (p.age >= p.life) {
          p.sprite.visible = false
          live.splice(i, 1)
          free.push(p)
          continue
        }
        const k = p.kind
        p.velocity.multiplyScalar(Math.max(0, 1 - k.drag * dt))
        p.velocity.y += (k.rise * 0.25 - k.gravity) * dt
        p.sprite.position.addScaledVector(p.velocity, dt)
        if (p.sprite.position.y < 1) p.sprite.position.y = 1
        const t = p.age / p.life
        const size = (k.size + k.growth * p.age) * p.scale
        p.sprite.scale.set(size, size, 1)
        if (k.cool !== undefined) p.sprite.material.color.setHex(k.colour).lerp(coolTo.setHex(k.cool), Math.min(1, t * 1.6))
        p.sprite.material.opacity = k.opacity * Math.min(1, p.age * (k.fadeIn ?? 12)) * (1 - t) ** 1.5
      }
    },
    clear() {
      while (live.length) {
        const p = live.pop() as Particle
        p.sprite.visible = false
        free.push(p)
      }
    },
  }
}
