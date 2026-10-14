/**
 * Screenshot the pruned pages at 1440 and 390 over raw CDP.
 *
 * One-off verification helper for the page-prune PR. Get the debug port from
 * PortPilot (start_browser), then:
 *   node scripts/shot-prune.mjs 9222 3097
 * Output lands in screenshots/prune/ (gitignored).
 */

import { mkdirSync, writeFileSync } from 'node:fs'

const CDP_PORT = process.argv[2] ?? '9222'
const APP_PORT = process.argv[3] ?? '3097'
const OUT = 'screenshots/prune'

const PAGES = [
  ['home', '/'],
  ['explore-gallery', '/explore'],
  ['explore-webb', '/explore?view=webb'],
  ['events', '/events'],
  ['events-spacecraft', '/events#spacecraft'],
]
const VIEWPORTS = [
  ['1440', 1440, 900],
  ['390', 390, 844],
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function listTargets() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
  return res.json()
}

async function newTab(url) {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
  if (res.ok) return res.json()
  // Older builds only accept GET on /json/new
  const fallback = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(url)}`)
  return fallback.json()
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result ?? {})
      pending.delete(msg.id)
    }
  })
  const ready = new Promise(res => ws.addEventListener('open', res))
  return {
    ready,
    send: (method, params = {}) =>
      new Promise(res => {
        const myId = ++id
        pending.set(myId, res)
        ws.send(JSON.stringify({ id: myId, method, params }))
      }),
    close: () => ws.close(),
  }
}

mkdirSync(OUT, { recursive: true })

const tab = await newTab('about:blank')
const cdp = connect(tab.webSocketDebuggerUrl)
await cdp.ready
await cdp.send('Page.enable')
await cdp.send('Network.enable')
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

for (const [vpName, width, height] of VIEWPORTS) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 500,
  })
  for (const [name, path] of PAGES) {
    await cdp.send('Page.navigate', { url: `http://localhost:${APP_PORT}${path}` })
    await sleep(11000)
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
    const file = `${OUT}/${name}-${vpName}.png`
    writeFileSync(file, Buffer.from(data, 'base64'))
    console.log('wrote', file)
  }
}

await cdp.send('Emulation.clearDeviceMetricsOverride')
cdp.close()
await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${tab.id}`)
console.log('done')
void listTargets
