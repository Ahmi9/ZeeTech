'use client'

import Link from 'next/link'

const categories = [
  { name: 'Clothing', emoji: '👕', href: '/categories/clothing' },
  { name: 'Shoes', emoji: '👟', href: '/categories/shoes' },
  { name: 'Accessories', emoji: '👜', href: '/categories/accessories' },
  { name: 'Electronics', emoji: '🎧', href: '/categories/electronics' },
  { name: 'Home', emoji: '🏠', href: '/categories/home' },
  { name: 'Beauty', emoji: '💄', href: '/categories/beauty' },
]

export default function CategoriesSection() {
  return (
    <section
      style={{
        padding: '80px 32px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '48px',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--brand)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Browse By
          </p>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            Categories
          </h2>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px',
        }}
      >
        <style>{`
          @media (max-width: 1024px) {
            .categories-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .categories-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
        <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px 16px',
                borderRadius: '16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'var(--brand)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <span style={{ fontSize: '40px' }}>{cat.emoji}</span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}