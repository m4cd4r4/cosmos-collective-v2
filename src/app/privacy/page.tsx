/**
 * Privacy Policy Page
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Shield, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Cosmos Collective - how we handle your data.',
}

export default function PrivacyPage() {
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
            <div className="w-16 h-16 rounded-2xl bg-cosmos-purple/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-cosmos-purple" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: December 6, 2024
            </p>
          </div>

          {/* Content */}
          <Card padding="lg" className="mb-8">
            <CardContent className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
              <p className="text-gray-300 mb-6">
                Cosmos Collective is committed to protecting your privacy. This policy explains
                how we handle information when you use our platform.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
              <p className="text-gray-300 mb-4">
                Cosmos Collective is designed to work without requiring user accounts or personal data collection:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
                <li><strong>No account required</strong> - All features are accessible without signing in</li>
                <li><strong>Local storage only</strong> - Preferences and favorites are stored in your browser</li>
                <li><strong>No tracking cookies</strong> - We do not use advertising or tracking cookies</li>
                <li><strong>No personal data collection</strong> - We do not collect names, emails, or personal information</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mb-4">Local Data Storage</h2>
              <p className="text-gray-300 mb-4">
                We use browser localStorage to save:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
                <li>Your favorited observations</li>
                <li>Display preferences (view mode, sort order)</li>
                <li>Citizen science session statistics</li>
              </ul>
              <p className="text-gray-300 mb-6">
                This data never leaves your browser and can be cleared at any time through your browser settings.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
              <p className="text-gray-300 mb-4">
                Cosmos Collective integrates with external astronomical data services:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
                <li><strong>NASA APIs</strong> - Astronomy Picture of the Day, ISS tracking</li>
                <li><strong>YouTube</strong> - ISS live camera embeds (subject to YouTube/Google privacy policy)</li>
                <li><strong>Aladin Lite (CDS)</strong> - Interactive sky map</li>
              </ul>
              <p className="text-gray-300 mb-6">
                These services have their own privacy policies. We encourage you to review them.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Analytics</h2>
              <p className="text-gray-300 mb-6">
                We may use privacy-respecting analytics (such as Vercel Analytics) to understand
                general usage patterns. This data is aggregated and does not identify individual users.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 mb-6">
                We may update this privacy policy from time to time. Changes will be posted on this page
                with an updated revision date.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
              <p className="text-gray-300">
                If you have questions about this privacy policy, please open an issue on our{' '}
                <a
                  href="https://github.com/m4cd4r4/cosmos-collective-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmos-cyan hover:underline"
                >
                  GitHub repository
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
