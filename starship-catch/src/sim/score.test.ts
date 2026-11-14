import { describe, expect, it } from 'vitest'
import { flyOnCue } from './fly-on-cue'
import { scoreCatch } from './score'

describe('the catch score', () => {
  it('scores a catch flown on the cue highly, and scores nothing that was not caught', () => {
    const { flight, log } = flyOnCue(0)
    const score = scoreCatch(flight, 1_100)
    expect(score, log).not.toBeNull()
    expect(score!.total, JSON.stringify(score)).toBeGreaterThan(70)
    expect(score!.total).toBeLessThanOrEqual(100)
    expect(scoreCatch(flyOnCue(2).flight, 1_100)).toBeNull()
  })
})
