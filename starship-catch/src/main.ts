// Entry point: the game loop. Physics runs on a fixed 60 Hz step; rendering follows
// the display. three.js and the ground load only after the player presses the start button.

import '@fontsource-variable/outfit'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles.css'

import { DT } from './sim/physics'
import { aboveArms, advance, startFlight, type Flight, type Input } from './sim/flight'
import { makeScenario, newSeed } from './sim/scenario'
import { predictArrival } from './sim/predict'
import { pilot } from './sim/pilot'
import { scoreCatch } from './sim/score'
import { createControls } from './ui/controls'
import { createEndCard, createHowTo, createStartCard, type RunNotes } from './ui/cards'
import { createSound } from './ui/sound'
import { createHud } from './ui/hud'
import type { World } from './scene/world'

const app = document.getElementById('app') as HTMLElement
const canvas = document.getElementById('scene') as HTMLCanvasElement
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Real seconds the outcome is held on screen before the end card. A catch is held longer. */
const CRASH_HOLD = 3
const CATCH_HOLD = 4

const params = new URLSearchParams(location.search)
/** ?seed=N replays one drop. Development only: ?autopilot flies the test pilot, ?speed=N runs faster, for screenshots. */
const FIXED_SEED = Number(params.get('seed')) || null
const AUTOPILOT = import.meta.env.DEV && params.has('autopilot')
const SPEED = import.meta.env.DEV ? Number(params.get('speed')) || 1 : 1

let world: World | null = null
let groundFlown: string | null = null
let seed = FIXED_SEED ?? newSeed()
let flight: Flight = startFlight(makeScenario(seed))
let paused = false
let assist = readAssist()
let accumulator = 0
let lastFrame = 0
let settle: number | null = null
let endCard: HTMLElement | null = null
let notes: RunNotes = { xAt2km: null, windAt2km: 0, assistUsed: assist }
let heard: string | null = null
let howTo: HTMLElement | null = null

const hud = createHud()
const sound = createSound()
const controls = createControls(hud, {
  onPause: togglePause,
  onRetry: () => begin(newSeed()),
  onAssist: toggleAssist,
  onMute: () => sound.toggle(),
  onGesture: () => sound.unlock(),
  live: () => !flight.outcome && world !== null && !paused && !howTo,
})
const startCard = createStartCard(load)
app.append(hud.root, startCard.root)
hud.help.addEventListener('click', () => openHowTo())
window.addEventListener('keydown', (event) => {
  if (event.code === 'Slash' && world) openHowTo()
  else if (howTo && event.code === 'Escape') closeHowTo()
})

/** Assist is on until the player turns it off. */
function readAssist(): boolean {
  try {
    return localStorage.getItem('starship-catch:assist') !== 'off'
  } catch {
    return true
  }
}

function howToSeen(): boolean {
  try {
    return localStorage.getItem('starship-catch:howto') === 'seen'
  } catch {
    return false
  }
}

/** The three-step card. Shown before the first drop, and from the ? button. The run waits while it is open. */
function openHowTo() {
  if (howTo || !world || flight.outcome) return
  paused = true
  howTo = createHowTo(closeHowTo)
  app.append(howTo)
}

function closeHowTo() {
  if (!howTo) return
  howTo.remove()
  howTo = null
  paused = false
  try {
    localStorage.setItem('starship-catch:howto', 'seen')
  } catch {
    // Storage blocked: the card shows again next visit.
  }
  ;(document.activeElement as HTMLElement | null)?.blur?.()
}

function toggleAssist() {
  assist = !assist
  if (assist) notes.assistUsed = true
  try {
    localStorage.setItem('starship-catch:assist', assist ? 'on' : 'off')
  } catch {
    // Storage blocked: Assist still works for this visit.
  }
}

async function load() {
  if (world) return begin(newSeed())
  startCard.setBusy('Loading the launch site')
  try {
    const [{ loadSite }, { createWorld }] = await Promise.all([import('./scene/site'), import('./scene/world')])
    const site = await loadSite()
    groundFlown = site.flown
    world = createWorld(canvas, site, reducedMotion)
    window.addEventListener('resize', () => world?.resize())
    startCard.root.remove()
    hud.root.hidden = false
    begin(seed)
    if (!howToSeen()) openHowTo()
    requestAnimationFrame(frame)
  } catch (error) {
    console.error(error)
    startCard.setError('The launch site or the 3D view failed to load. Check that WebGL is on, then try again.')
  }
}

function begin(nextSeed: number) {
  if (!world) return
  seed = nextSeed
  flight = startFlight(makeScenario(seed))
  notes = { xAt2km: null, windAt2km: 0, assistUsed: assist }
  heard = null
  controls.reset()
  paused = false
  accumulator = 0
  settle = null
  endCard?.remove()
  endCard = null
  hud.root.hidden = false
  world.reset()
  ;(document.activeElement as HTMLElement | null)?.blur?.()
}

function togglePause() {
  if (world && !flight.outcome && !howTo) paused = !paused
}

function simulate(realSeconds: number) {
  controls.update(realSeconds)
  accumulator += realSeconds * SPEED
  let steps = 0
  while (accumulator >= DT && !flight.outcome) {
    accumulator -= DT
    let input: Input = controls.take()
    if (AUTOPILOT) {
      input = pilot(flight)
      controls.throttle = input.throttle
      controls.steer = input.steer
    }
    const above = aboveArms(flight)
    advance(flight, input, DT)
    if (notes.xAt2km === null && above > 2_000 && aboveArms(flight) <= 2_000) {
      notes.xAt2km = flight.state.x
      notes.windAt2km = flight.windX
    }
    steps++
  }
  if (flight.outcome && settle === null) settle = 0
  return steps * DT
}

function showEndCard() {
  settle = null
  hud.root.hidden = true
  endCard = createEndCard(flight, {
    groundFlown,
    score: scoreCatch(flight),
    notes,
    onRetry: () => begin(newSeed()),
    onSame: () => begin(seed),
  })
  app.append(endCard)
}


/** How many pixels the HUD covers at the top and at the bottom of the screen. */
function hudInsets(): [number, number] {
  if (hud.root.hidden) return [0, 0]
  let top = 0
  let bottom = 0
  for (const panel of hud.root.querySelectorAll('.panel:not(.scope)')) {
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
  // Development only: lets the screenshot script read the run.
  if (import.meta.env.DEV) (window as unknown as { __flight: Flight }).__flight = flight

  let simDt = 0
  if (!paused && !document.hidden) {
    if (!flight.outcome) simDt = simulate(realDt)
    else if (settle !== null && !endCard) {
      // Let the catch, or the crash, be seen up close before the card.
      const hold = reducedMotion ? 1.5 : flight.outcome === 'caught' ? CATCH_HOLD : CRASH_HOLD
      if ((settle += realDt) >= hold) showEndCard()
    }
  }

  world.setInsets(...hudInsets())
  const held: Input = { throttle: controls.throttle, steer: controls.steer, ignite: false }
  const arrival = assist && !flight.outcome ? predictArrival(flight, held) : null
  world.render({ flight, arrival, clock: now / 1000, simDt, realDt: paused ? 0 : realDt })
  hud.update({ flight, throttle: controls.throttle, steer: controls.steer, paused, assist, arrival, muted: sound.muted })
  sound.update(flight, controls.steer, !paused && !flight.outcome && !document.hidden)
  if (flight.outcome && heard !== flight.outcome) {
    heard = flight.outcome
    if (flight.outcome === 'caught') sound.catchClang()
    else sound.crash(flight.outcome === 'sea')
  }
}
