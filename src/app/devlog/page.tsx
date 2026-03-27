/**
 * Devlog Page
 * Technical blog documenting the development journey
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { getDevlogPosts, type DevlogPost } from '@/lib/devlog'
import {
  Calendar,
  Clock,
  Code2,
  Telescope,
  Radio,
  Cpu,
  ArrowRight,
  Zap,
  BookOpen,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Devlog',
  description: 'Technical journey building Cosmos Collective. Deep dives into astronomical data integration, visualisation techniques, and modern web development.',
}

// ── Category config ────────────────────────────────────────────────────────

const categoryMeta: Record<string, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, color: string }> = {
  'architecture':      { icon: Code2,     color: '#4a90e2' },
  'data-integration':  { icon: Telescope, color: '#d4af37' },
  'radio-astronomy':   { icon: Radio,     color: '#e040fb' },
  'visualization':     { icon: Cpu,       color: '#4caf93' },
  'accessibility':     { icon: BookOpen,  color: '#f59e0b' },
  'performance':       { icon: Zap,       color: '#64d8cb' },
}

function getCategoryMeta(cat: string) {
  return categoryMeta[cat] ?? { icon: Code2, color: '#d4af37' }
}

function formatPostDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function DevlogPage() {
  const posts = await getDevlogPosts()

  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {} as Record<number, DevlogPost[]>)

  const years = Object.keys(postsByYear).map(Number).sort((a, b) => b - a)
  const featuredCount = posts.filter(p => p.featured).length
  const totalReadTime = posts.reduce((sum, p) => sum + p.readingTime, 0)

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* ── App Header Strip ──────────────────────────────────────────── */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Code2 className="w-4 h-4 text-[#d4af37]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Dev Log</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
            <span className="text-[11px] uppercase tracking-[0.15em] text-[#d4af37]">{posts.length} Posts</span>
          </div>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.12em] text-[#4a5580] border border-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded">
            Building Cosmos Collective
          </span>
        </div>
        <span className="hidden sm:block text-[11px] uppercase tracking-wider text-[#4a5580]">
          Technical Deep-Dives
        </span>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {[
          { label: 'Total Posts',   value: String(posts.length),       color: '#d4af37' },
          { label: 'Featured',      value: String(featuredCount),       color: '#e040fb' },
          { label: 'Total Read',    value: `${totalReadTime} min`,      color: '#4a90e2' },
          { label: 'Latest',        value: posts[0] ? formatPostDate(posts[0].date) : '—', color: '#4caf93' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-6 lg:px-10 py-2 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <span className="text-lg sm:text-xl font-bold truncate max-w-[120px]" style={{ color }}>{value}</span>
            <span className="text-[11px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5 whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-5xl mx-auto w-full">

        {/* Featured (latest) post */}
        {posts[0] && <FeaturedPost post={posts[0]} />}

        {/* Posts by year */}
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year}>
              {/* Year divider */}
              <div className="flex items-center gap-3 mb-3">
                <span className="flex-1 border-t border-[rgba(212,175,55,0.08)]" />
                <span className="text-xs uppercase tracking-[0.2em] text-[#4a5580] px-1">{year}</span>
                <span className="flex-1 border-t border-[rgba(212,175,55,0.08)]" />
              </div>

              <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden divide-y divide-[rgba(212,175,55,0.06)]">
                {postsByYear[year].map((post) => (
                  <PostRow key={post.slug} post={post} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-[rgba(212,175,55,0.08)]">
            <Code2 className="w-8 h-8 text-[#4a5580] mx-auto mb-3" />
            <p className="text-[12px] text-[#4a5580]">Development posts coming soon</p>
          </div>
        )}
      </main>

    </div>
  )
}

// ── Featured Post ─────────────────────────────────────────────────────────

function FeaturedPost({ post }: { post: DevlogPost }) {
  const { icon: Icon, color } = getCategoryMeta(post.category)

  return (
    <Link href={`/devlog/${post.slug}`} className="block group mb-6">
      <div className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-[rgba(8,12,28,0.7)] overflow-hidden hover:border-[rgba(212,175,55,0.45)] transition-colors">
        <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.15em] text-[#d4af37]">Latest</span>
          {post.featured && (
            <span className="ml-auto text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(224,64,251,0.12)] text-[#e040fb] border border-[rgba(224,64,251,0.25)]">
              Featured
            </span>
          )}
        </div>
        <div className="p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.15em] mb-1.5" style={{ color }}>
              {post.category.replace(/-/g, ' ')}
            </div>
            <h2 className="text-[15px] font-bold text-[#e0e8ff] group-hover:text-[#d4af37] transition-colors leading-snug mb-1.5">
              {post.title}
            </h2>
            <p className="text-[11px] text-[#6070a0] line-clamp-2 leading-relaxed mb-2.5">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 flex-wrap text-[10px] text-[#4a5580]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />{formatPostDate(post.date)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{post.readingTime} min
              </span>
              {post.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[#4a5580]">{tag}</span>
              ))}
              <span className="ml-auto flex items-center gap-1 text-[#d4af37] group-hover:gap-2 transition-all">
                Read post <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Post Row ──────────────────────────────────────────────────────────────

function PostRow({ post }: { post: DevlogPost }) {
  const { icon: Icon, color } = getCategoryMeta(post.category)

  return (
    <Link href={`/devlog/${post.slug}`} className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group">
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}12` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-[#c8d4f0] group-hover:text-[#d4af37] font-semibold transition-colors leading-snug">
            {post.title}
          </span>
          {post.featured && (
            <span className="text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(212,175,55,0.12)] text-[#d4af37] border border-[rgba(212,175,55,0.25)] shrink-0">
              Featured
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#4a5580] mt-0.5 line-clamp-1">{post.excerpt}</p>
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#3a4560] flex-wrap">
          <span style={{ color }}>{post.category.replace(/-/g, ' ')}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{formatPostDate(post.date)}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{post.readingTime} min</span>
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded bg-white/[0.03] text-[#3a4560]">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
