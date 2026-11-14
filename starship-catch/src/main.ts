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
import { scoreCatch } from './sim/score'
import { createEndCard, createStartCard, createTips, type TipId } from './ui/cards'
import { createReplayTag } from './ui/replay'
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
/** Real seconds the scene is left in view after the run ends, before the replay. A catch is held longer. */
const SETTLE_SECONDS = 2.6
const CATCH_HOLD_SECONDS = 4.5
/** Liftoff runs in real time until the stack has cleared the tower, s. */
const LIFTOFF_REAL_TIME = 8
/** Hot staging runs in real time for this long either side of the ship lighting, s. */
const STAGING_REAL_TIME: [number, number] = [2, 5]
/** The last stretch of the landing kept for the replay, real seconds. */
const REPLAY_SECONDS = 11

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

/** One rendered frame of the landing, kept for the replay. */
interface Recorded {
  flight: Flight
  throttle: number
  simDt: number
  realDt: number
}
let recording: Recorded[] = []
let replay: { frames: Recorded[]; index: number; clock: number; after: number } | null = null
let replayed = false
const replayTag = createReplayTag(() => finishReplay())
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
app.append(hud.root, replayTag.root, startCard.root)
window.addEventListener('keydown', (event) => {
  if (!replay || !['Space', 'Escape', 'Enter'].includes(event.code)) return
  event.preventDefault()
  event.stopImmediatePropagation()
  finishReplay()
}, { capture: true })

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
  recording = []
  replay = null
  replayed = false
  replayTag.root.hidden = true
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
  if (flight.phase === 'ascent' && flight.state.time < LIFTOFF_REAL_TIME) return 1
  if (flight.phase === 'staging') {
    const lights = flight.events.meco! + TUNING.stagingDelay
    const t = flight.state.time
    return t > lights - STAGING_REAL_TIME[0] && t < lights + STAGING_REAL_TIME[1] ? 1 : ASCENT_SCALE
  }
  if (flight.phase === 'ascent') return ASCENT_SCALE
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
  const canReplay = recording.length > 30
  endCard = createEndCard(flight, {
    call: controls.call,
    groundFlown,
    score: gate ? scoreCatch(flight, gate.flight.state.deltaV) : null,
    onRetry: gate ? () => begin('landing') : null,
    onRestart: () => begin('liftoff'),
    onReplay: canReplay ? startReplay : null,
  })
  app.append(endCard)
}

/** Keep the last stretch of the landing, up to and including the frame it ended on. */
function record(simDt: number, realDt: number) {
  const last = recording.at(-1)
  if (flight.phase !== 'landing' && !(flight.phase === 'ended' && last && last.flight.outcome === null)) return
  recording.push({ flight: structuredClone(flight), throttle: controls.throttle, simDt, realDt })
  let kept = 0
  let from = recording.length
  while (from > 0 && kept < REPLAY_SECONDS) kept += recording[--from].realDt
  if (from > 0) recording = recording.slice(from)
}

function startReplay() {
  if (!world || recording.length < 2) return showEndCard()
  endCard?.remove()
  endCard = null
  settle = null
  replayed = true
  replay = { frames: recording, index: 0, clock: 0, after: 0 }
  replayTag.root.hidden = false
  world.reset()
}

function finishReplay() {
  if (!replay) return
  replay = null
  replayTag.root.hidden = true
  world?.reset()
  showEndCard()
}

/** Play the recording back at the speed it was flown. Returns the frame to draw. */
function stepReplay(realDt: number): Recorded {
  const r = replay!
  r.clock += realDt
  let elapsed = 0
  for (let i = 0; i <= r.index; i++) elapsed += r.frames[i].realDt
  while (r.index < r.frames.length - 1 && elapsed + r.frames[r.index + 1].realDt <= r.clock) elapsed += r.frames[++r.index].realDt
  // Hold on the last frame a moment before the card.
  if (r.index === r.frames.length - 1 && (r.after += realDt) > 2.2) queueMicrotask(finishReplay)
  return r.frames[r.index]
}

const narrow = window.matchMedia('(max-width: 760px)')

/** On a phone the panels stack across the top and the bottom: how many pixels each stack covers. */
function hudInsets(): [number, number] {
  if (!narrow.matches || hud.root.hidden) return [0, 0]
  let top = 0
  let bottom = 0
  for (const panel of hud.root.querySelectorAll('.panel')) {
    const box = panel.getBoundingClientRect()
    if (!box.height) continue
    if (box.top < window.innerHeight / 2) top = Math.max(top, box.bottom)
    else bottom = Math.max(bottom, window.innerHeight - box.top)
  }
  return [top, bottom]
}

function frame(now: number) {
  requestAnimationFrame(frame)
  const realDt = Math.min(0.1, (now - lastFrame) / 1000)
  lastFrame = now
  if (!world) return

  if (replay) {
    hud.root.hidden = true
    world.setInsets(0, 0)
    const shown = stepReplay(document.hidden ? 0 : realDt)
    world.render({ flight: shown.flight, throttle: shown.throttle, arrival: null, clock: now / 1000, simDt: shown.simDt, realDt, aids: false, replay: true })
    return
  }

  let simDt = 0
  if (!paused && !document.hidden) {
    if (flight.phase !== 'ended') simDt = simulate(realDt)
    else {
      // Let the catch, or the fireball, be seen before the replay and the card.
      simDt = realDt
      const hold = reducedMotion ? 0.8 : flight.outcome === 'caught' ? CATCH_HOLD_SECONDS : SETTLE_SECONDS
      if (settle !== null && (settle += realDt) >= hold) {
        if (!replayed && recording.length > 30) startReplay()
        else showEndCard()
      }
    }
    record(simDt, realDt)
  }

  world.setInsets(...hudInsets())
  const held: Input ={ throttle: controls.throttle, tiltDeg: controls.tiltDeg, shutdown: false, go: false, ignite: false }
  const arrival = predictArrival(flight, held)
  world.render({ flight, throttle: controls.throttle, arrival, clock: now / 1000, simDt, realDt, aids: flight.phase !== 'ended', replay: false })
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
