'use client'

import { motion } from 'framer-motion'

// Primary CTA button with a periodic shine sweep and press/hover spring.
export default function ShinyCta({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative overflow-hidden ${className ?? ''}`}
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        aria-hidden
        className="absolute top-0 bottom-0 w-1/3 skew-x-[-20deg] bg-white/25"
        initial={{ left: '-45%' }}
        animate={{ left: '135%' }}
        transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
      />
    </motion.a>
  )
}
