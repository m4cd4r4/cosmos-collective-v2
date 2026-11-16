// The ground beyond the photographs (more than 22 km out): flat land to the west and the Gulf
// to the east, with soft patches of colour so it reads as country from altitude. Its pattern is
// scenery, not a map. The shoreline follows the coast's real trend, measured on the Sentinel-2
// layer: north-north-west up South Padre Island, nearly due south into Mexico. Colours sampled
// from the edges of that layer.

import * as THREE from 'three'
import { BEND_GLSL } from './sky'

/** The shoreline beside the tower, m east of the catch point, and how far it moves east per metre south (z), north and south of it. */
const SHORE_X = 420
const SHORE_NORTH = 0.128
const SHORE_SOUTH = 0.026
const SIZE = 3_000_000

export function createGround(): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { land: { value: new THREE.Color(0x8d876a) }, marsh: { value: new THREE.Color(0x7f8a6d) }, sea: { value: new THREE.Color(0x6c8f7b) }, deep: { value: new THREE.Color(0x554e43) } },
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
  ${BEND_GLSL}
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
  float wander = (fbm(vec2(0.0, vXZ.y / 9000.0)) - 0.5) * 3000.0 * smoothstep(20000.0, 40000.0, abs(vXZ.y));
  float trend = vXZ.y < 0.0 ? ${SHORE_NORTH} * vXZ.y : ${SHORE_SOUTH} * vXZ.y;
  float shore = ${SHORE_X.toFixed(1)} + trend + wander;
  float east = vXZ.x - shore;
  float patches = fbm(vXZ / 2600.0);
  vec3 ground = mix(land, marsh, smoothstep(0.45, 0.7, patches));
  vec3 water = mix(sea, deep, smoothstep(2000.0, 20000.0, east) + (fbm(vXZ / 5000.0) - 0.5) * 0.15);
  gl_FragColor = vec4(mix(ground, water, smoothstep(-60.0, 60.0, east)), 1.0);
#include <colorspace_fragment>
#include <fog_fragment>
}`,
  })
  // Rings out from the tower, so the ground can follow the Earth's curve down to the horizon.
  const mesh = new THREE.Mesh(new THREE.RingGeometry(1, SIZE / 2, 96, 72), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -1
  // After the sky dome (-2), which draws without a depth test and would paint over it, before the stars (-1).
  mesh.renderOrder = -1.5
  return mesh
}
