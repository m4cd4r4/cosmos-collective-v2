// For each FLAGGED tile in image-audit.json, search the NASA Images API for a real image of that target.
// Usage: node scripts/find-explore-image-candidates.mjs <audit.json> <out.json>
// Candidates are only suggestions: the name must appear in the NASA title or keywords, the ~medium file must
// answer 200, and a human still looks at the contact sheet before anything is applied.
import fs from 'node:fs'

const [auditPath, outPath] = process.argv.slice(2)
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
const flagged = audit.filter((r) => r.verdict === 'FLAG')

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
const GENERIC = new Set(['galaxy', 'nebula', 'field', 'deep', 'cluster', 'system', 'survey', 'disc', 'disk'])

async function search(q) {
  const r = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image`)
  if (!r.ok) return []
  return ((await r.json()).collection?.items || []).slice(0, 12).map((i) => ({
    id: i.data[0].nasa_id,
    title: i.data[0].title,
    center: i.data[0].center || '',
    keywords: (i.data[0].keywords || []).join(' '),
    desc: (i.data[0].description || '').slice(0, 240),
  }))
}

const out = []
for (const t of flagged) {
  // Search strings: the plain name first, then catalogue-style aliases
  const queries = [t.name.replace(/\(.*?\)/g, '').trim(), ...(t.aliases || [])].slice(0, 2)
  const want = [t.name, ...(t.aliases || [])].map(norm).filter((p) => p.length >= 3 && !GENERIC.has(p))
  let best = null
  for (const q of queries) {
    for (const c of await search(q)) {
      const hay = norm(`${c.title} ${c.keywords}`)
      if (!want.some((w) => hay.includes(w))) continue
      const url = `https://images-assets.nasa.gov/image/${c.id}/${c.id}~medium.jpg`
      const head = await fetch(url, { method: 'HEAD' })
      if (head.status !== 200) continue
      best = { ...c, url, q }
      break
    }
    if (best) break
  }
  out.push({ id: t.id, name: t.name, currentNasaId: t.nasaId, currentTitle: t.nasaTitle, candidate: best })
  process.stdout.write(best ? '+' : '.')
}
console.log()
fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log(`flagged ${flagged.length}, candidates found ${out.filter((o) => o.candidate).length}`)
