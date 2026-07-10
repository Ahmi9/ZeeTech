'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export default function AmbientGlow() {
  const { scrollY } = useScroll()
  const smoothY = useSpring(scrollY, { stiffness: 60, damping: 25, restDelta: 0.5 })

  const orb1Y = useTransform(smoothY, (v) => v * 0.25)
  const orb1X = useTransform(smoothY, (v) => Math.sin(v / 900) * 60)
  const orb2Y = useTransform(smoothY, (v) => v * 0.4 + 400)
  const orb2X = useTransform(smoothY, (v) => Math.cos(v / 700) * 80)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '520px',
          height: '520px',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, var(--sc-accent) 0%, transparent 70%)',
          opacity: 0.16,
          filter: 'blur(60px)',
          x: orb1X,
          y: orb1Y,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: '440px',
          height: '440px',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, var(--sc-accent-dark) 0%, transparent 70%)',
          opacity: 0.14,
          filter: 'blur(70px)',
          x: orb2X,
          y: orb2Y,
        }}
      />
    </div>
  )
}
