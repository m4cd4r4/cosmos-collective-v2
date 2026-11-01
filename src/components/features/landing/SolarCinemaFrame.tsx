'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The real solar system app in Cinema, behind the card's poster image.
 * Desktop only: phones and reduced motion keep the poster. Loads as the card
 * nears the screen, pauses when it leaves, and stays hidden until the app says
 * it has loaded. The app gives itself up on a device too slow to run it.
 */

const EMBED_URL = '/solar-system/index.html?embed=1'

export function SolarCinemaFrame() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const onScreenRef = useRef(false)
  const [load, setLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 1024) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tellPaused = () => {
      frameRef.current?.contentWindow?.postMessage(
        { solarEmbedPaused: !onScreenRef.current },
        window.location.origin,
      )
    }

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.source !== frameRef.current?.contentWindow) return
      if (e.data === 'solar-embed-ready') {
        setReady(true)
        tellPaused() // it may have scrolled away while loading
      }
      if (e.data === 'solar-embed-slow') setSlow(true)
    }
    window.addEventListener('message', onMessage)

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreenRef.current = entry.isIntersecting
        if (entry.isIntersecting) setLoad(true)
        tellPaused()
      },
      { rootMargin: '200px' },
    )
    if (wrapRef.current) observer.observe(wrapRef.current)

    return () => {
      observer.disconnect()
      window.removeEventListener('message', onMessage)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 transition-opacity duration-700 ${ready && !slow ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      {load && !slow && (
        <iframe
          ref={frameRef}
          src={EMBED_URL}
          title=""
          tabIndex={-1}
          className="w-full h-full border-0 pointer-events-none bg-black"
        />
      )}
    </div>
  )
}
