// The label shown while the landing is played back, with a way out.

import { el } from './dom'

export interface ReplayTag {
  root: HTMLElement
}

export function createReplayTag(onSkip: () => void): ReplayTag {
  const root = el(
    'div',
    { class: 'panel replay-tag', hidden: true, role: 'status' },
    el('span', { class: 'replay-dot', 'aria-hidden': 'true' }),
    el('strong', {}, 'Replay'),
    el('span', { class: 'muted' }, 'from the beach'),
    el('button', { class: 'ghost', type: 'button', onclick: onSkip }, 'Skip ', el('kbd', {}, 'Space')),
  )
  return { root }
}
