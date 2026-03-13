import {
  Zap,
  Globe,
  Star,
  Sparkles,
  Moon,
  Sun,
  Rocket,
  Radio,
} from 'lucide-react'
import type { EventSeverity } from '@/types'

// ── Countdown formatting ─────────────────────────────────────────────────

export function formatCountdown(eventTime: string): string {
  const diff = new Date(eventTime).getTime() - Date.now()
  if (diff <= 0) return 'NOW'
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}d ${hrs}h`
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

// ── Event type icons ─────────────────────────────────────────────────────

export function getEventIcon(type: string) {
  switch (type) {
    case 'solar': return Zap
    case 'asteroid': return Globe
    case 'meteor-shower': return Star
    case 'transit': return Radio
    case 'lunar': return Moon
    case 'eclipse': return Sun
    case 'conjunction': return Sparkles
    case 'launch': return Rocket
    default: return Sparkles
  }
}

// ── Severity colors ──────────────────────────────────────────────────────

export interface SeverityColorSet {
  bg: string
  border: string
  text: string
}

export function getSeverityColor(severity: string): SeverityColorSet {
  switch (severity) {
    case 'rare':
    case 'once-in-lifetime':
      return { bg: 'bg-[rgba(239,68,68,0.15)]', border: 'border-[rgba(239,68,68,0.3)]', text: 'text-[#ef4444]' }
    case 'significant':
      return { bg: 'bg-[rgba(212,175,55,0.15)]', border: 'border-[rgba(212,175,55,0.3)]', text: 'text-[#d4af37]' }
    case 'notable':
      return { bg: 'bg-[rgba(74,144,226,0.15)]', border: 'border-[rgba(74,144,226,0.3)]', text: 'text-[#4a90e2]' }
    default:
      return { bg: 'bg-[rgba(255,255,255,0.05)]', border: 'border-[rgba(255,255,255,0.1)]', text: 'text-[#4a5580]' }
  }
}

export function getSeverityHex(severity: string): string {
  if (severity === 'once-in-lifetime' || severity === 'rare') return '#e040fb'
  if (severity === 'significant' || severity === 'notable') return '#d4af37'
  return '#4a5580'
}

// ── Severity ordering ────────────────────────────────────────────────────

export const SEVERITY_ORDER: Record<EventSeverity, number> = {
  'once-in-lifetime': 5,
  'rare': 4,
  'significant': 3,
  'notable': 2,
  'info': 1,
}
