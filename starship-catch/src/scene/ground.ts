// The ground beyond the aerial photographs: flat land to the west and the Gulf to the east,
// with a wandering shoreline and soft patches of colour so it reads as country from altitude.
// Colours sampled from the widest photograph. Its pattern is scenery, not a map.

import * as THREE from 'three'

/** The shoreline runs north to south about this far east of the tower, m. */
const SHORE_X = 400
const SIZE = 3_000_000

export function createGround(): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { land: { value: new THREE.Color(0x8f8a74) }, marsh: { value: new THREE.Color(0x6f7458) }, sea: { value: new THREE.Color(0x6f9c96) }, deep: { value: new THREE.Color(0x3f6f7a) } },
    ]),
    vertexShader: `
#include <common>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
varying vec2 vXZ;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vXZ = world.xz;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
#include <logdepthbuf_vertex>
#include <fog_vertex>
}`,
    fragmentShader: `
#include <common>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
uniform vec3 land;
uniform vec3 marsh;
uniform vec3 sea;
uniform vec3 deep;
varying vec2 vXZ;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) { sum += amp * noise(p); p *= 2.03; amp *= 0.5; }
  return sum;
}
void main() {
#include <logdepthbuf_fragment>
  // The shore wanders by a few kilometres along its length; it is straight only near the tower.
  float wander = (fbm(vec2(0.0, vXZ.y / 9000.0)) - 0.5) * 6000.0 * smoothstep(1500.0, 12000.0, abs(vXZ.y));
  float shore = ${SHORE_X.toFixed(1)} + wander;
  float east = vXZ.x - shore;
  float patches = fbm(vXZ / 2600.0);
  vec3 ground = mix(land, marsh, smoothstep(0.45, 0.7, patches));
  vec3 water = mix(sea, deep, smoothstep(2000.0, 60000.0, east) * 0.8 + (fbm(vXZ / 5000.0) - 0.5) * 0.15);
  gl_FragColor = vec4(mix(ground, water, smoothstep(-60.0, 60.0, east)), 1.0);
#include <colorspace_fragment>
#include <fog_fragment>
}`,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -1
  // After the sky dome (-2), which draws without a depth test and would paint over it, before the stars (-1).
  mesh.renderOrder = -1.5
  return mesh
}
