// Keyboard and touch input. Owns the commanded throttle and pitch.
// On screen the lander travels right to left, so "left" pitches the nose towards upright
// and beyond, and "right" pitches it back towards level.

import type { Hud } from './hud'

const THROTTLE_RATE = 0.7 // full range per second
const PITCH_RATE = 15 // degrees per second
const PITCH_NUDGE = 5 // degrees per keyboard activation of a pitch button
const PITCH_MIN = 0
const PITCH_MAX = 120

const VIEW_RATE = Math.PI / 2 // radians per second with Q or E held
const DRAG_RATE = Math.PI / 400 // radians per CSS pixel dragged

export interface Controls {
  throttle: number
  pitchDeg: number
  /** How far the camera has been swung round the lander, radians. 0 is the chase view. */
  viewYaw: number
  /** Apply held keys and buttons. `dt` is real seconds, not simulated ones. */
  update(dt: number): void
  /** Turn the view for held Q or E. Runs every frame, so the player can look round while paused too. */
  look(dt: number): void
}

interface Handlers {
  onPause(): void
  onRetry(): void
  onSkip(): void
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

export function createControls(hud: Hud, handlers: Handlers, canvas: HTMLCanvasElement): Controls {
  const held = { up: false, down: false, left: false, right: false, viewLeft: false, viewRight: false }
  const controls: Controls = {
    throttle: 0,
    pitchDeg: 0,
    viewYaw: 0,
    update(dt) {
      const throttleDir = Number(held.up) - Number(held.down)
      if (throttleDir) controls.throttle = clamp(controls.throttle + throttleDir * THROTTLE_RATE * dt, 0, 1)
      const pitchDir = Number(held.left) - Number(held.right)
      if (pitchDir) controls.pitchDeg = clamp(controls.pitchDeg + pitchDir * PITCH_RATE * dt, PITCH_MIN, PITCH_MAX)
    },
    look(dt) {
      const viewDir = Number(held.viewLeft) - Number(held.viewRight)
      if (viewDir) controls.viewYaw += viewDir * VIEW_RATE * dt
    },
  }

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const key = KEYS[event.code]
    if (key) {
      held[key] = true
      event.preventDefault() // keep arrow keys from also moving the slider or the page
    } else if (event.code === 'KeyQ') held.viewLeft = true
    else if (event.code === 'KeyE') held.viewRight = true
    else if (event.code === 'KeyC' && !event.repeat) controls.viewYaw = 0
    else if (event.code === 'KeyP' && !event.repeat) handlers.onPause()
    else if (event.code === 'KeyR' && !event.repeat) handlers.onRetry()
  })
  window.addEventListener('keyup', (event) => {
    const key = KEYS[event.code]
    if (key) held[key] = false
    else if (event.code === 'KeyQ') held.viewLeft = false
    else if (event.code === 'KeyE') held.viewRight = false
  })
  window.addEventListener('blur', () => {
    held.up = held.down = held.left = held.right = held.viewLeft = held.viewRight = false
  })

  // Drag the scene to swing the camera round the lander; double-click puts it back behind.
  let dragX: number | null = null
  canvas.addEventListener('pointerdown', (event) => {
    dragX = event.clientX
    canvas.setPointerCapture(event.pointerId)
  })
  canvas.addEventListener('pointermove', (event) => {
    if (dragX === null) return
    controls.viewYaw -= (event.clientX - dragX) * DRAG_RATE
    dragX = event.clientX
  })
  const endDrag = () => (dragX = null)
  canvas.addEventListener('pointerup', endDrag)
  canvas.addEventListener('pointercancel', endDrag)
  canvas.addEventListener('dblclick', () => (controls.viewYaw = 0))

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
  hud.skipButton.addEventListener('click', handlers.onSkip)

  return controls
}
