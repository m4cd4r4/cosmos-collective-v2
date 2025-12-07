'use client'

/**
 * Footer Component
 * Site footer with links, credits, and accessibility info
 */

import Link from 'next/link'
import { Github, ExternalLink, Accessibility, Heart, Briefcase } from 'lucide-react'

// ============================================
// Footer Links
// ============================================

const footerLinks = {
  explore: [
    { label: 'JWST Gallery', href: '/explore?source=JWST' },
    { label: 'Australian Telescopes', href: '/explore?source=ASKAP' },
    { label: 'Sky Map', href: '/sky-map' },
    { label: 'Live Events', href: '/events' },
  ],
  community: [
    { label: 'Citizen Science', href: '/citizen-science' },
    { label: 'Leaderboard', href: '/citizen-science/leaderboard' },
  ],
  learn: [
    { label: 'Devlog', href: '/devlog' },
    { label: 'About SKA', href: 'https://www.skao.int/', external: true },
    { label: 'CSIRO Astronomy', href: 'https://www.csiro.au/en/about/facilities-collections/atnf', external: true },
    { label: 'NASA JWST', href: 'https://webb.nasa.gov/', external: true },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Credits', href: '/credits' },
  ],
}

const dataCredits = [
  { name: 'STScI/MAST', url: 'https://mast.stsci.edu/' },
  { name: 'NASA', url: 'https://www.nasa.gov/' },
  { name: 'ESA', url: 'https://www.esa.int/' },
  { name: 'CSIRO', url: 'https://www.csiro.au/' },
  { name: 'Zooniverse', url: 'https://www.zooniverse.org/' },
]

// ============================================
// Footer Component
// ============================================

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-cosmos-depth border-t border-white/10" role="contentinfo">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-xl font-display font-bold text-gradient-stellar">
                Cosmos
              </span>
              <span className="text-xl font-display font-light text-white">
                Collective
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Exploring the universe together through multi-wavelength astronomy
              and citizen science.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/m4cd4r4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://ko-fi.com/m4cd4r4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-cosmos-pink hover:bg-cosmos-pink/10 transition-colors"
                aria-label="Support on Ko-fi"
              >
                <Heart className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Learn</h3>
            <ul className="space-y-2">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Data credits */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <span>Data provided by:</span>
            {dataCredits.map((credit, index) => (
              <span key={credit.name}>
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  {credit.name}
                </a>
                {index < dataCredits.length - 1 && <span className="ml-4">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 bg-cosmos-void/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>© {currentYear} Cosmos Collective</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Built by{' '}
                <a
                  href="https://github.com/m4cd4r4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  m4cd4r4
                </a>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/m4cd4r4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-cosmos-cyan/10 hover:text-cosmos-cyan transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Available for hire</span>
              </a>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/accessibility"
                className="inline-flex items-center gap-1 hover:text-gray-300 transition-colors"
              >
                <Accessibility className="w-4 h-4" />
                <span className="hidden sm:inline">Accessibility</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
