// The instrument strip and the two controls. The throttle slider and pitch buttons are
// the touch controls and the instruments at once; gold marks show the guidance cue.

import type { Control } from '../sim/physics'
import type { Phase, Prediction } from '../sim/flight'
import { BOULDER_HALF_WIDTH, BRAKING_TIME_SCALE } from '../sim/flight'
import { LIMITS } from '../data/facts'
import { el, fmt } from './dom'

export interface HudView {
  phase: Phase
  radarAltitude: number
  climbRate: number
  groundSpeed: number
  deltaV: number
  range: number
  throttle: number
  pitchDeg: number
  cue: Control
  /** Where the lander comes down if the controls stay as they are. Null when it would not. */
  prediction: Prediction | null
  paused: boolean
}

export interface Hud {
  root: HTMLElement
  throttleInput: HTMLInputElement
  pitchLeft: HTMLButtonElement
  pitchRight: HTMLButtonElement
  pauseButton: HTMLButtonElement
  skipButton: HTMLButtonElement
  update(view: HudView): void
}

const SVG = 'http://www.w3.org/2000/svg'
const DIAL = { cx: 44, cy: 46, r: 34 }

function svg(tag: string, attrs: Record<string, string | number>): SVGElement {
  const node = document.createElementNS(SVG, tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value))
  return node
}

/** Point on the dial for a pitch angle. 0 degrees lies along the direction of travel. */
function dialPoint(pitchDeg: number, radius: number): [number, number] {
  const a = (pitchDeg * Math.PI) / 180
  return [DIAL.cx + radius * Math.cos(a), DIAL.cy - radius * Math.sin(a)]
}

function readout(label: string, title: string) {
  const value = el('span', { class: 'value' })
  const unit = el('span', { class: 'unit' })
  const cell = el('div', { class: 'readout', title }, el('span', { class: 'label' }, label), el('span', { class: 'figure' }, value, unit))
  let last = ''
  return {
    cell,
    set(text: string, unitText: string, over = false) {
      const key = `${text}|${unitText}|${over}`
      if (key === last) return
      last = key
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

export function createHud(): Hud {
  const altitude = readout('Altitude', 'Height above the ground beneath the lander')
  const vertical = readout('Vertical', 'Vertical speed. Negative is descending')
  const horizontal = readout('Horizontal', 'Speed over the ground')
  const deltaV = readout('Delta-v', 'Propellant left, as the change in speed it can still deliver')
  const range = readout('Range', 'Distance to the target')
  const impact = readout('Impact', 'Vertical speed at touchdown if you hold the controls as they are. The marker on the ground shows where you come down, or where you stop above it')

  const phaseName = el('strong', { class: 'phase-name' })
  const phaseNote = el('span', { class: 'phase-note' })
  const chip = el('span', { class: 'chip', title: 'A game setting, not a mission figure' })
  const pauseButton = el('button', { class: 'ghost', type: 'button', 'aria-pressed': 'false' }, 'Pause')
  const skipButton = el('button', { class: 'ghost', type: 'button' }, 'Skip to takeover')
  const status = el(
    'div',
    { class: 'panel status' },
    el('div', { class: 'phase' }, phaseName, chip),
    phaseNote,
    el('div', { class: 'status-actions' }, skipButton, pauseButton),
  )

  const throttleInput = el('input', { id: 'throttle', type: 'range', min: 0, max: 100, step: 1, value: 0 })
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

  const dial = svg('svg', { viewBox: '0 0 88 56', class: 'dial', 'aria-hidden': 'true' })
  const [ax, ay] = dialPoint(0, DIAL.r)
  const [bx, by] = dialPoint(120, DIAL.r)
  dial.append(svg('path', { d: `M ${ax} ${ay} A ${DIAL.r} ${DIAL.r} 0 0 0 ${bx} ${by}`, class: 'dial-arc' }))
  const needle = svg('line', { x1: DIAL.cx, y1: DIAL.cy, class: 'dial-needle' })
  const cueTick = svg('line', { class: 'dial-cue' })
  dial.append(needle, cueTick)

  const chevron = (d: string) => {
    const icon = svg('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' })
    icon.append(svg('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))
    return icon
  }
  const pitchLeft = el('button', { class: 'pitch-button', type: 'button', 'aria-label': 'Pitch towards upright' }, chevron('M10 3 5 8l5 5'))
  const pitchRight = el('button', { class: 'pitch-button', type: 'button', 'aria-label': 'Pitch towards level' }, chevron('M6 3l5 5-5 5'))
  const pitchValue = el('output', { class: 'value' })
  const pitchCueText = el('span', { class: 'cue-text' })
  const pitch = el(
    'div',
    { class: 'panel control pitch' },
    el('div', { class: 'control-head' }, el('span', { class: 'label' }, 'Pitch'), pitchValue),
    el('div', { class: 'pitch-row' }, pitchLeft, dial, pitchRight),
    pitchCueText,
  )

  const root = el(
    'div',
    { class: 'hud', hidden: true },
    status,
    el('div', { class: 'panel readouts', role: 'group', 'aria-label': 'Instruments' }, altitude.cell, vertical.cell, horizontal.cell, deltaV.cell, range.cell, impact.cell),
    throttle,
    pitch,
  )

  let lastPhase = ''
  let lastText = ''

  function update(view: HudView) {
    const low = view.radarAltitude < 150
    altitude.set(...distance(Math.max(0, view.radarAltitude)))
    vertical.set(fmt.one(view.climbRate), 'm/s', low && -view.climbRate > LIMITS.verticalSpeed.value)
    horizontal.set(
      Math.abs(view.groundSpeed) >= 100 ? fmt.whole(view.groundSpeed) : fmt.one(view.groundSpeed),
      'm/s',
      low && Math.abs(view.groundSpeed) > LIMITS.horizontalSpeed.value,
    )
    deltaV.set(fmt.whole(view.deltaV), 'm/s', view.deltaV < 60)
    const [rangeText, rangeUnit] = distance(Math.abs(view.range))
    range.set(rangeText, view.range < 0 ? `${rangeUnit} past` : rangeUnit)
    const hit = view.prediction
    if (!hit) impact.set('--', view.phase === 'braking' ? '' : 'no touchdown')
    else if (hit.hover) {
      const rocks = Math.abs(hit.range) < BOULDER_HALF_WIDTH
      impact.set('--', rocks ? 'stops over rocks' : 'stops in the air', rocks)
    } else {
      const rocks = Math.abs(hit.range) < BOULDER_HALF_WIDTH
      const hard = hit.verticalSpeed > LIMITS.verticalSpeed.value || hit.horizontalSpeed > LIMITS.horizontalSpeed.value
      impact.set(fmt.one(hit.verticalSpeed), rocks ? 'm/s, rocks' : 'm/s', rocks || hard)
    }

    const phaseKey = `${view.phase}|${view.paused}`
    if (phaseKey !== lastPhase) {
      lastPhase = phaseKey
      const braking = view.phase === 'braking'
      phaseName.textContent = view.paused ? 'Paused' : braking ? 'Braking burn' : 'Manual descent'
      phaseNote.textContent = braking ? 'The computer is flying. You take over at high gate.' : 'You have throttle and pitch. Put the marker on clear ground.'
      chip.textContent = braking ? `${BRAKING_TIME_SCALE}x time` : 'Real time'
      skipButton.hidden = !braking
      throttleInput.disabled = braking
      pauseButton.textContent = view.paused ? 'Resume' : 'Pause'
      pauseButton.setAttribute('aria-pressed', String(view.paused))
      pitchLeft.disabled = braking
      pitchRight.disabled = braking
    }

    const throttlePct = Math.round(view.throttle * 100)
    const cuePct = Math.round(view.cue.throttle * 100)
    const pitchDeg = Math.round(view.pitchDeg)
    const cueDeg = Math.round(view.cue.pitchDeg)
    const text = `${throttlePct}|${cuePct}|${pitchDeg}|${cueDeg}|${view.phase}`
    if (text === lastText) return
    lastText = text

    if (Number(throttleInput.value) !== throttlePct) throttleInput.value = String(throttlePct)
    throttleValue.textContent = `${throttlePct}%`
    throttleCue.style.setProperty('--at', String(view.cue.throttle))
    throttleCueText.textContent = `Cue ${cuePct}%`

    pitchValue.textContent = `${pitchDeg}°`
    const [nx, ny] = dialPoint(view.pitchDeg, DIAL.r - 5)
    needle.setAttribute('x2', nx.toFixed(1))
    needle.setAttribute('y2', ny.toFixed(1))
    const [c1x, c1y] = dialPoint(view.cue.pitchDeg, DIAL.r - 4)
    const [c2x, c2y] = dialPoint(view.cue.pitchDeg, DIAL.r + 5)
    cueTick.setAttribute('x1', c1x.toFixed(1))
    cueTick.setAttribute('y1', c1y.toFixed(1))
    cueTick.setAttribute('x2', c2x.toFixed(1))
    cueTick.setAttribute('y2', c2y.toFixed(1))
    cueTick.style.visibility = view.phase === 'braking' ? 'hidden' : 'visible'
    pitchCueText.textContent = view.phase === 'braking' ? 'Held by computer' : `Cue ${cueDeg}°`
  }

  return { root, throttleInput, pitchLeft, pitchRight, pauseButton, skipButton, update }
}
