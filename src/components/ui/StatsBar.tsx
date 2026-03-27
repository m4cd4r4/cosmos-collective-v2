interface StatItem {
  label: string
  value: string
  color: string
}

interface StatsBarProps {
  items: StatItem[]
}

export function StatsBar({ items }: StatsBarProps) {
  return (
    <div className="bg-cosmos-depth/90 border-b border-cosmos-gold/[0.08] flex shrink-0">
      {items.map(({ label, value, color }) => (
        <div key={label} className="flex flex-col items-center px-6 lg:px-10 py-2 border-r border-cosmos-gold/[0.06] last:border-0">
          <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
          <span className="text-[11px] uppercase tracking-widest text-gray-500 mt-0.5 whitespace-nowrap">{label}</span>
        </div>
      ))}
    </div>
  )
}
