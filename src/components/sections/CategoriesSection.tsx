'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppData } from '@/components/providers/AppDataProvider'

const bgColors = ['var(--bg-muted)', 'var(--brand-light)', 'var(--bg-subtle)', 'var(--surface)']

export default function CategoriesSection() {
  const { categories: allCategories } = useAppData()
  const categories = allCategories.filter(c => !c.parent_id)
  const loading = false
  const [showScrollHint, setShowScrollHint] = useState(true)
  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const isCarousel = categories.length > 4

  function scrollDesktop(direction: 'left' | 'right') {
    const el = desktopScrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  useEffect(() => {
    const t = setTimeout(() => setShowScrollHint(false), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="categories-section" style={{ width: '100%', background: 'var(--bg)', padding: '80px 0' }}>
      <div className="categories-header-desktop" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <p style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--brand)',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Shop By Category
          </p>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Explore Our Collections
          </h2>
        </motion.div>
      </div>

      <div className="categories-header-mobile" style={{ display: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          style={{ padding: '0 24px', marginBottom: '20px', textAlign: 'left' }}
        >
          <p style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--brand)',
            textTransform: 'uppercase',
            marginBottom: '8px',
            fontWeight: 600,
          }}>
            Shop By Category
          </p>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            margin: 0,
          }}>
            Explore Our Collections
          </h2>
        </motion.div>
      </div>

      <div className="categories-desktop" style={{ position: 'relative', padding: '0 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {isCarousel && !loading && categories.length > 0 && (
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
          className="categories-grid"
          style={
            isCarousel
              ? {
                  display: 'flex',
                  gap: '20px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }
              : {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                }
          }
        >
          {loading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1/1',
                    background: 'var(--bg-muted)',
                    borderRadius: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    ...(isCarousel ? { flexShrink: 0, width: 'calc(25% - 15px)' } : {}),
                  }}
                />
              ))}
            </>
          ) : categories.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No categories yet
            </p>
          ) : (
            categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                style={{
                  aspectRatio: '1/1',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  ...(isCarousel
                    ? { flexShrink: 0, width: 'calc(25% - 15px)', scrollSnapAlign: 'start' }
                    : {}),
                }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
                >
                  {category.image_url ? (
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{ width: '100%', height: '100%', position: 'relative' }}
                    >
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={65}
                        loading="eager"
                        style={{ objectFit: 'cover' }}
                      />
                    </motion.div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: bgColors[index % bgColors.length] }} />
                  )}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.72) 100%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingBottom: '20px',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}>
                      {category.name}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="categories-mobile" style={{ display: 'none' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: '20vw',
            paddingRight: '20vw',
            paddingBottom: '12px',
          }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: '60vw',
                  minWidth: '200px',
                  maxWidth: '280px',
                  aspectRatio: '1/1',
                  background: 'var(--bg-muted)',
                  borderRadius: '16px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 24px' }}>
            No categories yet
          </p>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ opacity: showScrollHint ? 1 : 0, x: showScrollHint ? 0 : 8 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute',
                  top: '0',
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

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: '12px',
                  paddingLeft: '20vw',
                  paddingRight: '20vw',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    style={{
                      textDecoration: 'none',
                      flexShrink: 0,
                      width: '60vw',
                      minWidth: '200px',
                      maxWidth: '280px',
                      scrollSnapAlign: 'center',
                    }}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        aspectRatio: '1/1',
                      }}
                    >
                      {category.image_url ? (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          style={{ width: '100%', height: '100%', position: 'relative' }}
                        >
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            sizes="60vw"
                            quality={65}
                            loading="eager"
                            style={{ objectFit: 'cover' }}
                          />
                        </motion.div>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: index % 4 === 0 ? 'var(--bg-muted)' : index % 4 === 1 ? 'var(--brand-light)' : index % 4 === 2 ? 'var(--bg-subtle)' : 'var(--surface)',
                          color: 'var(--text-muted)',
                          fontSize: '12px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}>
                          {category.name}
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)',
                      }} />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        pointerEvents: 'none',
                      }}>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: '#ffffff',
                          textTransform: 'uppercase',
                          margin: 0,
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}>
                          {category.name}
                        </p>
                        <span style={{
                          fontSize: '16px',
                          color: '#ffffff',
                          flexShrink: 0,
                        }}>
                          →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .categories-mobile div::-webkit-scrollbar { display: none; }
        .categories-desktop .categories-grid::-webkit-scrollbar { display: none; }
        @media (min-width: 769px) {
          .categories-desktop .categories-grid {
            overflow: hidden !important;
            scroll-snap-type: none !important;
            touch-action: auto !important;
            overscroll-behavior: auto !important;
          }
        }
        @media (max-width: 768px) {
          .categories-desktop { display: none !important; }
          .categories-mobile { display: block !important; }
          .categories-header-desktop { display: none !important; }
          .categories-header-mobile { display: block !important; }
        }
      `}</style>
    </section>
  )
}