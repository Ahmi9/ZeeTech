'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, Banknote, Truck } from 'lucide-react'

function FloatingChip({
  children,
  className,
  delay = 0,
  drift = -8,
  duration = 4.5,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  drift?: number
  duration?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
      className={`absolute z-10 ${className ?? ''}`}
    >
      <motion.div
        animate={{ y: [0, drift, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        className="flex items-center gap-2 rounded-[9999px] border border-[var(--sc-border)] bg-white px-3.5 py-2 text-xs md:text-sm font-medium text-[var(--sc-ink)] shadow-lg"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function HeroShot({ src }: { src: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="w-full rounded-[var(--radius-xl)] border border-[var(--sc-border)] bg-[var(--sc-surface)] overflow-hidden shadow-xl">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--sc-border)] bg-[var(--sc-surface)]">
          <span className="w-2.5 h-2.5 rounded-[9999px] bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-[9999px] bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-[9999px] bg-[#28c840]" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Demo Store storefront homepage" className="w-full h-auto block" />
      </div>

      <FloatingChip className="-top-4 -left-2 md:-left-6" delay={0.9} drift={-8} duration={4.6}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366]">
          <BadgeCheck size={13} color="#fff" />
        </span>
        Order confirmed on WhatsApp
      </FloatingChip>

      <FloatingChip className="-bottom-4 -right-2 md:-right-5" delay={1.15} drift={9} duration={5.4}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--sc-accent)]">
          <Banknote size={12} color="#fff" />
        </span>
        Rs 0/month platform fee
      </FloatingChip>

      <FloatingChip className="top-1/2 -right-3 md:-right-8 hidden sm:flex" delay={1.4} drift={-7} duration={5}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--sc-ink)]">
          <Truck size={12} color="#fff" />
        </span>
        COD ready
      </FloatingChip>
    </motion.div>
  )
}
