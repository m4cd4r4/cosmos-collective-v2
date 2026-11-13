// Where the fixed stars sit in the game's world frame: +X along the track, +Y up at the
// target, +Z to the right of the track. Pure maths, no rendering.

export type Vec3 = [number, number, number]

/**
 * The Moon's mean north pole, J2000 right ascension and declination. IAU value, as in
 * NASA NAIF's pck00010.tpc (BODY301_POLE_RA, BODY301_POLE_DEC). The 1.5 degree wobble of
 * the pole over 18.6 years is left out.
 */
export const LUNAR_NORTH_POLE = { raDeg: 269.9949, decDeg: 66.5392 }
/** Mean obliquity of the ecliptic at J2000, degrees. */
const OBLIQUITY_DEG = 23.4393
/**
 * Game setting: the time of year, as the Sun's ecliptic longitude in degrees. It turns the
 * sky about the zenith. Chosen so that Scorpius and Sagittarius stand low over the ground ahead.
 */
export const SUN_ECLIPTIC_LONGITUDE_DEG = 150

const RAD = Math.PI / 180
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const add = (a: Vec3, b: Vec3, scale: number): Vec3 => [a[0] + b[0] * scale, a[1] + b[1] * scale, a[2] + b[2] * scale]
const unit = (a: Vec3): Vec3 => add([0, 0, 0], a, 1 / Math.hypot(...a))

/** Unit vector for a J2000 right ascension and declination. */
export function equatorial(raDeg: number, decDeg: number): Vec3 {
  const ra = raDeg * RAD
  const dec = decDeg * RAD
  return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)]
}

/**
 * Maps a J2000 direction to the world frame, as seen from the lunar south pole: the Moon's
 * south celestial pole is overhead, and the Sun's ecliptic longitude sits at the compass
 * direction the terrain was lit from (`sunAlong`, `sunAcross`: the Sun's direction on the
 * ground, along the track and to its right).
 */
export function skyToWorld(sunAlong: number, sunAcross: number, sunLongitudeDeg = SUN_ECLIPTIC_LONGITUDE_DEG): (direction: Vec3) => Vec3 {
  const up = equatorial(LUNAR_NORTH_POLE.raDeg + 180, -LUNAR_NORTH_POLE.decDeg)
  const longitude = sunLongitudeDeg * RAD
  const obliquity = OBLIQUITY_DEG * RAD
  const sun: Vec3 = [Math.cos(longitude), Math.sin(longitude) * Math.cos(obliquity), Math.sin(longitude) * Math.sin(obliquity)]
  // Horizontal axes on the sky: towards the Sun, and a quarter turn from it.
  const towardsSun = unit(add(sun, up, -dot(sun, up)))
  const quarter = cross(towardsSun, up)
  const length = Math.hypot(sunAlong, sunAcross)
  const sx = sunAlong / length
  const sz = sunAcross / length
  return (direction) => {
    const a = dot(direction, towardsSun)
    const b = dot(direction, quarter)
    return [sx * a - sz * b, dot(direction, up), sz * a + sx * b]
  }
}
