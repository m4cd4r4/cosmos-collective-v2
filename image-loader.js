/**
 * Custom Image Loader for Next.js
 * Handles NASA API images with fallback and error handling
 */

export default function customImageLoader({ src, width, quality }) {
  const isProduction = process.env.NODE_ENV === 'production'
  const isNASA = src.includes('nasa.gov') || src.includes('images-assets.nasa.gov')
  const isExternalImage = src.includes('stsci.edu') || src.includes('casda.csiro.au')

  // In production, use proxy for external images to handle timeouts/CORS
  if (isProduction && (isNASA || isExternalImage)) {
    const encodedSrc = encodeURIComponent(src)
    const params = [`url=${encodedSrc}`, `w=${width}`]
    if (quality) {
      params.push(`q=${quality}`)
    }
    return `/api/image-proxy?${params.join('&')}`
  }

  // In development or for internal images, return original URL
  if (isNASA || isExternalImage) {
    return src
  }

  // For all other images, use default Next.js optimization
  const params = [`w=${width}`]
  if (quality) {
    params.push(`q=${quality}`)
  }

  return `${src}?${params.join('&')}`
}
