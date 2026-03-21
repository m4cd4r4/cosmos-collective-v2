/**
 * Captures the solar system Vortex preset as PNG frames,
 * then encodes to an optimised looping video (WebM + MP4) and a GIF fallback.
 *
 * Usage: node scripts/capture-vortex.js [vortex|moon-watch]
 */

const { chromium } = require('playwright')
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const PRESET = process.argv[2] || 'vortex'
const DURATION_MS = 5200       // capture slightly longer than 5s for clean loop
const FPS = 15                 // 15fps is smooth and file-efficient
const FRAME_INTERVAL = Math.round(1000 / FPS)
const TOTAL_FRAMES = Math.ceil(DURATION_MS / FRAME_INTERVAL)
const WIDTH = 1100
const HEIGHT = 619             // 16:9
const FRAMES_DIR = path.resolve(__dirname, `../tmp-frames-${PRESET}`)
const OUT_DIR   = path.resolve(__dirname, '../public/images')
const OUT_GIF   = path.join(OUT_DIR, `hero-${PRESET}.gif`)
const OUT_WEBM  = path.join(OUT_DIR, `hero-${PRESET}.webm`)
const OUT_MP4   = path.join(OUT_DIR, `hero-${PRESET}.mp4`)

const BRAVE = 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'
const hasBrave = fs.existsSync(BRAVE)

async function main() {
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true })
  fs.mkdirSync(FRAMES_DIR, { recursive: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log(`Launching ${hasBrave ? 'Brave' : 'Chromium'}...`)

  const browser = await chromium.launch({
    headless: false,
    executablePath: hasBrave ? BRAVE : undefined,
    args: [
      '--no-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--ignore-gpu-blacklist',
    ],
  })

  const page = await browser.newPage()
  await page.setViewportSize({ width: WIDTH, height: HEIGHT })

  const url = 'https://cosmos-collective.com.au/solar-system'
  console.log(`Loading ${url} ...`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

  await page.waitForSelector('iframe', { timeout: 15000 })

  // Wait for canvas
  console.log('Waiting for WebGL canvas...')
  const iframeEl = await page.$('iframe')
  const iframeFrame = await iframeEl.contentFrame()
  await iframeFrame.waitForSelector('canvas', { timeout: 20000 })

  // Let Three.js and textures load
  console.log('Warming up (5s)...')
  await page.waitForTimeout(5000)

  // Activate preset
  console.log(`Preset: ${PRESET}`)
  await iframeFrame.evaluate((preset) => {
    const btn = document.querySelector(`.preset-btn[data-preset="${preset}"]`)
    if (btn) btn.click()
  }, PRESET)

  // Let camera settle
  await page.waitForTimeout(3000)

  // Capture
  console.log(`Capturing ${TOTAL_FRAMES} frames @ ${FPS}fps ...`)
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const fp = path.join(FRAMES_DIR, `frame-${String(i).padStart(4, '0')}.png`)
    await page.screenshot({ path: fp, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } })
    if (i < TOTAL_FRAMES - 1) await page.waitForTimeout(FRAME_INTERVAL)
    process.stdout.write(`  ${i + 1}/${TOTAL_FRAMES}\r`)
  }
  console.log(`\nCaptured ${TOTAL_FRAMES} frames.`)
  await browser.close()

  const inputPattern = path.join(FRAMES_DIR, 'frame-%04d.png').replace(/\\/g, '/')

  // ── WebM (VP9) — best quality/size, modern browsers ──────────────────────
  console.log('Encoding WebM (VP9)...')
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${inputPattern}" ` +
    `-c:v libvpx-vp9 -crf 38 -b:v 0 -vf "fps=${FPS},scale=${WIDTH}:-2" ` +
    `-pix_fmt yuv420p -auto-alt-ref 0 -loop 0 "${OUT_WEBM}"`,
    { stdio: 'inherit' }
  )

  // ── MP4 (H.264) — Safari/iOS fallback ────────────────────────────────────
  console.log('Encoding MP4 (H.264)...')
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${inputPattern}" ` +
    `-c:v libx264 -crf 28 -preset fast -vf "fps=${FPS},scale=${WIDTH}:-2" ` +
    `-pix_fmt yuv420p -movflags +faststart "${OUT_MP4}"`,
    { stdio: 'inherit' }
  )

  // ── GIF — true fallback for anything that can't play video ───────────────
  console.log('Building GIF palette...')
  const palette = path.join(FRAMES_DIR, 'palette.png').replace(/\\/g, '/')
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${inputPattern}" ` +
    `-vf "fps=${FPS},scale=900:-1:flags=lanczos,palettegen=stats_mode=diff:max_colors=128" ` +
    `-update 1 "${palette}"`,
    { stdio: 'inherit' }
  )
  console.log('Encoding GIF...')
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${inputPattern}" -i "${palette}" ` +
    `-filter_complex "fps=${FPS},scale=900:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" ` +
    `-loop 0 "${OUT_GIF}"`,
    { stdio: 'inherit' }
  )

  // Cleanup frames
  fs.rmSync(FRAMES_DIR, { recursive: true })

  const sz = (f) => (fs.statSync(f).size / 1024).toFixed(0) + 'KB'
  console.log(`\nDone!`)
  console.log(`  WebM : ${OUT_WEBM} (${sz(OUT_WEBM)})`)
  console.log(`  MP4  : ${OUT_MP4}  (${sz(OUT_MP4)})`)
  console.log(`  GIF  : ${OUT_GIF}  (${sz(OUT_GIF)})`)
}

main().catch(err => { console.error(err); process.exit(1) })
