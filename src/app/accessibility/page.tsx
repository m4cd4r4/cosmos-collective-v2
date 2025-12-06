/**
 * Accessibility Page
 * Information about accessibility features and commitment
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Accessibility,
  Eye,
  Keyboard,
  Monitor,
  MousePointer,
  Volume2,
  Contrast,
  Type,
  ArrowLeft,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Learn about accessibility features and our commitment to making astronomy accessible to everyone.',
}

const accessibilityFeatures = [
  {
    icon: Keyboard,
    title: 'Keyboard Navigation',
    description: 'Full keyboard navigation support throughout the site. Use Tab to move between elements and Enter to activate.',
  },
  {
    icon: Eye,
    title: 'Screen Reader Support',
    description: 'Semantic HTML and ARIA labels ensure compatibility with screen readers like NVDA, JAWS, and VoiceOver.',
  },
  {
    icon: Contrast,
    title: 'High Contrast',
    description: 'Carefully chosen colour combinations meet WCAG AA contrast requirements for readability.',
  },
  {
    icon: Type,
    title: 'Scalable Text',
    description: 'All text scales properly with browser zoom settings up to 200% without loss of functionality.',
  },
  {
    icon: MousePointer,
    title: 'Focus Indicators',
    description: 'Clear visual focus indicators help keyboard users track their position on the page.',
  },
  {
    icon: Monitor,
    title: 'Responsive Design',
    description: 'The site adapts to different screen sizes and orientations for optimal viewing on any device.',
  },
]

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cosmos-void">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-cosmos-cyan/20 flex items-center justify-center mx-auto mb-6">
              <Accessibility className="w-8 h-8 text-cosmos-cyan" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Accessibility
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We believe the wonders of the universe should be accessible to everyone.
              Our commitment to accessibility is fundamental to our mission.
            </p>
          </div>

          {/* Commitment Statement */}
          <Card className="mb-12" padding="lg">
            <CardContent>
              <h2 className="text-xl font-semibold text-white mb-4">Our Commitment</h2>
              <p className="text-gray-300 mb-4">
                Cosmos Collective is committed to ensuring digital accessibility for people with disabilities.
                We are continually improving the user experience for everyone and applying the relevant
                accessibility standards.
              </p>
              <p className="text-gray-300">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
                These guidelines explain how to make web content more accessible for people with disabilities
                and more user-friendly for everyone.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Accessibility Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {accessibilityFeatures.map((feature) => (
              <Card key={feature.title} padding="lg">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cosmos-purple/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-cosmos-purple" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feedback Section */}
          <Card padding="lg" className="bg-cosmos-cyan/5 border-cosmos-cyan/20">
            <CardContent>
              <div className="flex items-start gap-4">
                <Volume2 className="w-6 h-6 text-cosmos-cyan flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Feedback</h2>
                  <p className="text-gray-300 mb-4">
                    We welcome your feedback on the accessibility of Cosmos Collective.
                    If you encounter any accessibility barriers or have suggestions for improvement,
                    please let us know.
                  </p>
                  <p className="text-gray-300">
                    You can report issues or suggestions through our{' '}
                    <a
                      href="https://github.com/m4cd4r4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cosmos-cyan hover:underline"
                    >
                      GitHub repository
                    </a>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <div className="mt-12">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Technical Standards
            </h2>
            <Card padding="lg">
              <CardContent>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cosmos-cyan mt-1">-</span>
                    <span>Semantic HTML5 markup for proper document structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cosmos-cyan mt-1">-</span>
                    <span>ARIA landmarks and labels for assistive technology</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cosmos-cyan mt-1">-</span>
                    <span>Colour contrast ratios meeting WCAG 2.1 AA requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cosmos-cyan mt-1">-</span>
                    <span>Descriptive alt text for all meaningful images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cosmos-cyan mt-1">-</span>
                    <span>Visible focus states for interactive elements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cosmos-cyan mt-1">-</span>
                    <span>Consistent and predictable navigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cosmos-cyan mt-1">-</span>
                    <span>No content that flashes more than three times per second</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
