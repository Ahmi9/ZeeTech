'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Shield, Truck, RotateCcw, CreditCard } from 'lucide-react'

const badges = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above Rs 2,000' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Shield, title: 'Secure Payment', desc: 'JazzCash & EasyPaisa' },
  { icon: CreditCard, title: 'WhatsApp Support', desc: 'Mon-Sat, 9am to 9pm' },
]

const INTERVAL = 2800

function BadgeIcon({ icon: Icon }: { icon: typeof badges[number]['icon'] }) {
  return (
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'var(--brand-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 14px -4px color-mix(in srgb, var(--brand) 40%, transparent)',
      }}
    >
      <Icon size={20} color="var(--brand)" strokeWidth={1.75} />
    </div>
  )
}

export default function TrustBadges() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % badges.length)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const active = badges[index]

  return (
    <section style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      padding: '24px',
    }}>
      <style>{`
        .trust-badges-grid { display: grid; }
        .trust-badges-carousel { display: none; }
        @media (max-width: 768px) {
          .trust-badges-grid { display: none !important; }
          .trust-badges-carousel { display: flex !important; }
        }
      `}</style>

      {/* Desktop: 4-column grid */}
      <div
        className="trust-badges-grid"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
        }}
      >
        {badges.map(({ icon, title, desc }) => (
          <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <BadgeIcon icon={icon} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                {title}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: rotating single-badge carousel */}
      <div className="trust-badges-carousel" style={{ flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px', minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
              }}
            >
              <BadgeIcon icon={active.icon} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  {active.title}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {active.desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {badges.map((_, i) => (
            <button
              key={i}
              aria-label={`Show ${badges[i].title}`}
              onClick={() => setIndex(i)}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '6px',
                  borderRadius: '999px',
                  background: i === index ? 'var(--brand)' : 'var(--border-strong)',
                  transform: i === index ? 'scaleX(1)' : 'scaleX(0.333)',
                  transformOrigin: 'left center',
                  transition: 'transform 0.3s ease, background 0.3s ease',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
