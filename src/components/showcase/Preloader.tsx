'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'

const BRAND = 'Ahmi Makes'

// Full-screen intro loader: crawls to ~85% while assets load, snaps to 100%
// on window "load" (all non-lazy images fetched), then lifts away like a
// curtain. Failsafe-capped so a stalled asset can never trap the visitor.
export default function Preloader() {
  const [phase, setPhase] = useState<'loading' | 'done' | 'gone'>('loading')
  const progress = useMotionValue(0)
  const display = useTransform(progress, (v) => `${Math.round(v)}`)
  const barWidth = useTransform(progress, (v) => `${v}%`)

  useEffect(() => {
    const crawl = animate(progress, 85, { duration: 2.4, ease: 'easeOut' })
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      crawl.stop()
      animate(progress, 100, { duration: 0.4, ease: 'easeInOut' }).then(() =>
        setTimeout(() => setPhase('done'), 150)
      )
    }
    if (document.readyState === 'complete') {
      // page was already loaded (e.g. instant back-nav) — let the intro read, then go
      const t = setTimeout(finish, 900)
      return () => {
        crawl.stop()
        clearTimeout(t)
      }
    }
    window.addEventListener('load', finish, { once: true })
    const failsafe = setTimeout(finish, 5000)
    return () => {
      crawl.stop()
      clearTimeout(failsafe)
      window.removeEventListener('load', finish)
    }
  }, [progress])

  // hold the page still while the loader is up
  useEffect(() => {
    if (phase === 'gone') return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [phase])

  return (
    <AnimatePresence>
      {phase !== 'gone' && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          animate={phase === 'done' ? { y: '-104%' } : { y: 0 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={() => phase === 'done' && setPhase('gone')}
          className="fixed left-0 top-0 z-[200] flex h-[103dvh] w-full flex-col items-center justify-center overflow-hidden rounded-b-[40px] bg-[#12140F]"
        >
          {/* faint dot texture, same language as the hero */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)',
            }}
          />

          {/* logo mark with spinning gradient arc */}
          <div className="relative mb-8">
            <motion.div
              aria-hidden
              className="absolute -inset-4 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #1F7A5C 320deg, #7ee2bd 350deg, transparent 360deg)',
                maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
                WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="flex h-16 w-16 items-center justify-center rounded-[18px] text-2xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #1F7A5C 0%, #155C44 100%)',
                boxShadow: '0 14px 40px -10px rgba(31,122,92,0.65)',
              }}
            >
              A
            </motion.span>
          </div>

          {/* wordmark — letters rise in one by one */}
          <div className="mb-9 flex overflow-hidden text-xl font-semibold tracking-tight text-white" aria-label={BRAND}>
            {BRAND.split('').map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
          </div>

          {/* progress bar */}
          <div className="relative h-[3px] w-[210px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: barWidth,
                background: 'linear-gradient(90deg, #1F7A5C, #7ee2bd)',
              }}
            />
          </div>

          {/* big percentage, editorial corner placement */}
          <div className="pointer-events-none absolute bottom-8 right-7 md:bottom-10 md:right-12 flex items-end leading-none text-white/90">
            <motion.span className="text-6xl md:text-8xl font-bold tabular-nums tracking-tight">{display}</motion.span>
            <span className="mb-1.5 ml-1 text-xl md:text-2xl font-semibold text-white/50">%</span>
          </div>

          <span className="pointer-events-none absolute bottom-10 left-7 md:bottom-12 md:left-12 text-[11px] font-medium uppercase tracking-[0.25em] text-white/40">
            Building stores that sell
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
