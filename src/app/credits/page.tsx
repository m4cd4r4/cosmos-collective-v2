/**
 * Credits Page — app-style full-window panel
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Heart, ExternalLink, Database, Cpu, Server, Github } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Credits',
  description: 'Acknowledgments and credits for Cosmos Collective - data sources, tools, and contributors.',
}

const dataSources = [
  { name: 'NASA', url: 'https://www.nasa.gov/', description: 'Astronomy Picture of the Day, ISS tracking data, and public domain imagery.' },
  { name: 'STScI / MAST', url: 'https://mast.stsci.edu/', description: 'Mikulski Archive for Space Telescopes — JWST and Hubble observation data and imagery.' },
  { name: 'ESA', url: 'https://www.esa.int/', description: 'European Space Agency — partner agency for JWST and Hubble.' },
  { name: 'CSA', url: 'https://www.asc-csa.gc.ca/', description: 'Canadian Space Agency — partner agency for the James Webb Space Telescope.' },
  { name: 'CSIRO', url: 'https://www.csiro.au/', description: 'Commonwealth Scientific and Industrial Research Organisation — Australian telescope data.' },
  { name: 'ATNF / CASDA', url: 'https://research.csiro.au/casda/', description: 'Australia Telescope National Facility and CSIRO ASKAP Science Data Archive.' },
  { name: 'CDS Strasbourg', url: 'https://cds.u-strasbg.fr/', description: 'Aladin Lite sky map viewer and SIMBAD astronomical database.' },
  { name: 'Where Is The ISS', url: 'https://wheretheiss.at/', description: 'Real-time International Space Station tracking API.' },
]

const technologies = [
  { name: 'Next.js', url: 'https://nextjs.org/', description: 'React framework for production-grade web applications.' },
  { name: 'React', url: 'https://react.dev/', description: 'JavaScript library for building user interfaces.' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org/', description: 'Typed superset of JavaScript for enhanced developer experience.' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', description: 'Utility-first CSS framework for rapid UI development.' },
  { name: 'TanStack Query', url: 'https://tanstack.com/query/', description: 'Powerful asynchronous state management for data fetching.' },
  { name: 'Framer Motion', url: 'https://www.framer.com/motion/', description: 'Production-ready motion library for React.' },
  { name: 'Lucide', url: 'https://lucide.dev/', description: 'Beautiful and consistent icon library.' },
  { name: 'Aladin Lite', url: 'https://aladin.cds.unistra.fr/AladinLite/', description: 'Lightweight sky atlas for embedding in web pages.' },
]

const infrastructure = [
  { name: 'Vercel', url: 'https://vercel.com/', description: 'Platform for deploying and hosting Next.js applications.' },
  { name: 'GitHub', url: 'https://github.com/', description: 'Source code hosting and version control.' },
]

function CreditRow({ name, url, description }: { name: string; url: string; description: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-[rgba(212,175,55,0.06)] last:border-0 hover:bg-white/[0.02] transition-colors group">
      <div className="flex-1 min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#d4af37] hover:text-[#e0c060] transition-colors group-hover:underline"
        >
          {name}
          <ExternalLink className="w-3 h-3 opacity-60" />
          <span className="sr-only">(opens in new tab)</span>
        </a>
        <p className="text-[11px] text-[#4a5580] mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color }}>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function CreditsPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0e1a] text-[#c8d4f0] font-mono">
      <Header />

      {/* App Header Strip */}
      <div className="bg-[rgba(4,6,18,0.97)] border-b border-[rgba(212,175,55,0.15)] px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Heart className="w-4 h-4 text-[#e040fb]" />
          <span className="text-base font-bold tracking-[0.15em] uppercase text-[#e0e8ff]">Credits</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#d4af37]">Open Source</span>
          </div>
        </div>
        <span className="hidden sm:block text-[9px] uppercase tracking-wider text-[#4a5580]">
          Acknowledgments &amp; Attributions
        </span>
      </div>

      {/* Stats Bar */}
      <div className="bg-[rgba(8,12,28,0.9)] border-b border-[rgba(212,175,55,0.08)] flex shrink-0">
        {[
          { label: 'Data Sources', value: String(dataSources.length), color: '#d4af37' },
          { label: 'Technologies', value: String(technologies.length), color: '#4a90e2' },
          { label: 'Infrastructure', value: String(infrastructure.length), color: '#4caf93' },
          { label: 'License', value: 'MIT', color: '#e040fb' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center px-6 lg:px-10 py-2 border-r border-[rgba(212,175,55,0.06)] last:border-0">
            <span className="text-lg sm:text-xl font-bold" style={{ color }}>{value}</span>
            <span className="text-[9px] uppercase tracking-[0.13em] text-[#4a5580] mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-auto px-4 sm:px-5 py-5 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Data Sources */}
          <Section title="Data Sources" icon={Database} color="#d4af37">
            {dataSources.map(s => <CreditRow key={s.name} {...s} />)}
          </Section>

          {/* Technologies */}
          <Section title="Open Source Technologies" icon={Cpu} color="#4a90e2">
            {technologies.map(t => <CreditRow key={t.name} {...t} />)}
          </Section>

          {/* Infrastructure + Imagery + Thanks + License */}
          <div className="space-y-5">
            <Section title="Infrastructure" icon={Server} color="#4caf93">
              {infrastructure.map(i => <CreditRow key={i.name} {...i} />)}
            </Section>

            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-[#e040fb]" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#e040fb]">Special Thanks</span>
              </div>
              <div className="px-4 py-4 space-y-3">
                <div>
                  <p className="text-[11px] text-[#6070a0] leading-relaxed">
                    To the scientists, engineers, and teams behind{' '}
                    <a href="https://webbtelescope.org/" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:text-[#e0c060] hover:underline transition-colors">JWST<span className="sr-only"> (opens in new tab)</span></a>,{' '}
                    <a href="https://hubblesite.org/" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:text-[#e0c060] hover:underline transition-colors">Hubble<span className="sr-only"> (opens in new tab)</span></a>, and ground-based observatories worldwide who make these incredible observations possible.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#6070a0] leading-relaxed">
                    To the{' '}
                    <a href="https://opensource.org/" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:text-[#e0c060] hover:underline transition-colors">open source community<span className="sr-only"> (opens in new tab)</span></a>{' '}
                    for building and maintaining the tools that make projects like this possible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Imagery + License */}
          <div className="space-y-5">
            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <span className="w-3.5 h-3.5 text-[10px] text-[#f59e0b]">✦</span>
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#f59e0b]">Imagery Credits</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {[
                  { title: 'James Webb Space Telescope', url: 'https://webbtelescope.org/images', body: 'NASA, ESA, CSA, and STScI. JWST imagery is generally in the public domain.' },
                  { title: 'Hubble Space Telescope', url: 'https://hubblesite.org/images/gallery', body: 'NASA, ESA, and STScI. Hubble imagery is generally in the public domain.' },
                  { title: 'Australian Telescopes', url: 'https://www.csiro.au/en/about/facilities-collections/atnf', body: 'CSIRO ASKAP, Parkes (Murriyang), and ATCA. Credit: CSIRO.' },
                  { title: 'NASA APOD', url: 'https://apod.nasa.gov/', body: 'Credit to individual astronomers, observatories, and agencies as noted per image.' },
                  { title: 'Solar System Scope Textures', url: 'https://www.solarsystemscope.com/textures/', body: 'Planetary and lunar surface textures used in the 3D Solar System viewer. Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).' },
                ].map(({ title, url, body }) => (
                  <div key={title} className="border-b border-[rgba(212,175,55,0.06)] last:border-0 pb-2.5 last:pb-0">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#d4af37] hover:text-[#e0c060] transition-colors hover:underline"
                    >
                      {title}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                    <div className="text-[10px] text-[#4a5580] mt-0.5 leading-relaxed">{body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[rgba(8,12,28,0.7)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[rgba(212,175,55,0.08)] flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-[#c8d4f0]" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#c8d4f0]">License</span>
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] text-[#6070a0] leading-relaxed mb-3">
                  Cosmos Collective is open source software released under the MIT License.
                </p>
                <a
                  href="https://github.com/m4cd4r4/cosmos-collective-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#d4af37] hover:text-[#e0c060] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  View source on GitHub
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
