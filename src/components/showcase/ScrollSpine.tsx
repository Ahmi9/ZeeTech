'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollSpine() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 })

  return (
    <div
      className="hidden md:block"
      style={{
        position: 'fixed',
        top: 0,
        left: '28px',
        height: '100vh',
        width: '2px',
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      {/* faint full-height track */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--sc-border)',
          opacity: 0.6,
        }}
      />
      {/* filled progress, grows from the top as you scroll */}
      <motion.div
        style={{
          scaleY,
          transformOrigin: 'top',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, var(--sc-accent), var(--sc-accent-dark))',
          boxShadow: '0 0 12px 1px color-mix(in srgb, var(--sc-accent) 55%, transparent)',
        }}
      >
        {/* glowing dot riding the tip of the fill */}
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            translateX: '-50%',
            translateY: '50%',
            width: '10px',
            height: '10px',
            borderRadius: '9999px',
            background: 'var(--sc-accent)',
            boxShadow: '0 0 0 4px color-mix(in srgb, var(--sc-accent) 25%, transparent), 0 0 16px 2px color-mix(in srgb, var(--sc-accent) 70%, transparent)',
          }}
        />
      </motion.div>
    </div>
  )
}
