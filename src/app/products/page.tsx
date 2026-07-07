'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/sections/Footer'
import PageSpacer from '@/components/layout/PageSpacer'
import { supabase } from '@/lib/supabase'
import RatingBadge from '@/components/ui/RatingBadge'

const priceFilters = ['Under Rs 2,000', 'Rs 2,000 - Rs 4,000', 'Rs 4,000 - Rs 8,000', 'Above Rs 8,000']
const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low']

export default function AllProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('')
  const [selectedSort, setSelectedSort] = useState('')

  useEffect(() => {
    supabase
      .from('products')
      .select('*, product_reviews(rating, is_approved)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter(product => {
    if (!selectedPriceFilter) return true
    const price = Number(product.price)
    if (selectedPriceFilter === 'Under Rs 2,000') return price < 2000
    if (selectedPriceFilter === 'Rs 2,000 - Rs 4,000') return price >= 2000 && price <= 4000
    if (selectedPriceFilter === 'Rs 4,000 - Rs 8,000') return price > 4000 && price <= 8000
    if (selectedPriceFilter === 'Above Rs 8,000') return price > 8000
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'Price: Low to High') return Number(a.price) - Number(b.price)
    if (selectedSort === 'Price: High to Low') return Number(b.price) - Number(a.price)
    if (selectedSort === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return 0
  })

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)' }}>
      <PageSpacer />
      <div className="all-products-layout" style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '16px 40px 0' }}>
        <aside className="all-products-sidebar" style={{ width: '240px', flexShrink: 0, padding: '16px 0', position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--brand)', marginBottom: '24px' }}>
            All Products
          </h1>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '24px' }} />

          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Filter By
          </p>

          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Price Range
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {priceFilters.map((filter) => {
              const isSelected = selectedPriceFilter === filter
              return (
                <a
                  key={filter}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedPriceFilter(isSelected ? '' : filter)
                  }}
                  style={{
                    fontSize: '13px',
                    color: isSelected ? 'var(--brand)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                    textDecoration: 'none',
                    padding: '6px 0',
                  }}
                >
                  {filter}
                </a>
              )
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Sort By
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sortOptions.map((option) => {
              const isSelected = selectedSort === option
              return (
                <a
                  key={option}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedSort(option)
                  }}
                  style={{
                    fontSize: '13px',
                    color: isSelected ? 'var(--brand)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                    textDecoration: 'none',
                    padding: '6px 0',
                  }}
                >
                  {option}
                </a>
              )
            })}
          </div>
        </aside>

        <main className="all-products-main" style={{ flex: 1, padding: '16px 40px 80px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading products...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No products found</p>
            </div>
          ) : (
            <div className="all-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      aspectRatio: '3/4',
                      background: 'var(--bg-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          quality={65}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Product Image
                        </p>
                      )}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {product.name}
                      </p>
                      <RatingBadge reviews={product.product_reviews} />
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        {product.original_price ? (
                          <>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              Rs {product.price.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              Rs {product.original_price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Rs {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          .all-products-layout {
            flex-direction: column !important;
            padding: 16px 0 0 !important;
          }
          .all-products-sidebar {
            display: none !important;
          }
          .all-products-main {
            padding: 24px 16px 60px !important;
            width: 100% !important;
          }
          .all-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
