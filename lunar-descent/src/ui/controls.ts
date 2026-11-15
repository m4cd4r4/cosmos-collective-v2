// Keyboard and touch input. Owns the commanded throttle and pitch.
// On screen the lander travels right to left, so "left" pitches the nose towards upright
// and beyond, and "right" pitches it back towards level.

import type { Hud } from './hud'
import { PITCH_KEYS, THROTTLE_KEYS, THROTTLE_PER_NOTCH, keyRamp } from '../sim/input'

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
  /** Apply taps, held keys and buttons, and the mouse wheel. `dt` is real seconds, not simulated ones. */
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

/** A tap or wheel turn older than this when the flight next updates is dropped: it was made while paused or before the takeover. */
const NUDGE_MAX_AGE_MS = 200

export function createControls(hud: Hud, handlers: Handlers, canvas: HTMLCanvasElement): Controls {
  const held = { up: false, down: false, left: false, right: false, viewLeft: false, viewRight: false }
  /** Seconds each control key has been held, from its press. */
  const heldFor = { up: 0, down: 0, left: 0, right: 0 }
  /** Taps and wheel turns not yet applied: they move the controls on the next update, so a tap shorter than a frame still counts. */
  const nudge = { throttle: 0, pitch: 0, at: 0 }
  const press = (key: 'up' | 'down' | 'left' | 'right') => {
    if (held[key]) return
    held[key] = true
    heldFor[key] = 0
    if (key === 'up' || key === 'down') nudge.throttle += (key === 'up' ? 1 : -1) * THROTTLE_KEYS.step
    else nudge.pitch += (key === 'left' ? 1 : -1) * PITCH_KEYS.step
    nudge.at = performance.now()
  }
  const ramp = (key: 'up' | 'down' | 'left' | 'right', feel: typeof THROTTLE_KEYS, dt: number) => {
    if (!held[key]) return 0
    const move = keyRamp(feel, heldFor[key], dt)
    heldFor[key] += dt
    return move
  }
  const controls: Controls = {
    throttle: 0,
    pitchDeg: 0,
    viewYaw: 0,
    update(dt) {
      const fresh = performance.now() - nudge.at < NUDGE_MAX_AGE_MS
      const throttleMove = (fresh ? nudge.throttle : 0) + ramp('up', THROTTLE_KEYS, dt) - ramp('down', THROTTLE_KEYS, dt)
      const pitchMove = (fresh ? nudge.pitch : 0) + ramp('left', PITCH_KEYS, dt) - ramp('right', PITCH_KEYS, dt)
      nudge.throttle = nudge.pitch = 0
      if (throttleMove) controls.throttle = clamp(controls.throttle + throttleMove, 0, 1)
      if (pitchMove) controls.pitchDeg = clamp(controls.pitchDeg + pitchMove, PITCH_MIN, PITCH_MAX)
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
      press(key)
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

  // The mouse wheel is a throttle: up for more. One notch is one tap. Touchpads send many
  // small deltas, so they add up to notches.
  // Only over the scene and the HUD, so the start and end cards still scroll.
  let wheel = 0
  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey) return // pinch-zoom
    event.preventDefault()
    wheel += event.deltaMode === 1 ? event.deltaY * 33 : event.deltaMode === 2 ? event.deltaY * 800 : event.deltaY
    const notches = Math.trunc(wheel / 100)
    if (!notches) return
    wheel -= notches * 100
    nudge.throttle -= notches * THROTTLE_PER_NOTCH
    nudge.at = performance.now()
  }
  canvas.addEventListener('wheel', onWheel, { passive: false })
  hud.root.addEventListener('wheel', onWheel, { passive: false })

  hud.throttleInput.addEventListener('input', () => {
    controls.throttle = Number(hud.throttleInput.value) / 100
  })

  const holdButton = (button: HTMLButtonElement, key: 'left' | 'right') => {
    const release = () => (held[key] = false)
    button.addEventListener('pointerdown', (event) => {
      press(key)
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
