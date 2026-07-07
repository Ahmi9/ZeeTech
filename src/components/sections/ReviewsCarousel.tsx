'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReviewWithProduct {
  id: string
  customer_name: string
  customer_city: string | null
  rating: number
  review_text: string
  created_at: string
  products: { name: string; slug: string; images: string[] | null } | null
}

function renderStars(rating: number) {
  return (
    <span style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '14px' }}>
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

function ReviewCardContent({ review }: { review: ReviewWithProduct }) {
  return (
    <>
      <Quote size={20} color="var(--brand)" style={{ marginBottom: '12px', flexShrink: 0 }} />
      {renderStars(review.rating)}
      <p style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
        margin: '12px 0',
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {review.review_text}
      </p>
      <div style={{ marginTop: 'auto' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {review.customer_name}
          {review.customer_city && (
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> · {review.customer_city}</span>
          )}
        </p>
        {review.products && (
          <Link
            href={`/products/${review.products.slug}`}
            style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', marginTop: '4px', display: 'block' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            on {review.products.name}
          </Link>
        )}
      </div>
    </>
  )
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('product_reviews')
      .select('id, customer_name, customer_city, rating, review_text, created_at, products(name, slug, images)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setReviews(data as unknown as ReviewWithProduct[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowSwipeHint(false), 3000)
    return () => clearTimeout(t)
  }, [])

  function scrollDesktop(direction: 'left' | 'right') {
    const el = desktopScrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    const singleWidth = el.scrollWidth / 2
    const maxScroll = el.scrollWidth - el.clientWidth

    if (direction === 'right') {
      if (el.scrollLeft + amount >= maxScroll - 2) {
        el.scrollLeft -= singleWidth
      }
      el.scrollBy({ left: amount, behavior: 'smooth' })
    } else {
      if (el.scrollLeft - amount <= 2) {
        el.scrollLeft += singleWidth
      }
      el.scrollBy({ left: -amount, behavior: 'smooth' })
    }
  }

  // Mobile: correct the scroll position instantly once it crosses a duplicated-list
  // boundary, so continuous touch swiping loops forever without a visible jump.
  useEffect(() => {
    const el = mobileScrollRef.current
    if (!el || reviews.length === 0) return

    // Cached once per layout instead of read on every scroll event, which would
    // otherwise force a synchronous reflow after each scrollLeft write below.
    let singleWidth = el.scrollWidth / 2

    function onScroll() {
      if (!el || singleWidth <= 0) return
      if (el.scrollLeft >= singleWidth) {
        el.scrollLeft -= singleWidth
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += singleWidth
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      singleWidth = el.scrollWidth / 2
    })
    resizeObserver.observe(el)

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObserver.disconnect()
    }
  }, [reviews.length])

  if (!loading && reviews.length === 0) return null

  const loopedReviews = reviews.length > 0 ? [...reviews, ...reviews] : []

  return (
    <section style={{ width: '100%', background: 'var(--bg-subtle)', padding: '80px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '12px' }}>
            What Our Customers Say
          </p>
          <h2 style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Real Reviews, Real Customers
          </h2>
        </motion.div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="reviews-desktop" style={{ position: 'relative', padding: '0 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {!loading && reviews.length > 0 && (
          <>
            <button
              onClick={() => scrollDesktop('left')}
              aria-label="Scroll left"
              style={{
                position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: '44px', height: '44px', borderRadius: '50%',
                border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              <ChevronLeft size={20} color="var(--text-primary)" />
            </button>
            <button
              onClick={() => scrollDesktop('right')}
              aria-label="Scroll right"
              style={{
                position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: '44px', height: '44px', borderRadius: '50%',
                border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              <ChevronRight size={20} color="var(--text-primary)" />
            </button>
          </>
        )}

        <div
          ref={desktopScrollRef}
          className="reviews-desktop-track"
          style={{
            display: 'flex',
            gap: '20px',
            overflow: 'hidden',
            paddingBottom: '4px',
          }}
        >
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: 'calc(25% - 15px)',
                  minWidth: '260px',
                  height: '220px',
                  background: 'var(--bg-muted)',
                  borderRadius: '14px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))
          ) : (
            loopedReviews.map((review, index) => (
              <motion.div
                key={`${review.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
                style={{
                  flexShrink: 0,
                  width: 'calc(25% - 15px)',
                  minWidth: '260px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <ReviewCardContent review={review} />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="reviews-mobile" style={{ display: 'none', position: 'relative' }}>
        {!loading && reviews.length > 0 && (
          <motion.div
            animate={{ opacity: showSwipeHint ? 1 : 0, x: showSwipeHint ? 0 : 8 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              top: '-28px',
              right: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <span>Swipe</span>
            <span style={{ fontSize: '14px' }}>→</span>
          </motion.div>
        )}

        {loading ? (
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: '13vw',
            paddingRight: '13vw',
            paddingBottom: '12px',
          }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: '74vw',
                  minWidth: '220px',
                  height: '250px',
                  background: 'var(--bg-muted)',
                  borderRadius: '14px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : (
          <div
            ref={mobileScrollRef}
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '12px',
              paddingLeft: '13vw',
              paddingRight: '13vw',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {loopedReviews.map((review, index) => (
              <div
                key={`${review.id}-m${index}`}
                style={{
                  flexShrink: 0,
                  width: '74vw',
                  minWidth: '220px',
                  scrollSnapAlign: 'center',
                }}
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '250px',
                  }}
                >
                  <ReviewCardContent review={review} />
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .reviews-desktop-track::-webkit-scrollbar { display: none; }
        .reviews-mobile div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .reviews-desktop { display: none !important; }
          .reviews-mobile { display: block !important; }
        }
      `}</style>
    </section>
  )
}
