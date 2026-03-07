'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { getDevlogPosts } from '@/lib/devlog'

interface LogLine {
  date: string
  title: string
}

export function DevlogWidget() {
  const [lines, setLines] = useState<LogLine[]>([])
  const [typingLine, setTypingLine] = useState('')
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pausing'>('typing')
  const containerRef = useRef<HTMLDivElement>(null)

  // Load posts on mount
  const postsRef = useRef<LogLine[]>([])
  const [loaded, setLoaded] = useState(false)

  useMemo(() => {
    getDevlogPosts().then(posts => {
      postsRef.current = posts.slice(0, 8).map(p => ({
        date: p.date.slice(0, 10),
        title: p.title,
      }))
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded || postsRef.current.length === 0) return

    const post = postsRef.current[lineIndex % postsRef.current.length]
    const fullText = `> ${post.date}  ${post.title}`

    if (phase === 'typing') {
      if (charIndex >= fullText.length) {
        // Done typing this line, pause before moving on
        setPhase('pausing')
        return
      }
      const raf = requestAnimationFrame(() => {
        setTimeout(() => {
          setTypingLine(fullText.slice(0, charIndex + 1))
          setCharIndex(c => c + 1)
        }, 25)
      })
      return () => cancelAnimationFrame(raf)
    }

    if (phase === 'pausing') {
      const timeout = setTimeout(() => {
        // Push completed line and start next
        setLines(prev => [...prev.slice(-4), { date: post.date, title: post.title }])
        setTypingLine('')
        setCharIndex(0)
        setLineIndex(i => i + 1)
        setPhase('typing')
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [loaded, lineIndex, charIndex, phase])

  return (
    <div className="absolute inset-0 bg-[#050810] p-3 flex flex-col overflow-hidden font-mono">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]/50" />
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]/50" />
          <span className="w-2 h-2 rounded-full bg-[#22c55e]/50" />
        </div>
        <span className="text-[8px] uppercase tracking-[0.15em] text-[#22c55e]/30">devlog feed</span>
      </div>

      {/* Scrolling lines */}
      <div ref={containerRef} className="flex-1 overflow-hidden flex flex-col justify-end">
        {lines.map((line, i) => (
          <div key={`${line.date}-${i}`} className="text-[10px] leading-relaxed text-[#22c55e]/50 truncate transition-transform duration-300">
            {'>'} {line.date}  {line.title}
          </div>
        ))}

        {/* Currently typing line */}
        <div className="text-[10px] leading-relaxed text-[#22c55e]/80 truncate">
          {typingLine}
          <span className="animate-typing-cursor text-[#22c55e]">_</span>
        </div>
      </div>
    </div>
  )
}
