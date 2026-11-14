// The sky: a dome that darkens to space with height, stars that come out above the air,
// and a layer of fair-weather cloud the stack climbs through and the booster falls back through.
// The clouds are scenery: nothing published says what the sky held on any flight.

import * as THREE from 'three'

export interface Sky {
  group: THREE.Group
  /** `space` 0 at the ground to 1 above the air. */
  update(camera: THREE.Camera, space: number): void
}

/** Cloud base and top, m. The booster passes through on the way up and again in the coast. */
const CLOUD_LOW = 5_200
const CLOUD_HIGH = 7_400
const CLOUD_OPACITY = 0.92
/** A cloud closer to the camera than this many of its own widths thins out, so flying through one is a wisp, not a white screen. */
const CLOUD_CLEAR = 0.9

/** A puffy cloud: overlapping soft discs, brighter on top, drawn once into a canvas. */
function cloudTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const c = canvas.getContext('2d') as CanvasRenderingContext2D
  // A fixed pattern, so every visit looks the same.
  let seed = 7
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  for (let i = 0; i < 26; i++) {
    const x = size * (0.22 + 0.56 * random())
    const y = size * (0.35 + 0.35 * random())
    const r = size * (0.1 + 0.14 * random())
    const shade = Math.round(225 + 30 * (1 - y / size))
    const puff = c.createRadialGradient(x, y, 0, x, y, r)
    puff.addColorStop(0, `rgba(${shade},${shade},${shade + 2},0.55)`)
    puff.addColorStop(1, `rgba(${shade},${shade},${shade + 2},0)`)
    c.fillStyle = puff
    c.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createDome(): THREE.Mesh {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(3_000_000, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false,
      uniforms: { space: { value: 0 }, horizon: { value: new THREE.Color(0xb4cbe0) }, zenith: { value: new THREE.Color(0x3f7fc4) }, dark: { value: new THREE.Color(0x04060c) } },
      vertexShader: 'varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
uniform float space;
uniform vec3 horizon;
uniform vec3 zenith;
uniform vec3 dark;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = max(0.0, d.y);
  vec3 day = mix(horizon, zenith, pow(h, 0.6));
  // High up the air is a thin bright band along the horizon, the limb of the Earth, below black sky.
  float limb = exp(-abs(d.y + 0.04 * space) * 22.0);
  vec3 high = mix(dark, horizon * 1.15, limb);
  gl_FragColor = vec4(mix(day, high, space), 1.0);
#include <colorspace_fragment>
}`,
    }),
  )
  dome.renderOrder = -2
  dome.frustumCulled = false
  return dome
}

function createStars(): THREE.Points {
  const count = 1_800
  const positions = new Float32Array(count * 3)
  const point = new THREE.Vector3()
  let seed = 3
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  for (let i = 0; i < count; i++) {
    point.set(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1)
    if (point.lengthSq() > 1 || point.lengthSq() < 0.01) {
      i--
      continue
    }
    point.normalize().multiplyScalar(2_500_000)
    positions.set([point.x, point.y, point.z], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const stars = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xf4f1e8, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }),
  )
  stars.renderOrder = -1
  stars.frustumCulled = false
  return stars
}

function createClouds(): THREE.Group {
  const group = new THREE.Group()
  const map = cloudTexture()
  let seed = 11
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  // A field along the flight path, from inland of the pad to past the turn-round point, and some over the pad itself.
  const place = (count: number, x0: number, x1: number, z: number) => {
    for (let i = 0; i < count; i++) {
      // One material each, so a cloud the camera flies into can fade on its own.
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: CLOUD_OPACITY }))
      const size = 700 + random() * 1_900
      sprite.scale.set(size * 1.6, size, 1)
      sprite.position.set(x0 + (x1 - x0) * random(), CLOUD_LOW + (CLOUD_HIGH - CLOUD_LOW) * random(), (random() * 2 - 1) * z)
      group.add(sprite)
    }
  }
  place(150, -60_000, 140_000, 70_000)
  place(14, -2_500, 3_000, 2_500)
  return group
}

export function createSky(): Sky {
  const group = new THREE.Group()
  const dome = createDome()
  const stars = createStars()
  const clouds = createClouds()
  group.add(dome, stars, clouds)
  const uniforms = (dome.material as THREE.ShaderMaterial).uniforms
  const starMaterial = stars.material as THREE.PointsMaterial

  return {
    group,
    update(camera, space) {
      dome.position.copy(camera.position)
      stars.position.copy(camera.position)
      uniforms.space.value = space
      starMaterial.opacity = Math.max(0, (space - 0.55) / 0.45)
      stars.visible = starMaterial.opacity > 0
      for (const child of clouds.children) {
        const sprite = child as THREE.Sprite
        const width = sprite.scale.x
        const near = sprite.position.distanceTo(camera.position) / width
        sprite.material.opacity = CLOUD_OPACITY * Math.min(1, Math.max(0, (near - 0.25) / (CLOUD_CLEAR - 0.25)))
        sprite.visible = sprite.material.opacity > 0.01
      }
    },
  }
}
