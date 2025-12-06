/**
 * Terms of Use Page
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { FileText, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for Cosmos Collective platform.',
}

export default function TermsPage() {
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
            <div className="w-16 h-16 rounded-2xl bg-cosmos-gold/20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-cosmos-gold" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Terms of Use
            </h1>
            <p className="text-gray-400">
              Last updated: December 6, 2024
            </p>
          </div>

          {/* Content */}
          <Card padding="lg" className="mb-8">
            <CardContent className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">Acceptance of Terms</h2>
              <p className="text-gray-300 mb-6">
                By accessing and using Cosmos Collective, you agree to be bound by these Terms of Use.
                If you do not agree to these terms, please do not use the platform.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Use of the Platform</h2>
              <p className="text-gray-300 mb-4">
                Cosmos Collective is provided for educational and informational purposes. You may:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
                <li>Browse and explore astronomical data and imagery</li>
                <li>Use the interactive sky map and visualisation tools</li>
                <li>Participate in citizen science classification activities</li>
                <li>Access educational content about astronomy and telescopes</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mb-4">Intellectual Property</h2>
              <p className="text-gray-300 mb-4">
                <strong>Astronomical imagery:</strong> Images from NASA, ESA, CSA, and STScI are in the public
                domain or used under their respective policies. Credit is provided where applicable.
              </p>
              <p className="text-gray-300 mb-4">
                <strong>Platform code:</strong> The Cosmos Collective platform is open source under the MIT License.
                See our{' '}
                <a
                  href="https://github.com/m4cd4r4/cosmos-collective-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmos-cyan hover:underline"
                >
                  GitHub repository
                </a>{' '}
                for details.
              </p>
              <p className="text-gray-300 mb-6">
                <strong>Third-party content:</strong> Some features embed content from third parties
                (YouTube, Zooniverse, CDS). These are subject to their respective terms of service.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Citizen Science Contributions</h2>
              <p className="text-gray-300 mb-6">
                Classification activities on this platform are demonstrations of citizen science workflows.
                For official contributions to astronomical research, we encourage you to participate directly
                on{' '}
                <a
                  href="https://www.zooniverse.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmos-cyan hover:underline"
                >
                  Zooniverse
                </a>
                .
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Disclaimer</h2>
              <p className="text-gray-300 mb-6">
                Cosmos Collective is provided &quot;as is&quot; without warranties of any kind. We strive for accuracy
                but cannot guarantee the completeness or reliability of astronomical data displayed.
                For scientific research, please consult primary data sources.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Data Sources</h2>
              <p className="text-gray-300 mb-4">
                Astronomical data is sourced from:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
                <li>NASA/ESA/CSA James Webb Space Telescope</li>
                <li>NASA/ESA Hubble Space Telescope</li>
                <li>CSIRO ASKAP and Australian radio telescopes</li>
                <li>NASA public APIs</li>
                <li>CDS Strasbourg (Aladin Lite, SIMBAD)</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mb-4">Limitation of Liability</h2>
              <p className="text-gray-300 mb-6">
                To the maximum extent permitted by law, Cosmos Collective and its contributors shall not
                be liable for any damages arising from the use or inability to use the platform.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Changes to Terms</h2>
              <p className="text-gray-300 mb-6">
                We reserve the right to modify these terms at any time. Continued use of the platform
                after changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
              <p className="text-gray-300">
                Questions about these terms can be directed to our{' '}
                <a
                  href="https://github.com/m4cd4r4/cosmos-collective-v2/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmos-cyan hover:underline"
                >
                  GitHub issues
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
