// The right-hand panel. One block per phase: the pressure meter for the ascent, the health
// checks and the catch call for boostback, the ignition button, then the tilt control.

import { ENGINES } from '../data/facts'
import { dynamicPressure } from '../sim/physics'
import { TUNING } from '../sim/flight'
import type { HudView } from './hud'
import { el, fmt } from './dom'

export interface Panels {
  root: HTMLElement
  goButton: HTMLButtonElement
  noGoButton: HTMLButtonElement
  cutButton: HTMLButtonElement
  igniteButton: HTMLButtonElement
  tiltLeft: HTMLButtonElement
  tiltRight: HTMLButtonElement
  update(view: HudView, key: string): void
}

const SVG = 'http://www.w3.org/2000/svg'
const DIAL = { cx: 44, cy: 52, r: 40 }
/** The meter is this many times the limit wide, so there is room to see an overshoot. */
const METER_SPAN = 1.25
/** Half-width of the impact strip, m. */
const STRIP_SPAN = 4_000
/** Seconds into boostback at which the tower checks report. A game setting. */
const CHECK_SECONDS = 6

function svg(tag: string, attrs: Record<string, string | number>): SVGElement {
  const node = document.createElementNS(SVG, tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value))
  return node
}

/** Point on the tilt dial. The dial shows the tilt two and a half times larger than life. */
function dialPoint(tiltDeg: number, radius: number): [number, number] {
  const a = (tiltDeg * 2.5 * Math.PI) / 180
  return [DIAL.cx + radius * Math.sin(a), DIAL.cy - radius * Math.cos(a)]
}

const head = (label: string, value: HTMLElement) => el('div', { class: 'control-head' }, el('span', { class: 'label' }, label), value)

export function createPanels(): Panels {
  // Ascent: dynamic pressure against the limit.
  const pressureValue = el('output', { class: 'value' })
  const fill = el('span', { class: 'meter-fill' })
  const meter = el('div', { class: 'meter', 'aria-hidden': 'true' }, fill, el('span', { class: 'meter-limit', style: `left:${100 / METER_SPAN}%` }))
  const pressure = el('div', { class: 'block' }, head('Dynamic pressure', pressureValue), meter, el('span', { class: 'fine' }, 'Past the line for more than a moment, the stack breaks up.'))

  // Boostback: health checks, the catch call, and the engine cut.
  const towerCheck = el('span', { class: 'value' })
  const boosterCheck = el('span', { class: 'value' })
  const goButton = el('button', { class: 'secondary call', type: 'button', 'aria-pressed': 'false' }, 'Go for catch ', el('kbd', {}, 'G'))
  const noGoButton = el('button', { class: 'secondary call', type: 'button', 'aria-pressed': 'false' }, 'No go ', el('kbd', {}, 'N'))
  const marker = el('span', { class: 'strip-marker' })
  const strip = el('div', { class: 'strip', 'aria-hidden': 'true' }, el('span', { class: 'strip-aim' }), marker)
  const cutCue = el('span', { class: 'cue-text' })
  const cutButton = el('button', { class: 'primary', type: 'button' }, 'Cut engines ', el('kbd', {}, 'Space'))
  const call = el(
    'div',
    { class: 'block' },
    el('dl', { class: 'checks' }, el('dt', { class: 'label' }, 'Tower and arms'), el('dd', {}, towerCheck), el('dt', { class: 'label' }, 'Booster'), el('dd', {}, boosterCheck)),
    el('div', { class: 'call-row', role: 'group', 'aria-label': 'Catch call' }, goButton, noGoButton),
    el('div', { class: 'control-head' }, el('span', { class: 'label' }, 'Impact point'), cutCue),
    strip,
    cutButton,
  )

  const waiting = el('p', { class: 'muted' })
  const wait = el('div', { class: 'block' }, waiting)

  // Falling: light the landing burn.
  const igniteCue = el('span', { class: 'cue-text' })
  const igniteButton = el('button', { class: 'primary', type: 'button' }, 'Light landing burn ', el('kbd', {}, 'Space'))
  const ignite = el('div', { class: 'block' }, igniteButton, igniteCue)

  // Landing burn: tilt.
  const dial = svg('svg', { viewBox: '0 0 88 56', class: 'dial', 'aria-hidden': 'true' })
  const [ax, ay] = dialPoint(-TUNING.tiltMaxDeg, DIAL.r)
  const [bx, by] = dialPoint(TUNING.tiltMaxDeg, DIAL.r)
  dial.append(svg('path', { d: `M ${ax} ${ay} A ${DIAL.r} ${DIAL.r} 0 0 1 ${bx} ${by}`, class: 'dial-arc' }))
  const needle = svg('line', { x1: DIAL.cx, y1: DIAL.cy, class: 'dial-needle' })
  const cueTick = svg('line', { class: 'dial-cue' })
  dial.append(needle, cueTick)
  const chevron = (d: string) => {
    const icon = svg('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' })
    icon.append(svg('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))
    return icon
  }
  const tiltLeft = el('button', { class: 'tilt-button', type: 'button', 'aria-label': 'Tilt to push west, towards the tower' }, chevron('M10 3 5 8l5 5'))
  const tiltRight = el('button', { class: 'tilt-button', type: 'button', 'aria-label': 'Tilt to push east, towards the sea' }, chevron('M6 3l5 5-5 5'))
  const tiltValue = el('output', { class: 'value' })
  const tiltCue = el('span', { class: 'cue-text' })
  const tilt = el('div', { class: 'block' }, head('Tilt', tiltValue), el('div', { class: 'tilt-row' }, tiltLeft, dial, tiltRight), tiltCue)

  const blocks: Record<string, HTMLElement> = { ascent: pressure, boostback: call, falling: ignite, burn: tilt, sea: tilt }
  const root = el('div', { class: 'panel control action' }, pressure, call, wait, ignite, tilt)
  let lastKey = ''
  let lastText = ''

  function update(view: HudView, key: string) {
    const { flight } = view
    if (key !== lastKey) {
      lastKey = key
      const shown = blocks[key] ?? wait
      for (const block of [pressure, call, wait, ignite, tilt]) block.hidden = block !== shown
      root.hidden = key === 'ended'
      waiting.textContent =
        key === 'staging'
          ? `${ENGINES.liftoff - ENGINES.inner} engines are off. ${ENGINES.inner} stay lit through hot staging.`
          : flight.committed
            ? 'Go for catch. The grid fins are steering for the arms.'
            : 'No catch. The grid fins are steering for the sea, offshore.'
    }

    if (key === 'ascent') {
      const used = dynamicPressure(flight.state) / TUNING.qLimit
      pressureValue.textContent = `${fmt.whole(used * 100)}%`
      fill.style.width = `${Math.min(100, (used / METER_SPAN) * 100).toFixed(1)}%`
      fill.classList.toggle('over', used > 1)
    } else if (key === 'boostback') {
      const checked = flight.phaseTime >= CHECK_SECONDS
      const fault = flight.scenario.towerFault
      const aim = view.call === 'go' ? 0 : TUNING.splashX
      const off = flight.impactX - aim
      const text = `${checked}|${view.call}|${Math.round((off / STRIP_SPAN) * 200)}`
      if (text !== lastText) {
        lastText = text
        towerCheck.textContent = !checked ? 'Checking' : (fault ?? 'Healthy')
        towerCheck.classList.toggle('bad', checked && fault !== null)
        boosterCheck.textContent = `${flight.scenario.boostbackLit} of ${ENGINES.centre} engines relit`
        goButton.setAttribute('aria-pressed', String(view.call === 'go'))
        noGoButton.setAttribute('aria-pressed', String(view.call === 'no-go'))
        marker.style.left = `${Math.min(98, Math.max(2, 50 + (off / STRIP_SPAN) * 50)).toFixed(1)}%`
        cutCue.textContent = off <= 0 ? 'Cue: cut now' : off < 40_000 ? 'Cut at the gold line' : `Aim: ${view.call === 'go' ? 'the arms' : 'the sea'}`
      }
    } else if (key === 'falling') {
      const now = flight.state.y <= view.igniteHeight
      igniteCue.textContent = now ? 'Cue: light now' : `Cue: light at ${fmt.whole(view.igniteHeight)} m`
    } else if (key === 'burn' || key === 'sea') {
      const text = `${Math.round(view.tiltDeg * 2)}|${Math.round(view.cue.tiltDeg * 2)}`
      if (text === lastText) return
      lastText = text
      const whole = Math.round(view.tiltDeg)
      tiltValue.textContent = whole === 0 ? '0°' : `${Math.abs(whole)}° ${whole > 0 ? 'east' : 'west'}`
      const [nx, ny] = dialPoint(view.tiltDeg, DIAL.r - 5)
      needle.setAttribute('x2', nx.toFixed(1))
      needle.setAttribute('y2', ny.toFixed(1))
      const [c1x, c1y] = dialPoint(view.cue.tiltDeg, DIAL.r - 4)
      const [c2x, c2y] = dialPoint(view.cue.tiltDeg, DIAL.r + 5)
      cueTick.setAttribute('x1', c1x.toFixed(1))
      cueTick.setAttribute('y1', c1y.toFixed(1))
      cueTick.setAttribute('x2', c2x.toFixed(1))
      cueTick.setAttribute('y2', c2y.toFixed(1))
      const cue = Math.round(view.cue.tiltDeg)
      tiltCue.textContent = `Cue ${cue === 0 ? '0°' : `${Math.abs(cue)}° ${cue > 0 ? 'east' : 'west'}`}`
    }
  }

  return { root, goButton, noGoButton, cutButton, igniteButton, tiltLeft, tiltRight, update }
}
