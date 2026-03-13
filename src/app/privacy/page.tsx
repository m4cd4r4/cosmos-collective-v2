/**
 * Privacy Policy Page — app-style full-window panel
 */

import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Shield, Database, Globe, BarChart2, Github, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Cosmos Collective - how we handle your data.',
}

const principles = [
  { label: 'No account required', detail: 'All features are accessible without signing in' },
  { label: 'Local storage only', detail: 'Preferences and favourites are stored in your browser' },
  { label: 'No tracking cookies', detail: 'We do not use advertising or tracking cookies' },
  { label: 'No personal data', detail: 'We do not collect names, emails, or personal information' },
]

const thirdParty = [
  { name: 'NASA APIs', detail: 'Astronomy Picture of the Day, ISS tracking' },
  { name: 'YouTube', detail: 'ISS live camera embeds (subject to YouTube/Google privacy policy)' },
  { name: 'Aladin Lite (CDS)', detail: 'Interactive sky map' },
]

const localStorage = [
  'Your favourited observations',
  'Display preferences (view mode, sort order)',
]

function SectionHeader({ icon: Icon, title, color }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, title: string; color: string }) {
  return (
    <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color }}>{title}</span>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-[#4a90e2]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Privacy Policy</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(74,144,226,0.12)] border border-[rgba(74,144,226,0.25)]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#4a90e2]">Privacy-First</span>
          </div>
        </div>
        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-[#4a5580]">
          Last updated: Dec 7, 2025
        </span>
      </div>

      {/* Stats Bar */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {[
          { label: 'Data Collected', value: 'None', color: '#4caf93' },
          { label: 'Cookies', value: '0', color: '#4caf93' },
          { label: '3rd Parties', value: String(thirdParty.length), color: '#f59e0b' },
          { label: 'Local Storage', value: String(localStorage.length) + ' items', color: '#4a90e2' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-6 lg:px-10 py-2 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
            <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Privacy Principles */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
            <SectionHeader icon={Shield} title="Privacy Principles" color="#4a90e2" />
            <div className="px-4 py-4">
              <p className="text-[11px] text-[#6070a0] leading-relaxed mb-4">
                Cosmos Collective is committed to protecting your privacy. This platform is designed to work without requiring user accounts or personal data collection.
              </p>
              <div className="space-y-2.5">
                {principles.map(({ label, detail }) => (
                  <div key={label} className="flex items-start gap-2.5 py-2 border-b border-[rgba(212,175,55,0.05)] last:border-0">
                    <div className="w-2 h-2 rounded-full bg-[#4caf93] shrink-0 mt-1.5" />
                    <div>
                      <div className="text-[11px] font-semibold text-[#c8d4f0]">{label}</div>
                      <div className="text-[10px] text-[#4a5580] mt-0.5">{detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Third-Party Services */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
            <SectionHeader icon={Globe} title="Third-Party Services" color="#f59e0b" />
            <div className="px-4 py-4">
              <p className="text-[11px] text-[#6070a0] leading-relaxed mb-4">
                Cosmos Collective integrates with external astronomical data services. These services have their own privacy policies.
              </p>
              <div className="space-y-2.5">
                {thirdParty.map(({ name, detail }) => (
                  <div key={name} className="py-2 border-b border-[rgba(212,175,55,0.05)] last:border-0">
                    <div className="text-[11px] font-semibold text-[#c8d4f0]">{name}</div>
                    <div className="text-[10px] text-[#4a5580] mt-0.5">{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Local Data Storage */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
            <SectionHeader icon={Database} title="Local Data Storage" color="#4a90e2" />
            <div className="px-4 py-4">
              <p className="text-[11px] text-[#6070a0] leading-relaxed mb-4">
                We use browser localStorage to save:
              </p>
              <ul className="space-y-2">
                {localStorage.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[11px] text-[#6070a0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a90e2] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-[#4a5580] mt-4 leading-relaxed">
                This data never leaves your browser and can be cleared at any time through your browser settings.
              </p>
            </div>
          </div>

          {/* Analytics + Contact */}
          <div className="space-y-5">
            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <SectionHeader icon={BarChart2} title="Analytics" color="#64d8cb" />
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed">
                  We may use privacy-respecting analytics (such as Vercel Analytics) to understand general usage patterns. This data is aggregated and does not identify individual users.
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
                  If you have questions about this privacy policy, please open an issue on our GitHub repository.
                </p>
                <a
                  href="https://github.com/m4cd4r4/cosmos-collective-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#d4af37] hover:text-[#e0c060] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Open an issue on GitHub
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
