// The instrument strip, the throttle, and the panel on the right that changes with the
// phase: the pressure meter, the catch call, the landing burn. Gold marks show the cue.

import { ENGINES } from '../data/facts'
import { dynamicPressure } from '../sim/physics'
import { TUNING, type Flight, type Input } from '../sim/flight'
import type { Arrival } from '../sim/predict'
import type { Call } from './controls'
import { el, fmt } from './dom'
import { createPanels, type Panels } from './panels'

export interface HudView {
  flight: Flight
  cue: Input
  throttle: number
  tiltDeg: number
  call: Call
  /** How many times faster than real time the simulation is running. */
  timeScale: number
  paused: boolean
  arrival: Arrival | null
  /** Height at which the cue lights the landing burn, m. */
  igniteHeight: number
  /** What the Skip button would skip, or null to hide it. */
  skip: string | null
}

export interface Hud extends Pick<Panels, 'goButton' | 'noGoButton' | 'cutButton' | 'igniteButton' | 'tiltLeft' | 'tiltRight'> {
  root: HTMLElement
  throttleInput: HTMLInputElement
  pauseButton: HTMLButtonElement
  skipButton: HTMLButtonElement
  update(view: HudView): void
}

function readout(title: string) {
  const label = el('span', { class: 'label' })
  const value = el('span', { class: 'value' })
  const unit = el('span', { class: 'unit' })
  const cell = el('div', { class: 'readout', title }, label, el('span', { class: 'figure' }, value, unit))
  let last = ''
  return {
    cell,
    set(name: string, text: string, unitText: string, over = false) {
      const key = `${name}|${text}|${unitText}|${over}`
      if (key === last) return
      last = key
      label.textContent = name
      value.textContent = text
      unit.textContent = unitText
      cell.classList.toggle('over', over)
    },
  }
}

function distance(metres: number): [string, string] {
  const abs = Math.abs(metres)
  if (abs >= 10_000) return [fmt.one(metres / 1000), 'km']
  if (abs >= 100) return [fmt.whole(metres), 'm']
  return [fmt.one(metres), 'm']
}

export function clock(seconds: number): string {
  const whole = Math.floor(seconds)
  return `T+${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const PHASES: Record<string, [string, string]> = {
  ascent: ['Ascent', 'You have the throttle. Ease it back through max-Q or the stack breaks up.'],
  staging: ['Hot staging', 'The ship lights its engines and flies on. The booster flips to come home.'],
  boostback: ['Boostback', 'Read the checks and make the catch call. Cut the engines when the impact point reaches the mark.'],
  coast: ['Coast', 'The grid fins steer. Nothing to fly until the landing burn.'],
  falling: ['Falling', 'Light the landing burn at the cue. Too late and nothing can stop it.'],
  burn: ['Landing burn', 'Throttle and tilt. Bring the white ring down on to the gold one, slowly.'],
  sea: ['Landing burn', 'Throttle down to a soft splashdown.'],
  ended: ['', ''],
}

export function createHud(): Hud {
  const cells = [
    readout('Height of the base of the booster above the ground, or above the catch arms during the landing burn'),
    readout('Speed, or the sink rate during the landing burn'),
    readout('Distance east of the tower'),
    readout('Propellant left, as the change in speed it can still deliver. A game setting'),
    readout('Engines lit'),
    readout('Dynamic pressure, the predicted impact point, or how the burn ends if the controls are held'),
  ]
  const [altitude, speed, range, deltaV, engines, context] = cells

  const phaseName = el('strong', { class: 'phase-name' })
  const phaseNote = el('span', { class: 'phase-note' })
  const time = el('span', { class: 'value time' })
  const chip = el('span', { class: 'chip', title: 'A game setting, not a mission figure' })
  const pauseButton = el('button', { class: 'ghost', type: 'button', 'aria-pressed': 'false' }, 'Pause')
  const skipButton = el('button', { class: 'ghost', type: 'button' })
  const status = el('div', { class: 'panel status' }, el('div', { class: 'phase' }, phaseName, chip, time), phaseNote, el('div', { class: 'status-actions' }, skipButton, pauseButton))

  const throttleInput = el('input', { id: 'throttle', type: 'range', min: 0, max: 100, step: 1, value: 100 })
  const throttleValue = el('output', { for: 'throttle', class: 'value' })
  const throttleCue = el('span', { class: 'cue-mark', 'aria-hidden': 'true' })
  const throttleCueText = el('span', { class: 'cue-text' })
  const throttle = el(
    'div',
    { class: 'panel control throttle' },
    el('div', { class: 'control-head' }, el('label', { for: 'throttle', class: 'label' }, 'Throttle'), throttleValue),
    el('div', { class: 'slider' }, throttleInput, throttleCue),
    throttleCueText,
  )

  const panels = createPanels()
  const root = el(
    'div',
    { class: 'hud', hidden: true },
    status,
    el('div', { class: 'panel readouts', role: 'group', 'aria-label': 'Instruments' }, ...cells.map((c) => c.cell)),
    throttle,
    panels.root,
  )

  let lastStatus = ''
  let lastThrottle = ''

  function update(view: HudView) {
    const { flight } = view
    const s = flight.state
    const landing = flight.phase === 'landing'
    const key = flight.phase === 'landing' ? (!flight.lit ? 'falling' : flight.committed ? 'burn' : 'sea') : flight.phase

    const target = flight.committed ? TUNING.catchHeight : 0
    if (landing) altitude.set(flight.committed ? 'Above arms' : 'Altitude', ...distance(Math.max(0, s.y - target)))
    else altitude.set('Altitude', ...(s.y >= 10_000 ? ([fmt.one(s.y / 1000), 'km'] as [string, string]) : distance(Math.max(0, s.y))))
    if (landing && flight.lit) speed.set('Sink', fmt.one(-s.vy), 'm/s', s.y - target < 60 && -s.vy > TUNING.catchSinkSpeed * 2)
    else speed.set('Speed', fmt.whole(Math.hypot(s.vx, s.vy)), 'm/s')
    if (landing) range.set('Offset', fmt.one(Math.abs(s.x)), s.x >= 0 ? 'm east' : 'm west', flight.committed && s.y - target < 40 && Math.abs(s.x) > TUNING.catchHalfGap)
    else range.set('Downrange', ...distance(s.x))
    deltaV.set('Propellant', fmt.whole(s.deltaV), 'm/s', s.deltaV < 100)
    engines.set('Engines', String(flight.thrustAccel > 0 || flight.phase === 'staging' ? flight.engines : 0), `of ${flight.phase === 'ascent' ? ENGINES.liftoff : ENGINES.centre}`)

    if (flight.phase === 'ascent') {
      const used = dynamicPressure(s) / TUNING.qLimit
      context.set('Pressure', fmt.whole(used * 100), '% of limit', used > 1)
    } else if (landing && flight.lit) {
      const a = view.arrival
      if (!a) context.set('Arrival', '--', '')
      else if (a.hover) context.set('Arrival', '--', 'stops in the air', true)
      else context.set('Arrival', fmt.one(a.sink), 'm/s sink', a.outcome !== 'caught' && a.outcome !== 'splashdown')
    } else if (flight.phase === 'staging') context.set('Impact', '--', '')
    else {
      const [text, unit] = distance(Math.abs(flight.impactX))
      context.set('Impact', text, `${unit} ${flight.impactX >= 0 ? 'east' : 'west'}`)
    }
    time.textContent = clock(s.time)

    const scale = Math.round(view.timeScale)
    const statusKey = `${key}|${view.paused}|${scale}|${view.skip}`
    if (statusKey !== lastStatus) {
      lastStatus = statusKey
      const [name, note] = PHASES[key]
      phaseName.textContent = view.paused ? 'Paused' : name
      phaseNote.textContent = note
      chip.textContent = scale === 1 ? 'Real time' : `${scale}x time`
      skipButton.hidden = view.skip === null
      skipButton.textContent = view.skip ?? ''
      pauseButton.textContent = view.paused ? 'Resume' : 'Pause'
      pauseButton.setAttribute('aria-pressed', String(view.paused))
    }

    // The throttle is live in the ascent and in the landing burn. Its floor differs between them.
    const live = flight.phase === 'ascent' || (landing && flight.lit)
    const floor = flight.phase === 'ascent' ? TUNING.ascentMinThrottle : TUNING.landingMinThrottle
    const shown = live ? Math.max(floor, view.throttle) : view.throttle
    const pct = Math.round(shown * 100)
    const cuePct = Math.round(view.cue.throttle * 100)
    const throttleKey = `${pct}|${cuePct}|${live}`
    if (throttleKey !== lastThrottle) {
      lastThrottle = throttleKey
      throttleInput.disabled = !live
      throttle.classList.toggle('idle', !live)
      if (Number(throttleInput.value) !== pct) throttleInput.value = String(pct)
      throttleValue.textContent = live ? `${pct}%` : '--'
      throttleCue.style.setProperty('--at', String(view.cue.throttle))
      throttleCue.style.visibility = live ? 'visible' : 'hidden'
      throttleCueText.textContent = live ? `Cue ${cuePct}%` : 'Held by computer'
    }

    panels.update(view, key)
  }

  return { ...panels, root, throttleInput, pauseButton, skipButton, update }
}
