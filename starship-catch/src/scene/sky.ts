// The sky: single scattering through a spherical atmosphere (air.ts), so it is blue overhead at
// the ground, darkens towards black as the camera climbs, reddens round a low Sun, and meets the
// curved Earth at a horizon that dips below level with height. Each frame the scattering is
// marched once into a small sky-view table for the camera's height (Hillaire 2020); the dome, the
// haze over the ground and the light the steel reflects all read from it.
//
// Clouds are scattered fair-weather cumulus, drawn as stacked slices of one noise field. Nothing
// published says what the sky held on Flight 8; they are scenery, kept off the pad so the approach
// stays in view.

import * as THREE from 'three'
import { AIR_GLSL, EARTH_RADIUS, SUN_INTENSITY, transmittance } from './air'

export type Quality = 'high' | 'low'

export interface Sky {
  group: THREE.Group
  /** Unit vector towards the Sun, in the scene frame (x east, y up, z south). */
  setSun(direction: THREE.Vector3): void
  /** Call each frame before rendering. `space` 0 at the ground to 1 above the air, for the stars. */
  update(camera: THREE.Camera, space: number): void
  /** The light the steel reflects: a prefiltered copy of the sky for the camera's height. */
  environment: THREE.Texture | null
  /** Adds the haze between the camera and whatever the material draws. Call before first render. */
  haze(material: THREE.Material, options?: { bend?: boolean }): void
  /** Sunlight reaching `altitude` m, as a colour scaled to the sky's units. */
  sunlight(altitude: number, out: THREE.Color): THREE.Color
  /** Tone mapping exposure shared with the renderer. */
  exposure: number
}

const SKY_UNIFORMS = {
  airSky: { value: null as THREE.Texture | null },
  airSun: { value: new THREE.Vector3(0, 1, 0) },
  airAltitude: { value: 0 },
  airExposure: { value: 1 },
}

/** Earth's curve: everything drawn with `bend` drops by d² / 2R with distance d from the tower. */
export const BEND_GLSL = /* glsl */ `
{
  vec3 airOffset = transpose(mat3(viewMatrix)) * mvPosition.xyz;
  vec3 airW = cameraPosition + airOffset;
  float airDrop = dot(airW.xz, airW.xz) / ${(2 * EARTH_RADIUS).toFixed(1)};
  mvPosition.xyz += mat3(viewMatrix) * vec3(0.0, -airDrop, 0.0);
  gl_Position = projectionMatrix * mvPosition;
}
`

const HAZE_PARS_VERTEX = /* glsl */ `
#ifdef USE_FOG
varying vec3 vAirRay;
#endif
`
const HAZE_VERTEX = /* glsl */ `
#ifdef USE_FOG
vAirRay = transpose(mat3(viewMatrix)) * mvPosition.xyz;
#endif
`
const HAZE_PARS_FRAGMENT = /* glsl */ `
#ifdef USE_FOG
varying vec3 vAirRay;
uniform sampler2D airSky;
uniform float airAltitude;
${AIR_GLSL}
vec3 airToLinear(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
vec3 airToSrgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
// The haze: what the air between the camera and the surface takes out (an exact integral of the
// thinning air along the straight ray) and puts in (the sky table's light for that direction,
// scaled by how much of the full ray's air lies in front of the surface). Colours in sRGB.
vec3 airHaze(vec3 colour, vec3 ray) {
  float airDist = length(ray);
  vec3 airDir = ray / max(airDist, 1e-3);
  float h0 = max(0.0, cameraPosition.y);
  float h1 = max(0.0, cameraPosition.y + ray.y);
  float dh = h1 - h0;
  float fr = abs(dh) > 1.0 ? H_R * (exp(-h0 / H_R) - exp(-h1 / H_R)) / dh : exp(-h0 / H_R);
  float fm = abs(dh) > 1.0 ? H_M * (exp(-h0 / H_M) - exp(-h1 / H_M)) / dh : exp(-h0 / H_M);
  vec3 airT = exp(-(BETA_R * fr + BETA_ME * fm) * airDist);
  vec4 airS = texture2D(airSky, skyUv(airDir, airAltitude));
  float airShare = clamp((1.0 - dot(airT, vec3(1.0 / 3.0))) / max(1e-4, 1.0 - airS.a), 0.0, 1.0);
  vec3 airLin = airToLinear(colour) * airT + airTone(airS.rgb * airShare);
  return airToSrgb(clamp(airLin, 0.0, 1.0));
}
#endif
`
const HAZE_FRAGMENT = /* glsl */ `
#ifdef USE_FOG
gl_FragColor.rgb = airHaze(gl_FragColor.rgb, vAirRay);
#endif
`

/** The table: one texel a direction, marched through the air from the camera. */
function lutMaterial(quality: Quality): THREE.ShaderMaterial {
  const steps = quality === 'high' ? 32 : 18
  const light = quality === 'high' ? 8 : 4
  return new THREE.ShaderMaterial({
    uniforms: { airSun: SKY_UNIFORMS.airSun, airAltitude: SKY_UNIFORMS.airAltitude, airExposure: SKY_UNIFORMS.airExposure },
    depthTest: false,
    depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
uniform vec3 airSun;
uniform float airAltitude;
varying vec2 vUv;
${AIR_GLSL}
void main() {
  vec3 d = skyDir(vUv, airAltitude);
  vec3 p = vec3(0.0, EARTH_R + max(1.0, airAltitude), 0.0);
  float ground = groundHit(p, d);
  float top = sphereExit(p, d, ATMOS_R);
  float tMax = ground > 0.0 ? ground : top;
  gl_FragColor = tMax > 0.0 ? scatter(p, d, tMax, airSun, ${steps}, ${light}) : vec4(0.0, 0.0, 0.0, 1.0);
}`,
  })
}

const DOME_VERTEX = 'varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'

/** The dome seen on screen, tone mapped; `env` is the linear copy rendered into the reflections. */
function domeMaterial(env: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    uniforms: { ...SKY_UNIFORMS, sunColour: { value: new THREE.Color() } },
    vertexShader: DOME_VERTEX,
    fragmentShader: `
uniform sampler2D airSky;
uniform vec3 airSun;
uniform float airAltitude;
uniform vec3 sunColour;
varying vec3 vDir;
${AIR_GLSL}
void main() {
  vec3 d = normalize(vDir);
  vec4 sky = texture2D(airSky, skyUv(d, airAltitude));
  vec3 colour = sky.rgb;
  vec3 p = vec3(0.0, EARTH_R + max(1.0, airAltitude), 0.0);
  bool ground = groundHit(p, d) > 0.0;
  ${
    env
      ? `// The ground under the reflections: the coast's sand and scrub, lit by the Sun and the sky, seen through the air. Brighter than a strict albedo would give, to match how bright the unlit photograph shows on screen.
  if (ground) colour += vec3(0.34, 0.31, 0.25) * (sunColour * max(0.0, airSun.y) + 1.2 * texture2D(airSky, vec2(0.0, 1.0)).rgb * AIR_PI) * sky.a;
  gl_FragColor = vec4(colour, 1.0);`
      : `// The Sun's disc, 0.53 degrees across, dimmed through the air.
  float c = dot(d, airSun);
  float disc = smoothstep(0.999955, 0.999968, c);
  if (!ground) colour += sunColour * disc * 2000.0;
  gl_FragColor = vec4(airTone(colour), 1.0);
#include <colorspace_fragment>`
  }
}`,
  })
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

let noiseCache: THREE.DataTexture | null = null
/** A tiling noise field, 256 texels, drawn once and shared: five octaves of smoothed value noise. */
export function noiseTexture(): THREE.DataTexture {
  if (noiseCache) return noiseCache
  const n = 256
  const data = new Uint8Array(n * n * 4)
  let seed = 11
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const field = new Float32Array(n * n)
  for (let octave = 0, amp = 0.5; octave < 5; octave++, amp *= 0.5) {
    const cells = 4 << octave
    const grid = Array.from({ length: cells * cells }, random)
    const at = (x: number, y: number) => grid[((y + cells) % cells) * cells + ((x + cells) % cells)]
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const fx = (x / n) * cells
        const fy = (y / n) * cells
        const x0 = Math.floor(fx)
        const y0 = Math.floor(fy)
        const sx = (fx - x0) ** 2 * (3 - 2 * (fx - x0))
        const sy = (fy - y0) ** 2 * (3 - 2 * (fy - y0))
        const top = at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx
        const bottom = at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx
        field[y * n + x] += amp * (top * (1 - sy) + bottom * sy)
      }
    }
  }
  for (let i = 0; i < n * n; i++) {
    const v = Math.round(Math.min(1, field[i] / 0.97) * 255)
    data.set([v, v, v, 255], i * 4)
  }
  const texture = new THREE.DataTexture(data, n, n)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  noiseCache = texture
  return texture
}

/** Cloud base and top, m: fair-weather cumulus over the coast. Scenery, see the note at the top. */
const CLOUD_BASE = 1_300
const CLOUD_TOP = 1_900
/** Clouds thin to nothing within this many metres of the tower. */
const CLOUD_CLEAR = 2_500

/**
 * The clouds: one box round the cloud layer, its shader marching each view ray through the layer.
 * Seen from outside, the faces towards the camera start the march; from inside, the far faces do.
 * The march is drawn at half size into its own picture and laid over the scene through a small
 * blur (cloudOverlay below): the march's leftover dither averages out there, so edges stay soft.
 */
function createClouds(quality: Quality, noise: THREE.Texture): { group: THREE.Group; materials: THREE.ShaderMaterial[] } {
  // Steps lengthen with distance, so near clouds are sampled finely and far ones, small on screen, coarsely.
  const steps = quality === 'high' ? 96 : 48
  const stepRate = quality === 'high' ? 0.035 : 0.07
  const stepMin = quality === 'high' ? 30 : 50
  const lightSteps = quality === 'high' ? 3 : 1
  const group = new THREE.Group()
  const thickness = CLOUD_TOP - CLOUD_BASE
  const material = new THREE.ShaderMaterial({
    transparent: false,
    blending: THREE.NoBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.FrontSide,
    fog: true,
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      ...SKY_UNIFORMS,
      noise: { value: noise },
      sunColour: { value: new THREE.Color() },
      ambient: { value: new THREE.Color() },
    },
    vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
#include <logdepthbuf_vertex>
}`,
    fragmentShader: `
#include <common>
#include <logdepthbuf_pars_fragment>
${HAZE_PARS_FRAGMENT}
uniform sampler2D noise;
uniform vec3 sunColour;
uniform vec3 ambient;
uniform vec3 airSun;
varying vec3 vWorld;
const float BASE = ${CLOUD_BASE.toFixed(1)};
const float TOP = ${CLOUD_TOP.toFixed(1)};
// Cloud density: broad patches cut into heaps, flat bottomed with rounded tops, roughened by finer noise.
float cloud(vec3 p) {
  // Height over the curved Earth, so the layer follows it down to the horizon.
  float h = p.y + dot(p.xz, p.xz) / ${(2 * EARTH_RADIUS).toFixed(1)};
  float k = (h - BASE) / (TOP - BASE);
  if (k < 0.0 || k > 1.0) return 0.0;
  float n = texture2D(noise, p.xz / 9000.0).r * 0.6 + texture2D(noise, p.xz / 2600.0 + 0.37).r * 0.3;
  float clear = smoothstep(${CLOUD_CLEAR.toFixed(1)}, ${(CLOUD_CLEAR * 2).toFixed(1)}, length(p.xz));
  float shape = n - (0.5 + 0.3 * k * k) + 0.08 * smoothstep(0.0, 0.15, k) - 0.08;
  if (shape <= 0.0) return 0.0;
  float detail = texture2D(noise, p.xz / 700.0 + vec2(k * 0.21, k * 0.13)).r;
  // A soft edge: density eases in over the rim of each heap, so no step of the march meets a wall.
  return smoothstep(0.0, 0.2, shape - detail * 0.04) * clear * smoothstep(0.0, 0.12, k) * smoothstep(1.0, 0.7, k);
}
float hg(float c, float g) { return (1.0 - g * g) / (4.0 * 3.14159 * pow(1.0 + g * g - 2.0 * g * c, 1.5)); }
void main() {
#include <logdepthbuf_fragment>
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorld - ro);
  // The span of the ray inside the layer, from the camera if it is inside.
  float dy = abs(rd.y) < 1e-4 ? 1e-4 : rd.y;
  float tA = (BASE - ro.y) / dy;
  float tB = (TOP - ro.y) / dy;
  float t0 = max(0.0, min(tA, tB));
  float t1 = max(tA, tB);
  if (ro.y > BASE && ro.y < TOP) t1 = rd.y > 0.0 ? tB : (rd.y < 0.0 ? tA : 1e9);
  if (t1 <= t0) discard;
  // Each step starts at an offset that varies smoothly from pixel to pixel (interleaved gradient
  // noise, Jimenez 2014), so what error is left is an even dither, not speckle.
  float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float c = dot(rd, airSun);
  float phase = mix(hg(c, 0.55), hg(c, -0.2), 0.3) * 4.0 * 3.14159;
  vec3 light = vec3(0.0);
  float through = 1.0;
  float depthSum = 0.0;
  float weight = 0.0;
  float at = t0;
  for (int i = 0; i < ${steps}; i++) {
    if (at >= t1) break;
    float dt = min(max(${stepMin.toFixed(1)}, at * ${stepRate.toFixed(3)}), t1 - at);
    float t = at + jitter * dt;
    at += dt;
    vec3 p = ro + rd * t;
    float d = cloud(p);
    if (d <= 0.0) continue;
    float sigma = d * 0.018;
    // Light towards the Sun through the cloud above this point.
    float shade = 0.0;
    for (int j = 1; j <= ${lightSteps}; j++) shade += cloud(p + airSun * float(j) * 140.0);
    float sunT = exp(-shade * 140.0 * 0.018 * ${(3 / lightSteps).toFixed(2)}) ;
    float powder = 1.0 - exp(-sigma * 120.0);
    vec3 s = sunColour * sunT * phase * (0.35 + 0.65 * powder) + ambient * (0.6 + 0.4 * smoothstep(${CLOUD_BASE.toFixed(1)}, ${CLOUD_TOP.toFixed(1)}, p.y));
    float stepT = exp(-sigma * dt);
    light += through * s * (1.0 - stepT);
    depthSum += t * through * (1.0 - stepT);
    weight += through * (1.0 - stepT);
    through *= stepT;
    if (through < 0.02) break;
  }
  float alpha = 1.0 - through;
  if (alpha < 0.002) discard;
  vec3 colour = airToSrgb(airTone(light / alpha));
  // Haze between the camera and the cloud, at the cloud's mean depth.
  colour = airHaze(colour, rd * (depthSum / max(weight, 1e-4)));
  // Premultiplied, for the overlay.
  gl_FragColor = vec4(colour * alpha, alpha);
}`,
  })
  const box = new THREE.Mesh(new THREE.BoxGeometry(90_000, thickness + 400, 90_000), material)
  box.position.y = (CLOUD_BASE + CLOUD_TOP) / 2
  box.frustumCulled = false
  group.add(box)
  return { group, materials: [material] }
}

/**
 * Lays the half-size cloud picture over the scene: nine taps of it for each pixel, and a depth
 * for each pixel so the booster and the towers stand in front. That depth is the nearest a cloud
 * can be along the pixel's ray: where the ray enters the layer, or leaves the clear air round the
 * tower if that is further.
 */
function cloudOverlay(map: THREE.Texture): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    depthTest: true,
    fog: false,
    uniforms: {
      map: { value: map },
      texel: { value: new THREE.Vector2(1, 1) },
      screen: { value: new THREE.Vector2(1, 1) },
      projectionInverse: { value: new THREE.Matrix4() },
      cameraWorld: { value: new THREE.Matrix4() },
      depthScale: { value: 1 },
    },
    vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
uniform sampler2D map;
uniform vec2 texel;
uniform vec2 screen;
uniform mat4 projectionInverse;
uniform mat4 cameraWorld;
uniform float depthScale;
void main() {
  vec2 uv = gl_FragCoord.xy / screen;
  vec4 sum = vec4(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      float w = (x == 0 ? 2.0 : 1.0) * (y == 0 ? 2.0 : 1.0);
      sum += texture2D(map, uv + vec2(float(x), float(y)) * texel * 1.25) * w;
    }
  }
  sum /= 16.0;
  if (sum.a < 0.003) discard;
  vec4 v = projectionInverse * vec4(uv * 2.0 - 1.0, 1.0, 1.0);
  vec3 dirView = normalize(v.xyz / v.w);
  vec3 rd = mat3(cameraWorld) * dirView;
  vec3 ro = cameraPosition;
  float dy = abs(rd.y) < 1e-4 ? 1e-4 : rd.y;
  float tA = (${CLOUD_BASE.toFixed(1)} - ro.y) / dy;
  float tB = (${CLOUD_TOP.toFixed(1)} - ro.y) / dy;
  float near = max(0.0, min(tA, tB));
  // Out of the clear air round the tower.
  float a = dot(rd.xz, rd.xz);
  float b = dot(ro.xz, rd.xz);
  float c = dot(ro.xz, ro.xz) - ${(CLOUD_CLEAR * CLOUD_CLEAR).toFixed(1)};
  float disc = b * b - a * c;
  if (a > 1e-8 && disc > 0.0) {
    float leave = (-b + sqrt(disc)) / a;
    float enter = (-b - sqrt(disc)) / a;
    if (near > enter && near < leave) near = leave;
  }
  // The renderer's logarithmic depth, for a point that far along the ray.
  gl_FragDepth = log2(1.0 + near * max(0.05, -dirView.z)) * depthScale * 0.5;
  gl_FragColor = sum;
}`,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  mesh.frustumCulled = false
  // After the ground photographs and the booster's shadow, before the plume, the smoke and the rings.
  mesh.renderOrder = -4
  return mesh
}

export function createSky(renderer: THREE.WebGLRenderer, quality: Quality): Sky {
  const group = new THREE.Group()
  const halfFloat = renderer.extensions.has('EXT_color_buffer_half_float') || renderer.extensions.has('EXT_color_buffer_float')
  const size = quality === 'high' ? [256, 128] : [128, 64]
  const lut = new THREE.WebGLRenderTarget(size[0], size[1], {
    type: halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType,
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
    depthBuffer: false,
    generateMipmaps: false,
  })
  lut.texture.wrapS = THREE.RepeatWrapping
  lut.texture.wrapT = THREE.ClampToEdgeWrapping
  SKY_UNIFORMS.airSky.value = lut.texture
  const lutScene = new THREE.Scene()
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lutMaterial(quality))
  quad.frustumCulled = false
  lutScene.add(quad)
  const lutCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const dome = new THREE.Mesh(new THREE.SphereGeometry(3_000_000, 48, 24), domeMaterial(false))
  dome.renderOrder = -2
  dome.frustumCulled = false
  const stars = createStars()
  const noise = noiseTexture()
  const clouds = createClouds(quality, noise)
  const cloudScene = new THREE.Scene()
  // Switches on the haze code the cloud shader shares with everything else.
  cloudScene.fog = new THREE.Fog(0xffffff, 1e12, 2e12)
  cloudScene.add(clouds.group)
  const cloudTarget = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter, generateMipmaps: false })
  const overlay = cloudOverlay(cloudTarget.texture)
  const overlayUniforms = (overlay.material as THREE.ShaderMaterial).uniforms
  const bufferSize = new THREE.Vector2()
  const clearColour = new THREE.Color()
  group.add(dome, stars, overlay)

  const envMaterial = domeMaterial(true)
  const envScene = new THREE.Scene()
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), envMaterial))
  const pmrem = new THREE.PMREMGenerator(renderer)
  let envTarget: THREE.WebGLRenderTarget | null = null
  let envKey = ''

  const starMaterial = stars.material as THREE.PointsMaterial
  const sunDir = SKY_UNIFORMS.airSun.value
  const sunAtCamera = new THREE.Color()
  const sunAtClouds = new THREE.Color()
  const ambient = new THREE.Color()
  const sunSpill = new THREE.Color()
  let lastAltitude = -1
  let sunChanged = true
  const patched = new WeakSet<THREE.Material>()

  const sky: Sky = {
    group,
    environment: null,
    exposure: 1,
    setSun(direction) {
      sunDir.copy(direction).normalize()
      sunChanged = true
    },
    sunlight(altitude, out) {
      const elevation = (Math.asin(Math.min(1, Math.max(-1, sunDir.y))) * 180) / Math.PI
      const t = transmittance(altitude, elevation, 32)
      return out.setRGB(t[0] * SUN_INTENSITY, t[1] * SUN_INTENSITY, t[2] * SUN_INTENSITY)
    },
    haze(material, options = {}) {
      if (patched.has(material)) return
      patched.add(material)
      ;(material as THREE.Material & { fog: boolean }).fog = true
      const previous = material.onBeforeCompile
      material.onBeforeCompile = (shader, r) => {
        previous.call(material, shader, r)
        shader.uniforms.airSky = SKY_UNIFORMS.airSky
        shader.uniforms.airAltitude = SKY_UNIFORMS.airAltitude
        shader.uniforms.airExposure = SKY_UNIFORMS.airExposure
        shader.vertexShader = shader.vertexShader
          .replace('#include <fog_pars_vertex>', HAZE_PARS_VERTEX)
          .replace('#include <fog_vertex>', HAZE_VERTEX)
        if (options.bend) shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>\n${BEND_GLSL}`)
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <fog_pars_fragment>', HAZE_PARS_FRAGMENT)
          .replace('#include <fog_fragment>', HAZE_FRAGMENT)
      }
      material.customProgramCacheKey = () => `air-haze-${options.bend ? 'bent' : 'flat'}-${material.type}`
      material.needsUpdate = true
    },
    update(camera, space) {
      const altitude = Math.max(1, camera.position.y)
      dome.position.copy(camera.position)
      stars.position.copy(camera.position)
      starMaterial.opacity = Math.max(0, (space - 0.55) / 0.45)
      stars.visible = starMaterial.opacity > 0
      SKY_UNIFORMS.airAltitude.value = altitude
      const inside = camera.position.y > CLOUD_BASE - 200 && camera.position.y < CLOUD_TOP + 200
      for (const m of clouds.materials) m.side = inside ? THREE.BackSide : THREE.FrontSide
      SKY_UNIFORMS.airExposure.value = sky.exposure

      if (sunChanged || Math.abs(altitude - lastAltitude) > Math.max(2, altitude * 0.002)) {
        lastAltitude = altitude
        sky.sunlight(altitude, sunAtCamera)
        ;(dome.material as THREE.ShaderMaterial).uniforms.sunColour.value.copy(sunAtCamera)
        envMaterial.uniforms.sunColour.value.copy(sunAtCamera)
        const previous = renderer.getRenderTarget()
        renderer.setRenderTarget(lut)
        renderer.render(lutScene, lutCamera)
        renderer.setRenderTarget(previous)
      }
      if (sunChanged) {
        // Light on the clouds: the Sun at their height, and the sky overhead, from the same air.
        sky.sunlight((CLOUD_BASE + CLOUD_TOP) / 2, sunAtClouds)
        // Skylight on the shaded side: blue, weaker with a low Sun, with some of the Sun's own colour bounced in.
        const elevation = Math.max(0.02, sunDir.y)
        ambient.setRGB(0.32, 0.45, 0.72).multiplyScalar(SUN_INTENSITY * 0.035 * Math.sqrt(elevation)).add(sunSpill.copy(sunAtClouds).multiplyScalar(0.03))
        for (const m of clouds.materials) {
          m.uniforms.sunColour.value.copy(sunAtClouds)
          m.uniforms.ambient.value.copy(ambient)
        }
      }

      // The reflections change slowly with height: refilter them in steps, not every frame.
      const key = `${Math.round(Math.log(altitude + 200) * (quality === 'high' ? 8 : 4))}:${sunDir.x.toFixed(3)},${sunDir.y.toFixed(3)}`
      if (key !== envKey) {
        envKey = key
        const next = pmrem.fromScene(envScene as unknown as THREE.Scene, 0, 0.1, 100)
        envTarget?.dispose()
        envTarget = next
        sky.environment = next.texture
      }
      sunChanged = false

      // The clouds, at half size, for the overlay.
      renderer.getDrawingBufferSize(bufferSize)
      const cw = Math.max(2, Math.ceil(bufferSize.x / 2))
      const ch = Math.max(2, Math.ceil(bufferSize.y / 2))
      if (cloudTarget.width !== cw || cloudTarget.height !== ch) cloudTarget.setSize(cw, ch)
      const view = camera as THREE.PerspectiveCamera
      view.updateMatrixWorld()
      overlayUniforms.texel.value.set(1 / cw, 1 / ch)
      overlayUniforms.screen.value.copy(bufferSize)
      overlayUniforms.projectionInverse.value.copy(view.projectionMatrixInverse)
      overlayUniforms.cameraWorld.value.copy(view.matrixWorld)
      overlayUniforms.depthScale.value = 2 / Math.log2(view.far + 1)
      const target = renderer.getRenderTarget()
      const clearAlpha = renderer.getClearAlpha()
      renderer.getClearColor(clearColour)
      renderer.setRenderTarget(cloudTarget)
      renderer.setClearColor(0x000000, 0)
      renderer.clear()
      renderer.render(cloudScene, view)
      renderer.setRenderTarget(target)
      renderer.setClearColor(clearColour, clearAlpha)
    },
  }
  return sky
}
