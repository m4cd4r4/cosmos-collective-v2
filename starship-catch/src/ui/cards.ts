// Start card, tip cards and the end card. All copy that states a real-world fact takes
// its number and its source from data/facts.ts.

import type { Flight, Outcome } from '../sim/flight'
import {
  CATCH_RECORD,
  ENGINES,
  FLIGHT_15,
  FLIGHT_8,
  GROUND_CREDIT,
  NOT_AFFILIATED,
  QUOTES,
  SPACEX_F8,
  VEHICLE,
  WIKI_F8,
  type Source,
} from '../data/facts'
import type { Call } from './controls'
import { el, sourceLink } from './dom'
import { clock } from './hud'

const TUNING_NOTE =
  'Game settings, not mission figures: thrust, speeds, heights, propellant, the pressure limit, the catch limits and the time compression. SpaceX publishes times and engine counts, not these.'

function groundCredit(flown: string | null): string {
  if (!flown) return GROUND_CREDIT.text
  const date = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(flown))
  return `${GROUND_CREDIT.text}, flown ${date}`
}

const link = (source: Source) => sourceLink(source.name, source.url)

// ---------- Start card ----------

export interface StartCard {
  root: HTMLElement
  setBusy(text: string): void
  setError(text: string): void
}

export function createStartCard(onBegin: () => void): StartCard {
  const button = el('button', { class: 'primary', type: 'button', onclick: onBegin }, 'Go for launch')
  const error = el('p', { class: 'error', role: 'alert' })
  const key = (keys: string, action: string) => el('li', {}, el('kbd', {}, keys), ' ', action)

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
        `Fly a ${VEHICLE.boosterHeight.value} m Super Heavy booster off the pad on ${ENGINES.liftoff} engines, send the ship on its way, then bring the booster back and set it down in the arms of the launch tower. `,
        'The run follows the timeline SpaceX published for Starship Flight 8.',
      ),
      el(
        'ul',
        { class: 'keys' },
        key('W S', 'throttle'),
        key('A D', 'tilt'),
        key('G N', 'go or no go'),
        key('Space', 'cut or light engines'),
        key('P', 'pause'),
        key('R', 'retry'),
      ),
      el('p', { class: 'muted' }, 'Arrow keys and the on-screen controls work too. Gold marks show what the flight computer would do.'),
      el('div', { class: 'actions' }, button),
      error,
      el(
        'ul',
        { class: 'notes' },
        el('li', {}, 'You throttle through max Q, make the catch call, cut the boostback burn, light the landing burn and fly the last seconds into the arms. The quiet stretches run faster than real time, and the HUD says by how much.'),
        el('li', {}, TUNING_NOTE),
        el('li', {}, 'The tower, arms and launch mount are representative models. The ground is an aerial photograph from June 2022, so the site in it is older than the flight.'),
      ),
      el('p', { class: 'fine' }, NOT_AFFILIATED, ' ', sourceLink(GROUND_CREDIT.text, GROUND_CREDIT.url), '.'),
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

// ---------- Tip cards ----------

export type TipId = 'maxq' | 'staging' | 'call' | 'fins' | 'burn' | 'three'

interface TipCopy {
  title: string
  body: string
  sources: Source[]
}

const published = (id: string) => clock(FLIGHT_8.find((row) => row.id === id)!.seconds)

const TIPS: Record<TipId, TipCopy> = {
  maxq: {
    title: 'Max Q',
    body: `The moment the air presses hardest on the stack. Ease the throttle back as the pressure meter nears the line, then open it again. Flight 8's published timeline puts it at ${published('maxQ')}.`,
    sources: [WIKI_F8],
  },
  staging: {
    title: 'Hot staging',
    body: `All but ${ENGINES.inner} of the booster's engines shut down, and the ship lights its own while still attached. Then the booster flips to fly home.`,
    sources: [SPACEX_F8],
  },
  call: {
    title: 'The catch call',
    body: `"${QUOTES.criteria.text}" Read the checks, then call go or no go. With no go, the booster flies itself to the sea.`,
    sources: [QUOTES.criteria.source],
  },
  fins: {
    title: 'Grid fins',
    body: 'The grid fins steer the booster on the way down. They need air to push against, so they do little until it is low.',
    sources: [],
  },
  burn: {
    title: 'The landing burn',
    body: `The ${ENGINES.centre} centre engines relight to brake, then all but ${ENGINES.inner} shut down. Light it at the cue: too late and nothing can stop the booster.`,
    sources: [ENGINES.source],
  },
  three: {
    title: 'Three engines',
    body: `"${QUOTES.flight8.text}" Bring the white ring on to the gold one, slowly.`,
    sources: [QUOTES.flight8.source],
  },
}

// Short, because on a phone a tip card covers the booster while it is up.
const TIP_SECONDS = 10

export interface Tips {
  root: HTMLElement
  show(id: TipId): void
  clear(): void
}

export function createTips(): Tips {
  const root = el('div', { class: 'tips', 'aria-live': 'polite' })
  let timer = 0
  const clear = () => {
    window.clearTimeout(timer)
    root.replaceChildren()
  }
  return {
    root,
    clear,
    show(id) {
      const tip = TIPS[id]
      clear()
      const sources = el('p', { class: 'fine' })
      tip.sources.forEach((source, i) => sources.append(i ? ', ' : 'Source: ', link(source)))
      root.append(
        el(
          'aside',
          { class: 'panel tip' },
          el('div', { class: 'tip-head' }, el('strong', {}, tip.title), el('button', { class: 'ghost', type: 'button', 'aria-label': 'Dismiss tip', onclick: clear }, 'Close')),
          el('p', {}, tip.body),
          tip.sources.length ? sources : null,
        ),
      )
      timer = window.setTimeout(clear, TIP_SECONDS * 1000)
    },
  }
}

// ---------- End card ----------

const OUTCOME: Record<Outcome, { title: string; line: string }> = {
  caught: { title: 'Caught', line: 'The arms closed on the booster. It is hanging on the tower.' },
  'hard-catch': {
    title: 'Too hard into the arms',
    line: 'The booster was between the arms, but too fast or too far off vertical, and it was lost. Arrive slower and upright.',
  },
  missed: { title: 'Missed the arms', line: 'The booster came down outside the arms and was lost. Keep the white ring on the gold one all the way in.' },
  'no-burn': {
    title: 'No landing burn',
    line: 'The engines were never relit, and the booster reached the tower at full speed. Light the burn when the cue says to.',
  },
  'tower-strike': { title: 'Struck the tower', line: 'The booster drifted west into the tower and was lost. Tilt east sooner.' },
  splashdown: { title: 'Splashdown', line: 'A soft, controlled splashdown in the Gulf.' },
  'hard-splashdown': { title: 'Hit the sea hard', line: 'The booster reached the water too fast. Light the burn at the cue and throttle down to a slow sink.' },
  'on-land': {
    title: 'Came down on land',
    line: 'With no catch, the booster belongs offshore. Cut the boostback engines when the impact point reaches the gold line.',
  },
  breakup: {
    title: 'Broke up at max Q',
    line: 'Dynamic pressure stayed over the limit for too long. Ease the throttle back as the meter nears the line.',
  },
}

function verdict(flight: Flight, call: Call): string | null {
  if (flight.events.boostbackEnd === undefined) return null
  const fault = flight.scenario.towerFault !== null
  if (fault && call === 'go') return 'Your call: go, against a failed tower check. The wrong call, and it was overridden: the catch was called off and the booster sent to the sea, as on Flight 6.'
  if (fault) return `Your call: ${call === 'no-go' ? 'no go' : 'none'}. The tower check had failed, so the sea was the right place for this booster.`
  if (call === 'go') return 'Your call: go for catch, with the tower and the booster healthy. The right call.'
  return `Your call: ${call === 'no-go' ? 'no go' : 'none'}. With no go the booster takes its default path to the sea. The tower was healthy, so this one could have been caught.`
}

const tagged = (text: string, status: string, source: Source) => el('span', { class: 'ref' }, `${text} `, el('span', { class: 'tag' }, status), ' ', link(source))

export interface EndOptions {
  call: Call
  /** ISO date the ground photograph was flown, or null. */
  groundFlown: string | null
  /** Null when the run ended before the landing began. */
  onRetry: (() => void) | null
  onRestart(): void
}

export function createEndCard(flight: Flight, options: EndOptions): HTMLElement {
  const outcome = OUTCOME[flight.outcome ?? 'missed']
  const restart = el('button', { class: options.onRetry ? 'secondary' : 'primary', type: 'button', onclick: options.onRestart }, 'Fly again from liftoff')
  const retry = options.onRetry ? el('button', { class: 'primary', type: 'button', onclick: options.onRetry }, 'Fly the landing again') : null
  const call = verdict(flight, options.call)

  const table = el(
    'table',
    {},
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Event'), el('th', { scope: 'col' }, 'You'), el('th', { scope: 'col' }, 'Starship Flight 8'))),
    el(
      'tbody',
      {},
      ...FLIGHT_8.map((row) => {
        const at = flight.events[row.id]
        return el(
          'tr',
          {},
          el('th', { scope: 'row' }, row.label),
          el('td', { class: 'you' }, el('span', { class: 'value' }, at === undefined ? '--' : clock(at))),
          el('td', {}, tagged(clock(row.seconds), 'Published timeline', WIKI_F8), tagged(row.flown, 'Flown', SPACEX_F8)),
        )
      }),
    ),
  )

  const card = el(
    'div',
    { class: 'overlay' },
    el(
      'section',
      { class: 'panel card end', role: 'dialog', 'aria-labelledby': 'end-title' },
      el('h1', { id: 'end-title' }, outcome.title),
      el('p', {}, outcome.line),
      call ? el('p', { class: 'muted' }, call) : null,
      el('div', { class: 'actions' }, retry, restart),
      el('div', { class: 'table-wrap' }, table),
      call ? el('p', { class: 'fine' }, `This run was modelled on ${flight.scenario.modelledOn} `, link(flight.scenario.source), '.') : null,
      el('p', { class: 'fine' }, `Your times come from a simplified flight model. ${TUNING_NOTE}`),
      el('p', { class: 'fine' }, `${CATCH_RECORD.text} ${FLIGHT_15.text} `, link(FLIGHT_15.source), '.'),
      el('p', { class: 'fine' }, NOT_AFFILIATED, ' ', sourceLink(groundCredit(options.groundFlown), GROUND_CREDIT.url), '.'),
    ),
  )
  queueMicrotask(() => (retry ?? restart).focus({ preventScroll: true }))
  return card
}


