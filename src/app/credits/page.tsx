/**
 * Credits Page
 * Acknowledgments for data sources, libraries, and contributors
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Heart, ArrowLeft, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Credits',
  description: 'Acknowledgments and credits for Cosmos Collective - data sources, tools, and contributors.',
}

// Data sources with descriptions
const dataSources = [
  {
    name: 'NASA',
    url: 'https://www.nasa.gov/',
    description: 'Astronomy Picture of the Day, ISS tracking data, and public domain imagery.',
  },
  {
    name: 'STScI / MAST',
    url: 'https://mast.stsci.edu/',
    description: 'Mikulski Archive for Space Telescopes - JWST and Hubble observation data and imagery.',
  },
  {
    name: 'ESA',
    url: 'https://www.esa.int/',
    description: 'European Space Agency - partner agency for JWST and Hubble.',
  },
  {
    name: 'CSA',
    url: 'https://www.asc-csa.gc.ca/',
    description: 'Canadian Space Agency - partner agency for the James Webb Space Telescope.',
  },
  {
    name: 'CSIRO',
    url: 'https://www.csiro.au/',
    description: 'Commonwealth Scientific and Industrial Research Organisation - Australian telescope data and imagery.',
  },
  {
    name: 'ATNF / CASDA',
    url: 'https://research.csiro.au/casda/',
    description: 'Australia Telescope National Facility and CSIRO ASKAP Science Data Archive.',
  },
  {
    name: 'CDS Strasbourg',
    url: 'https://cds.u-strasbg.fr/',
    description: 'Aladin Lite sky map viewer and SIMBAD astronomical database.',
  },
  {
    name: 'Zooniverse',
    url: 'https://www.zooniverse.org/',
    description: 'Citizen science platform and project data for galaxy classification.',
  },
  {
    name: 'Where Is The ISS',
    url: 'https://wheretheiss.at/',
    description: 'Real-time International Space Station tracking API.',
  },
]

// Open source technologies
const technologies = [
  {
    name: 'Next.js',
    url: 'https://nextjs.org/',
    description: 'React framework for production-grade web applications.',
  },
  {
    name: 'React',
    url: 'https://react.dev/',
    description: 'JavaScript library for building user interfaces.',
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org/',
    description: 'Typed superset of JavaScript for enhanced developer experience.',
  },
  {
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com/',
    description: 'Utility-first CSS framework for rapid UI development.',
  },
  {
    name: 'TanStack Query',
    url: 'https://tanstack.com/query/',
    description: 'Powerful asynchronous state management for data fetching.',
  },
  {
    name: 'Framer Motion',
    url: 'https://www.framer.com/motion/',
    description: 'Production-ready motion library for React.',
  },
  {
    name: 'Lucide',
    url: 'https://lucide.dev/',
    description: 'Beautiful and consistent icon library.',
  },
  {
    name: 'Aladin Lite',
    url: 'https://aladin.cds.unistra.fr/AladinLite/',
    description: 'Lightweight sky atlas for embedding in web pages.',
  },
]

// Hosting and infrastructure
const infrastructure = [
  {
    name: 'Vercel',
    url: 'https://vercel.com/',
    description: 'Platform for deploying and hosting Next.js applications.',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/',
    description: 'Source code hosting and version control.',
  },
]

export default function CreditsPage() {
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
            <div className="w-16 h-16 rounded-2xl bg-cosmos-pink/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-cosmos-pink" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Credits & Acknowledgments
            </h1>
            <p className="text-gray-400">
              Cosmos Collective is built upon the incredible work of many organisations and open source projects.
            </p>
          </div>

          {/* Data Sources */}
          <Card padding="lg" className="mb-8">
            <CardContent>
              <h2 className="text-2xl font-semibold text-white mb-6">Data Sources</h2>
              <p className="text-gray-300 mb-6">
                The astronomical data and imagery displayed in Cosmos Collective comes from these
                world-class institutions and archives:
              </p>
              <div className="space-y-4">
                {dataSources.map((source) => (
                  <div
                    key={source.name}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-lg font-semibold text-cosmos-cyan hover:underline"
                        >
                          {source.name}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <p className="text-gray-400 mt-1">{source.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Imagery Credits */}
          <Card padding="lg" className="mb-8">
            <CardContent>
              <h2 className="text-2xl font-semibold text-white mb-6">Imagery Credits</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-white">James Webb Space Telescope:</strong>{' '}
                  Images credited to NASA, ESA, CSA, and STScI. JWST imagery is generally
                  in the public domain.
                </p>
                <p>
                  <strong className="text-white">Hubble Space Telescope:</strong>{' '}
                  Images credited to NASA, ESA, and STScI. Hubble imagery is generally
                  in the public domain.
                </p>
                <p>
                  <strong className="text-white">Australian Telescopes:</strong>{' '}
                  Radio astronomy imagery from CSIRO&apos;s ASKAP, Parkes (Murriyang),
                  and ATCA telescopes. Credit: CSIRO.
                </p>
                <p>
                  <strong className="text-white">NASA APOD:</strong>{' '}
                  Daily featured images include credit to individual astronomers,
                  observatories, and space agencies as noted in each image&apos;s details.
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  All imagery is used in accordance with the respective organisations&apos; media
                  usage policies. For specific image credits, please refer to the original
                  data source.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card padding="lg" className="mb-8">
            <CardContent>
              <h2 className="text-2xl font-semibold text-white mb-6">Open Source Technologies</h2>
              <p className="text-gray-300 mb-6">
                Cosmos Collective is built with these amazing open source tools and frameworks:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {technologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <a
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-white hover:text-cosmos-cyan transition-colors"
                    >
                      {tech.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-sm text-gray-400 mt-1">{tech.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <Card padding="lg" className="mb-8">
            <CardContent>
              <h2 className="text-2xl font-semibold text-white mb-6">Infrastructure</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infrastructure.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-white hover:text-cosmos-cyan transition-colors"
                    >
                      {item.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Thanks */}
          <Card padding="lg" className="mb-8">
            <CardContent>
              <h2 className="text-2xl font-semibold text-white mb-6">Special Thanks</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To the scientists, engineers, and teams behind the James Webb Space Telescope,
                  Hubble Space Telescope, and ground-based observatories around the world who
                  make these incredible observations possible.
                </p>
                <p>
                  To the Zooniverse team and the millions of citizen scientists who contribute
                  to astronomical research through volunteer classification.
                </p>
                <p>
                  To the open source community for building and maintaining the tools that
                  make projects like this possible.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* License */}
          <Card padding="lg">
            <CardContent>
              <h2 className="text-2xl font-semibold text-white mb-4">License</h2>
              <p className="text-gray-300 mb-4">
                Cosmos Collective is open source software released under the MIT License.
              </p>
              <a
                href="https://github.com/m4cd4r4/cosmos-collective-v2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cosmos-cyan hover:underline"
              >
                View source code on GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
