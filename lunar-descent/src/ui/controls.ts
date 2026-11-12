// Keyboard and touch input. Owns the commanded throttle and pitch.
// On screen the lander travels right to left, so "left" pitches the nose towards upright
// and beyond, and "right" pitches it back towards level.

import type { Hud } from './hud'

const THROTTLE_RATE = 0.7 // full range per second
const PITCH_RATE = 15 // degrees per second
const PITCH_NUDGE = 5 // degrees per keyboard activation of a pitch button
const PITCH_MIN = 0
const PITCH_MAX = 120

export interface Controls {
  throttle: number
  pitchDeg: number
  /** Apply held keys and buttons. `dt` is real seconds, not simulated ones. */
  update(dt: number, manualPitch: boolean): void
}

interface Handlers {
  onPause(): void
  onRetry(): void
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

const KEYS: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

export function createControls(hud: Hud, handlers: Handlers): Controls {
  const held = { up: false, down: false, left: false, right: false }
  const controls: Controls = {
    throttle: 0,
    pitchDeg: 0,
    update(dt, manualPitch) {
      const throttleDir = Number(held.up) - Number(held.down)
      if (throttleDir) controls.throttle = clamp(controls.throttle + throttleDir * THROTTLE_RATE * dt, 0, 1)
      const pitchDir = Number(held.left) - Number(held.right)
      if (manualPitch && pitchDir) controls.pitchDeg = clamp(controls.pitchDeg + pitchDir * PITCH_RATE * dt, PITCH_MIN, PITCH_MAX)
    },
  }

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const key = KEYS[event.code]
    if (key) {
      held[key] = true
      event.preventDefault() // keep arrow keys from also moving the slider or the page
    } else if (event.code === 'KeyP' && !event.repeat) handlers.onPause()
    else if (event.code === 'KeyR' && !event.repeat) handlers.onRetry()
  })
  window.addEventListener('keyup', (event) => {
    const key = KEYS[event.code]
    if (key) held[key] = false
  })
  window.addEventListener('blur', () => {
    held.up = held.down = held.left = held.right = false
  })

  hud.throttleInput.addEventListener('input', () => {
    controls.throttle = Number(hud.throttleInput.value) / 100
  })

  const holdButton = (button: HTMLButtonElement, key: 'left' | 'right') => {
    const release = () => (held[key] = false)
    button.addEventListener('pointerdown', (event) => {
      held[key] = true
      button.setPointerCapture(event.pointerId)
    })
    button.addEventListener('pointerup', release)
    button.addEventListener('pointercancel', release)
    button.addEventListener('lostpointercapture', release)
    button.addEventListener('contextmenu', (event) => event.preventDefault())
    // Enter or Space on a focused button arrives as a click with no pointer: nudge.
    button.addEventListener('click', (event) => {
      if (event.detail !== 0) return
      controls.pitchDeg = clamp(controls.pitchDeg + (key === 'left' ? PITCH_NUDGE : -PITCH_NUDGE), PITCH_MIN, PITCH_MAX)
    })
  }
  holdButton(hud.pitchLeft, 'left')
  holdButton(hud.pitchRight, 'right')
  hud.pauseButton.addEventListener('click', handlers.onPause)

  return controls
}
