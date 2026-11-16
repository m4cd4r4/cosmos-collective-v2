// Keyboard and touch input. Owns the commanded throttle and steering and the one-shot
// "light the landing burn". On screen east is to the right, so "right" pushes the booster east.
// Steering is spring-centred: hold to lean, let go and the booster comes back upright.

import type { Input } from '../sim/flight'

const THROTTLE_RATE = 0.7 // full range per second
const STEER_RATE = 3.5 // full lean per second, either way
const START_THROTTLE = 0.7

export interface ControlButtons {
  throttleUp: HTMLButtonElement
  throttleDown: HTMLButtonElement
  steerLeft: HTMLButtonElement
  steerRight: HTMLButtonElement
  ignite: HTMLButtonElement
  assist: HTMLButtonElement
  sound: HTMLButtonElement
  pause: HTMLButtonElement
}

export interface Controls {
  throttle: number
  steer: number
  /** Apply held keys and buttons. `dt` is real seconds. */
  update(dt: number): void
  /** The input for the next physics step. The ignite command is cleared once taken. */
  take(): Input
  reset(): void
}

interface Handlers {
  onPause(): void
  onRetry(): void
  onAssist(): void
  onMute(): void
  /** Any click or key: the browser now allows audio. */
  onGesture(): void
  /** False once the run has ended: keys then belong to the end card. */
  live(): boolean
}

type Held = 'up' | 'down' | 'left' | 'right'

const KEYS: Record<string, Held> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function createControls(buttons: ControlButtons, handlers: Handlers): Controls {
  const held: Record<Held, boolean> = { up: false, down: false, left: false, right: false }
  let ignite = false

  const controls: Controls = {
    throttle: START_THROTTLE,
    steer: 0,
    update(dt) {
      const throttleDir = Number(held.up) - Number(held.down)
      if (throttleDir) controls.throttle = clamp(controls.throttle + throttleDir * THROTTLE_RATE * dt, 0, 1)
      const want = Number(held.right) - Number(held.left)
      const step = STEER_RATE * dt
      controls.steer = clamp(controls.steer + clamp(want - controls.steer, -step, step), -1, 1)
    },
    take() {
      const input: Input = { throttle: controls.throttle, steer: controls.steer, ignite }
      ignite = false
      return input
    },
    reset() {
      controls.throttle = START_THROTTLE
      controls.steer = 0
      ignite = false
      held.up = held.down = held.left = held.right = false
    },
  }

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const key = KEYS[event.code]
    if (key) {
      if (!handlers.live()) return
      held[key] = true
      event.preventDefault() // keep arrow keys from scrolling the page
      return
    }
    if (event.repeat) return
    if (event.code === 'Space' && handlers.live()) {
      // Space on a focused button would also click it.
      event.preventDefault()
      ignite = true
    } else if (event.code === 'KeyP') handlers.onPause()
    else if (event.code === 'KeyR') handlers.onRetry()
    else if (event.code === 'KeyH') handlers.onAssist()
    else if (event.code === 'KeyM') handlers.onMute()
  })
  window.addEventListener('keydown', handlers.onGesture, { capture: true })
  window.addEventListener('pointerdown', handlers.onGesture, { capture: true })
  window.addEventListener('keyup', (event) => {
    const key = KEYS[event.code]
    if (key) held[key] = false
    if (event.code === 'Space' && handlers.live()) event.preventDefault()
  })
  window.addEventListener('blur', () => {
    held.up = held.down = held.left = held.right = false
  })

  // Touch and mouse: hold a button as you would hold a key.
  const hold = (button: HTMLButtonElement, key: Held) => {
    const release = () => {
      held[key] = false
      button.classList.remove('down')
    }
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      held[key] = true
      button.classList.add('down')
      button.setPointerCapture(event.pointerId)
    })
    button.addEventListener('pointerup', release)
    button.addEventListener('pointercancel', release)
    button.addEventListener('lostpointercapture', release)
    button.addEventListener('contextmenu', (event) => event.preventDefault())
    // Enter on a focused button arrives as a click with no pointer: a short nudge.
    button.addEventListener('click', (event) => {
      if (event.detail !== 0) return
      if (key === 'up' || key === 'down') controls.throttle = clamp(controls.throttle + (key === 'up' ? 0.1 : -0.1), 0, 1)
      else controls.steer = key === 'right' ? 1 : -1
    })
  }
  hold(buttons.throttleUp, 'up')
  hold(buttons.throttleDown, 'down')
  hold(buttons.steerLeft, 'left')
  hold(buttons.steerRight, 'right')
  // The press itself, not the click: a browser sends no click for a second finger while the
  // first still holds a steering button, and that is how a phone player lights the burn.
  // The click stays for Enter on a focused button. Lighting twice is harmless: it lights once.
  const light = () => {
    if (handlers.live()) ignite = true
  }
  buttons.ignite.addEventListener('pointerdown', light)
  buttons.ignite.addEventListener('click', light)
  buttons.assist.addEventListener('click', handlers.onAssist)
  buttons.pause.addEventListener('click', handlers.onPause)
  buttons.sound.addEventListener('click', handlers.onMute)

  return controls
}
