// Start card and end card. All copy that states a real-world fact takes its number and its
// source from data/facts.ts. Everything else the player sees is game tuning, and says so.

import { TUNING, type Flight, type Outcome } from '../sim/flight'
import type { Score } from '../sim/score'
import { CATCH_RECORD, ELEVATION_CREDIT, SATELLITE_CREDIT, ENGINES, FLIGHT_15, FLIGHT_8, GROUND_CREDIT, MODELS_NOTE, NOT_AFFILIATED, QUOTES, VEHICLE, WIKI_F8, type Source } from '../data/facts'
import { TOUCH, el, sourceLink } from './dom'

const TUNING_NOTE =
  'Game settings, not mission figures: the starting height, speeds, thrust, wind, propellant and the catch limits. SpaceX publishes engine counts and times, not these.'

function groundCredit(flown: string | null): string {
  if (!flown) return GROUND_CREDIT.text
  const date = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(flown))
  return `${GROUND_CREDIT.text}, flown ${date}`
}

const link = (source: Source) => sourceLink(source.name, source.url)

function clock(seconds: number): string {
  const whole = Math.floor(seconds)
  return `T+${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

// ---------- Start card ----------

export interface StartCard {
  root: HTMLElement
  setBusy(text: string): void
  setError(text: string): void
}

const key = (keys: string, action: string) => el('li', {}, el('kbd', {}, keys), ' ', action)

export function createStartCard(onBegin: () => void): StartCard {
  const button = el('button', { class: 'primary', type: 'button', onclick: onBegin }, 'Take control')
  const error = el('p', { class: 'error', role: 'alert' })

  const root = el(
    'div',
    { class: 'overlay' },
    el(
      'section',
      { class: 'panel card', role: 'dialog', 'aria-labelledby': 'start-title' },
      el('p', { class: 'eyebrow' }, 'Starbase, Texas'),
      el('h1', { id: 'start-title' }, 'Return to the Tower'),
      el(
        'p',
        {},
        `A ${VEHICLE.boosterHeight.value} m Super Heavy booster is falling engines first, high above the launch site, with its engines off. `,
        'Fly it down into the arms of the tower. Nobody will tell you when to press.',
      ),
      TOUCH
        ? el(
            'ul',
            { class: 'keys' },
            key('← →', 'hold to steer west or east'),
            key('↓ ↑', 'hold to move the throttle'),
            key('Light burn', 'tap once for the landing burn'),
          )
        : el(
            'ul',
            { class: 'keys' },
            key('A D', 'steer west or east'),
            key('W S', 'throttle'),
            key('Space', 'light the landing burn'),
            key('H', 'Assist'),
            key('M', 'sound'),
            key('P', 'pause'),
            key('R', 'new drop'),
          ),
      el(
        'ul',
        { class: 'notes' },
        el('li', {}, 'Steer with the grid fins on the way down. The wind pushes you about, and it is stronger high up.'),
        el('li', {}, `Light the landing burn once, low enough to save propellant and high enough to stop. It lights the ${ENGINES.centre} centre engines, then drops to ${ENGINES.inner} as you slow.`),
        el('li', {}, 'Arrive centred between the arms, slow and upright. The scope and the arrow at the edge show where the tower is. Assist, on at the start, shows where you will reach the arms if you hold the controls.'),
        el('li', {}, TUNING_NOTE),
        el('li', {}, 'Both pads, the tank farm and the build site stand where the 2024 aerial photographs show them. The models are representative: SpaceX publishes no drawings.'),
      ),
      el('div', { class: 'actions' }, button),
      error,
      el('p', { class: 'fine' }, NOT_AFFILIATED, ' ', sourceLink(GROUND_CREDIT.text, GROUND_CREDIT.url), '. ', sourceLink(ELEVATION_CREDIT.text, ELEVATION_CREDIT.url), '. ', sourceLink(SATELLITE_CREDIT.text, SATELLITE_CREDIT.url), '.'),
    ),
  )

  return {
    root,
    setBusy(text) {
      button.disabled = true
      button.textContent = text
    },
    setError(text) {
      button.disabled = false
      button.textContent = 'Try again'
      error.textContent = text
    },
  }
}

// ---------- End card ----------

const TITLE: Record<Outcome, string> = {
  caught: 'Caught',
  'hard-catch': 'Too hard into the arms',
  'tower-strike': 'Hit the tower',
  ground: 'Crashed below the arms',
  sea: 'Overshot into the Gulf',
  'no-propellant': 'Out of propellant',
  'no-burn': 'No landing burn',
}

/** What happened on the way down, noted by the game loop for the tips. */
export interface RunNotes {
  /** Offset from the arms when the booster passed 2 km above them, m east. Null if it never did. */
  xAt2km: number | null
  /** Wind at that moment, m/s towards the east. */
  windAt2km: number
  assistUsed: boolean
}

export interface EndOptions {
  /** ISO date the ground photograph was flown, or null. */
  groundFlown: string | null
  /** Null unless the booster was caught. */
  score: Score | null
  notes: RunNotes
  onRetry(): void
  onSame(): void
}

/** The best score on this device, after counting `total`. Storage may be blocked. */
function best(total: number): { best: number; isNew: boolean } {
  const storeKey = 'starship-catch:best:approach'
  try {
    const before = Number(localStorage.getItem(storeKey) ?? 0)
    if (total > before) localStorage.setItem(storeKey, String(total))
    return { best: Math.max(before, total), isNew: total > before && before > 0 }
  } catch {
    return { best: total, isNew: false }
  }
}

function scoreBlock(score: Score): HTMLElement {
  const record = best(score.total)
  const note = record.isNew ? 'A new best' : record.best > score.total ? `Best ${record.best}` : 'Catch score, out of 100'
  return el(
    'div',
    { class: 'score', role: 'group', 'aria-label': `Catch score ${score.total} out of 100` },
    el('div', { class: 'score-total' }, String(score.total), el('small', {}, note)),
    ...score.parts.map((part) => {
      const bar = el('span', {})
      bar.style.width = `${Math.round(part.share * 100)}%`
      return el('div', { class: 'score-part' }, el('span', {}, part.label), el('span', { class: 'score-bar', 'aria-hidden': 'true' }, bar), el('span', { class: 'value' }, part.value))
    }),
  )
}

const metres = (m: number) => (Math.abs(m) >= 1_000 ? `${(Math.abs(m) / 1_000).toFixed(1)} km` : `${Math.round(Math.abs(m))} m`)

/** Two or three if-then tips, picked from what happened on this run. */
export function coaching(flight: Flight, notes: RunNotes): string[] {
  const t = TUNING
  const s = flight.state
  const tips: string[] = []
  const add = (tip: string) => {
    if (tips.length < 3 && !tips.includes(tip)) tips.push(tip)
  }
  const outcome = flight.outcome
  const litHeight = flight.litAt === null ? null : flight.litAt - t.catchHeight

  if (!flight.lit && outcome !== 'caught') add(`If the burn never lights, nothing can stop the booster. ${TOUCH ? 'Tap Light burn' : 'Press Space'} while it is still falling fast, a kilometre or two above the arms.`)
  if (flight.ranDry && litHeight !== null && litHeight > 2_500)
    add(`You lit the burn ${metres(litHeight)} above the arms. If you run dry, light it later and lower: until then the air brakes the booster for free.`)
  else if (flight.ranDry) add('If you run dry, do not hover. Keep sinking on the 3 engines and line up on the way down.')

  if (notes.xAt2km !== null && Math.abs(notes.xAt2km) > 150 && outcome !== 'caught') {
    const side = notes.xAt2km > 0 ? 'east' : 'west'
    const other = notes.xAt2km > 0 ? 'west' : 'east'
    const windy = Math.sign(notes.windAt2km) === Math.sign(notes.xAt2km) && Math.abs(notes.windAt2km) > 4
    add(`At 2 km you were still ${metres(notes.xAt2km)} ${side} of the tower. If the ${windy ? 'wind pushes' : 'drift carries'} you ${side}, steer ${other} with the grid fins while you are high: they bite hardest in fast, thick air.`)
  }
  if (litHeight !== null && litHeight < 900 && (outcome === 'hard-catch' || outcome === 'ground' || outcome === 'tower-strike') && !flight.ranDry)
    add(`You lit the burn ${metres(litHeight)} above the arms. If you arrive too fast, light it a few hundred metres higher and hold the throttle open until the sink rate falls.`)
  if (outcome === 'tower-strike' && s.x < t.towerFace - t.towerWidth / 2) add('If you come in from the west of the tower, stay above its top until you are past it, then sink.')
  else if (outcome === 'tower-strike' || outcome === 'ground')
    add(`If you are off centre near the arms, stop sinking and hover just above them until the offset reads under ${t.catchHalfGap} m.`)
  if (outcome === 'hard-catch') {
    if (-s.vy > t.catchSinkSpeed) add('If you reach the arms fast, add throttle earlier on the 3 engines and let the sink rate fall to walking pace.')
    if (Math.abs(s.vx) > t.catchSideSpeed) add('If you slide sideways into the arms, ease off the steering a few seconds before and let the booster settle.')
    if (Math.abs(flight.tiltDeg) > t.catchTiltDeg) add('If you lean at the arms, let go of the steering in the last 20 m so the booster comes upright.')
  }
  if (outcome === 'caught') {
    if (Math.abs(s.x) > 1) add('If you want a higher score, hover a moment just above the arms and centre it to under a metre before the last few metres.')
    if (-s.vy > 3) add('If you want it softer, throttle up a touch in the last 10 m so it settles in at a walking pace.')
    if (s.deltaV / t.propellant < 0.2) add('If you want to keep more propellant, light the burn lower and spend less time hovering.')
    add('A new drop changes the start, the drift and the wind. See if you can do it again.')
  }
  if (!notes.assistUsed && outcome !== 'caught') add(`If you want help reading the drift, ${TOUCH ? 'the Assist button' : 'Assist (H)'} marks where you will reach the arms if you hold the controls as they are.`)
  if (tips.length < 2) add('If it keeps getting away from you, make small, early corrections. Big late ones overshoot.')
  return tips
}

function stat(label: string, value: string, unit: string, over: boolean): HTMLElement {
  return el('div', { class: `stat${over ? ' over' : ''}` }, el('span', { class: 'label' }, label), el('span', { class: 'stat-figure' }, el('span', { class: 'value' }, value), el('span', { class: 'unit' }, unit)))
}

const row = (id: string) => FLIGHT_8.find((r) => r.id === id)!

export function createEndCard(flight: Flight, options: EndOptions): HTMLElement {
  const outcome = flight.outcome ?? 'ground'
  const caught = outcome === 'caught'
  const s = flight.state
  const t = TUNING
  const retry = el('button', { class: 'primary retry', type: 'button', onclick: options.onRetry }, 'Retry ', TOUCH ? null : el('kbd', {}, 'R'))
  const same = el('button', { class: 'secondary', type: 'button', onclick: options.onSame }, 'Same drop again')
  const burn = row('landingStart')
  const caughtRow = row('catch')
  const engines = flight.scenario.engines
  const sink = Math.max(0, -s.vy)
  const left = Math.round((s.deltaV / t.propellant) * 100)
  const off = Math.abs(s.x)

  const stats = el(
    'div',
    { class: 'stats' },
    stat(caught ? 'Sink into the arms' : 'Sink at the end', sink.toFixed(sink < 20 ? 1 : 0), 'm/s', sink > t.catchSinkSpeed),
    stat('Offset', off >= 1_000 ? (off / 1_000).toFixed(1) : off.toFixed(off < 100 ? 1 : 0), `${off >= 1_000 ? 'km' : 'm'} ${s.x >= 0 ? 'east' : 'west'}`, off > t.catchHalfGap),
    stat('Propellant left', String(left), '%', left <= 0),
  )

  const tips = coaching(flight, options.notes)
  const sources = el(
    'details',
    { class: 'sources' },
    el('summary', {}, 'Sources and notes'),
    el(
      'div',
      { class: 'facts' },
      el('p', {}, `On Flight 8 the landing burn began at ${clock(burn.seconds)} and the booster was caught at ${clock(caughtRow.seconds)}, ${caughtRow.seconds - burn.seconds} seconds later. `, el('span', { class: 'tag' }, 'Published timeline'), ' ', link(WIKI_F8)),
      el('p', {}, `"${QUOTES.flight8.text}" `, link(QUOTES.flight8.source)),
      el('p', {}, `The engines on this drop were modelled on ${engines.modelledOn} `, link(engines.source)),
      el('p', {}, `${CATCH_RECORD.text} ${FLIGHT_15.text} `, link(FLIGHT_15.source)),
      options.score ? el('p', { class: 'fine' }, "The score is a game measure: how far inside the game's catch limits you arrived, and the propellant you kept. SpaceX publishes no such figure.") : null,
      el('p', { class: 'fine' }, `This drop: seed ${flight.scenario.seed}. ${TUNING_NOTE}`),
      el('p', { class: 'fine' }, NOT_AFFILIATED, ' ', sourceLink(groundCredit(options.groundFlown), GROUND_CREDIT.url), '. ', sourceLink(ELEVATION_CREDIT.text, ELEVATION_CREDIT.url), '. ', sourceLink(SATELLITE_CREDIT.text, SATELLITE_CREDIT.url), '.'),
    ),
  )

  const card = el(
    'div',
    { class: 'overlay end-overlay' },
    el(
      'section',
      { class: `panel card end${caught ? ' won' : ' lost'}`, role: 'dialog', 'aria-labelledby': 'end-title' },
      el('p', { class: 'eyebrow' }, caught ? 'Booster caught' : 'Booster lost'),
      el('h1', { id: 'end-title' }, TITLE[outcome]),
      el('p', { class: 'reason' }, flight.reason),
      stats,
      options.score ? scoreBlock(options.score) : null,
      el('div', { class: 'tips' }, el('span', { class: 'label' }, 'Next time'), el('ul', {}, ...tips.map((tip) => el('li', {}, tip)))),
      el('div', { class: 'actions' }, retry, same),
      sources,
    ),
  )
  queueMicrotask(() => retry.focus({ preventScroll: true }))
  return card
}

// ---------- How to catch ----------

const step = (n: number, title: string, keys: string[], body: string) =>
  el('li', {}, el('span', { class: 'step-n' }, String(n)), el('div', {}, el('strong', {}, title, ' ', ...keys.map((k) => el('kbd', {}, k))), el('p', {}, body)))

/** Three steps before the first drop. Reopened from the ? button. */
export function createHowTo(onClose: () => void): HTMLElement {
  const go = el('button', { class: 'primary', type: 'button', onclick: onClose }, 'Got it')
  const card = el(
    'div',
    { class: 'overlay' },
    el(
      'section',
      { class: 'panel card howto', role: 'dialog', 'aria-labelledby': 'howto-title' },
      el('p', { class: 'eyebrow' }, 'How to catch'),
      el('h1', { id: 'howto-title' }, 'Three things to get right'),
      el(
        'ol',
        { class: 'steps' },
        step(
          1,
          'Steer over the tower.',
          TOUCH ? ['←', '→'] : ['A', 'D'],
          `${TOUCH ? 'Hold an arrow to lean west or east; let go and the booster comes upright.' : 'Lean west or east.'} On the scope, bring your dot down on to the gold ring at its centre. When the tower is off screen, the arrow at the edge points to it.`,
        ),
        step(
          2,
          'Light the burn.',
          TOUCH ? ['Light burn'] : ['Space', 'W', 'S'],
          `Low enough to save propellant, early enough to slow down. It lights once. Then ${TOUCH ? 'hold ↓ or ↑ to set the throttle and' : 'set the throttle to'} control the sink.`,
        ),
        step(
          3,
          'Arrive centred and slow.',
          [],
          `Within ${TUNING.catchHalfGap} m of the centre of the arms, sinking under ${TUNING.catchSinkSpeed} m/s, nearly upright. These limits are game settings.`,
        ),
      ),
      el('p', { class: 'muted' }, `${TOUCH ? 'Assist' : 'Assist (H)'} draws a white ring in the scene and a dashed one on the scope where you will reach the arms if you hold the controls. It starts on.${TOUCH ? ' You can use two thumbs at once: steer with one and work the throttle with the other.' : ''}`),
      el('div', { class: 'actions' }, go),
      el('p', { class: 'fine' }, sourceLink(GROUND_CREDIT.text, GROUND_CREDIT.url), '. ', sourceLink(ELEVATION_CREDIT.text, ELEVATION_CREDIT.url), '. ', sourceLink(SATELLITE_CREDIT.text, SATELLITE_CREDIT.url), '. ', MODELS_NOTE),
    ),
  )
  queueMicrotask(() => go.focus({ preventScroll: true }))
  return card
}
