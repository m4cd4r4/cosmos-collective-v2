// Keyboard and touch input. Owns the commanded throttle and tilt, the catch call and the
// two one-shot commands: cut the boostback engines, and light the landing burn.
// On screen east is to the right, so "right" leans the thrust to push the booster east.

import { TUNING, type Input } from '../sim/flight'
import type { Hud } from './hud'

const THROTTLE_RATE = 0.8 // full range per second
const TILT_RATE = 22 // degrees per second
const TILT_NUDGE = 2 // degrees per keyboard activation of a tilt button

export type Call = 'none' | 'go' | 'no-go'

export interface Controls {
  throttle: number
  tiltDeg: number
  call: Call
  /** Apply held keys and buttons. `dt` is real seconds, not simulated ones. */
  update(dt: number): void
  /** The input for the next physics step. One-shot commands are cleared once taken. */
  take(): Input
  reset(): void
}

interface Handlers {
  onPause(): void
  onRetry(): void
  onSkip(): void
  /** Which one-shot command Space and the action button mean right now. */
  action(): 'cut' | 'ignite' | null
  /** Whether the catch call can still be made. */
  canCall(): boolean
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
  let cut = false
  let ignite = false

  const controls: Controls = {
    throttle: 1,
    tiltDeg: 0,
    call: 'none',
    update(dt) {
      const throttleDir = Number(held.up) - Number(held.down)
      if (throttleDir) controls.throttle = clamp(controls.throttle + throttleDir * THROTTLE_RATE * dt, 0, 1)
      const tiltDir = Number(held.right) - Number(held.left)
      if (tiltDir) controls.tiltDeg = clamp(controls.tiltDeg + tiltDir * TILT_RATE * dt, -TUNING.tiltMaxDeg, TUNING.tiltMaxDeg)
    },
    take() {
      const input: Input = { throttle: controls.throttle, tiltDeg: controls.tiltDeg, go: controls.call === 'go', shutdown: cut, ignite }
      cut = ignite = false
      return input
    },
    reset() {
      controls.throttle = 1
      controls.tiltDeg = 0
      controls.call = 'none'
      cut = ignite = false
    },
  }

  const act = () => {
    const action = handlers.action()
    if (action === 'cut') cut = true
    else if (action === 'ignite') ignite = true
  }
  const makeCall = (call: Call) => {
    if (handlers.canCall()) controls.call = call
  }

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const key = KEYS[event.code]
    if (key) {
      held[key] = true
      event.preventDefault() // keep arrow keys from also moving the slider or the page
    } else if (event.repeat) return
    else if (event.code === 'Space') {
      // Space on a focused button would also click it.
      event.preventDefault()
      act()
    } else if (event.code === 'KeyG') makeCall('go')
    else if (event.code === 'KeyN') makeCall('no-go')
    else if (event.code === 'KeyP') handlers.onPause()
    else if (event.code === 'KeyR') handlers.onRetry()
  })
  window.addEventListener('keyup', (event) => {
    const key = KEYS[event.code]
    if (key) held[key] = false
    // Space is handled on keydown; stop the browser clicking the focused button on keyup as well.
    if (event.code === 'Space') event.preventDefault()
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
    // Enter on a focused button arrives as a click with no pointer: nudge.
    button.addEventListener('click', (event) => {
      if (event.detail !== 0) return
      controls.tiltDeg = clamp(controls.tiltDeg + (key === 'right' ? TILT_NUDGE : -TILT_NUDGE), -TUNING.tiltMaxDeg, TUNING.tiltMaxDeg)
    })
  }
  holdButton(hud.tiltLeft, 'left')
  holdButton(hud.tiltRight, 'right')
  hud.goButton.addEventListener('click', () => makeCall('go'))
  hud.noGoButton.addEventListener('click', () => makeCall('no-go'))
  hud.cutButton.addEventListener('click', act)
  hud.igniteButton.addEventListener('click', act)
  hud.pauseButton.addEventListener('click', handlers.onPause)
  hud.skipButton.addEventListener('click', handlers.onSkip)

  return controls
}
