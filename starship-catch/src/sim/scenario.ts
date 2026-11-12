// What goes wrong on a run. Every scenario is modelled on something that was flown.

import { SPACEX_F14, SPACEX_F6, SPACEX_F8, WIKI_F7, type Source } from '../data/facts'

export interface Scenario {
  id: 'flight8' | 'flight7' | 'flight6' | 'flight14'
  /** Shown on the end card, after the call has been made. */
  modelledOn: string
  source: Source
  /** Engines that relight for the boostback burn, of 13. */
  boostbackLit: number
  /** Engines that relight at the start of the landing burn, of 13. */
  landingLit: number
  /** A tower fault the health checks report during boostback. Null when the tower is healthy. */
  towerFault: string | null
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'flight8',
    modelledOn: 'Flight 8: 11 of 13 engines relit for boostback, 12 of 13 for the landing burn, and the booster was caught.',
    source: SPACEX_F8,
    boostbackLit: 11,
    landingLit: 12,
    towerFault: null,
  },
  {
    id: 'flight7',
    modelledOn: 'Flight 7: 12 of 13 engines relit for boostback, all 13 for the landing burn, and the booster was caught.',
    source: WIKI_F7,
    boostbackLit: 12,
    landingLit: 13,
    towerFault: null,
  },
  {
    id: 'flight6',
    modelledOn: 'Flight 6: health checks on the tower failed during boostback. The catch was called off and the booster splashed down in the Gulf.',
    source: SPACEX_F6,
    boostbackLit: 13,
    landingLit: 13,
    towerFault: 'Tower hardware check failed',
  },
  {
    id: 'flight14',
    modelledOn: 'Flight 14: 11 of 13 engines relit for the landing burn, and the booster still made a controlled splashdown.',
    source: SPACEX_F14,
    boostbackLit: 13,
    landingLit: 11,
    towerFault: null,
  },
]

/** The first run is always Flight 8 as flown. Later runs draw from all four. */
export function pickScenario(runNumber: number, random: () => number = Math.random): Scenario {
  if (runNumber === 0) return SCENARIOS[0]
  return SCENARIOS[Math.floor(random() * SCENARIOS.length) % SCENARIOS.length]
}
