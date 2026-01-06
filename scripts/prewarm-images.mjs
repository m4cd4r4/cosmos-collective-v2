/**
 * Image Pre-warming Script
 * Pre-fetches critical images to warm up Vercel CDN cache
 * Run as part of build process or manually: node scripts/prewarm-images.mjs
 */

// Critical images that should be pre-cached
// These are the most commonly viewed images on the homepage and key pages
const CRITICAL_IMAGES = [
  // Homepage hero images (most important)
  'https://images-assets.nasa.gov/image/PIA12567/PIA12567~medium.jpg',
  'https://images-assets.nasa.gov/image/PIA23122/PIA23122~medium.jpg',

  // Featured JWST observations
  'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001327/GSFC_20171208_Archive_e001327~medium.jpg',
  'https://mast.stsci.edu/api/v0.1/Download/file?uri=mast:JWST/product/jw02731-o001_t001_nircam_clear-f200w_i2d.jpg',

  // Popular targets from Explore page
  'https://images-assets.nasa.gov/image/PIA03606/PIA03606~medium.jpg', // Crab Nebula
  'https://images-assets.nasa.gov/image/PIA01322/PIA01322~medium.jpg', // Eagle Nebula
]

const PRODUCTION_URL = 'https://cosmos-collective.com.au'
const DEV_URL = 'http://localhost:3000'

async function prewarmImage(imageUrl, baseUrl) {
  const encodedUrl = encodeURIComponent(imageUrl)
  const proxyUrl = `${baseUrl}/api/image-proxy?url=${encodedUrl}&w=640`

  try {
    console.log(`🔥 Pre-warming: ${imageUrl.substring(0, 60)}...`)

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cosmos-Collective-Prewarm/1.0',
      },
    })

    if (response.ok) {
      const size = parseInt(response.headers.get('content-length') || '0')
      const cached = response.headers.get('x-vercel-cache') === 'HIT'
      console.log(`   ✅ ${response.status} - ${(size / 1024).toFixed(1)}KB ${cached ? '(cached)' : '(fresh)'}`)
      return true
    } else {
      console.log(`   ⚠️  ${response.status} - Failed to prewarm`)
      return false
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  const isDev = args.includes('--dev')
  const baseUrl = isDev ? DEV_URL : PRODUCTION_URL

  console.log(`\n🚀 Cosmos Collective - Image Pre-warming`)
  console.log(`📍 Target: ${baseUrl}`)
  console.log(`🖼️  Images to prewarm: ${CRITICAL_IMAGES.length}\n`)

  let successCount = 0
  let failCount = 0

  // Process images sequentially to avoid overwhelming the API
  for (const imageUrl of CRITICAL_IMAGES) {
    const success = await prewarmImage(imageUrl, baseUrl)
    if (success) {
      successCount++
    } else {
      failCount++
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n📊 Pre-warming complete:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📈 Cache hit rate: ${((successCount / CRITICAL_IMAGES.length) * 100).toFixed(1)}%\n`)

  if (failCount > 0) {
    console.log(`⚠️  Some images failed to prewarm. They will be cached on first user request.\n`)
  }
}

main().catch(console.error)
