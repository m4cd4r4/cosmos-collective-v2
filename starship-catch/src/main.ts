// Entry point: the game loop. Physics runs on a fixed 60 Hz step; rendering follows
// the display. three.js and the ground load only after the player presses the start button.

import '@fontsource-variable/outfit'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles.css'

import { DT } from './sim/physics'
import { TUNING, advance, guidance, igniteHeight, startFlight, type Flight, type Input, type Phase } from './sim/flight'
import { predictArrival } from './sim/predict'
import { pickScenario } from './sim/scenario'
import { createControls, type Call } from './ui/controls'
import { createEndCard, createStartCard, createTips, type TipId } from './ui/cards'
import { createHud } from './ui/hud'
import type { World } from './scene/world'

const app = document.getElementById('app') as HTMLElement
const canvas = document.getElementById('scene') as HTMLCanvasElement
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** How many times faster than real time each phase runs. Game settings, shown on the HUD. */
const ASCENT_SCALE = 4
const BOOSTBACK_SCALE = 3
const COAST_SCALE = 16
/** Boostback drops to real time once the impact point is this close to the aim, m. */
const DECISION_RANGE = 40_000
/** Real seconds the scene is left in view after the run ends, before the end card. */
const SETTLE_SECONDS = 2.6

/** Development only: with ?autopilot the flight computer flies the landing burn, for screenshots. */
const AUTOPILOT = import.meta.env.DEV && new URLSearchParams(location.search).has('autopilot')

let world: World | null = null
let groundFlown: string | null = null
let run = 0
let flight: Flight = startFlight(pickScenario(0))
/** The flight as it was when the landing began, for an instant retry. */
let gate: { flight: Flight; call: Call } | null = null
let paused = false
let accumulator = 0
let lastFrame = 0
let settle: number | null = null
let endCard: HTMLElement | null = null
const tipsShown = new Set<TipId>()

const hud = createHud()
const tips = createTips()
hud.root.append(tips.root)
const controls = createControls(hud, {
  onPause: togglePause,
  onRetry: () => begin(gate ? 'landing' : 'liftoff'),
  onSkip: skip,
  action: () => (flight.phase === 'boostback' ? 'cut' : flight.phase === 'landing' && !flight.lit ? 'ignite' : null),
  canCall: () => flight.phase === 'boostback',
})
const startCard = createStartCard(load)
app.append(hud.root, startCard.root)

async function load() {
  if (world) return begin('liftoff')
  startCard.setBusy('Loading the launch site')
  try {
    const [{ loadSite }, { createWorld }] = await Promise.all([import('./scene/site'), import('./scene/world')])
    const site = await loadSite()
    groundFlown = site.flown
    world = createWorld(canvas, site, reducedMotion)
    window.addEventListener('resize', () => world?.resize())
    startCard.root.remove()
    hud.root.hidden = false
    begin('liftoff')
    requestAnimationFrame(frame)
  } catch (error) {
    console.error(error)
    startCard.setError('The launch site or the 3D view failed to load. Check that WebGL is on, then try again.')
  }
}

function begin(mode: 'liftoff' | 'landing') {
  if (!world) return
  controls.reset()
  if (mode === 'landing' && gate) {
    flight = structuredClone(gate.flight)
    controls.call = gate.call
    focusSoon(hud.igniteButton)
  } else {
    flight = startFlight(pickScenario(run++))
    gate = null
    showTip('maxq')
    focusSoon(hud.throttleInput)
  }
  paused = false
  accumulator = 0
  settle = null
  endCard?.remove()
  endCard = null
  if (mode === 'landing') tips.clear()
  world.reset()
}

/** The HUD shows and enables its controls on the next frame; a hidden or disabled one cannot take focus before that. */
function focusSoon(element: HTMLElement) {
  requestAnimationFrame(() => requestAnimationFrame(() => element.focus()))
}

function showTip(id: TipId) {
  if (tipsShown.has(id)) return
  tipsShown.add(id)
  tips.show(id)
}

function togglePause() {
  if (world && flight.phase !== 'ended') paused = !paused
}

function skippable(): string | null {
  if (flight.phase === 'ascent' || flight.phase === 'staging') return 'Skip ascent'
  return flight.phase === 'coast' ? 'Skip coast' : null
}

/** Hand the rest of the ascent, or of the coast, to the flight computer and jump to its end. */
function skip() {
  const label = skippable()
  if (!label || paused) return
  const done: Phase = label === 'Skip ascent' ? 'boostback' : 'landing'
  while (flight.phase !== done && flight.phase !== 'ended') stepOnce(guidance(flight))
  world?.reset()
}

function boostbackAim(): number {
  return controls.call === 'go' ? 0 : TUNING.splashX
}

function timeScale(): number {
  if (flight.phase === 'ascent' || flight.phase === 'staging') return ASCENT_SCALE
  if (flight.phase === 'boostback') return Math.abs(flight.impactX - boostbackAim()) < DECISION_RANGE ? 1 : BOOSTBACK_SCALE
  return flight.phase === 'coast' ? COAST_SCALE : 1
}

function stepOnce(input: Input) {
  const before = flight.phase
  const three = flight.downselected
  advance(flight, input, DT)
  if (flight.downselected && !three) showTip('three')
  if (flight.phase !== before) entered(flight.phase)
}

function entered(phase: Phase) {
  accumulator = 0
  if (phase === 'staging') showTip('staging')
  else if (phase === 'boostback') {
    showTip('call')
    focusSoon(hud.goButton)
  } else if (phase === 'coast') showTip('fins')
  else if (phase === 'landing') {
    controls.throttle = 1
    controls.tiltDeg = 0
    gate = { flight: structuredClone(flight), call: controls.call }
    showTip('burn')
    focusSoon(hud.igniteButton)
  } else if (phase === 'ended') {
    settle = 0
    tips.clear()
  }
}

/** Advance the flight by a frame's worth of fixed steps. Returns the simulated seconds advanced. */
function simulate(realSeconds: number): number {
  controls.update(realSeconds)
  accumulator += realSeconds * timeScale()
  let steps = 0
  while (accumulator >= DT && flight.phase !== 'ended') {
    accumulator -= DT
    const input = controls.take()
    if (AUTOPILOT && flight.lit) {
      const cue = guidance(flight)
      controls.throttle = input.throttle = cue.throttle
      controls.tiltDeg = input.tiltDeg = cue.tiltDeg
    }
    stepOnce(input)
    steps++
  }
  return steps * DT
}

function showEndCard() {
  settle = null
  endCard = createEndCard(flight, {
    call: controls.call,
    groundFlown,
    onRetry: gate ? () => begin('landing') : null,
    onRestart: () => begin('liftoff'),
  })
  app.append(endCard)
}

function frame(now: number) {
  requestAnimationFrame(frame)
  const realDt = Math.min(0.1, (now - lastFrame) / 1000)
  lastFrame = now
  if (!world) return

  let simDt = 0
  if (!paused && !document.hidden) {
    if (flight.phase !== 'ended') simDt = simulate(realDt)
    else {
      // Let the catch, or the fireball, be seen before the card covers it.
      simDt = realDt
      if (settle !== null && (settle += realDt) >= (reducedMotion ? 0.8 : SETTLE_SECONDS)) showEndCard()
    }
  }

  const held: Input = { throttle: controls.throttle, tiltDeg: controls.tiltDeg, shutdown: false, go: false, ignite: false }
  const arrival = predictArrival(flight, held)
  world.render({ flight, throttle: controls.throttle, arrival, clock: now / 1000, simDt, realDt, aids: flight.phase !== 'ended' })
  // The catch, or the fireball, has the screen to itself.
  hud.root.hidden = flight.phase === 'ended'
  hud.update({
    flight,
    cue: guidance(flight),
    throttle: controls.throttle,
    tiltDeg: controls.tiltDeg,
    call: controls.call,
    timeScale: timeScale(),
    paused,
    arrival,
    igniteHeight: flight.phase === 'landing' && !flight.lit ? igniteHeight(flight) : 0,
    skip: skippable(),
  })
}
