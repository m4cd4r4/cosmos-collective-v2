'use client'

/**
 * Theme Toggle Button
 * Allows users to switch between dark/light/system themes
 */

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        aria-label="Toggle theme"
        title={`Current theme: ${theme}`}
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : theme === 'light' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
