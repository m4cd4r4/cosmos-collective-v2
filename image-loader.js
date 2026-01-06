/**
 * Custom Image Loader for Next.js
 * Handles NASA API images with fallback and error handling
 */

export default function customImageLoader({ src, width, quality }) {
  // For NASA images, bypass Next.js optimization due to CORS/timeout issues
  if (src.includes('nasa.gov') || src.includes('images-assets.nasa.gov')) {
    // Return original NASA URL without optimization
    return src
  }

  // For all other images, use default Next.js optimization
  const params = [`w=${width}`]
  if (quality) {
    params.push(`q=${quality}`)
  }

  return `${src}?${params.join('&')}`
}
