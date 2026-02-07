/**
 * Devlog Page
 * Technical blog documenting the development journey
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Starfield } from '@/components/ui/Starfield'
import { Card, CardContent } from '@/components/ui/Card'
import { getDevlogPosts, type DevlogPost } from '@/lib/devlog'
import {
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  Code2,
  Telescope,
  Radio,
  Cpu,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Devlog',
  description: 'Technical journey building Cosmos Collective. Deep dives into astronomical data integration, visualisation techniques, and modern web development.',
}

// ============================================
// Category Icons
// ============================================

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'architecture': Code2,
  'data-integration': Telescope,
  'radio-astronomy': Radio,
  'visualization': Cpu,
  'default': Code2,
}

export default async function DevlogPage() {
  const posts = await getDevlogPosts()

  // Group posts by year
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {} as Record<number, DevlogPost[]>)

  const years = Object.keys(postsByYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <Header />

      <main className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Development Log
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Technical deep-dives, architectural decisions, and lessons learned
              building a multi-spectrum astronomical data exploration platform.
            </p>
          </section>

          {/* Featured Post */}
          {posts.length > 0 && (
            <section className="mb-12">
              <FeaturedPost post={posts[0]} />
            </section>
          )}

          {/* Posts by Year */}
          {years.map((year) => (
            <section key={year} className="mb-12">
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-12 h-0.5 bg-cosmos-gold" />
                {year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postsByYear[year].map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          ))}

          {/* Empty State */}
          {posts.length === 0 && (
            <Card className="max-w-2xl mx-auto text-center" padding="xl">
              <CardContent>
                <Code2 className="w-12 h-12 text-cosmos-gold mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Devlog Coming Soon
                </h2>
                <p className="text-gray-400">
                  Technical posts documenting the development journey are being written.
                  Check back soon for deep dives into the architecture, data integration,
                  and visualisation techniques.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ============================================
// Featured Post Component
// ============================================

function FeaturedPost({ post }: { post: DevlogPost }) {
  const CategoryIcon = categoryIcons[post.category] || categoryIcons.default

  return (
    <Link href={`/devlog/${post.slug}`} className="block group">
      <Card className="overflow-hidden" padding="none">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image/Gradient */}
            <div className="h-48 md:h-auto bg-gradient-to-br from-cosmos-gold/20 via-cosmos-nebula-blue/20 to-cosmos-gold/20 flex items-center justify-center">
              <CategoryIcon className="w-24 h-24 text-white/20" />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-cosmos-gold/20 text-cosmos-gold text-xs font-medium">
                  Featured
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs">
                  {post.category.replace('-', ' ')}
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-3 group-hover:text-cosmos-gold transition-colors">
                {post.title}
              </h3>

              <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} min read
                </span>
              </div>

              <span className="inline-flex items-center gap-2 text-cosmos-gold group-hover:gap-3 transition-all">
                Read post
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ============================================
// Post Card Component
// ============================================

function PostCard({ post }: { post: DevlogPost }) {
  const CategoryIcon = categoryIcons[post.category] || categoryIcons.default

  return (
    <Link href={`/devlog/${post.slug}`} className="block group h-full">
      <Card className="h-full transition-all duration-300 group-hover:scale-[1.02]" padding="lg">
        <CardContent className="h-full flex flex-col">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-cosmos-gold/10 flex items-center justify-center mb-4">
            <CategoryIcon className="w-5 h-5 text-cosmos-gold" />
          </div>

          {/* Category */}
          <span className="text-xs text-cosmos-gold font-medium uppercase tracking-wider mb-2">
            {post.category.replace('-', ' ')}
          </span>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cosmos-gold transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-gray-400 flex-1 line-clamp-3">{post.excerpt}</p>

          {/* Meta */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString('en-AU', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime} min
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-white/5 text-gray-500 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
