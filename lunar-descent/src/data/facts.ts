// Every real-world number the game shows, with its source.
// Mirrored in docs/artemis/PROJECT-PLAN.md section 5. Change both together.

export type Status = 'Flown' | 'NASA requirement' | 'Design limit' | 'Constant' | 'Planned' | 'Measured'

export interface Fact {
  value: number
  unit: string
  status: Status
  /** Short source name shown beside the number. */
  source: string
  url: string
}

const MISSION_REPORT = 'https://ntrs.nasa.gov/api/citations/19710015566/downloads/19710015566.pdf'
const ALSJ = 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.landing.html'
const GEAR = 'https://ntrs.nasa.gov/api/citations/19720018253/downloads/19720018253.pdf'
export const OIG = 'https://oig.nasa.gov/wp-content/uploads/2026/03/final-report-ig-26-004-nasas-management-of-the-human-landing-system-contracts.pdf'
export const IAC = 'https://ntrs.nasa.gov/api/citations/20260008717/downloads/HLS%20IAC%202026%20FINAL.pdf'
const FT = 0.3048

export const LIMITS = {
  verticalSpeed: { value: 10 * FT, unit: 'm/s', status: 'Design limit', source: 'Apollo Lunar Module landing gear', url: GEAR },
  horizontalSpeed: { value: 4 * FT, unit: 'm/s', status: 'Design limit', source: 'Apollo Lunar Module landing gear', url: GEAR },
  tilt: { value: 8, unit: '°', status: 'NASA requirement', source: 'NASA Inspector General, 2026', url: OIG },
  accuracy: { value: 100, unit: 'm', status: 'NASA requirement', source: 'NASA, uncrewed lander demos, 2026', url: IAC },
} satisfies Record<string, Fact>

export const APOLLO_11 = {
  startAltitude: { value: 50_000 * FT, unit: 'm', status: 'Flown', source: 'Apollo 11 Mission Report', url: MISSION_REPORT },
  highGateAltitude: { value: 7_129 * FT, unit: 'm', status: 'Flown', source: 'Apollo 11 Mission Report', url: MISSION_REPORT },
  highGateDescentRate: { value: 125 * FT, unit: 'm/s', status: 'Flown', source: 'Apollo 11 Mission Report', url: MISSION_REPORT },
  descentSeconds: { value: 12 * 60 + 34, unit: 's', status: 'Flown', source: 'Apollo Lunar Surface Journal', url: ALSJ },
  touchdownVertical: { value: 1.7 * FT, unit: 'm/s', status: 'Flown', source: 'Apollo 11 Mission Report', url: MISSION_REPORT },
  touchdownSideways: { value: 2.1 * FT, unit: 'm/s', status: 'Flown', source: 'Apollo 11 Mission Report', url: MISSION_REPORT },
  propellantSecondsLeft: { value: 45, unit: 's', status: 'Flown', source: 'Apollo Lunar Surface Journal', url: ALSJ },
  dustAltitude: { value: 30, unit: 'm', status: 'Flown', source: 'Apollo 11 Mission Report', url: MISSION_REPORT },
} satisfies Record<string, Fact>

export const STARSHIP_HLS = {
  height: { value: 50, unit: 'm', status: 'Planned', source: 'NASA, Human Landing Systems', url: 'https://www.nasa.gov/reference/human-landing-systems/' },
} satisfies Record<string, Fact>

export const SHACKLETON = {
  diameter: { value: 21, unit: 'km', status: 'Measured', source: 'NASA, Faces of Shackleton', url: 'https://science.nasa.gov/image-detail/faces-of-shackleton/' },
} satisfies Record<string, Fact>

export const TERRAIN_CREDIT = {
  text: 'Terrain: NASA Lunar Orbiter Laser Altimeter (LOLA), 5 m and 240 m per pixel',
  url: 'https://pgda.gsfc.nasa.gov/products/78',
}

export const ARTEMIS_URL = 'https://www.nasa.gov/humans-in-space/artemis/'
export const PLUME_URL =
  'https://www.nasa.gov/directorates/esdmd/artemis-campaign-development-division/human-landing-system-program/nasa-marshall-fires-up-hybrid-rocket-motor-to-prep-for-moon-landings/'
export const SUN_URL = 'https://www.nasa.gov/centers-and-facilities/nesc/characterizing-the-visual-experience-of-astronauts-at-the-lunar-south-pole/'
