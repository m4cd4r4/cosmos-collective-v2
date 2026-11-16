// The instrument strip along the top and the flying controls along the bottom.
// Readouts only: nothing here tells the player when or how much to press.

import { ENGINES } from '../data/facts'
import { TUNING, aboveArms, type Flight } from '../sim/flight'
import type { Arrival } from '../sim/predict'
import type { ControlButtons } from './controls'
import { el, fmt } from './dom'
import { sinkBand } from '../sim/guide'
import { createScope } from './scope'
import { propellantSeconds, runThrottle, stopDistance, type Stop } from '../sim/stop'

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
  // Physics, not a cue: how far the burn takes to stop the fall at the throttle set now, and how long the tanks last.
  const stopNote = note('How far the booster falls before the landing burn stops it, at the throttle set now. Ignores the lean')
  above.cell.append(stopNote.root)
  const fuelNote = note('Seconds of burn left at the throttle set now, on the engines that would run')
  propellant.cell.append(fuelNote.root)
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
  // The long line on wide screens, a short one on phones.
  const leanLong = el('span', { class: 'long' })
  const leanShort = el('span', { class: 'short' })
  const leanNote = el('span', { class: 'gauge-note' }, leanLong, leanShort)
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
    const pct = Math.round(runThrottle(view.throttle) * 100)
    if (flight.outcome || h <= 0) {
      stopNote.set('', '', 'off')
    } else {
      const stop = stopDistance(flight, view.throttle)
      stopNote.set(...stopText(stop, pct), stopBand(stop, h))
    }
    const secs = flight.outcome ? 0 : propellantSeconds(flight, view.throttle)
    fuelNote.set(flight.ranDry ? 'Tanks dry' : `${fmt.whole(secs)} s at ${pct}%`, '', secs < 3 && !flight.outcome ? 'bad' : 'ok')
    engines.set('Engines', flight.engines ? String(flight.engines) : 'Off', flight.engines ? `of ${ENGINES.centre}` : flight.lit ? 'dry' : 'grid fins')
    const w = flight.windX
    wind.set('Wind', fmt.whole(Math.abs(w)), Math.abs(w) < 0.5 ? 'm/s' : w > 0 ? 'm/s to east →' : 'm/s ← to west')

    const lit = flight.lit && !flight.ranDry
    const shown = lit ? Math.max(TUNING.minThrottle, view.throttle) : view.throttle
    const lean = Math.round(flight.tiltDeg)
    // Assist stays on screen while it is on: where the booster reaches the arms, or where it stops short of them.
    const arrival = view.assist ? view.arrival : null
    const arrivalKey = arrival ? `${Math.round(arrival.x)}|${arrival.hover}|${arrival.hover ? Math.round(arrival.y / 10) : ''}` : 'x'
    const key = `${Math.round(shown * 100)}|${lit}|${flight.lit}|${lean}|${view.paused}|${view.assist}|${arrivalKey}|${flight.downselected}|${view.muted}`
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
    const stopUp = arrival && arrival.hover ? `Stops ${distanceText(Math.max(0, arrival.y - TUNING.catchHeight))} up` : ''
    const plain = lit ? 'Engines and fins' : 'Grid fins'
    leanLong.textContent = arrival ? (arrival.hover ? `${stopUp}, ${arrivalText(arrival.x, true)}` : `Assist: ${arrivalText(arrival.x)}`) : plain
    leanShort.textContent = arrival ? (arrival.hover ? stopUp : `Assist: ${arrivalText(arrival.x)}`) : plain
    pause.firstChild!.textContent = view.paused ? 'Resume ' : 'Pause '
    pause.setAttribute('aria-pressed', String(view.paused))
    assist.setAttribute('aria-pressed', String(view.assist))
    sound.setAttribute('aria-pressed', String(!view.muted))
    sound.firstChild!.textContent = view.muted ? 'Sound off ' : 'Sound '
  }

  return { root, help, update, throttleUp, throttleDown, steerLeft, steerRight, ignite, assist, sound, pause }
}

/** A small line under a readout. The short text, when given, replaces the long one on phones. */
function note(title: string) {
  const long = el('span', { class: 'long' })
  const short = el('span', { class: 'short' })
  const root = el('span', { class: 'cell-note', title }, long, short)
  let last = ''
  return {
    root,
    set(text: string, shortText: string, band: 'ok' | 'warn' | 'bad' | 'off') {
      const key = `${text}|${shortText}|${band}`
      if (key === last) return
      last = key
      long.textContent = text
      short.textContent = shortText || text
      root.dataset.stop = band
    },
  }
}

function distanceText(metres: number): string {
  return metres >= 1_000 ? `${fmt.one(metres / 1000)} km` : `${fmt.whole(Math.round(metres / 10) * 10)} m`
}

function stopText(stop: Stop, pct: number): [string, string] {
  if (stop.kind === 'no-stop-3') return [`No stop on ${ENGINES.inner} engines at ${pct}%`, `No stop at ${pct}%`]
  if (stop.kind === 'dry') return [`Tanks run dry before a stop at ${pct}%`, `Runs dry at ${pct}%`]
  return [`Stops in ${distanceText(stop.distance)} at ${pct}%`, `Stops ${distanceText(stop.distance)} at ${pct}%`]
}

/** Neutral while the stop fits comfortably above the arms, amber when it is close, red when it does not fit. */
function stopBand(stop: Stop, above: number): 'ok' | 'warn' | 'bad' {
  if (stop.kind !== 'stops') return 'bad'
  const share = stop.distance / Math.max(1, above)
  return share < 0.8 ? 'ok' : share <= 1 ? 'warn' : 'bad'
}

function arrivalText(x: number, short = false): string {
  const off = Math.abs(x)
  if (off < 1) return 'on centre'
  const text = off >= 1_000 ? `${fmt.one(off / 1000)} km` : `${Math.round(off)} m`
  return `${text} ${short ? (x > 0 ? 'E' : 'W') : x > 0 ? 'east' : 'west'}`
}
