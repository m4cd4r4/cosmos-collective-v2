// Sound, made in the browser with WebAudio: no recordings. Engine roar that follows the
// throttle and the engines lit, wind rush that rises with speed, grid-fin clacks, a clang
// from the arms on a catch and a boom on a crash. Browsers only allow audio after a click or
// a key, so nothing plays until then. The mute choice is remembered where storage allows.

import type { Flight } from '../sim/flight'

const STORE = 'starship-catch:muted'

export interface Sound {
  muted: boolean
  /** Call from a click or a key: creates the audio graph the first time. */
  unlock(): void
  toggle(): void
  /** Once a frame. `active` is false while paused or after the run has ended. */
  update(flight: Flight, steer: number, active: boolean): void
  catchClang(): void
  crash(sea: boolean): void
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORE) === 'yes'
  } catch {
    return false
  }
}

function noiseBuffer(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    if (brown) {
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    } else data[i] = white
  }
  return buffer
}

interface Graph {
  ctx: AudioContext
  master: GainNode
  roarGain: GainNode
  roarFilter: BiquadFilterNode
  rumble: OscillatorNode
  windGain: GainNode
  windFilter: BiquadFilterNode
  white: AudioBuffer
}

export function createSound(): Sound {
  let graph: Graph | null = null
  let lastClack = 0
  let clackSteer = 0

  function build(): Graph | null {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.value = sound.muted ? 0 : 0.8
    master.connect(ctx.destination)

    // Roar: brown noise through a low-pass that opens with the throttle, over a low saw rumble.
    const roarSource = ctx.createBufferSource()
    roarSource.buffer = noiseBuffer(ctx, 4, true)
    roarSource.loop = true
    const roarFilter = ctx.createBiquadFilter()
    roarFilter.type = 'lowpass'
    roarFilter.frequency.value = 300
    const roarGain = ctx.createGain()
    roarGain.gain.value = 0
    const rumble = ctx.createOscillator()
    rumble.type = 'sawtooth'
    rumble.frequency.value = 45
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0.18
    roarSource.connect(roarFilter)
    rumble.connect(rumbleGain).connect(roarFilter)
    roarFilter.connect(roarGain).connect(master)
    roarSource.start()
    rumble.start()

    // Wind: white noise through a band-pass that rises with speed.
    const white = noiseBuffer(ctx, 3, false)
    const windSource = ctx.createBufferSource()
    windSource.buffer = white
    windSource.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.Q.value = 0.7
    windFilter.frequency.value = 400
    const windGain = ctx.createGain()
    windGain.gain.value = 0
    windSource.connect(windFilter).connect(windGain).connect(master)
    windSource.start()

    return { ctx, master, roarGain, roarFilter, rumble, windGain, windFilter, white }
  }

  /** A short burst of filtered noise with a falling envelope. */
  function burst(g: Graph, at: number, length: number, type: BiquadFilterType, from: number, to: number, level: number) {
    const source = g.ctx.createBufferSource()
    source.buffer = g.white
    const filter = g.ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.setValueAtTime(from, at)
    filter.frequency.exponentialRampToValueAtTime(to, at + length)
    const gain = g.ctx.createGain()
    gain.gain.setValueAtTime(level, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
    source.connect(filter).connect(gain).connect(g.master)
    source.start(at, Math.random() * 2)
    source.stop(at + length + 0.05)
  }

  function tone(g: Graph, at: number, freq: number, length: number, level: number, type: OscillatorType = 'sine') {
    const osc = g.ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const gain = g.ctx.createGain()
    gain.gain.setValueAtTime(level, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
    osc.connect(gain).connect(g.master)
    osc.start(at)
    osc.stop(at + length + 0.05)
  }

  const sound: Sound = {
    muted: readMuted(),
    unlock() {
      if (!graph) graph = build()
      if (graph && graph.ctx.state === 'suspended') void graph.ctx.resume()
    },
    toggle() {
      sound.muted = !sound.muted
      try {
        localStorage.setItem(STORE, sound.muted ? 'yes' : 'no')
      } catch {
        // Storage blocked: the choice lasts for this visit.
      }
      if (graph) graph.master.gain.setTargetAtTime(sound.muted ? 0 : 0.8, graph.ctx.currentTime, 0.05)
    },
    update(flight, steer, active) {
      if (!graph) return
      const g = graph
      const now = g.ctx.currentTime
      const s = flight.state
      const engines = active && flight.thrustAccel > 0 ? flight.engines : 0
      const level = engines ? flight.throttle * flight.spool * Math.sqrt(engines / 13) : 0
      g.roarGain.gain.setTargetAtTime(level * 0.9, now, 0.08)
      g.roarFilter.frequency.setTargetAtTime(220 + 700 * level, now, 0.1)
      g.rumble.frequency.setTargetAtTime(38 + 30 * level, now, 0.1)
      const speed = active ? Math.hypot(s.vx, s.vy) : 0
      g.windGain.gain.setTargetAtTime(Math.min(0.35, (speed / 300) ** 2 * 0.35), now, 0.2)
      g.windFilter.frequency.setTargetAtTime(250 + speed * 5, now, 0.2)
      // Grid fins clack as they swing to a new setting.
      if (active && Math.abs(steer - clackSteer) > 0.3 && now - lastClack > 0.07) {
        clackSteer = steer
        lastClack = now
        burst(g, now, 0.05, 'highpass', 2_500, 1_200, 0.25)
        tone(g, now, 900 + Math.random() * 300, 0.04, 0.05, 'square')
      }
    },
    catchClang() {
      if (!graph) return
      const g = graph
      const now = g.ctx.currentTime
      burst(g, now, 0.12, 'bandpass', 3_000, 800, 0.5)
      // Inharmonic partials ring like struck steel.
      for (const [freq, length, level] of [
        [196, 2.6, 0.28],
        [503, 2.0, 0.18],
        [822, 1.6, 0.12],
        [1_377, 1.1, 0.08],
        [2_120, 0.7, 0.05],
      ]) tone(g, now, freq, length, level)
      tone(g, now + 0.35, 233, 1.8, 0.12)
    },
    crash(sea) {
      if (!graph) return
      const g = graph
      const now = g.ctx.currentTime
      burst(g, now, sea ? 1.6 : 3, 'lowpass', sea ? 2_500 : 1_200, 60, sea ? 0.7 : 1)
      if (!sea) {
        tone(g, now, 52, 1.6, 0.6)
        burst(g, now + 0.15, 1.2, 'bandpass', 900, 200, 0.3)
      }
    },
  }
  return sound
}
