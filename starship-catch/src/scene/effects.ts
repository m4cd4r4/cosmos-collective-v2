// Steam, dust, fire and spray: a small pool of soft sprites. All of it lives in the 3D scene.

import * as THREE from 'three'

export type Puff = 'steam' | 'dust' | 'fire' | 'smoke' | 'spray'

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
}

const KINDS: Record<Puff, Kind> = {
  // White deluge steam at liftoff: fast, billowing, soon gone.
  steam: { colour: 0xf4f4f0, additive: false, life: 7, size: 26, growth: 16, rise: 9, drag: 0.9, gravity: 0, opacity: 0.55 },
  // Tan dust: slower, lower, and it lingers.
  dust: { colour: 0xc9a67a, additive: false, life: 16, size: 22, growth: 9, rise: 2.5, drag: 0.7, gravity: 0, opacity: 0.5 },
  fire: { colour: 0xffa040, additive: true, life: 1.6, size: 30, growth: 55, rise: 12, drag: 1.6, gravity: 0, opacity: 0.9 },
  smoke: { colour: 0x2a2623, additive: false, life: 14, size: 34, growth: 14, rise: 9, drag: 0.8, gravity: 0, opacity: 0.6 },
  spray: { colour: 0xf2f6f6, additive: false, life: 4.5, size: 16, growth: 10, rise: 0, drag: 0.3, gravity: 9.8, opacity: 0.6 },
}

interface Particle {
  sprite: THREE.Sprite
  velocity: THREE.Vector3
  kind: Kind
  age: number
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

export function createEffects(): Effects {
  const group = new THREE.Group()
  const map = softDisc()
  const free: Particle[] = []
  const live: Particle[] = []
  for (let i = 0; i < POOL; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0 }))
    sprite.visible = false
    group.add(sprite)
    free.push({ sprite, velocity: new THREE.Vector3(), kind: KINDS.steam, age: 0, life: 1 })
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
        const size = k.size + k.growth * p.age
        p.sprite.scale.set(size, size, 1)
        p.sprite.material.opacity = k.opacity * Math.min(1, t * 8) * (1 - t) ** 1.5
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
