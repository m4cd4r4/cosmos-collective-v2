// Every real-world number and claim the game shows, with its source.
// Mirrored in docs/artemis/PROJECT-PLAN.md. Change both together.
// Fetched and checked on 2026-11-12.

export type Status = 'Flown' | 'Published timeline' | 'Planned' | 'Design figure' | 'Constant'

export interface Source {
  name: string
  url: string
}

export const SPACEX_F5: Source = { name: 'SpaceX, Starship Flight 5', url: 'https://www.spacex.com/launches/starship-flight-5' }
export const SPACEX_F6: Source = { name: 'SpaceX, Starship Flight 6', url: 'https://www.spacex.com/launches/starship-flight-6' }
export const SPACEX_F8: Source = { name: 'SpaceX, Starship Flight 8', url: 'https://www.spacex.com/launches/starship-flight-8' }
export const SPACEX_F14: Source = { name: 'SpaceX, Starship Flight 14', url: 'https://www.spacex.com/launches/starship-flight-14' }
export const SPACEX_F15: Source = { name: 'SpaceX, Starship Flight 15', url: 'https://www.spacex.com/launches/starship-flight-15' }
export const SPACEX_VEHICLE: Source = { name: 'SpaceX, Starship', url: 'https://www.spacex.com/vehicles/starship' }
export const WIKI_F7: Source = { name: 'Wikipedia, Starship flight test 7', url: 'https://en.wikipedia.org/wiki/Starship_flight_test_7' }
export const WIKI_F8: Source = { name: 'Wikipedia, Starship flight test 8', url: 'https://en.wikipedia.org/wiki/Starship_flight_test_8' }
export const WIKI_VEHICLE: Source = { name: 'Wikipedia, SpaceX Super Heavy', url: 'https://en.wikipedia.org/wiki/SpaceX_Super_Heavy' }

export type EventId = 'maxQ' | 'meco' | 'hotStaging' | 'boostbackStart' | 'boostbackEnd' | 'landingStart' | 'catch'

export interface TimelineRow {
  id: EventId
  label: string
  /** Seconds after liftoff in the timeline SpaceX published for Flight 8 ("all times approximate"). */
  seconds: number
  /** What happened on the day. */
  flown: string
}

/**
 * Flight 8, 6 March 2025. Times are from the timeline SpaceX published before the flight,
 * as recorded by Wikipedia; the outcomes are from SpaceX's own account of the flight.
 */
export const FLIGHT_8: TimelineRow[] = [
  { id: 'maxQ', label: 'Max Q', seconds: 62, flown: 'Throttled down, passed' },
  { id: 'meco', label: 'Most engines cut off', seconds: 152, flown: 'All but 3 engines shut down' },
  { id: 'hotStaging', label: 'Hot staging', seconds: 160, flown: 'Ship lit 6 engines and separated' },
  { id: 'boostbackStart', label: 'Boostback start', seconds: 165, flown: '11 of 13 engines relit' },
  { id: 'boostbackEnd', label: 'Boostback shutdown', seconds: 246, flown: 'Completed' },
  { id: 'landingStart', label: 'Landing burn start', seconds: 394, flown: '12 of 13 engines relit' },
  { id: 'catch', label: 'Catch', seconds: 422, flown: 'Caught by the tower arms' },
]

export const ENGINES = {
  liftoff: 33,
  /** "13 maneuverable engines in the center and the remaining 20 around the perimeter" */
  centre: 13,
  /** Stay lit through hot staging, and fly the booster into the arms. */
  inner: 3,
  source: SPACEX_VEHICLE,
}

export const VEHICLE = {
  /** The booster version flown on Flights 5 to 11. SpaceX's page now lists the newer 72 m booster. */
  boosterHeight: { value: 71, unit: 'm', status: 'Design figure' as Status, source: WIKI_VEHICLE },
  diameter: { value: 9, unit: 'm', status: 'Design figure' as Status, source: SPACEX_VEHICLE },
  /** Ship height on the current SpaceX page; the Flight 8 ship was about 2 m shorter. Drawn only until staging. */
  shipHeight: { value: 52, unit: 'm', status: 'Design figure' as Status, source: SPACEX_VEHICLE },
}

export const CATCH_RECORD = {
  text: 'Three boosters have been caught: Flights 5, 7 and 8.',
  source: SPACEX_F15,
}

export const FLIGHT_15 = {
  text: 'Flight 15 is planned to be the first to return both the booster and the ship to the tower. Planned, not flown, when this game was built.',
  source: SPACEX_F15,
}

export const QUOTES = {
  criteria: {
    text: 'Thousands of distinct vehicle and pad criteria had to be met prior to the catch attempt.',
    source: SPACEX_F5,
  },
  flight6: {
    text: 'Automated health checks of critical hardware on the launch and catch tower triggered an abort of the catch attempt.',
    source: SPACEX_F6,
  },
  flight8: {
    text: 'The three center engines continued running to maneuver the booster to the launch and catch tower arms.',
    source: SPACEX_F8,
  },
}

export const GROUND_CREDIT = {
  text: 'Ground: USDA NAIP aerial imagery via the USGS National Map, public domain',
  url: 'https://www.usgs.gov/centers/eros/science/usgs-eros-archive-aerial-photography-national-agriculture-imagery-program-naip',
}

export const NOT_AFFILIATED = 'An independent educational game. Not affiliated with NASA or SpaceX.'
