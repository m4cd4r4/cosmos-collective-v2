'use client'

/**
 * Skip to Content Link
 * Accessibility feature for keyboard navigation
 * Appears when focused, allows users to skip directly to main content
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      // Using onKeyDown to handle Enter key specifically
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          const main = document.getElementById('main-content')
          if (main) {
            main.focus()
            main.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }}
    >
      Skip to main content
    </a>
  )
}
