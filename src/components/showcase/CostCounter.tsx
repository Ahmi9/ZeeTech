'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

// Rs 8,000/month × 36 months
const TOTAL = 288000

export default function CostCounter() {
  const ref = useRef<HTMLDivElement>(null)
  // number climbs from 0 to TOTAL as the block scrolls into the middle of the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.95', 'center 0.45'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 })
  const display = useTransform(progress, (v) =>
    'Rs ' + Math.round(v * TOTAL).toLocaleString('en-IN')
  )

  return (
    <div ref={ref} className="text-center">
      <p className="text-sm md:text-base font-medium uppercase tracking-[0.18em] text-[var(--sc-muted)] mb-4">
        Three years on Shopify costs you
      </p>
      <motion.p className="text-5xl md:text-8xl font-bold tracking-tight text-[var(--sc-danger)] tabular-nums mb-5">
        {display}
      </motion.p>
      <p className="text-base md:text-lg text-[var(--sc-ink-soft)] max-w-md mx-auto leading-relaxed">
        — in subscription fees alone, before you sell a single item.
        <span className="block mt-1 font-medium text-[var(--sc-accent-dark)]">
          We build it once. You keep your money.
        </span>
      </p>
    </div>
  )
}
