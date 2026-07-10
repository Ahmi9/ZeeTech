'use client'

import { motion } from 'framer-motion'

// Dashed connector drawn left-to-right behind the How It Works cards (md+).
export default function StepsConnector() {
  return (
    <div aria-hidden className="hidden md:block absolute left-[14%] right-[14%] top-[52px] pointer-events-none">
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, margin: '-20% 0px' }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 100 10" fill="none" preserveAspectRatio="none" className="w-full h-10 overflow-visible">
          <path
            d="M 0 5 Q 25 -3 50 5 T 100 5"
            stroke="var(--sc-accent)"
            strokeWidth="1.5"
            strokeDasharray="5 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>
    </div>
  )
}
