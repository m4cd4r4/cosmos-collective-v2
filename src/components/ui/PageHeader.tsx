import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  badge?: { text: string; color?: string; pulse?: boolean }
  subtitle?: string
  rightContent?: React.ReactNode
}

export function PageHeader({ icon: Icon, title, badge, subtitle, rightContent }: PageHeaderProps) {
  return (
    <div className="bg-cosmos-void/97 border-b border-cosmos-gold/[0.15] px-5 h-[52px] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-cosmos-gold" />
        <span className="text-base font-bold tracking-widest uppercase text-white/90">{title}</span>
        {badge && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: `${badge.color ?? '#d4af37'}20`, border: `1px solid ${badge.color ?? '#d4af37'}30` }}>
            {badge.pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badge.color ?? '#d4af37' }} />}
            <span className="text-[11px] uppercase tracking-widest" style={{ color: badge.color ?? '#d4af37' }}>{badge.text}</span>
          </div>
        )}
        {subtitle && (
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-gray-500 border border-cosmos-gold/10 px-2 py-0.5 rounded">
            {subtitle}
          </span>
        )}
      </div>
      {rightContent}
    </div>
  )
}
