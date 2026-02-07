'use client'

import { useRef } from 'react'
import { motion, useInView, type Variant } from 'framer-motion'

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none'

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: RevealDirection
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
}

const getInitialTransform = (direction: RevealDirection, distance: number): Variant => {
  switch (direction) {
    case 'up': return { opacity: 0, y: distance }
    case 'down': return { opacity: 0, y: -distance }
    case 'left': return { opacity: 0, x: distance }
    case 'right': return { opacity: 0, x: -distance }
    case 'none': return { opacity: 0 }
  }
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 30,
  once = true,
  className,
  as = 'div',
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-80px 0px' })

  const Component = motion[as]

  return (
    <Component
      ref={ref}
      initial={getInitialTransform(direction, distance)}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : getInitialTransform(direction, distance)}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </Component>
  )
}

interface StaggerChildrenProps {
  children: React.ReactNode
  stagger?: number
  direction?: RevealDirection
  className?: string
}

export function StaggerChildren({
  children,
  stagger = 0.1,
  direction = 'up',
  className,
}: StaggerChildrenProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  direction = 'up',
  distance = 24,
  className,
}: {
  children: React.ReactNode
  direction?: RevealDirection
  distance?: number
  className?: string
}) {
  const initial = getInitialTransform(direction, distance)

  return (
    <motion.div
      variants={{
        hidden: initial,
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
