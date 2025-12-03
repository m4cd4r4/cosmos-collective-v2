/**
 * Individual Devlog Post Page
 * Renders markdown content with syntax highlighting
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Starfield } from '@/components/ui/Starfield'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DevlogContent } from '@/components/features/devlog/DevlogContent'
import { getDevlogPost, getRelatedPosts, getDevlogPosts, type DevlogPost } from '@/lib/devlog'
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
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
    <div className="min-h-screen relative">
      <Starfield />
      <Header />

      <main className="relative z-10 pt-20 pb-16">
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link
            href="/devlog"
            className="inline-flex items-center gap-2 text-cosmos-cyan hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Devlog
          </Link>

          {/* Header */}
          <header className="mb-12">
            {/* Category */}
            <span className="inline-block px-3 py-1 rounded-full bg-cosmos-cyan/20 text-cosmos-cyan text-sm font-medium mb-4">
              {post.category.replace('-', ' ')}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-gray-400 text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Excerpt */}
          <div className="glass-panel rounded-xl p-6 mb-12 border-l-4 border-cosmos-cyan">
            <p className="text-lg text-gray-300 italic">{post.excerpt}</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-cosmos max-w-none">
            <DevlogContent content={post.content} />
          </div>

          {/* Share */}
          <footer className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share this post:</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon-sm" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://cosmos-collective.dev/devlog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon-sm" asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://cosmos-collective.dev/devlog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto px-4 max-w-4xl mt-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <RelatedPostCard key={related.slug} post={related} />
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <nav className="container mx-auto px-4 max-w-4xl mt-12">
          <div className="flex justify-between">
            <Link
              href="/devlog"
              className="flex items-center gap-2 text-gray-400 hover:text-cosmos-cyan transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Posts
            </Link>
          </div>
        </nav>
      </main>

      <Footer />
    </div>
  )
}

// ============================================
// Related Post Card
// ============================================

function RelatedPostCard({ post }: { post: DevlogPost }) {
  return (
    <Link href={`/devlog/${post.slug}`} className="block group">
      <Card className="h-full transition-all group-hover:scale-[1.02]" padding="md">
        <CardContent>
          <span className="text-xs text-cosmos-cyan font-medium uppercase tracking-wider">
            {post.category.replace('-', ' ')}
          </span>
          <h3 className="text-lg font-semibold text-white mt-2 mb-2 group-hover:text-cosmos-cyan transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {post.readingTime} min read
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
