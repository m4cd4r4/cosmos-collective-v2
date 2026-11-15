// The approach scope: a small dial with the catch arms at its centre and the booster as a dot,
// side on like the main view (east right, up up). Distances are squeezed so metres near the
// arms and kilometres far out both read. A tail shows where the booster is heading, an arrow
// shows the wind, and Assist adds a ghost ring where the booster reaches the arms' height.

import { TUNING, type Flight } from '../sim/flight'
import { scopePoint, scopeScale } from '../sim/guide'
import type { Arrival } from '../sim/predict'
import { el } from './dom'

export interface Scope {
  root: HTMLElement
  draw(flight: Flight, arrival: Arrival | null): void
}

const INK = '#f4f1e8'
const MUTED = 'rgba(184, 192, 212, 0.55)'
const LINE = 'rgba(255, 255, 255, 0.14)'
const GOLD = '#d4af37'

export function createScope(): Scope {
  const canvas = el('canvas', { class: 'scope-canvas', 'aria-hidden': 'true' })
  const root = el(
    'div',
    { class: 'panel scope', role: 'img', 'aria-label': 'Approach scope: the catch arms at the centre, the booster as a dot' },
    el('span', { class: 'label' }, 'Scope'),
    canvas,
  )
  let size = 0

  function draw(flight: Flight, arrival: Arrival | null) {
    const css = canvas.clientWidth
    if (!css) return
    const ratio = Math.min(2, window.devicePixelRatio || 1)
    if (size !== css * ratio) {
      size = css * ratio
      canvas.width = canvas.height = size
    }
    const c = canvas.getContext('2d')
    if (!c) return
    c.setTransform(ratio, 0, 0, ratio, 0, 0)
    const R = css / 2 - 4
    const cx = css / 2
    const cy = css / 2
    c.clearRect(0, 0, css, css)

    // Rings at 30 m, 300 m and 3 km, and the cross through the arms.
    c.lineWidth = 1
    c.strokeStyle = LINE
    for (const m of [30, 300, 3_000]) {
      c.beginPath()
      c.arc(cx, cy, scopeScale(m) * R, 0, Math.PI * 2)
      c.stroke()
    }
    c.beginPath()
    c.moveTo(cx - R, cy)
    c.lineTo(cx + R, cy)
    c.moveTo(cx, cy - R)
    c.lineTo(cx, cy + R)
    c.stroke()
    c.strokeStyle = MUTED
    c.beginPath()
    c.arc(cx, cy, R, 0, Math.PI * 2)
    c.stroke()

    // The tower, west of the arms, standing below the centre.
    c.fillStyle = MUTED
    c.fillRect(cx - 6, cy, 3, R * 0.35)
    // The catch zone: the gap between the arms.
    c.strokeStyle = GOLD
    c.lineWidth = 2
    c.beginPath()
    c.arc(cx, cy, Math.max(5, scopeScale(TUNING.catchHalfGap) * R), 0, Math.PI * 2)
    c.stroke()

    // Assist: where the booster reaches the arms' height if the controls are held.
    if (arrival && !arrival.hover) {
      c.setLineDash([3, 3])
      c.strokeStyle = INK
      c.lineWidth = 1.5
      c.beginPath()
      c.arc(cx + scopeScale(arrival.x) * R, cy, 6, 0, Math.PI * 2)
      c.stroke()
      c.setLineDash([])
    }

    // The booster, with a tail along its velocity: where it will be in a few seconds.
    const s = flight.state
    const p = scopePoint(flight)
    const bx = cx + p.x * R
    const by = cy - p.y * R
    const ahead = { ...flight, state: { ...s, x: s.x + s.vx * 4, y: Math.max(0, s.y + s.vy * 4) } }
    const q = scopePoint(ahead)
    c.strokeStyle = INK
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(bx, by)
    c.lineTo(cx + q.x * R, cy - q.y * R)
    c.stroke()
    c.fillStyle = INK
    c.beginPath()
    c.arc(bx, by, 4, 0, Math.PI * 2)
    c.fill()

    // Wind: an arrow along the top, as long as it is strong.
    const w = flight.windX
    const len = Math.min(R * 0.6, Math.abs(w) * 2.4)
    if (len > 2) {
      const dir = Math.sign(w)
      const y = cy - R + 10
      c.strokeStyle = MUTED
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(cx - (dir * len) / 2, y)
      c.lineTo(cx + (dir * len) / 2, y)
      c.lineTo(cx + (dir * len) / 2 - dir * 5, y - 4)
      c.moveTo(cx + (dir * len) / 2, y)
      c.lineTo(cx + (dir * len) / 2 - dir * 5, y + 4)
      c.stroke()
    }
  }

  return { root, draw }
}
