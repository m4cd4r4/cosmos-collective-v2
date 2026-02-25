/**
 * Individual Devlog Post Page
 * Renders markdown content with syntax highlighting
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Starfield } from '@/components/ui/Starfield'
import { DevlogContent } from '@/components/features/devlog/DevlogContent'
import { getDevlogPost, getRelatedPosts, getDevlogPosts, type DevlogPost } from '@/lib/devlog'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag,
  User,
  Share2,
  Twitter,
  Linkedin,
} from 'lucide-react'

// ============================================
// Metadata
// ============================================

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getDevlogPost(params.slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
    },
  }
}

export async function generateStaticParams() {
  const posts = await getDevlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// ============================================
// Page Component
// ============================================

export default async function DevlogPostPage({ params }: PageProps) {
  const post = await getDevlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(params.slug)

  return (
    <div className="h-screen overflow-hidden flex flex-col relative bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Starfield />
      <Header />

      {/* App Header Strip */}
      <div className="relative z-10 bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center gap-3 shrink-0">
        <Link href="/devlog" className="text-[10px] uppercase tracking-wider text-[#4a5580] hover:text-[#d4af37] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Dev Log
        </Link>
        <span className="text-[#3a4560]">/</span>
        <span className="text-[11px] font-semibold text-[#c8d4f0] truncate">{post.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-[rgba(212,175,55,0.25)] text-[#d4af37]">
            {post.category.replace(/-/g, ' ')}
          </span>
          <span className="text-[9px] text-[#4a5580] flex items-center gap-1">
            <Clock className="w-3 h-3" />{post.readingTime} min
          </span>
        </div>
      </div>

      <main className="relative z-10 flex-1 overflow-auto py-8 pb-16">
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-[#e0e8ff] mb-4 leading-snug">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#4a5580] mb-4">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author.name}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTime} min read
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-[#4a5580] border border-[rgba(212,175,55,0.08)]"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Excerpt */}
          <div className="rounded-xl px-5 py-4 mb-8 border-l-2 border-[#d4af37] bg-[rgba(212,175,55,0.06)]">
            <p className="text-[13px] text-[#8090b0] italic leading-relaxed">{post.excerpt}</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-cosmos max-w-none">
            <DevlogContent content={post.content} />
          </div>

          {/* Share */}
          <footer className="mt-10 pt-6 border-t border-[rgba(212,175,55,0.08)]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[#4a5580] text-[11px]">
                <Share2 className="w-3.5 h-3.5" />
                Share this post:
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://cosmos-collective.dev/devlog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Twitter"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[rgba(212,175,55,0.15)] text-[#4a5580] hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.3)] text-[10px] transition-colors"
                >
                  <Twitter className="w-3 h-3" /> X / Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://cosmos-collective.dev/devlog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[rgba(212,175,55,0.15)] text-[#4a5580] hover:text-[#d4af37] hover:border-[rgba(212,175,55,0.3)] text-[10px] transition-colors"
                >
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto px-4 max-w-4xl mt-10">
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#4a5580] mb-3">Related Posts</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {relatedPosts.map((related) => (
                <RelatedPostCard key={related.slug} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

// ============================================
// Related Post Card
// ============================================

function RelatedPostCard({ post }: { post: DevlogPost }) {
  return (
    <Link
      href={`/devlog/${post.slug}`}
      className="block group rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(8,12,28,0.7)] px-4 py-3.5 hover:border-[rgba(212,175,55,0.3)] transition-colors"
    >
      <span className="text-[9px] uppercase tracking-[0.15em] text-[#d4af37]">
        {post.category.replace(/-/g, ' ')}
      </span>
      <h3 className="text-[12px] font-semibold text-[#c8d4f0] mt-1.5 mb-1.5 group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
        {post.title}
      </h3>
      <p className="text-[10px] text-[#4a5580] line-clamp-2 leading-relaxed">{post.excerpt}</p>
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#3a4560]">
        <Clock className="w-3 h-3" />
        {post.readingTime} min read
      </div>
    </Link>
  )
}
