'use client'

import { motion } from 'framer-motion'

// Slow-drifting glow blobs contained inside the dark final-CTA card.
export default function CtaGlow() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-[9999px]"
        style={{
          width: 420,
          height: 420,
          top: '-35%',
          left: '-8%',
          opacity: 0.4,
          filter: 'blur(48px)',
          background: 'radial-gradient(circle, var(--sc-accent) 0%, transparent 70%)',
        }}
        animate={{ x: [0, 130, 0], y: [0, 50, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-[9999px]"
        style={{
          width: 360,
          height: 360,
          bottom: '-40%',
          right: '-5%',
          opacity: 0.3,
          filter: 'blur(56px)',
          background: 'radial-gradient(circle, var(--sc-accent-dark) 0%, transparent 70%)',
        }}
        animate={{ x: [0, -110, 0], y: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}
