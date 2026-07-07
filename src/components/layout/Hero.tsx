'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Truck, ShieldCheck, BadgeCheck } from 'lucide-react'
import { useAppData } from '@/components/providers/AppDataProvider'

const perks = [
  { icon: Truck, label: 'Fast Delivery' },
  { icon: ShieldCheck, label: 'Warranty Included' },
  { icon: BadgeCheck, label: '100% Genuine' },
]

export default function Hero() {
  const { settings } = useAppData()

  return (
    <section
      className="hero-section"
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg)',
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(100px, 12vw, 130px) 24px 24px',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-15%',
          left: '5%',
          width: 'min(700px, 70vw)',
          height: '500px',
          background: 'radial-gradient(closest-side, var(--brand-light), transparent)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="hero-row"
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 'clamp(32px, 5vw, 64px)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-muted)',
              borderRadius: '999px',
              padding: '5px 14px',
              color: 'var(--brand)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            New Arrivals Weekly
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
            style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            {settings?.hero_title || 'Tech That Keeps Up'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.16 }}
            style={{
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '440px',
              marginBottom: '28px',
            }}
          >
            {settings?.hero_subtitle || 'Smartwatches, earbuds, chargers and more — genuine, fast-shipped, and priced right.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.24 }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}
          >
            <a
              href="#featured-products-section"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('featured-products-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                background: 'var(--brand)',
                color: '#ffffff',
                padding: '12px 28px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.opacity = '1' }}
            >
              Shop Now
            </a>
            <a
              href="#categories-section"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                padding: '12px 28px',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--border-strong)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--bg-muted)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.background = 'transparent' }}
            >
              View Collection
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}
          >
            {perks.map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Icon size={16} strokeWidth={1.75} color="var(--brand)" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        <div
          className="hero-image-col"
          style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 30px 70px -30px rgba(0,0,0,0.25)',
            }}
          >
            {settings?.hero_image_url ? (
              <Image src={settings.hero_image_url} alt="Hero" fill style={{ objectFit: 'cover' }} sizes="(max-width: 1200px) 100vw, 560px" fetchPriority="high" loading="eager" />
            ) : (
              <Image src="/Pics/airpods.webp" alt="Hero" fill style={{ objectFit: 'cover' }} sizes="(max-width: 1200px) 100vw, 560px" fetchPriority="high" loading="eager" />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.25) 100%)' }} />
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="hero-badge-card"
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: '20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 20px',
              boxShadow: '0 12px 32px -10px rgba(0,0,0,0.18)',
              minWidth: '180px',
            }}
          >
            <p style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--brand)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Trending Now
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              Pro Wireless Earbuds
            </p>
            <p style={{ fontSize: '13px', color: 'var(--brand)', fontWeight: 700 }}>
              PKR 2,299
            </p>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-row { flex-direction: column !important; }
          .hero-image-col { width: 100% !important; }
        }
        @media (max-width: 640px) {
          .hero-badge-card { left: 16px !important; bottom: -16px !important; padding: 12px 16px !important; }
        }
      `}</style>
    </section>
  )
}
