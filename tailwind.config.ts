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
        // Primary "Cosmic Optimism" Palette
        cosmos: {
          // Deep space backgrounds
          void: '#030014',        // Deepest background
          depth: '#0a0a1a',       // Secondary background
          surface: '#111127',     // Card/panel backgrounds
          elevated: '#1a1a3e',    // Elevated elements

          // Stellar accent colors - Primary
          cyan: {
            DEFAULT: '#06b6d4',
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
            950: '#083344',
          },

          // Solar gold - Secondary accent
          gold: {
            DEFAULT: '#f59e0b',
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },

          // Aurora purple - Tertiary
          purple: {
            DEFAULT: '#a855f7',
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
            950: '#3b0764',
          },

          // Nebula pink - Highlights
          pink: {
            DEFAULT: '#ec4899',
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',
          },

          // Spectrum representation colors
          spectrum: {
            radio: '#22c55e',       // Green for radio waves
            microwave: '#84cc16',   // Yellow-green
            infrared: '#ef4444',    // Red for infrared
            visible: '#f59e0b',     // Gold for visible
            ultraviolet: '#8b5cf6', // Purple for UV
            xray: '#3b82f6',        // Blue for X-ray
            gamma: '#06b6d4',       // Cyan for gamma
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
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.35)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.35)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.35)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.35)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
        'cosmic': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },

      backgroundImage: {
        // Gradient backgrounds
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cosmic': 'linear-gradient(135deg, #030014 0%, #0a0a1a 50%, #111127 100%)',
        'gradient-nebula': 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
        'gradient-stellar': 'linear-gradient(90deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)',
        'gradient-aurora': 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%)',

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
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
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
            boxShadow: `0 0 0 3px ${theme('colors.cosmos.cyan.500')}`,
          },
        },
        '.focus-ring-inset': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `inset 0 0 0 2px ${theme('colors.cosmos.cyan.500')}`,
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
        // Text gradient
        '.text-gradient-stellar': {
          background: 'linear-gradient(90deg, #06b6d4, #a855f7, #ec4899)',
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
          background: theme('colors.cosmos.cyan.500'),
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
