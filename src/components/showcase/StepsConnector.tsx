'use client'

import { motion } from 'framer-motion'

// Dashed connector drawn left-to-right behind the How It Works cards (md+).
// Runs at the vertical center of the step-number badges; the solid card
// backgrounds sit above it (z-10 grid), so it only shows in the gaps.
export default function StepsConnector() {
  return (
    <div aria-hidden className="hidden md:block absolute left-[16.67%] right-[16.67%] top-[52px] z-0 pointer-events-none">
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, margin: '-20% 0px' }}
        transition={{ duration: 1.3, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 100 2" fill="none" preserveAspectRatio="none" className="block w-full h-[2px]">
          <path
            d="M 0 1 L 100 1"
            stroke="var(--sc-accent)"
            strokeWidth="2"
            strokeDasharray="5 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>
    </div>
  )
}
