import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Astronomy-Authentic Palette (Based on Real Space Observations)
        cosmos: {
          // Deep space backgrounds (warmer, more depth)
          void: '#0a0e1a',        // Deep space observation
          depth: '#131820',       // Nebula background
          surface: '#1a1f2e',     // Professional panels
          elevated: '#2a2f3e',    // Elevated elements
          border: '#2a2f3e',      // Cosmic dust lanes

          // Primary: Stellar Gold (Real star cores ~5000K)
          gold: {
            DEFAULT: '#d4af37',   // 24k gold - stellar cores
            50: '#fef9e7',
            100: '#fdf3d0',
            200: '#fbe7a1',
            300: '#f8db72',
            400: '#f6cf43',
            500: '#d4af37',        // Primary
            600: '#b8962f',
            700: '#9c7e27',
            800: '#80651f',
            900: '#644c17',
            950: '#48340f',
          },

          // Secondary: Infrared Amber (Spitzer 3.6µm)
          amber: {
            DEFAULT: '#ff9a3c',   // Infrared emissions
            50: '#fff4e6',
            100: '#ffe9cc',
            200: '#ffd399',
            300: '#ffbd66',
            400: '#ffa733',
            500: '#ff9a3c',        // Primary
            600: '#e68a35',
            700: '#cc7a2e',
            800: '#b36a27',
            900: '#995a20',
            950: '#804a19',
          },

          // Tertiary: Reflection Nebulae Blue
          'nebula-blue': {
            DEFAULT: '#4a90e2',   // Reflection nebulae
            50: '#ebf5ff',
            100: '#d6ebff',
            200: '#add6ff',
            300: '#85c2ff',
            400: '#5cadff',
            500: '#4a90e2',        // Primary
            600: '#3d7ac2',
            700: '#3064a2',
            800: '#234e82',
            900: '#163862',
            950: '#092242',
          },

          // Alert: H-alpha Emission (656.3nm)
          hydrogen: {
            DEFAULT: '#ff6b6b',   // H-alpha emission line
            50: '#fff0f0',
            100: '#ffe0e0',
            200: '#ffc2c2',
            300: '#ffa3a3',
            400: '#ff8585',
            500: '#ff6b6b',        // Primary
            600: '#e65d5d',
            700: '#cc4f4f',
            800: '#b34141',
            900: '#993333',
            950: '#802525',
          },

          // Info: Oxygen Emission ([OIII] 496nm)
          oxygen: {
            DEFAULT: '#3b82f6',   // [OIII] emission doublet
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',        // Primary
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },

          // Legacy spectrum colors (for astronomical data viz)
          spectrum: {
            radio: '#22c55e',       // Green for radio waves
            microwave: '#84cc16',   // Yellow-green
            infrared: '#ff9a3c',    // Amber for infrared
            visible: '#d4af37',     // Gold for visible
            ultraviolet: '#3b82f6', // Blue for UV
            xray: '#4a90e2',        // Nebula blue for X-ray
            gamma: '#ff6b6b',       // Hydrogen for gamma
          },
        },

        // Semantic colors with good contrast
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        info: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0891b2',
        },
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'Menlo', 'monospace'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        'glow-gold': '0 4px 16px rgba(212, 175, 55, 0.25)',
        'glow-amber': '0 4px 16px rgba(255, 154, 60, 0.25)',
        'glow-blue': '0 4px 16px rgba(74, 144, 226, 0.25)',
        'glow-hydrogen': '0 4px 16px rgba(255, 107, 107, 0.25)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
        'cosmic': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },

      backgroundImage: {
        // Gradient backgrounds (Astronomy-authentic)
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cosmic': 'linear-gradient(135deg, #0a0e1a 0%, #131820 50%, #1a1f2e 100%)',
        'gradient-nebula': 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)',
        'gradient-stellar': 'linear-gradient(90deg, #d4af37 0%, #ff9a3c 50%, #ff6b6b 100%)',
        'gradient-aurora': 'linear-gradient(180deg, transparent 0%, rgba(212, 175, 55, 0.05) 50%, transparent 100%)',

        // Glass effects
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'glass-strong': 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
      },

      backdropBlur: {
        xs: '2px',
      },

      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },

      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)' },
          '50%': { boxShadow: '0 8px 32px rgba(212, 175, 55, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // Accessibility: Focus ring styles
      ringWidth: {
        '3': '3px',
      },

      // Screen reader utilities already in Tailwind
      // Adding custom z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Aspect ratios for astronomical images
      aspectRatio: {
        'golden': '1.618',
        'ultrawide': '21/9',
        'astronomical': '4/3',
      },

      // Typography scale
      letterSpacing: {
        'widest': '0.2em',
      },
    },
  },
  plugins: [
    // Custom plugin for accessibility focus states
    function({ addUtilities, addComponents, theme }: any) {
      // Focus utilities with high visibility
      addUtilities({
        '.focus-ring': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.cosmos.gold.500')}`,
          },
        },
        '.focus-ring-inset': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `inset 0 0 0 2px ${theme('colors.cosmos.gold.500')}`,
          },
        },
        // High contrast mode utilities
        '.high-contrast': {
          '@media (prefers-contrast: more)': {
            '--tw-text-opacity': '1',
            color: 'white',
            borderColor: 'white',
          },
        },
        // Reduced motion
        '.motion-safe': {
          '@media (prefers-reduced-motion: no-preference)': {
            transition: 'all 0.3s ease',
          },
        },
        '.motion-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            transition: 'none',
          },
        },
      })

      // Glass panel component
      addComponents({
        '.glass-panel': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        '.glass-panel-strong': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        },
        // Text gradient (Astronomy-authentic)
        '.text-gradient-stellar': {
          background: 'linear-gradient(90deg, #d4af37 0%, #ff9a3c 100%)',
          backgroundClip: 'text',
          '-webkit-background-clip': 'text',
          color: 'transparent',
          backgroundSize: '200% auto',
        },
        // Skip link for accessibility
        '.skip-link': {
          position: 'absolute',
          top: '-40px',
          left: '0',
          background: theme('colors.cosmos.gold.500'),
          color: 'white',
          padding: '8px 16px',
          zIndex: '100',
          textDecoration: 'none',
          '&:focus': {
            top: '0',
          },
        },
      })
    },
  ],
}

export default config
