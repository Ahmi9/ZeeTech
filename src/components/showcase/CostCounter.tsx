'use client'

import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'

// Rs 8,000+/month × 12 months
const TOTAL = 100000

export default function CostCounter() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-25% 0px -25% 0px' })
  const count = useMotionValue(0)
  const display = useTransform(count, (v) => 'Rs ' + Math.round(v).toLocaleString('en-IN'))

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, TOTAL, { duration: 2, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, count])

  return (
    <div ref={ref} className="text-center">
      <p className="text-sm md:text-base font-medium uppercase tracking-[0.18em] text-[var(--sc-muted)] mb-4">
        One year on Shopify costs you
      </p>
      <motion.p
        initial={{ opacity: 0, scale: 0.85 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl md:text-8xl font-bold tracking-tight text-[var(--sc-danger)] tabular-nums mb-5"
      >
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
