// Entry point: the game loop. Physics runs on a fixed 60 Hz step; rendering follows
// the display. three.js and the terrain load only after the player presses Begin.

import '@fontsource-variable/outfit'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles.css'

import { DT, step, type State } from './sim/physics'
import { BRAKING_TIME_SCALE, assessTouchdown, attitudeHold, guidance, reachedTakeover, startState, takeoverState, type Phase } from './sim/flight'
import { createControls } from './ui/controls'
import { createEndCard, createStartCard, createTips, type TipId } from './ui/cards'
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
const controls = createControls(hud, { onPause: togglePause, onRetry: () => begin('takeover') })
const startCard = createStartCard(load)
app.append(hud.root, startCard.root)

let terrain: Terrain | null = null
let world: World | null = null
let state: State = startState()
let phase: Phase = 'ended'
let paused = false
let fromStart = true
let endCard: HTMLElement | null = null
let accumulator = 0
let lastFrame = 0
const tipsShown = new Set<TipId>()

async function load() {
  if (world) return begin('start')
  startCard.setBusy('Loading terrain')
  try {
    const [{ loadTerrain }, { createWorld }] = await Promise.all([import('./scene/terrain'), import('./scene/world')])
    terrain = await loadTerrain(window.innerWidth < 760)
    world = createWorld(canvas, terrain, reducedMotion)
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

function begin(mode: 'start' | 'takeover') {
  if (!world || !terrain) return
  // A retry before the takeover has been reached restarts the burn.
  fromStart = mode === 'start' || (phase === 'braking' && fromStart)
  state = fromStart ? startState() : takeoverState()
  phase = fromStart ? 'braking' : 'approach'
  const cue = guidance(state, phase, groundBelow())
  controls.throttle = fromStart ? 0 : cue.throttle
  controls.pitchDeg = cue.pitchDeg
  paused = false
  accumulator = 0
  endCard?.remove()
  endCard = null
  tips.clear()
  hud.throttleInput.focus()
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

function advance(realSeconds: number) {
  controls.update(realSeconds, phase === 'approach')
  accumulator += realSeconds * (phase === 'braking' ? BRAKING_TIME_SCALE : 1)
  while (accumulator >= DT && phase !== 'ended') {
    accumulator -= DT
    if (phase === 'braking') controls.pitchDeg = attitudeHold(state, controls.throttle)
    state = step(state, { throttle: controls.throttle, pitchDeg: controls.pitchDeg }, DT)

    if (phase === 'braking' && reachedTakeover(state)) {
      phase = 'approach'
      accumulator = 0
      showTip('takeover')
    }
    if (state.altitude - groundBelow() <= 0) touchDown()
  }

  if (phase === 'braking') {
    if (controls.throttle > 0.3) showTip('sideways')
    if (state.time > 170) showTip('sun')
  } else if (phase === 'approach' && state.range < 2_500 && state.time > 0) {
    showTip('ring')
  }
}

function touchDown() {
  if (!terrain) return
  const ground = groundBelow()
  state = { ...state, altitude: ground }
  const result = assessTouchdown(state, controls.pitchDeg, terrain.slopeAt(-state.range))
  phase = 'ended'
  controls.throttle = 0
  tips.clear()
  endCard = createEndCard(result, {
    burnSeconds: fromStart ? state.time : null,
    onRetry: () => begin('takeover'),
    onRestart: () => begin('start'),
  })
  app.append(endCard)
}

function frame(now: number) {
  requestAnimationFrame(frame)
  const realSeconds = Math.min(0.1, (now - lastFrame) / 1000)
  lastFrame = now
  if (!world) return
  if (!paused && phase !== 'ended' && !document.hidden) advance(realSeconds)

  const radarAltitude = state.altitude - groundBelow()
  const throttle = state.deltaV > 0 ? controls.throttle : 0
  const view = { state, pitchDeg: controls.pitchDeg, throttle, radarAltitude, clock: now / 1000 }
  world.render(view)

  const dust = world.dustAmount(view)
  dustOverlay.style.opacity = (dust * 0.94).toFixed(3)
  if (dust > 0.25 && phase === 'approach') showTip('dust')

  hud.update({
    phase,
    radarAltitude,
    climbRate: state.climbRate,
    groundSpeed: state.groundSpeed,
    deltaV: state.deltaV,
    range: state.range,
    throttle: controls.throttle,
    pitchDeg: controls.pitchDeg,
    cue: guidance(state, phase === 'ended' ? 'approach' : phase, groundBelow()),
    paused,
  })
}
