// Audit: does each JWST/Hubble tile's image actually show its target?
// Usage: node scripts/audit-explore-images.mjs <out.json>
// For every distinct NASA image id used by mast-api.ts it reads the NASA Images API
// title/description/keywords, then flags tiles whose name or aliases appear nowhere in them.
// A flag means "look at it", not "wrong": a human still reads the image.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'

const out = process.argv[2] || 'image-audit.json'
const src = fs.readFileSync('src/services/mast-api.ts', 'utf8')
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const tmp = path.join(os.tmpdir(), `mast-api-audit-${process.pid}.cjs`)
fs.writeFileSync(tmp, js)
const mast = createRequire(import.meta.url)(tmp)
fs.unlinkSync(tmp)

const tiles = [...mast.getFeaturedJWSTImages(), ...mast.getFeaturedHubbleImages()]
const nasaId = (u) => u?.match(/\/image\/([^/]+)\//)?.[1]
const ids = [...new Set(tiles.map((t) => nasaId(t.images.thumbnail)).filter(Boolean))]

const meta = {}
for (const id of ids) {
  try {
    const r = await fetch(`https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(id)}`)
    const d = (await r.json()).collection?.items?.[0]?.data?.[0]
    meta[id] = d ? { title: d.title, description: d.description || '', keywords: (d.keywords || []).join(' ') } : null
  } catch (e) {
    meta[id] = null
  }
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
const GENERIC = new Set(['galaxy', 'nebula', 'field', 'deep', 'cluster', 'system', 'the', 'of', 'survey', 'dwarf', 'disc', 'disk', 'jwst', 'webb'])

const rows = tiles.map((t) => {
  const id = nasaId(t.images.thumbnail)
  const m = id ? meta[id] : null
  const names = [t.targetName, ...(t.aliases || [])]
  const phrases = names.flatMap((n) => [n, n.replace(/\(.*?\)/g, '')]).map(norm).filter((p) => p.length >= 3 && !GENERIC.has(p))
  // distinctive word tokens too ("Carina", "Sombrero", "Triangulum")
  const tokens = names.flatMap((n) => n.split(/[^A-Za-z0-9]+/)).filter((w) => w.length >= 4 && !GENERIC.has(w.toLowerCase())).map(norm)
  const hay = m ? norm(`${m.title} ${m.description} ${m.keywords}`) : ''
  const hit = m && (phrases.some((p) => hay.includes(p)) || tokens.some((w) => hay.includes(w)))
  const sharedWith = tiles.filter((o) => o.id !== t.id && o.images.thumbnail === t.images.thumbnail).map((o) => o.targetName)
  return {
    id: t.id, name: t.targetName, aliases: t.aliases || [], source: t.source, category: t.category, nasaId: id,
    nasaTitle: m?.title ?? null,
    verdict: !m ? 'NO-METADATA' : hit ? 'ok' : 'FLAG',
    sharedWith,
  }
})

fs.writeFileSync(out, JSON.stringify(rows, null, 2))
const count = (v) => rows.filter((r) => r.verdict === v).length
console.log(`tiles ${rows.length}, distinct ids ${ids.length}: ok ${count('ok')}, FLAG ${count('FLAG')}, NO-METADATA ${count('NO-METADATA')}`)
