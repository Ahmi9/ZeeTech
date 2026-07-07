'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cartStore'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  images: string[] | null
  categories: { name: string } | null
}

function getEndOfDay() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return end.getTime()
}

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now())
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { hours, minutes, seconds }
}

export default function FlashSale() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_active', true)
      .not('original_price', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const onSale = data.filter((p: any) => p.original_price > p.price).slice(0, 4)
          setProducts(onSale)
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let target = getEndOfDay()
    const tick = () => {
      const left = getTimeLeft(target)
      setTimeLeft(left)
      if (left.hours === 0 && left.minutes === 0 && left.seconds === 0) {
        target = getEndOfDay()
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  function formatPrice(price: number): string {
    return `Rs ${Math.round(price).toLocaleString()}`
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <section style={{ width: '100%', background: '#0f0f0e', padding: '80px 0' }}>
      <div
        className="flashsale-header-desktop"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
            Limited Time Offer
          </p>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}>
            Flash Sale
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {[
            { value: timeLeft.hours, label: 'HRS' },
            { value: timeLeft.minutes, label: 'MIN' },
            { value: timeLeft.seconds, label: 'SEC' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                background: '#1a1a1a',
                borderRadius: '6px',
                padding: '10px 14px',
                minWidth: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#ffffff',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {pad(item.value)}
                </span>
              </div>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--brand)',
                textTransform: 'uppercase',
                marginTop: '6px',
              }}>
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      <div
        className="flashsale-header-mobile"
        style={{ display: 'none', padding: '0 24px', marginBottom: '32px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div>
            <p style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: 'var(--brand)',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              Limited Time Offer
            </p>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.15,
            }}>
              Flash Sale
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[
              { value: timeLeft.hours, label: 'HRS' },
              { value: timeLeft.minutes, label: 'MIN' },
              { value: timeLeft.seconds, label: 'SEC' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#ffffff',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {pad(item.value)}
                  </span>
                </div>
                <p style={{
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: 'var(--brand)',
                  textTransform: 'uppercase',
                  marginTop: '4px',
                }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div
        className="flashsale-desktop"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
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
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </>
        ) : products.length === 0 ? (
          <p style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            padding: '60px 0',
          }}>
            No deals available right now
          </p>
        ) : (
          products.map((product, index) => {
            const discount = product.original_price
              ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
              : 0

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    style={{
                      aspectRatio: '1/1',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
                  >
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}>
                        Product Image
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      background: 'var(--brand)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '4px 10px',
                      borderRadius: '0 0 8px 0',
                    }}>
                      -{discount}%
                    </div>
                  </motion.div>

                  <div style={{ padding: '14px 16px' }}>
                    <p style={{
                      fontSize: '10px',
                      letterSpacing: '0.15em',
                      color: 'var(--brand)',
                      textTransform: 'uppercase',
                    }}>
                      {product.categories?.name}
                    </p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.9)',
                      marginTop: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {product.name}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand)' }}>
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.35)',
                          textDecoration: 'line-through',
                        }}>
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div style={{ padding: '0 16px 16px' }}>
                  <button
                    onClick={() => {
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
                    }}
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

      <div
        className="flashsale-mobile"
        style={{ display: 'none' }}
      >
        {loading ? (
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: '24px',
            paddingRight: '24px',
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
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '100%', aspectRatio: '1/1', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ height: '8px', width: '45%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '14px', width: '85%', marginTop: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: '15px', width: '50%', marginTop: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p style={{
            textAlign: 'center',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            padding: '40px 24px',
          }}>
            No deals available right now
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product) => {
              const discount = product.original_price
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
                    scrollSnapAlign: 'start',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      aspectRatio: '1/1',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.04)',
                          color: 'rgba(255,255,255,0.2)',
                          fontSize: '11px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}>
                          Product Image
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        background: 'var(--brand)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '4px 10px',
                        borderRadius: '0 0 8px 0',
                      }}>
                        -{discount}%
                      </div>
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
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.9)',
                        marginTop: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {product.name}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand)' }}>
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.35)',
                            textDecoration: 'line-through',
                          }}>
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: '0 16px 16px' }}>
                    <button
                      onClick={() => {
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
                      }}
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
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .flashsale-mobile div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .flashsale-desktop { display: none !important; }
          .flashsale-mobile { display: block !important; }
          .flashsale-header-desktop { display: none !important; }
          .flashsale-header-mobile { display: flex !important; }
        }

        @media (hover: none) {
          button:active {
            opacity: 0.92 !important;
          }
        }
      `}</style>
    </section>
  )
}