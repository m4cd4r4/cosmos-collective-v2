// Build a local index of ESA/Webb images (id, title, object names, credit, CDN urls).
// Usage: node scripts/crawl-esawebb-index.mjs <out.json>
// ESA/Webb images are CC BY 4.0: credit "ESA/Webb, NASA, CSA, ..." must travel with each image.
import fs from 'node:fs'

const out = process.argv[2]
const H = { 'user-agent': 'Mozilla/5.0 (cosmos-collective image audit)' }
const get = async (u) => {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { headers: H, signal: AbortSignal.timeout(20000) })
      if (r.ok) return await r.text()
    } catch {}
  }
  return null
}

const ids = new Set()
for (let page = 1; page <= 80; page++) {
  const html = await get(`https://esawebb.org/images/archive/search/page/${page}/?query=`)
  if (!html) break
  const found = [...html.matchAll(/\/images\/([A-Za-z0-9-]*\d[A-Za-z0-9-]*)\//g)].map((m) => m[1])
  const before = ids.size
  found.forEach((i) => ids.add(i))
  process.stdout.write(`p${page}:${ids.size - before} `)
  if (ids.size === before) break
}
console.log(`\nids ${ids.size}`)

const rows = []
const queue = [...ids]
async function worker() {
  while (queue.length) {
    const id = queue.pop()
    const html = await get(`https://esawebb.org/images/${id}/`)
    if (!html) { rows.push({ id, error: true }); continue }
    const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
    rows.push({
      id,
      title: strip(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '').replace(/\s*\|\s*ESA\/Webb$/, ''),
      names: [...html.matchAll(/Ident=([^"&]+)"/g)].map((m) => decodeURIComponent(m[1]).replace(/\+/g, ' ')),
      credit: strip(html.match(/Credit:([\s\S]{0,300}?)<h2/)?.[1] || ''),
      screen: `https://cdn.esawebb.org/archives/images/screen/${id}.jpg`,
      large: `https://cdn.esawebb.org/archives/images/large/${id}.jpg`,
    })
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
fs.writeFileSync(out, JSON.stringify(rows.sort((a, b) => a.id.localeCompare(b.id)), null, 2))
console.log(`indexed ${rows.filter((r) => !r.error).length}, errors ${rows.filter((r) => r.error).length}`)
