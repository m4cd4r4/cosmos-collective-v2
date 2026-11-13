// Entry point: the game loop. Physics runs on a fixed 60 Hz step; rendering follows
// the display. three.js and the terrain load only after the player presses Begin.

import '@fontsource-variable/outfit'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles.css'

import { DT, step, type State } from './sim/physics'
import { APOLLO_11 } from './data/facts'
import { el, fmt } from './ui/dom'
import {
  BOULDER_HALF_WIDTH,
  BRAKING_TIME_SCALE,
  RETRY_RANGE,
  assessTouchdown,
  attitudeHold,
  flyCueTo,
  guidance,
  timeToTakeover,
  overflew,
  predictTouchdown,
  reachedTakeover,
  startState,
  takeoverState,
  type Phase,
  type Prediction,
} from './sim/flight'
import { createControls } from './ui/controls'
import { createEndCard, createOverflyCard, createStartCard, createTips, type TipId } from './ui/cards'
import { createHud } from './ui/hud'
import type { Terrain } from './scene/terrain'
import type { World } from './scene/world'

const app = document.getElementById('app') as HTMLElement
const canvas = document.getElementById('scene') as HTMLCanvasElement
const dustOverlay = document.getElementById('dust') as HTMLElement
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const hud = createHud()
const tips = createTips()
hud.root.append(tips.root)
const controls = createControls(hud, { onPause: togglePause, onRetry: () => begin('retry'), onSkip: skipIntro }, canvas)
const startCard = createStartCard(load)
// Rides beside the touchdown marker: how far short of the target, or long, the lander is heading.
const markerLabel = el('div', { class: 'marker-label', hidden: true, 'aria-hidden': 'true' })
app.append(markerLabel, hud.root, startCard.root)

let terrain: Terrain | null = null
let world: World | null = null
let state: State = startState()
let phase: Phase = 'ended'
let paused = false
let fromStart = true
let endCard: HTMLElement | null = null
/** The pause between touching down and the end card. */
let settle: { hard: boolean; seconds: number; card: HTMLElement } | null = null
let accumulator = 0
let lastFrame = 0
const tipsShown = new Set<TipId>()

async function load() {
  if (world) return begin('start')
  startCard.setBusy('Loading terrain')
  try {
    const [{ loadTerrain }, { createWorld }, { loadStars }] = await Promise.all([
      import('./scene/terrain'),
      import('./scene/world'),
      import('./scene/stars'),
    ])
    terrain = await loadTerrain(window.innerWidth < 760)
    const stars = await loadStars(terrain.sunDirection.x, terrain.sunDirection.z)
    world = createWorld(canvas, terrain, stars, reducedMotion)
    window.addEventListener('resize', () => world?.resize())
    startCard.root.remove()
    hud.root.hidden = false
    begin('start')
    requestAnimationFrame(frame)
  } catch (error) {
    console.error(error)
    startCard.setError('The terrain or the 3D view failed to load. Check that WebGL is on, then try again.')
  }
}

function begin(mode: 'start' | 'takeover' | 'retry') {
  if (!world || !terrain) return
  // The braking burn is a fast-forwarded intro flown by the computer. Reduced motion skips it.
  fromStart = mode === 'start' && !reducedMotion
  const ground = terrain.heightAt
  // A retry starts on the computer's line just before the decision, not a minute's flying from it.
  state = fromStart ? startState() : mode === 'retry' ? flyCueTo(takeoverState(), RETRY_RANGE, (range) => ground(-range)) : takeoverState()
  phase = fromStart ? 'braking' : 'approach'
  const cue = guidance(state, phase, groundBelow())
  controls.throttle = cue.throttle
  controls.pitchDeg = cue.pitchDeg
  paused = false
  accumulator = 0
  settle = null
  endCard?.remove()
  endCard = null
  tips.clear()
  if (fromStart) {
    showTip('sideways')
    focusSoon(hud.skipButton)
  } else {
    showTip('takeover')
    focusSoon(hud.throttleInput)
  }
}

/** The HUD shows and enables its controls on the next frame; a hidden or disabled one cannot take focus before that. */
function focusSoon(element: HTMLElement) {
  requestAnimationFrame(() => requestAnimationFrame(() => element.focus()))
}

function skipIntro() {
  if (phase === 'braking') begin('takeover')
}

function togglePause() {
  if (phase !== 'ended') paused = !paused
}

function groundBelow(): number {
  return terrain ? terrain.heightAt(-state.range) : 0
}

function showTip(id: TipId) {
  if (tipsShown.has(id)) return
  tipsShown.add(id)
  tips.show(id)
}

/** Simulated seconds before the takeover over which the intro slows down and pitches over. */
const PITCH_OVER_SECONDS = 30

/** 0 during the braking burn, rising to 1 at the takeover. */
function pitchOver(): number {
  const t = Math.min(1, Math.max(0, 1 - timeToTakeover(state) / PITCH_OVER_SECONDS))
  return t * t * (3 - 2 * t)
}

/** The intro runs at 32x and eases to 4x for the pitch-over, so the handover can be seen coming. */
function timeScale(): number {
  return phase === 'braking' ? BRAKING_TIME_SCALE + (4 - BRAKING_TIME_SCALE) * pitchOver() : 1
}

function advance(realSeconds: number) {
  if (phase === 'approach') controls.update(realSeconds)
  accumulator += realSeconds * timeScale()
  while (accumulator >= DT && phase !== 'ended') {
    accumulator -= DT
    if (phase === 'braking') {
      // The braking law saturates in its last seconds and used to snap the lander upright.
      // Blend to the line the player is about to be handed instead.
      const blend = pitchOver()
      const next = guidance(state, 'approach', groundBelow())
      const throttle = guidance(state, phase, groundBelow()).throttle
      controls.throttle = throttle + (next.throttle - throttle) * blend
      controls.pitchDeg = attitudeHold(state, throttle) * (1 - blend) + next.pitchDeg * blend
    }
    state = step(state, { throttle: controls.throttle, pitchDeg: controls.pitchDeg }, DT)

    if (phase === 'braking' && reachedTakeover(state)) {
      phase = 'approach'
      accumulator = 0
      // Hand over on the computer's own line. The braking law saturates in its last
      // seconds, and left the player at full throttle and 70 degrees.
      const cue = guidance(state, phase, groundBelow())
      controls.throttle = cue.throttle
      controls.pitchDeg = cue.pitchDeg
      showTip('takeover')
      focusSoon(hud.throttleInput)
    }
    if (state.altitude - groundBelow() <= 0) touchDown()
    else if (overflew(state)) {
      const retry = { onRetry: () => begin('retry'), onRestart: () => begin('start') }
      endRun(createOverflyCard(state.altitude - groundBelow(), state.groundSpeed, retry))
    }
  }

  if (phase === 'approach') {
    // The boulders tip comes early enough to be gone before the player is choosing a spot:
    // on a phone a tip card covers the lander while it is up.
    if (state.range < 1_800) showTip('boulders')
    else if (state.range < 3_000) showTip('ring')
    else if (state.range < 5_200) showTip('sun')
    if (state.altitude - groundBelow() < APOLLO_11.dustAltitude.value) showTip('dust')
  }
}

function predict(): Prediction | null {
  if (phase !== 'approach' || !terrain) return null
  const ground = terrain.heightAt
  return predictTouchdown(state, { throttle: controls.throttle, pitchDeg: controls.pitchDeg }, (range) => ground(-range))
}

function touchDown() {
  if (!terrain) return
  const ground = groundBelow()
  state = { ...state, altitude: ground }
  const result = assessTouchdown(state, controls.pitchDeg, terrain.slopeAt(-state.range))
  const card = createEndCard(result, {
    burnSeconds: fromStart ? state.time : null,
    onRetry: () => begin('retry'),
    onRestart: () => begin('start'),
  })
  // Let the touchdown be seen before the card covers it.
  phase = 'ended'
  controls.throttle = 0
  tips.clear()
  settle = { hard: result.outcome === 'hard', seconds: 0, card }
}

/** How long the lander is left in view after it touches down, s. */
const SETTLE_SECONDS = 2.4

function endRun(card: HTMLElement) {
  phase = 'ended'
  controls.throttle = 0
  tips.clear()
  settle = null
  endCard = card
  app.append(card)
}

function frame(now: number) {
  requestAnimationFrame(frame)
  const realSeconds = Math.min(0.1, (now - lastFrame) / 1000)
  lastFrame = now
  if (!world) return
  controls.look(realSeconds)
  if (!paused && phase !== 'ended' && !document.hidden) advance(realSeconds)
  if (settle && !document.hidden) {
    settle.seconds += realSeconds
    if (settle.seconds >= (reducedMotion ? 0.8 : SETTLE_SECONDS)) endRun(settle.card)
  }

  const radarAltitude = state.altitude - groundBelow()
  const throttle = state.deltaV > 0 ? controls.throttle : 0
  const prediction = predict()
  const view = {
    state,
    pitchDeg: controls.pitchDeg,
    throttle,
    radarAltitude,
    clock: now / 1000,
    prediction,
    aids: phase === 'approach',
    settle: settle && { hard: settle.hard, seconds: reducedMotion ? SETTLE_SECONDS : settle.seconds },
    viewYaw: controls.viewYaw,
  }
  world.render(view)

  const dust = world.dustAmount(view)
  dustOverlay.style.opacity = (dust * 0.94).toFixed(3)

  const at = prediction && phase === 'approach' ? world.markerScreen() : null
  markerLabel.hidden = !at
  if (at && prediction) {
    const rocks = Math.abs(prediction.range) < BOULDER_HALF_WIDTH
    const metres = fmt.whole(Math.abs(prediction.range))
    markerLabel.textContent = rocks ? `${metres} m, in the rocks` : `${metres} m ${prediction.range > 0 ? 'short' : 'long'}`
    markerLabel.classList.toggle('over', rocks)
    markerLabel.style.transform = `translate(${Math.round(at.x + 14)}px, ${Math.round(at.y - 8)}px)`
  }

  hud.update({
    phase,
    altitude: state.altitude,
    timeScale: timeScale(),
    radarAltitude,
    climbRate: state.climbRate,
    groundSpeed: state.groundSpeed,
    deltaV: state.deltaV,
    range: state.range,
    throttle: controls.throttle,
    pitchDeg: controls.pitchDeg,
    cue: guidance(state, phase === 'ended' ? 'approach' : phase, groundBelow()),
    prediction,
    paused,
  })
}
