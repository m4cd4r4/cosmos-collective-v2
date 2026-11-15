// The instrument strip along the top and the flying controls along the bottom.
// Readouts only: nothing here tells the player when or how much to press.

import { ENGINES } from '../data/facts'
import { TUNING, aboveArms, type Flight } from '../sim/flight'
import type { Arrival } from '../sim/predict'
import type { ControlButtons } from './controls'
import { el, fmt } from './dom'
import { sinkBand } from '../sim/guide'
import { createScope } from './scope'

export interface HudView {
  flight: Flight
  /** Commanded throttle and steering, 0 to 1 and -1 to 1. */
  throttle: number
  steer: number
  paused: boolean
  assist: boolean
  muted: boolean
  arrival: Arrival | null
}

export interface Hud extends ControlButtons {
  root: HTMLElement
  help: HTMLButtonElement
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

function height(metres: number): [string, string] {
  const abs = Math.abs(metres)
  if (abs >= 1_000) return [fmt.one(metres / 1000), 'km']
  if (abs >= 100) return [fmt.whole(metres), 'm']
  return [fmt.one(metres), 'm']
}

const SVG = 'http://www.w3.org/2000/svg'
function icon(d: string): SVGElement {
  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('width', '18')
  svg.setAttribute('height', '18')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(SVG, 'path')
  path.setAttribute('d', d)
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-width', '2')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  svg.append(path)
  return svg
}
const UP = 'M3 10l5-5 5 5'
const DOWN = 'M3 6l5 5 5-5'
const LEFT = 'M10 3 5 8l5 5'
const RIGHT = 'M6 3l5 5-5 5'

export function createHud(): Hud {
  const cells = [
    readout('Height of the base of the booster above the catch arms'),
    readout('Sink rate: how fast the booster is coming down'),
    readout('Distance east or west of the centre of the arms'),
    readout('Propellant left. A game setting'),
    readout('Engines lit'),
    readout('Wind at the booster. A game setting'),
  ]
  const [above, sink, offset, propellant, engines, wind] = cells
  // The sink rate against the game's catch limit: green inside it, amber up to twice it, red beyond.
  const band = el('span', { class: 'band', title: `Game tuning: the catch limit is ${TUNING.catchSinkSpeed} m/s` }, el('i', {}))
  const bandNote = el('span', { class: 'band-note' }, `limit ${TUNING.catchSinkSpeed} (game)`)
  sink.cell.append(band, bandNote)
  const scope = createScope()

  const assist = el('button', { class: 'ghost', type: 'button', 'aria-pressed': 'false', title: 'Show where the booster reaches the arms if you hold the controls as they are' }, 'Assist ', el('kbd', {}, 'H'))
  const help = el('button', { class: 'ghost', type: 'button', 'aria-label': 'How to catch' }, '?')
  const sound = el('button', { class: 'ghost', type: 'button', 'aria-pressed': 'true' }, 'Sound ', el('kbd', {}, 'M'))
  const pause = el('button', { class: 'ghost', type: 'button', 'aria-pressed': 'false' }, 'Pause ', el('kbd', {}, 'P'))
  const status = el(
    'div',
    { class: 'panel status' },
    el('strong', { class: 'phase-name' }, 'Final approach'),
    el('div', { class: 'status-actions' }, assist, sound, pause, help),
  )

  // Throttle: hold to move it. It can be set before the burn is lit.
  const throttleDown = el('button', { class: 'pad-button', type: 'button', 'aria-label': 'Throttle down' }, icon(DOWN))
  const throttleUp = el('button', { class: 'pad-button', type: 'button', 'aria-label': 'Throttle up' }, icon(UP))
  const throttleFill = el('span', { class: 'gauge-fill' })
  const throttleFloor = el('span', { class: 'gauge-floor', style: `left:${TUNING.minThrottle * 100}%` })
  const throttleValue = el('span', { class: 'value' })
  const throttleNote = el('span', { class: 'gauge-note' })
  const throttle = el(
    'div',
    { class: 'group', role: 'group', 'aria-label': 'Throttle' },
    throttleDown,
    el('div', { class: 'gauge' }, el('div', { class: 'gauge-head' }, el('span', { class: 'label' }, 'Throttle'), throttleValue), el('span', { class: 'gauge-track', 'aria-hidden': 'true' }, throttleFill, throttleFloor), throttleNote),
    throttleUp,
  )

  const ignite = el('button', { class: 'primary ignite', type: 'button' }, el('span', {}, 'Light burn'), el('kbd', {}, 'Space'))

  // Steering: hold to lean. The needle shows the booster's lean now.
  const steerLeft = el('button', { class: 'pad-button', type: 'button', 'aria-label': 'Steer west, towards the tower' }, icon(LEFT))
  const steerRight = el('button', { class: 'pad-button', type: 'button', 'aria-label': 'Steer east, towards the sea' }, icon(RIGHT))
  const needle = el('span', { class: 'lean-needle' })
  const leanValue = el('span', { class: 'value' })
  const leanNote = el('span', { class: 'gauge-note' })
  const steer = el(
    'div',
    { class: 'group', role: 'group', 'aria-label': 'Steering' },
    steerLeft,
    el('div', { class: 'gauge' }, el('div', { class: 'gauge-head' }, el('span', { class: 'label' }, 'Lean'), leanValue), el('span', { class: 'lean-track', 'aria-hidden': 'true' }, needle), leanNote),
    steerRight,
  )

  const keys = el('p', { class: 'keys-hint' }, el('kbd', {}, 'W S'), ' throttle  ', el('kbd', {}, 'A D'), ' steer  ', el('kbd', {}, 'R'), ' new drop')
  const pad = el('div', { class: 'panel pad' }, throttle, ignite, steer)

  const root = el(
    'div',
    { class: 'hud', hidden: true },
    status,
    el('div', { class: 'panel readouts', role: 'group', 'aria-label': 'Instruments' }, ...cells.map((c) => c.cell)),
    scope.root,
    el('div', { class: 'bottom' }, pad, keys),
  )

  let last = ''

  function update(view: HudView) {
    const { flight } = view
    const s = flight.state
    const h = aboveArms(flight)
    const close = h < 80

    above.set(h > -0.05 ? 'Above arms' : 'Below arms', ...height(Math.abs(h)))
    const fall = -s.vy
    sink.set(fall >= 0 ? 'Sink' : 'Climb', fmt.one(Math.abs(fall)), 'm/s', close && fall > TUNING.catchSinkSpeed)
    // Only meaningful once the burn is lit or the arms are near.
    sink.cell.dataset.band = flight.lit || h < 1_000 ? sinkBand(Math.max(0, fall)) : 'off'
    scope.draw(flight, view.assist ? view.arrival : null)
    const off = Math.abs(s.x)
    const [offText, offUnit] = off >= 1_000 ? [fmt.one(off / 1000), 'km'] : [off >= 100 ? fmt.whole(off) : fmt.one(off), 'm']
    offset.set('Offset', offText, off < 0.05 ? offUnit : s.x > 0 ? `${offUnit} east →` : `${offUnit} ← west`, close && off > TUNING.catchHalfGap)
    const left = s.deltaV / TUNING.propellant
    propellant.set('Propellant', fmt.whole(left * 100), '%', left < 0.15)
    engines.set('Engines', flight.engines ? String(flight.engines) : 'Off', flight.engines ? `of ${ENGINES.centre}` : flight.lit ? 'dry' : 'grid fins')
    const w = flight.windX
    wind.set('Wind', fmt.whole(Math.abs(w)), Math.abs(w) < 0.5 ? 'm/s' : w > 0 ? 'm/s to east →' : 'm/s ← to west')

    const lit = flight.lit && !flight.ranDry
    const shown = lit ? Math.max(TUNING.minThrottle, view.throttle) : view.throttle
    const lean = Math.round(flight.tiltDeg)
    const arrival = view.assist && view.arrival && !view.arrival.hover ? view.arrival : null
    const key = `${Math.round(shown * 100)}|${lit}|${flight.lit}|${lean}|${view.paused}|${view.assist}|${arrival ? Math.round(arrival.x) : 'x'}|${flight.downselected}|${view.muted}`
    if (key === last) return
    last = key
    throttleValue.textContent = `${Math.round(shown * 100)}%`
    throttleFill.style.width = `${(shown * 100).toFixed(1)}%`
    throttle.classList.toggle('idle', !lit)
    throttleNote.textContent = lit ? (flight.downselected ? `${ENGINES.inner} centre engines` : 'All lit engines') : flight.lit ? 'Tanks dry' : 'Set for the burn'
    ignite.disabled = flight.lit
    ignite.firstElementChild!.textContent = flight.lit ? 'Burn lit' : 'Light burn'
    needle.style.left = `${(50 + (flight.tiltDeg / TUNING.tiltMaxDeg) * 50).toFixed(1)}%`
    leanValue.textContent = lean === 0 ? '0°' : `${Math.abs(lean)}° ${lean > 0 ? 'E' : 'W'}`
    leanNote.textContent = arrival ? `Assist: ${arrivalText(arrival.x)}` : lit ? 'Engines and fins' : 'Grid fins'
    pause.firstChild!.textContent = view.paused ? 'Resume ' : 'Pause '
    pause.setAttribute('aria-pressed', String(view.paused))
    assist.setAttribute('aria-pressed', String(view.assist))
    sound.setAttribute('aria-pressed', String(!view.muted))
    sound.firstChild!.textContent = view.muted ? 'Sound off ' : 'Sound '
  }

  return { root, help, update, throttleUp, throttleDown, steerLeft, steerRight, ignite, assist, sound, pause }
}

function arrivalText(x: number): string {
  const off = Math.abs(x)
  if (off < 1) return 'on centre'
  const text = off >= 1_000 ? `${fmt.one(off / 1000)} km` : `${Math.round(off)} m`
  return `${text} ${x > 0 ? 'east' : 'west'}`
}
