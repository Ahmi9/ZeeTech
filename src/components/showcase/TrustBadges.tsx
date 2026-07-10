'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ShieldCheck, Zap, MessageCircle, BadgeCheck } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const BADGES = [
  {
    icon: ShieldCheck,
    title: '100% Yours',
    sub: 'Full code & data ownership — nothing rented',
  },
  {
    icon: Zap,
    title: 'Live in 2–3 Weeks',
    sub: 'From first call to taking real orders',
  },
  {
    icon: MessageCircle,
    title: 'Direct Support',
    sub: 'WhatsApp us any time — no ticket queues',
  },
  {
    icon: BadgeCheck,
    title: 'No Hidden Fees',
    sub: 'One-time build, transparent pricing',
  },
]

function TiltCard({ icon: Icon, title, sub, index }: (typeof BADGES)[number] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 18 })
  const sry = useSpring(ry, { stiffness: 180, damping: 18 })

  function onMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * 12)
    rx.set(-py * 12)
  }

  function onMouseLeave() {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 700 }}
      className="relative rounded-[var(--radius-lg)] p-[1.5px] overflow-hidden h-full"
    >
      {/* rotating conic border */}
      <motion.div
        aria-hidden
        className="absolute inset-[-150%]"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, transparent 290deg, var(--sc-accent) 330deg, transparent 360deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5 + index * 0.8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative h-full rounded-[calc(var(--radius-lg)-1.5px)] border border-[var(--sc-border)] bg-[var(--sc-surface)] p-6 text-center">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--sc-accent-light)]"
        >
          <Icon size={22} className="text-[var(--sc-accent)]" />
        </motion.div>
        <p className="font-semibold text-[var(--sc-ink)] mb-1.5">{title}</p>
        <p className="text-sm text-[var(--sc-ink-soft)] leading-relaxed">{sub}</p>
      </div>
    </motion.div>
  )
}

export default function TrustBadges() {
  return (
    <section className="page-container py-12 md:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BADGES.map((badge, i) => (
          <ScrollReveal key={badge.title} delay={i * 0.1} className="h-full">
            <TiltCard {...badge} index={i} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
