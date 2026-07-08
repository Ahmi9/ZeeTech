'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Footer from '@/components/sections/Footer'
import PageSpacer from '@/components/layout/PageSpacer'
import { supabase } from '@/lib/supabase'
import RatingBadge from '@/components/ui/RatingBadge'
import AdminLoader from '@/components/ui/AdminLoader'

const priceFilters = ['Under Rs 2,000', 'Rs 2,000 - Rs 3,000', 'Above Rs 3,000']
const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low']

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string | null>('')
  const [selectedSort, setSelectedSort] = useState<string>('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      setLoading(true)

      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (categoryData) {
        setCategory(categoryData)

        const { data: childCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', categoryData.id)

        const categoryIds = [categoryData.id, ...(childCategories?.map(c => c.id) || [])]

        const { data: productsData } = await supabase
          .from('products')
          .select('*, product_reviews(rating, is_approved)')
          .in('category_id', categoryIds)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productsData) setProducts(productsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [slug])

  const filteredProducts = products.filter(product => {
    if (!selectedPriceFilter) return true
    const price = Number(product.price)
    if (selectedPriceFilter === 'Under Rs 2,000') return price < 2000
    if (selectedPriceFilter === 'Rs 2,000 - Rs 4,000') return price >= 2000 && price <= 4000
    if (selectedPriceFilter === 'Rs 4,000 - Rs 8,000') return price > 4000 && price <= 8000
    if (selectedPriceFilter === 'Above Rs 8,000') return price > 8000
    return true
  })

  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'Price: Low to High') return Number(a.price) - Number(b.price)
    if (selectedSort === 'Price: High to Low') return Number(b.price) - Number(a.price)
    if (selectedSort === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return 0
  })

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)' }}>
      <PageSpacer />
      <div className="category-layout" style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '16px 40px 0' }}>
        <aside className="category-sidebar" style={{ width: '240px', flexShrink: 0, padding: '16px 0', position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--brand)', marginBottom: '4px' }}>
            {category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px', borderLeft: '2px solid var(--brand)', paddingLeft: '10px' }}>
              {category.description}
            </p>
          )}
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
                    setSelectedPriceFilter(isSelected ? null : filter)
                  }}
                  style={{
                    fontSize: '13px',
                    color: isSelected ? 'var(--brand)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                    textDecoration: 'none',
                    padding: '6px 0',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isSelected ? 'var(--brand)' : 'var(--text-secondary)'}
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
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isSelected ? 'var(--brand)' : 'var(--text-secondary)'}
                >
                  {option}
                </a>
              )
            })}
          </div>
        </aside>

        <main className="category-products" style={{ flex: 1, padding: '16px 40px 80px' }}>
          <div className="category-mobile-header" style={{ display: 'none', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '4px' }}>
              COLLECTION
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--brand)', marginBottom: '4px' }}>
              {category?.name}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, borderLeft: '2px solid var(--brand)', paddingLeft: '10px' }}>
              {category?.description || ''}
            </p>
          </div>

          <div className="category-mobile-filters" style={{ display: 'none', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilterOpen(true)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '8px',
                  fontSize: '13px', border: '1px solid var(--border-strong)',
                  background: 'var(--bg)', color: 'var(--text-primary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filter {selectedPriceFilter && '·'}
              </button>
              <button
                onClick={() => setSortOpen(true)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '8px',
                  fontSize: '13px', border: '1px solid var(--border-strong)',
                  background: 'var(--bg)', color: 'var(--text-primary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                Sort {selectedSort && `· ${selectedSort}`}
              </button>
            </div>
          </div>

          {loading ? (
            <AdminLoader height="300px" />
          ) : products.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No products found in this category</p>
            </div>
          ) : sortedAndFilteredProducts.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No products match the selected filters</p>
            </div>
          ) : (
            <div className="category-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', paddingTop: '40px' }}>
              {sortedAndFilteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      onMouseEnter={(e) => {
                        const name = e.currentTarget.querySelector('.product-name') as HTMLElement
                        if (name) name.style.color = 'var(--brand)'
                      }}
                      onMouseLeave={(e) => {
                        const name = e.currentTarget.querySelector('.product-name') as HTMLElement
                        if (name) name.style.color = 'var(--text-primary)'
                      }}
                    >
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
                        <p className="product-name" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', transition: 'color 0.2s' }}>
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
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <style>{`
            @media (max-width: 768px) {
              .category-layout {
                flex-direction: column !important;
                padding: 16px 0 0 !important;
              }
              .category-sidebar {
                display: none !important;
              }
              .category-products {
                padding: 24px 16px 60px !important;
                width: 100% !important;
              }
              .category-products-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 16px !important;
              }
              .category-mobile-header { display: block !important; }
              .category-mobile-filters { display: block !important; }
            }
          `}</style>
        </main>
      </div>
      <Footer />

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)', zIndex: 400,
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: '80vw', maxWidth: '300px', zIndex: 401,
                background: 'var(--bg)', borderRight: '1px solid var(--border)',
                padding: '24px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Filters</h2>
                <button onClick={() => setFilterOpen(false)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '20px', color: 'var(--text-muted)', lineHeight: 1,
                }}>×</button>
              </div>

              <div>
                <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>PRICE RANGE</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Under Rs 2,000', 'Rs 2,000 - Rs 4,000', 'Rs 4,000 - Rs 8,000', 'Above Rs 8,000'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedPriceFilter(selectedPriceFilter === f ? '' : f)}
                      style={{
                        padding: '10px 14px', borderRadius: '8px', textAlign: 'left',
                        fontSize: '13px', cursor: 'pointer',
                        border: selectedPriceFilter === f ? '1px solid var(--brand)' : '1px solid var(--border)',
                        background: selectedPriceFilter === f ? 'var(--brand-light)' : 'var(--bg-subtle)',
                        color: selectedPriceFilter === f ? 'var(--brand)' : 'var(--text-secondary)',
                        fontWeight: selectedPriceFilter === f ? 500 : 400,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      {f}
                      {selectedPriceFilter === f && <span style={{ color: 'var(--brand)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFilterOpen(false)}
                style={{
                  marginTop: 'auto', width: '100%', padding: '12px',
                  background: 'var(--brand)', color: 'white', border: 'none',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sortOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSortOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)', zIndex: 400,
              }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                zIndex: 401, background: 'var(--bg)',
                borderTop: '1px solid var(--border)',
                borderRadius: '20px 20px 0 0',
                padding: '20px 24px 40px',
              }}
            >
              <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: 'var(--border-strong)', margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Sort By</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['Newest', 'Price: Low to High', 'Price: High to Low'].map(sort => (
                  <button
                    key={sort}
                    onClick={() => { setSelectedSort(sort); setSortOpen(false) }}
                    style={{
                      padding: '14px 16px', borderRadius: '10px', textAlign: 'left',
                      fontSize: '14px', border: 'none', cursor: 'pointer',
                      background: selectedSort === sort ? 'var(--brand-light)' : 'transparent',
                      color: selectedSort === sort ? 'var(--brand)' : 'var(--text-primary)',
                      fontWeight: selectedSort === sort ? 500 : 400,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    {sort}
                    {selectedSort === sort && <span style={{ color: 'var(--brand)', fontSize: '16px' }}>✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}