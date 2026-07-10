'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function FeatureParallax({
  children,
  offset = 40,
}: {
  children: React.ReactNode
  offset?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // drifts against scroll direction the whole time it's on screen
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])

  return (
    <div ref={ref}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
