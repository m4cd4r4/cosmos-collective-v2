// The air the sky is drawn from: a spherical Earth with an atmosphere of molecules (Rayleigh
// scattering), aerosol haze (Mie scattering) and ozone (absorption only), each thinning with
// height. Coefficients are the Earth atmosphere of Hillaire, "A Scalable and Production Ready Sky
// and Atmosphere Rendering Technique" (EGSR 2020), for red, green and blue at 680, 550 and 440 nm.
// The haze is set thicker than Hillaire's clear-day figure, for a humid Gulf coast evening: the
// air on the day is not published, so this is a plausible value, not a measurement.
// Pure logic and the shared GLSL; no three.js objects.

export const EARTH_RADIUS = 6_360_000
export const ATMOSPHERE_TOP = 6_460_000

/** Per metre at sea level. */
export const RAYLEIGH = [5.802e-6, 13.558e-6, 33.1e-6] as const
export const RAYLEIGH_HEIGHT = 8_000
export const MIE_SCATTER = 9e-6
export const MIE_EXTINCTION = 10e-6
export const MIE_HEIGHT = 1_200
export const MIE_G = 0.8
export const OZONE = [0.65e-6, 1.881e-6, 0.085e-6] as const
export const OZONE_CENTRE = 25_000
export const OZONE_HALF_WIDTH = 15_000

/** Sky radiance scale. The picture is exposed for this, so only its ratio to the exposure matters. */
export const SUN_INTENSITY = 20

const extinction = (h: number, c: 0 | 1 | 2) =>
  RAYLEIGH[c] * Math.exp(-h / RAYLEIGH_HEIGHT) +
  MIE_EXTINCTION * Math.exp(-h / MIE_HEIGHT) +
  OZONE[c] * Math.max(0, 1 - Math.abs(h - OZONE_CENTRE) / OZONE_HALF_WIDTH)

/**
 * How much sunlight gets through the air to a point `altitude` m up, with the Sun `elevationDeg`
 * above the horizon: red, green, blue, 0 to 1. Marched along the curved ray to the top of the air.
 */
export function transmittance(altitude: number, elevationDeg: number, steps = 64): [number, number, number] {
  const r0 = EARTH_RADIUS + Math.max(0, altitude)
  const mu = Math.sin((elevationDeg * Math.PI) / 180)
  // Distance along the ray to the top of the atmosphere, and whether it meets the ground first.
  const b = r0 * mu
  const disc = b * b - (r0 * r0 - ATMOSPHERE_TOP * ATMOSPHERE_TOP)
  const ground = b * b - (r0 * r0 - EARTH_RADIUS * EARTH_RADIUS)
  if (mu < 0 && ground > 0) return [0, 0, 0]
  const length = -b + Math.sqrt(Math.max(0, disc))
  const ds = length / steps
  const depth = [0, 0, 0]
  for (let i = 0; i < steps; i++) {
    const s = (i + 0.5) * ds
    const h = Math.sqrt(r0 * r0 + s * s + 2 * r0 * s * mu) - EARTH_RADIUS
    for (const c of [0, 1, 2] as const) depth[c] += extinction(h, c) * ds
  }
  return [Math.exp(-depth[0]), Math.exp(-depth[1]), Math.exp(-depth[2])]
}

const v3 = (a: readonly number[]) => `vec3(${a.map((x) => x.toExponential(4)).join(', ')})`

/** The same air in GLSL, shared by the sky, the haze over the ground and the clouds. */
export const AIR_GLSL = /* glsl */ `
const float EARTH_R = ${EARTH_RADIUS.toFixed(1)};
const float ATMOS_R = ${ATMOSPHERE_TOP.toFixed(1)};
const vec3 BETA_R = ${v3(RAYLEIGH)};
const float H_R = ${RAYLEIGH_HEIGHT.toFixed(1)};
const float BETA_MS = ${MIE_SCATTER.toExponential(4)};
const float BETA_ME = ${MIE_EXTINCTION.toExponential(4)};
const float H_M = ${MIE_HEIGHT.toFixed(1)};
const float MIE_G = ${MIE_G.toFixed(3)};
const vec3 BETA_O = ${v3(OZONE)};
const float SUN_I = ${SUN_INTENSITY.toFixed(1)};
const float AIR_PI = 3.14159265;

vec3 airExtinction(float h) {
  return BETA_R * exp(-h / H_R) + BETA_ME * exp(-h / H_M) + BETA_O * max(0.0, 1.0 - abs(h - ${OZONE_CENTRE.toFixed(1)}) / ${OZONE_HALF_WIDTH.toFixed(1)});
}
float rayleighPhase(float c) { return 3.0 / (16.0 * AIR_PI) * (1.0 + c * c); }
float miePhase(float c) {
  float g = MIE_G;
  float k = 3.0 / (8.0 * AIR_PI) * (1.0 - g * g) / (2.0 + g * g);
  return k * (1.0 + c * c) / pow(1.0 + g * g - 2.0 * g * c, 1.5);
}
// Distance along a ray from radius vector p to the sphere of radius r, or -1. Inside: the far hit.
float sphereExit(vec3 p, vec3 d, float r) {
  float b = dot(p, d);
  float c = dot(p, p) - r * r;
  float disc = b * b - c;
  if (disc < 0.0) return -1.0;
  return -b + sqrt(disc);
}
// The near hit on the ground, or -1 if the ray misses it.
float groundHit(vec3 p, vec3 d) {
  float b = dot(p, d);
  float c = dot(p, p) - EARTH_R * EARTH_R;
  float disc = b * b - c;
  if (disc < 0.0 || b > 0.0) return -1.0;
  return -b - sqrt(disc);
}
vec3 sunTransmittance(vec3 p, vec3 sun, int steps) {
  if (groundHit(p, sun) > 0.0) return vec3(0.0);
  float len = sphereExit(p, sun, ATMOS_R);
  float ds = len / float(steps);
  vec3 depth = vec3(0.0);
  for (int i = 0; i < 16; i++) {
    if (i >= steps) break;
    vec3 q = p + sun * (float(i) + 0.5) * ds;
    depth += airExtinction(length(q) - EARTH_R) * ds;
  }
  return exp(-depth);
}
// Single scattering along a ray: the light the air adds (rgb) and the share of the light
// behind it that gets through, averaged over red, green and blue (a).
vec4 scatter(vec3 p, vec3 d, float tMax, vec3 sun, int steps, int lightSteps) {
  float c = dot(d, sun);
  float pr = rayleighPhase(c);
  float pm = miePhase(c);
  float ds = tMax / float(steps);
  vec3 light = vec3(0.0);
  vec3 through = vec3(1.0);
  for (int i = 0; i < 48; i++) {
    if (i >= steps) break;
    vec3 q = p + d * (float(i) + 0.5) * ds;
    float h = max(0.0, length(q) - EARTH_R);
    vec3 ext = airExtinction(h);
    vec3 scat = BETA_R * exp(-h / H_R) * pr + BETA_MS * exp(-h / H_M) * pm;
    vec3 stepT = exp(-ext * ds);
    vec3 sunT = sunTransmittance(q, sun, lightSteps);
    // Energy-conserving step (Hillaire 2015): integrate the scattering across the step analytically.
    light += through * scat * sunT * (1.0 - stepT) / max(ext, vec3(1e-12));
    through *= stepT;
  }
  return vec4(light * SUN_I, dot(through, vec3(1.0 / 3.0)));
}
// The sky-view table: azimuth across, and up the height a sine-root curve that crowds texels
// round the horizon, which dips below level as the camera climbs (Hillaire 2020).
vec2 skyUv(vec3 d, float altitude) {
  float r = EARTH_R + max(1.0, altitude);
  float dip = acos(clamp(EARTH_R / r, 0.0, 1.0));
  float e = asin(clamp(d.y, -1.0, 1.0));
  float v;
  if (e >= -dip) v = 0.5 + 0.5 * sqrt(clamp((e + dip) / (AIR_PI * 0.5 + dip), 0.0, 1.0));
  else v = 0.5 - 0.5 * sqrt(clamp((-dip - e) / (AIR_PI * 0.5 - dip), 0.0, 1.0));
  float u = atan(d.x, -d.z) / (2.0 * AIR_PI) + 0.5;
  return vec2(u, v);
}
vec3 skyDir(vec2 uv, float altitude) {
  float r = EARTH_R + max(1.0, altitude);
  float dip = acos(clamp(EARTH_R / r, 0.0, 1.0));
  float e;
  if (uv.y >= 0.5) { float k = (uv.y - 0.5) * 2.0; e = k * k * (AIR_PI * 0.5 + dip) - dip; }
  else { float k = (0.5 - uv.y) * 2.0; e = -dip - k * k * (AIR_PI * 0.5 - dip); }
  float az = (uv.x - 0.5) * 2.0 * AIR_PI;
  return vec3(sin(az) * cos(e), sin(e), -cos(az) * cos(e));
}
// three's ACES filmic curve, so the sky and the lit models are tone mapped alike.
uniform float airExposure;
vec3 airRRT(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}
vec3 airTone(vec3 color) {
  const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  color *= airExposure / 0.6;
  color = outM * airRRT(inM * color);
  return clamp(color, 0.0, 1.0);
}
`
