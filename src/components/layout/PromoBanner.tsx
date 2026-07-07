'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function PromoBanner() {
  return (
    <section
      style={{
        padding: '0 32px',
        maxWidth: '1280px',
        margin: '0 auto 80px',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          padding: '60px 48px',
          background: 'linear-gradient(135deg, var(--text-primary) 0%, #2a2a25 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'var(--brand)',
            opacity: 0.15,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--brand)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Limited Time Offer
          </p>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: '#fff',
              marginBottom: '16px',
              maxWidth: '500px',
            }}
          >
            Get 30% Off Your First Order
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '32px',
            }}
          >
            Use code WELCOME30 at checkout. Valid for new customers only.
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '10px',
              background: 'var(--brand)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)' }}
          >
            Shop Now
            <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: '120px',
            opacity: 0.3,
          }}
        >
          🎉
        </div>
      </div>
    </section>
  )
}