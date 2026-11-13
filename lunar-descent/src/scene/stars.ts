// The star field: every star in the Yale Bright Star Catalogue, placed as seen from the
// lunar south pole. Points at a fixed distance, sized and dimmed by magnitude, tinted by
// colour index. They do not twinkle: there is no air.

import * as THREE from 'three'
import { skyToWorld } from '../sim/sky'

const URL = `${import.meta.env.BASE_URL}sky/stars.bin`
/** Beyond the farthest terrain, inside the camera's far plane. */
const DISTANCE = 1_500_000

// Blue-white through white to orange, by B-V colour index.
const HOT = new THREE.Color(0.68, 0.78, 1)
const WHITE = new THREE.Color(1, 1, 1)
const COOL = new THREE.Color(1, 0.72, 0.48)

export async function loadStars(sunAlong: number, sunAcross: number): Promise<THREE.Points> {
  const data = new Int16Array(await (await fetch(URL)).arrayBuffer())
  const count = data.length / 5
  const toWorld = skyToWorld(sunAlong, sunAcross)
  const positions = new Float32Array(count * 3)
  const colours = new Float32Array(count * 3)
  const magnitudes = new Float32Array(count)
  const colour = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const k = i * 5
    const [x, y, z] = toWorld([data[k] / 32767, data[k + 1] / 32767, data[k + 2] / 32767])
    positions.set([x * DISTANCE, y * DISTANCE, z * DISTANCE], i * 3)
    magnitudes[i] = data[k + 3] / 1000
    const index = data[k + 4] / 1000
    if (index < 0.4) colour.lerpColors(HOT, WHITE, Math.max(0, (index + 0.3) / 0.7))
    else colour.lerpColors(WHITE, COOL, Math.min(1, (index - 0.4) / 1.4))
    colours.set([colour.r, colour.g, colour.b], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('tint', new THREE.BufferAttribute(colours, 3))
  geometry.setAttribute('magnitude', new THREE.BufferAttribute(magnitudes, 1))

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { pixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
    vertexShader: /* glsl */ `
      attribute vec3 tint;
      attribute float magnitude;
      uniform float pixelRatio;
      varying vec4 vColour;
      void main() {
        // Brightness relative to a first magnitude star: each magnitude is a factor of 2.512.
        float flux = pow(10.0, -0.4 * (magnitude - 1.0));
        gl_PointSize = clamp(1.4 + 3.2 * pow(flux, 0.35), 1.4, 7.0) * pixelRatio;
        vColour = vec4(tint, clamp(1.8 * pow(flux, 0.45), 0.1, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec4 vColour;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(vColour.rgb, vColour.a * smoothstep(0.5, 0.12, d));
      }`,
  })
  const stars = new THREE.Points(geometry, material)
  stars.frustumCulled = false
  return stars
}
