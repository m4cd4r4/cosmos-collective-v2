// Start card, tip cards and the end card. All copy that states a real-world fact takes
// its number and its source from data/facts.ts.

import type { Touchdown } from '../sim/flight'
import { BRAKING_TIME_SCALE } from '../sim/flight'
import { APOLLO_11, ARTEMIS_URL, IAC, LIMITS, OIG, PLUME_URL, SHACKLETON, STARSHIP_HLS, SUN_URL, TERRAIN_CREDIT, type Fact } from '../data/facts'
import { el, fmt, sourceLink } from './dom'

const NOT_AFFILIATED = 'An independent educational project. Not affiliated with NASA or SpaceX.'

function credits(): HTMLElement {
  return el('p', { class: 'fine' }, NOT_AFFILIATED, ' ', sourceLink(TERRAIN_CREDIT.text, TERRAIN_CREDIT.url), '.')
}

// ---------- Start card ----------

export interface StartCard {
  root: HTMLElement
  setBusy(text: string): void
  setError(text: string): void
}

export function createStartCard(onBegin: () => void): StartCard {
  const button = el('button', { class: 'primary', type: 'button', onclick: onBegin }, 'Begin descent')
  const error = el('p', { class: 'error', role: 'alert' })
  const key = (keys: string, action: string) => el('li', {}, el('kbd', {}, keys), ' ', action)

  const root = el(
    'div',
    { class: 'overlay' },
    el(
      'section',
      { class: 'panel card', role: 'dialog', 'aria-labelledby': 'start-title' },
      el('p', { class: 'eyebrow' }, 'Lunar south pole'),
      el('h1', { id: 'start-title' }, 'Descent to Shackleton'),
      el(
        'p',
        {},
        `Fly the powered descent to the rim of Shackleton, a crater ${SHACKLETON.diameter.value} km across at the Moon's south pole. `,
        `The burn starts ${fmt.whole(APOLLO_11.startAltitude.value / 1000)} km up, as Apollo 11's did. The computer holds attitude while you brake. `,
        `At ${fmt.whole(APOLLO_11.highGateAltitude.value)} m it hands you the stick.`,
      ),
      el(
        'ul',
        { class: 'keys' },
        key('W S', 'throttle'),
        key('A D', 'pitch'),
        key('P', 'pause'),
        key('R', 'retry'),
      ),
      el('p', { class: 'muted' }, 'Arrow keys work too. On a touch screen, use the slider and the pitch buttons. Gold marks show what the computer would do.'),
      el(
        'ul',
        { class: 'notes' },
        el(
          'li',
          {},
          "The lander is modelled on SpaceX's Starship HLS. NASA plans the first crewed Artemis landing for 2028 and has not said which lander will fly it (",
          sourceLink('NASA', ARTEMIS_URL),
          ', ',
          sourceLink('NASA, 2026', IAC),
          ').',
        ),
        el('li', {}, "The target is a game target on Shackleton's rim. NASA has not chosen a landing site."),
        el(
          'li',
          {},
          `No descent figures are published for Starship HLS, so thrust, propellant and the ${BRAKING_TIME_SCALE}x speed of the braking burn are game settings. Propellant is shown as delta-v: the change in speed you have left.`,
        ),
      ),
      el('div', { class: 'actions' }, button),
      error,
      credits(),
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

export type TipId = 'sideways' | 'sun' | 'takeover' | 'ring' | 'dust'

interface TipCopy {
  title: string
  body: string
  sources: [string, string][]
}

const TIPS: Record<TipId, TipCopy> = {
  sideways: {
    title: 'Why you fly sideways',
    body: 'Almost all the speed you have to lose is speed over the ground, so the engines point along the track and the lander flies on its side.',
    sources: [],
  },
  sun: {
    title: 'A Sun that never climbs',
    body: 'In the south pole landing regions the Sun stays within a few degrees of the horizon, so shadows run for kilometres and crater floors stay black. Here it is set 1.5 degrees up, a game setting.',
    sources: [['NASA NESC', SUN_URL]],
  },
  takeover: {
    title: 'You have the stick',
    body: `This is high gate. Apollo 11 passed it at ${fmt.whole(APOLLO_11.highGateAltitude.value)} m, descending at ${fmt.whole(APOLLO_11.highGateDescentRate.value)} m/s (flown). NASA requires that a crew can fly the landing by hand, and NASA and SpaceX disagree on whether Starship's planned approach meets that.`,
    sources: [
      [APOLLO_11.highGateAltitude.source, APOLLO_11.highGateAltitude.url],
      ['NASA Inspector General, 2026', OIG],
    ],
  },
  ring: {
    title: 'The gold ring',
    body: `It marks ${LIMITS.accuracy.value} m from the target: the landing accuracy NASA requires of the uncrewed lander demonstrations.`,
    sources: [[LIMITS.accuracy.source, LIMITS.accuracy.url]],
  },
  dust: {
    title: 'Fly the instruments',
    body: `Apollo 11's crew first saw dust at about ${APOLLO_11.dustAltitude.value} m (flown). How the plume of a lander this size behaves is still being tested.`,
    sources: [
      [APOLLO_11.dustAltitude.source, APOLLO_11.dustAltitude.url],
      ['NASA Marshall', PLUME_URL],
    ],
  },
}

const TIP_SECONDS = 14

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
      tip.sources.forEach(([label, url], i) => sources.append(i ? ', ' : 'Source: ', sourceLink(label, url)))
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

const OUTCOME: Record<Touchdown['outcome'], { title: string; line: (t: Touchdown) => string }> = {
  landed: {
    title: 'Touchdown',
    line: (t) =>
      t.missDistance <= LIMITS.accuracy.value
        ? 'Down and upright, inside the ring.'
        : `Down and upright, ${fmt.whole(t.missDistance)} m from the target.`,
  },
  tilted: {
    title: 'Down, but leaning',
    line: (t) => `The lander settled ${fmt.one(t.tiltDeg)}° off vertical. NASA's limit is ${LIMITS.tilt.value}°.`,
  },
  hard: {
    title: 'Hard landing',
    line: (t) =>
      t.verticalSpeed > LIMITS.verticalSpeed.value
        ? `You hit the surface at ${fmt.one(t.verticalSpeed)} m/s. The landing gear limit used here is ${fmt.two(LIMITS.verticalSpeed.value)} m/s.`
        : `You touched down moving sideways at ${fmt.one(t.horizontalSpeed)} m/s. The landing gear limit used here is ${fmt.two(LIMITS.horizontalSpeed.value)} m/s.`,
  },
}

function reference(text: string, fact: Fact): HTMLElement {
  return el('span', { class: 'ref' }, `${text} `, el('span', { class: 'tag' }, fact.status), ' ', sourceLink(fact.source, fact.url))
}

function row(label: string, you: string, within: boolean | null, ...refs: HTMLElement[]): HTMLElement {
  const verdict = within === null ? null : el('span', { class: within ? 'verdict' : 'verdict over' }, within ? 'within limit' : 'over limit')
  return el('tr', {}, el('th', { scope: 'row' }, label), el('td', { class: 'you' }, el('span', { class: 'value' }, you), verdict), el('td', {}, ...refs))
}

function minutes(seconds: number): string {
  return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`
}

interface RetryOptions {
  onRetry(): void
  onRestart(): void
}

interface EndOptions extends RetryOptions {
  /** Simulated seconds from the start of the burn, or null when the run began at the takeover. */
  burnSeconds: number | null
}

/** Shown when the lander sails past the target without landing. */
export function createOverflyCard(altitude: number, groundSpeed: number, options: RetryOptions): HTMLElement {
  const retry = el('button', { class: 'primary', type: 'button', onclick: options.onRetry }, 'Fly again from the takeover')
  const card = el(
    'div',
    { class: 'overlay' },
    el(
      'section',
      { class: 'panel card end hard', role: 'dialog', 'aria-labelledby': 'end-title' },
      el('h1', { id: 'end-title' }, 'Overflew the target'),
      el(
        'p',
        {},
        `You passed the target ${altitude >= 1000 ? `${fmt.one(altitude / 1000)} km` : `${fmt.whole(altitude)} m`} up, still doing ${fmt.whole(groundSpeed)} m/s over the ground. Keep the throttle on the gold mark from the start of the burn.`,
      ),
      el('div', { class: 'actions' }, retry, el('button', { class: 'secondary', type: 'button', onclick: options.onRestart }, 'From the start of the burn')),
      credits(),
    ),
  )
  queueMicrotask(() => retry.focus({ preventScroll: true }))
  return card
}

export function createEndCard(t: Touchdown, options: EndOptions): HTMLElement {
  const outcome = OUTCOME[t.outcome]
  const retry = el('button', { class: 'primary', type: 'button', onclick: options.onRetry }, 'Fly again from the takeover')
  const table = el(
    'table',
    {},
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'At touchdown'), el('th', { scope: 'col' }, 'You'), el('th', { scope: 'col' }, 'Real figures'))),
    el(
      'tbody',
      {},
      row(
        'Vertical speed',
        `${fmt.one(t.verticalSpeed)} m/s`,
        t.verticalSpeed <= LIMITS.verticalSpeed.value,
        reference(`Limit ${fmt.two(LIMITS.verticalSpeed.value)} m/s`, LIMITS.verticalSpeed),
        reference(`Apollo 11: ${fmt.one(APOLLO_11.touchdownVertical.value)} m/s`, APOLLO_11.touchdownVertical),
      ),
      row(
        'Horizontal speed',
        `${fmt.one(t.horizontalSpeed)} m/s`,
        t.horizontalSpeed <= LIMITS.horizontalSpeed.value,
        reference(`Limit ${fmt.two(LIMITS.horizontalSpeed.value)} m/s`, LIMITS.horizontalSpeed),
        reference(`Apollo 11: ${fmt.one(APOLLO_11.touchdownSideways.value)} m/s`, APOLLO_11.touchdownSideways),
      ),
      row('Tilt', `${fmt.one(t.tiltDeg)}°`, t.tiltDeg <= LIMITS.tilt.value, reference(`Limit ${LIMITS.tilt.value}°`, LIMITS.tilt)),
      row(
        'Distance from target',
        `${fmt.whole(t.missDistance)} m`,
        t.missDistance <= LIMITS.accuracy.value,
        reference(`Within ${LIMITS.accuracy.value} m`, LIMITS.accuracy),
      ),
      row(
        'Propellant left',
        `${fmt.whole(t.deltaVLeft)} m/s of delta-v`,
        null,
        reference(`Apollo 11: about ${APOLLO_11.propellantSecondsLeft.value} seconds`, APOLLO_11.propellantSecondsLeft),
      ),
      options.burnSeconds === null
        ? null
        : row('Powered descent', minutes(options.burnSeconds), null, reference(`Apollo 11: ${minutes(APOLLO_11.descentSeconds.value)}`, APOLLO_11.descentSeconds)),
    ),
  )

  const card = el(
    'div',
    { class: 'overlay' },
    el(
      'section',
      { class: `panel card end ${t.outcome}`, role: 'dialog', 'aria-labelledby': 'end-title' },
      el('h1', { id: 'end-title' }, outcome.title),
      el('p', {}, outcome.line(t)),
      el('div', { class: 'actions' }, retry, el('button', { class: 'secondary', type: 'button', onclick: options.onRestart }, 'From the start of the burn')),
      el('div', { class: 'table-wrap' }, table),
      el(
        'p',
        { class: 'fine' },
        `The speed limits are those of the Apollo Lunar Module's landing gear; none is published for Starship HLS, which stands about ${STARSHIP_HLS.height.value} m tall (`,
        sourceLink(STARSHIP_HLS.height.source, STARSHIP_HLS.height.url),
        '). Your delta-v and descent time come from game settings.',
      ),
      credits(),
    ),
  )
  queueMicrotask(() => retry.focus({ preventScroll: true }))
  return card
}
