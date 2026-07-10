'use client'

import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'

const ITEMS = [
  'Zero Monthly Fees',
  'WhatsApp Order Confirmation',
  'Cash on Delivery',
  'One-Click Courier Booking',
  'Full Admin Panel',
  'Mobile-First Storefront',
]

const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

export default function VelocityMarquee() {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  // scrolling faster makes the strip move faster; scrolling up reverses it
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false })

  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`)
  const directionFactor = useRef(1)

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * -1.5 * (delta / 1000)
    if (velocityFactor.get() < 0) directionFactor.current = -1
    else if (velocityFactor.get() > 0) directionFactor.current = 1
    moveBy += directionFactor.current * moveBy * velocityFactor.get()
    baseX.set(baseX.get() + moveBy)
  })

  const chunk = ITEMS.map((item) => (
    <span key={item} className="flex items-center gap-8 shrink-0">
      <span>{item}</span>
      <span className="text-[var(--sc-accent)]">✦</span>
    </span>
  ))

  return (
    <section aria-hidden className="overflow-hidden py-8 md:py-10">
      <div className="rotate-[-1.5deg] scale-[1.03] bg-[var(--sc-ink)]">
        <div className="overflow-hidden whitespace-nowrap">
          <motion.div
            style={{ x }}
            className="flex gap-8 w-max py-4 md:py-5 text-lg md:text-2xl font-semibold text-white/90"
          >
            {chunk}
            {chunk}
            {chunk}
            {chunk}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
