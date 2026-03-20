/**
 * Terms of Use Page — app-style full-window panel
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { FileText, CheckCircle2, AlertCircle, Scale, Database, Github, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for Cosmos Collective platform.',
}

const permitted = [
  'Browse and explore astronomical data and imagery',
  'Use the interactive sky map, JWST Explorer, Kepler Explorer, and visualisation tools',
  'Access the live events tracker, ISS feed, and real-time space weather data',
  'Access educational content about astronomy and telescopes',
]

const dataSources = [
  'NASA/ESA/CSA James Webb Space Telescope',
  'NASA/ESA Hubble Space Telescope',
  'CSIRO ASKAP and Australian radio telescopes',
  'NASA public APIs',
  'CDS Strasbourg (Aladin Lite, SIMBAD)',
]

function SectionHeader({ icon: Icon, title, color }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, title: string; color: string }) {
  return (
    <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color }}>{title}</span>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-[#d4af37]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Terms of Use</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#d4af37]">MIT Licensed</span>
          </div>
        </div>
        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-[#4a5580]">
          Last updated: Dec 7, 2025
        </span>
      </div>

      {/* Stats Bar */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {[
          { label: 'Permitted Uses', value: String(permitted.length), color: '#4caf93' },
          { label: 'Data Sources', value: String(dataSources.length), color: '#d4af37' },
          { label: 'License', value: 'MIT', color: '#4a90e2' },
          { label: 'Warranties', value: 'None', color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-6 lg:px-10 py-2 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
            <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Acceptance + Permitted Use */}
          <div className="space-y-5">
            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <SectionHeader icon={FileText} title="Acceptance of Terms" color="#d4af37" />
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed">
                  By accessing and using Cosmos Collective, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the platform.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <SectionHeader icon={CheckCircle2} title="Use of the Platform" color="#4caf93" />
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed mb-3">
                  Cosmos Collective is provided for educational and informational purposes. You may:
                </p>
                <ul className="space-y-2">
                  {permitted.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4caf93] shrink-0 mt-0.5" />
                      <span className="text-[11px] text-[#6070a0] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <SectionHeader icon={Database} title="Data Sources" color="#4a90e2" />
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed mb-3">
                  Astronomical data is sourced from:
                </p>
                <ul className="space-y-2">
                  {dataSources.map((src) => (
                    <li key={src} className="flex items-center gap-2.5 text-[11px] text-[#6070a0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a90e2] shrink-0" />
                      {src}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* IP + Disclaimer + Liability + Contact */}
          <div className="space-y-5">

            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <SectionHeader icon={Scale} title="Intellectual Property" color="#e040fb" />
              <div className="px-4 py-4 space-y-3">
                <div>
                  <div className="text-[11px] font-semibold text-[#c8d4f0] mb-1">Astronomical Imagery</div>
                  <p className="text-[10px] text-[#4a5580] leading-relaxed">Images from NASA, ESA, CSA, and STScI are in the public domain or used under their respective policies. Credit is provided where applicable.</p>
                </div>
                <div className="border-t border-[rgba(212,175,55,0.06)] pt-3">
                  <div className="text-[11px] font-semibold text-[#c8d4f0] mb-1">Platform Code</div>
                  <p className="text-[10px] text-[#4a5580] leading-relaxed mb-2">The platform is open source under the MIT License.</p>
                  <a href="https://github.com/m4cd4r4/cosmos-collective-v2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] text-[#d4af37] hover:text-[#e0c060]">
                    <Github className="w-3 h-3" />
                    View on GitHub
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                </div>
                <div className="border-t border-[rgba(212,175,55,0.06)] pt-3">
                  <div className="text-[11px] font-semibold text-[#c8d4f0] mb-1">Third-Party Content</div>
                  <p className="text-[10px] text-[#4a5580] leading-relaxed">Some features embed content from YouTube and CDS Aladin Lite, subject to their respective terms of service.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <SectionHeader icon={AlertCircle} title="Disclaimer" color="#f59e0b" />
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed">
                  Cosmos Collective is provided &quot;as is&quot; without warranties of any kind. We strive for accuracy but cannot guarantee the completeness or reliability of astronomical data displayed. For scientific research, please consult primary data sources.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-[#c8d4f0]" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#c8d4f0]">Contact</span>
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed mb-3">
                  Questions about these terms can be directed to our GitHub issues page.
                </p>
                <a
                  href="https://github.com/m4cd4r4/cosmos-collective-v2/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#d4af37] hover:text-[#e0c060] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Open an issue
                  <ExternalLink className="w-3 h-3 opacity-60" />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
