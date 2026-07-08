'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cartStore'
import RatingBadge from '@/components/ui/RatingBadge'
import AddedToCartToast from '@/components/ui/AddedToCartToast'
import VariantPickerModal from '@/components/ui/VariantPickerModal'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(state => state.addItem)
  const [showToast, setShowToast] = useState(false)
  const [toastProductName, setToastProductName] = useState('')
  const [variantModalProduct, setVariantModalProduct] = useState<any>(null)
  const [maxNameLines, setMaxNameLines] = useState(2)
  const nameRef = useRef<HTMLParagraphElement | null>(null)
  const measureRef = useRef<HTMLDivElement | null>(null)
  const anyHasReviews = products.some(p => (p.product_reviews || []).some((r: any) => r.is_approved))

  function recomputeNameLines() {
    const widthEl = nameRef.current
    const measurer = measureRef.current
    if (!widthEl || !measurer || products.length === 0) return
    measurer.style.width = `${widthEl.clientWidth}px`
    const lineHeightPx = 14 * 1.3
    let max = 1
    for (const product of products) {
      measurer.textContent = product.name
      const lines = Math.round(measurer.scrollHeight / lineHeightPx)
      if (lines > max) max = lines
    }
    setMaxNameLines(max)
  }

  useLayoutEffect(() => {
    recomputeNameLines()
  }, [products])

  useEffect(() => {
    window.addEventListener('resize', recomputeNameLines)
    return () => window.removeEventListener('resize', recomputeNameLines)
  }, [products])

  function handleAddToCartClick(product: any) {
    if (product.product_attributes && product.product_attributes.length > 0) {
      setVariantModalProduct(product)
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      original_price: product.original_price ?? null,
      image: product.images?.[0] ?? null,
      quantity: 1,
      category: product.categories?.name ?? null,
    })
    setToastProductName(product.name)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(name), product_reviews(rating, is_approved), product_attributes(id)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setProducts(data)
        setLoading(false)
      })
  }, [])

  function formatPrice(price: number): string {
    return `Rs ${Math.round(price).toLocaleString()}`
  }

  return (
    <>
    <section id="featured-products-section" style={{ width: '100%', background: 'var(--bg-subtle)', padding: '100px 0' }}>
      <div className="products-header-desktop" style={{ textAlign: 'center', marginBottom: '60px' }}>
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
            Handpicked For You
          </p>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Featured Products
          </h2>
        </motion.div>
      </div>

      <div className="products-header-mobile" style={{ display: 'none' }}>
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
            Handpicked For You
          </p>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            margin: 0,
          }}>
            Featured Products
          </h2>
        </motion.div>
      </div>

      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: 1.3,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
      />

      <div
        className="products-desktop products-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          padding: '0 40px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
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
                }}
              />
            ))}
          </>
        ) : products.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            No featured products yet
          </p>
        ) : (
          products.map((product, index) => {
            const onSale = product.original_price && product.original_price > product.price
            const discountPct = onSale
              ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
              : 0

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      aspectRatio: '1/1',
                      background: 'var(--bg-muted)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {product.images && product.images[0] ? (
                      <motion.div
                        style={{ width: '100%', height: '100%', position: 'relative' }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={65}
                          style={{ objectFit: 'cover' }}
                        />
                      </motion.div>
                    ) : (
                      <p style={{
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        zIndex: 1,
                      }}>
                        Product Image
                      </p>
                    )}
                    {onSale && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        background: 'var(--brand)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '0 0 8px 0',
                      }}>
                        -{discountPct}%
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '14px 16px' }}>
                    <p style={{
                      fontSize: '10px',
                      letterSpacing: '0.15em',
                      color: 'var(--brand)',
                      textTransform: 'uppercase',
                    }}>
                      {product.categories?.name}
                    </p>
                    <p
                      ref={index === 0 ? nameRef : undefined}
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        marginTop: '4px',
                        lineHeight: 1.3,
                        height: `${maxNameLines * 1.3}em`,
                        display: '-webkit-box',
                        WebkitLineClamp: maxNameLines,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                      {product.name}
                    </p>
                    {anyHasReviews && <RatingBadge reviews={product.product_reviews} />}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <>
                          <span style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            textDecoration: 'line-through',
                          }}>
                            {formatPrice(product.original_price)}
                          </span>
                          <span style={{
                            background: 'var(--brand-light)',
                            color: 'var(--brand)',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}>
                            -{discountPct}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                <div style={{ padding: '0 16px 16px' }}>
                  <button
                    onClick={() => handleAddToCartClick(product)}
                    style={{
                      width: '100%',
                      background: 'var(--brand)',
                      color: '#ffffff',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      border: 'none',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <ShoppingBag size={14} strokeWidth={2} />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <div className="products-mobile" style={{ display: 'none' }}>
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
                  minWidth: '220px',
                  maxWidth: '300px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--bg-muted)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ height: '9px', width: '50%', background: 'var(--bg-muted)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '14px', width: '85%', marginTop: '8px', background: 'var(--bg-muted)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '12px', width: '40%', marginTop: '8px', background: 'var(--bg-muted)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '15px', width: '55%', marginTop: '8px', background: 'var(--bg-muted)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '34px', width: '100%', marginTop: '12px', background: 'var(--bg-muted)', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            margin: '0 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
          }}>
            <Package size={32} strokeWidth={1.5} />
            <p style={{ fontSize: '13px', margin: 0 }}>No featured products yet</p>
          </div>
        ) : (
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
            {products.map((product) => {
              const onSale = product.original_price && product.original_price > product.price
              const discountPct = onSale
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0

              return (
                <div
                  key={product.id}
                  style={{
                    flexShrink: 0,
                    width: '60vw',
                    minWidth: '220px',
                    maxWidth: '300px',
                    scrollSnapAlign: 'center',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      background: 'var(--bg-muted)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={65}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '11px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}>
                          Product Image
                        </div>
                      )}
                      {onSale && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          background: 'var(--brand)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '4px 10px',
                          borderRadius: '0 0 8px 0',
                        }}>
                          -{discountPct}%
                        </div>
                      )}
                    </div>
                  </Link>

                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{
                      fontSize: '9px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--brand)',
                      fontWeight: 600,
                      margin: 0,
                    }}>
                      {(product as any).categories?.name || ''}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginTop: '4px',
                      marginBottom: 0,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {product.name}
                    </p>
                    {anyHasReviews && <RatingBadge reviews={product.product_reviews} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Rs {Number(product.price).toLocaleString()}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            Rs {Number(product.original_price).toLocaleString()}
                          </span>
                          <span style={{
                            background: 'var(--brand-light)',
                            color: 'var(--brand)',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}>
                            -{discountPct}%
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCartClick(product)}
                      style={{
                        marginTop: '12px',
                        background: 'var(--brand)',
                        color: '#ffffff',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <ShoppingBag size={14} strokeWidth={2} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .products-mobile div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .products-desktop { display: none !important; }
          .products-mobile { display: block !important; }
          .products-header-desktop { display: none !important; }
          .products-header-mobile { display: block !important; }
        }

        @media (hover: none) {
          button:active {
            opacity: 0.92 !important;
          }
        }
      `}</style>
    </section>

    <AddedToCartToast show={showToast} productName={toastProductName} />

    <AnimatePresence>
      {variantModalProduct && (
        <VariantPickerModal
          product={{
            id: variantModalProduct.id,
            name: variantModalProduct.name,
            slug: variantModalProduct.slug,
            price: variantModalProduct.price,
            original_price: variantModalProduct.original_price,
            images: variantModalProduct.images,
            category: variantModalProduct.categories?.name ?? null,
          }}
          onClose={() => setVariantModalProduct(null)}
          onAdd={(item) => {
            addItem(item)
            setVariantModalProduct(null)
            setToastProductName(item.name)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 2000)
          }}
        />
      )}
    </AnimatePresence>
    </>
  )
}