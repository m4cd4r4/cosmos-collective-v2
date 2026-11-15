// One run's starting conditions, drawn from a seed: where the booster is when the player
// takes over, the wind, and how many engines relight. The engine counts are modelled on
// flown landing burns; the positions, speeds and wind are game tuning.

import { SPACEX_F14, SPACEX_F8, WIKI_F7, type Source } from '../data/facts'

export interface EngineCase {
  id: 'flight8' | 'flight7' | 'flight14'
  /** Engines that relight at the start of the landing burn, of 13. */
  landingLit: number
  /** Shown on the end card. */
  modelledOn: string
  source: Source
}

export const ENGINE_CASES: EngineCase[] = [
  { id: 'flight8', landingLit: 12, modelledOn: 'Flight 8, where 12 of 13 engines relit for the landing burn.', source: SPACEX_F8 },
  { id: 'flight7', landingLit: 13, modelledOn: 'Flight 7, where all 13 engines relit for the landing burn.', source: WIKI_F7 },
  { id: 'flight14', landingLit: 11, modelledOn: 'Flight 14, where 11 of 13 engines relit for the landing burn.', source: SPACEX_F14 },
]

export interface Gust {
  /** m/s */
  amp: number
  /** Hz */
  freq: number
  phase: number
}

export interface Scenario {
  seed: number
  engines: EngineCase
  /** Where the booster is when the player takes over: m east of the catch point, height of its base, and its velocity. */
  x: number
  y: number
  vx: number
  vy: number
  /** Wind near the ground, m/s towards the east. Negative blows towards the west, onto the tower. */
  wind: number
  gusts: Gust[]
}

/** A small, fast, seeded generator (mulberry32). Same seed, same run. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

const between = (random: () => number, lo: number, hi: number) => lo + (hi - lo) * random()
const sign = (random: () => number) => (random() < 0.5 ? -1 : 1)

export function makeScenario(seed: number): Scenario {
  const random = seeded(seed)
  return {
    seed,
    engines: ENGINE_CASES[Math.floor(random() * ENGINE_CASES.length) % ENGINE_CASES.length],
    x: sign(random) * between(random, 300, 1_200),
    y: between(random, 9_600, 10_400),
    vx: sign(random) * between(random, 5, 35),
    vy: -between(random, 190, 240),
    wind: sign(random) * between(random, 3, 11),
    gusts: [0, 1, 2].map((i) => ({ amp: between(random, 0.6, 2.4), freq: between(random, 0.04, 0.12) * (i + 1), phase: random() * Math.PI * 2 })),
  }
}

/** A fresh seed for a new run. */
export function newSeed(): number {
  return Math.floor(Math.random() * 1_000_000) + 1
}
