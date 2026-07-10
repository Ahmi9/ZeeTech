'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.4, 1], [0.92, 1, 0.88])
  const y = useTransform(scrollYProgress, [0, 0.4, 1], [40, 0, -60])
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 1], [8, 0, -6])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6])

  return (
    <div ref={ref} style={{ perspective: '1200px' }}>
      <motion.div style={{ scale, y, rotateX, opacity, transformStyle: 'preserve-3d' }}>
        {children}
      </motion.div>
    </div>
  )
}
