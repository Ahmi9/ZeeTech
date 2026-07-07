'use client'

import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'

const products = [
  {
    id: 1,
    name: 'Premium Sneakers',
    price: 129.99,
    originalPrice: 169.99,
    badge: 'New',
    emoji: '👟',
  },
  {
    id: 2,
    name: 'Designer Watch',
    price: 249.99,
    originalPrice: null,
    badge: 'Bestseller',
    emoji: '⌚',
  },
  {
    id: 3,
    name: 'Leather Backpack',
    price: 89.99,
    originalPrice: 119.99,
    badge: '-25%',
    emoji: '🎒',
  },
  {
    id: 4,
    name: 'Sunglasses Pro',
    price: 159.99,
    originalPrice: null,
    badge: null,
    emoji: '🕶️',
  },
]

function ProductCard({ product }: { product: typeof products[0] }) {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Badge */}
      {product.badge && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 1,
            padding: '6px 12px',
            borderRadius: '8px',
            background: product.badge === 'New'
              ? 'var(--text-primary)'
              : product.badge === 'Bestseller'
              ? 'var(--brand)'
              : 'var(--danger)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.03em',
          }}
        >
          {product.badge}
        </div>
      )}

      {/* Wishlist button */}
      <button
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 1,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          transition: 'color 0.15s, background 0.15s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
        aria-label="Add to wishlist"
      >
        <Heart size={16} />
      </button>

      {/* Product image */}
      <Link href={`/products/${product.id}`}>
        <div
          style={{
            aspectRatio: '1/1',
            background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--bg-muted) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '80px',
          }}
        >
          {product.emoji}
        </div>
      </Link>

      {/* Product info */}
      <div style={{ padding: '20px' }}>
        <Link
          href={`/products/${product.id}`}
          style={{ textDecoration: 'none' }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}
          >
            ${product.price}
          </span>
          {product.originalPrice && (
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textDecoration: 'line-through',
              }}
            >
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--text-primary)',
            color: 'var(--accent-fg)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default function FeaturedProducts() {
  return (
    <section
      style={{
        padding: '80px 32px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
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
            Handpicked for You
          </p>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            Featured Products
          </h2>
        </div>
        <Link
          href="/products"
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          View All
          <span style={{ fontSize: '18px' }}>→</span>
        </Link>
      </div>

      {/* Products grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
        }}
      >
        <style>{`
          @media (max-width: 1024px) {
            .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .products-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}