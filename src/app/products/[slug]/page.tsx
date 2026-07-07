'use client'

import { useEffect, useRef, useState } from 'react'
import PageSpacer from '@/components/layout/PageSpacer'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import RatingBadge from '@/components/ui/RatingBadge'
import { supabase } from '@/lib/supabase'
import { ProductReview } from '@/lib/types'
import Footer from '@/components/sections/Footer'
import { useCartStore } from '@/store/cartStore'

interface ProductWithCategory {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number | null
  images: string[]
  category: string | null
  category_id: string | null
  stock: number
  is_active: boolean
  is_featured: boolean
  specs: Record<string, any> | null
  created_at: string
  categories?: { name: string }
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<ProductWithCategory | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [relatedProducts, setRelatedProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAddedMessage, setShowAddedMessage] = useState(false)
  const { addItem } = useCartStore()
  const [attributes, setAttributes] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewName, setReviewName] = useState('')
  const [reviewCity, setReviewCity] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({})
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewImages, setReviewImages] = useState<File[]>([])
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([])
  const [reviewSubmitError, setReviewSubmitError] = useState('')
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)
  const submittingReviewRef = useRef(false)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const REVIEWS_PER_PAGE = 5
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!slug) return

    supabase
      .from('products')
      .select('*, categories(name)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Product not found')
          setLoading(false)
          return
        }
        setProduct(data)
        setLoading(false)

        supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .then(({ data: reviewsData }) => {
            if (reviewsData) setReviews(reviewsData)
          })

        supabase
          .from('products')
          .select('*, product_reviews(rating, is_approved)')
          .eq('category_id', data.category_id)
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(4)
          .then(({ data: relatedData }) => {
            if (relatedData) setRelatedProducts(relatedData)
          })

        ;(async () => {
          const { data: attrsData } = await supabase
            .from('product_attributes')
            .select('*, product_attribute_values(*)')
            .eq('product_id', data.id)
            .order('display_order')

          const { data: variantsData } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', data.id)
            .eq('is_active', true)

          if (attrsData) setAttributes(attrsData)
          if (variantsData) setVariants(variantsData)
        })()
      })
  }, [slug])

  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0) return
    if (Object.keys(selectedOptions).length < attributes.length) return

    const matched = variants.find(v => {
      return Object.entries(selectedOptions).every(
        ([key, val]) => v.variant_combination[key] === val
      )
    })
    setSelectedVariant(matched || null)
  }, [selectedOptions, variants, attributes])

  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant, product?.id])

  function formatPrice(price: number): string {
    return `Rs ${Math.round(price).toLocaleString()}`
  }

  function calculateDiscount(original: number, current: number): number {
    return Math.round(((original - current) / original) * 100)
  }

  function renderStars(rating: number) {
    return (
      <span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: star <= rating ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </span>
    )
  }

  function handleReviewImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files).slice(0, 4 - reviewImages.length)
    setReviewImages(prev => [...prev, ...newFiles])

    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setReviewImagePreviews(prev => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  function removeReviewImage(index: number) {
    setReviewImages(prev => prev.filter((_, i) => i !== index))
    setReviewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmitReview() {
    if (submittingReviewRef.current) return

    const errs: Record<string, string> = {}
    if (!reviewName.trim()) errs.name = 'Name is required'
    if (!reviewText.trim()) errs.text = 'Review text is required'
    if (reviewRating === 0) errs.rating = 'Please select a rating'
    setReviewErrors(errs)
    if (Object.keys(errs).length > 0) return

    submittingReviewRef.current = true
    setSubmittingReview(true)
    setReviewSubmitError('')

    try {
      const uploadedUrls: string[] = []
      for (const file of reviewImages) {
        const filename = `${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(filename, file)
        if (uploadError) {
          throw new Error('Image upload failed: ' + uploadError.message)
        }
        const { data: urlData } = supabase.storage.from('review-images').getPublicUrl(filename)
        uploadedUrls.push(urlData.publicUrl)
      }

      const { data, error } = await supabase.from('product_reviews').insert({
        product_id: product!.id,
        customer_name: reviewName.trim(),
        customer_city: reviewCity.trim() || null,
        rating: reviewRating,
        review_text: reviewText.trim(),
        is_approved: true,
        images: uploadedUrls,
      }).select().single()

      if (error) throw new Error(error.message)

      setReviews(prev => [data, ...prev])
      setReviewPage(1)
      setReviewName('')
      setReviewCity('')
      setReviewRating(0)
      setReviewText('')
      setReviewErrors({})
      setReviewImages([])
      setReviewImagePreviews([])
      setShowReviewForm(false)
      setReviewSuccess(true)
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (err) {
      setReviewSubmitError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      submittingReviewRef.current = false
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', paddingTop: '40px' }}>
<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: '60px', marginBottom: '80px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ aspectRatio: '1/1', background: 'var(--bg-muted)', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          <div className="product-detail-right" style={{ flex: 1, paddingTop: '20px' }}>
              <div style={{ height: '16px', width: '80px', background: 'var(--bg-muted)', borderRadius: '4px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '40px', width: '70%', background: 'var(--bg-muted)', borderRadius: '4px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '24px', width: '40%', background: 'var(--bg-muted)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', paddingTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Product not found</p>
      </div>
    )
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'highest') return b.rating - a.rating
    if (reviewSort === 'lowest') return a.rating - b.rating
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount ? calculateDiscount(product.original_price!, product.price) : 0
  const displayPrice = selectedVariant ? selectedVariant.price : product.price
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock

  return (
    <>
      <main style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)' }}>
        <PageSpacer />
        <div className="product-page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div className="product-detail-layout" style={{ display: 'flex', gap: '60px', marginBottom: '80px' }}>
          <div className="product-detail-left" style={{ flex: 1 }}>
            <div style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-muted)', position: 'relative' }}>
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  fetchPriority="high"
                  loading="eager"
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Product Image</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {product.images && product.images.map((img: string, index: number) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    width={72}
                    height={72}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: `2px solid ${index === selectedImage ? 'var(--brand)' : 'transparent'}`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-right" style={{ flex: 1, paddingTop: '20px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '8px' }}>
              {product.categories?.name}
            </p>
            <h1 className="product-title" style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '16px' }}>
              {product.name}
            </h1>

            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ display: 'flex', fontSize: '20px' }}>
                  {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                </span>
                <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {formatPrice(product.original_price!)}
                  </span>
                  <span style={{ background: 'var(--brand-light)', color: 'var(--brand)', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />

            {product.description ? (
              <div
                style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                No description available.
              </p>
            )}

            <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              {displayStock > 0 ? (
                <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                  In Stock
                </span>
              ) : (
                <span style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                  Out of Stock
                </span>
              )}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {displayStock > 0 ? `${displayStock} items available` : ''}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                Quantity
              </span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-strong)', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: '36px', height: '36px', border: 'none', background: 'var(--bg)',
                    color: 'var(--text-primary)', fontSize: '16px', cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    opacity: quantity <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  −
                </button>
                <span style={{ width: '44px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                  disabled={quantity >= displayStock}
                  style={{
                    width: '36px', height: '36px', border: 'none', background: 'var(--bg)',
                    color: 'var(--text-primary)', fontSize: '16px', cursor: quantity >= displayStock ? 'not-allowed' : 'pointer',
                    opacity: quantity >= displayStock ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {attributes.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {attributes.map((attr) => (
                  <div key={attr.id} style={{ marginBottom: '16px' }}>
                    <p style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--text-muted)',
                      marginBottom: '10px',
                    }}>
                      {attr.attribute_name}: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {selectedOptions[attr.attribute_name] || 'Select'}
                      </span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {attr.product_attribute_values
                        ?.sort((a: any, b: any) => a.display_order - b.display_order)
                        .map((val: any) => {
                          const isSelected = selectedOptions[attr.attribute_name] === val.value
                          return (
                            <button
                              key={val.id}
                              onClick={() => setSelectedOptions(prev => ({
                                ...prev,
                                [attr.attribute_name]: val.value
                              }))}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                border: isSelected ? '2px solid var(--brand)' : '1px solid var(--border-strong)',
                                background: isSelected ? 'var(--brand-light)' : 'var(--bg)',
                                color: isSelected ? 'var(--brand)' : 'var(--text-primary)',
                                fontWeight: isSelected ? 500 : 400,
                                transition: 'all 0.15s',
                              }}
                            >
                              {val.value}
                            </button>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              disabled={attributes.length > 0 && !selectedVariant ? true : displayStock <= 0}
              onClick={() => {
addItem({
                  id: selectedVariant ? product.id + '-' + selectedVariant.id : product.id,
                  name: product.name,
                  slug: product.slug,
                  price: selectedVariant ? selectedVariant.price : product.price,
                  original_price: product.original_price,
                  image: product.images?.[0] || null,
                  quantity: quantity,
                  category: (product as any).categories?.name || null,
                  variantId: selectedVariant?.id || null,
                  variantCombination: selectedVariant?.variant_combination || null,
                })
                setShowAddedMessage(true)
                setTimeout(() => setShowAddedMessage(false), 2000)
                setQuantity(1)
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: attributes.length > 0 && !selectedVariant ? 'var(--border-strong)' : displayStock > 0 ? 'var(--brand)' : 'var(--border-strong)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: attributes.length > 0 && !selectedVariant ? 'not-allowed' : displayStock > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <ShoppingBag size={18} />
              {attributes.length > 0 && !selectedVariant ? 'Select options above' : displayStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-muted)', marginTop: '8px' }}>
              Free delivery on orders above Rs 2,000
            </p>
          </div>
        </div>

        <section style={{ marginTop: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
              Customer Reviews
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{
                background: showReviewForm ? 'var(--bg-muted)' : 'var(--brand)',
                color: showReviewForm ? 'var(--text-primary)' : 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {reviews.length > 0 && (
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[5, 4, 3, 2, 1].map((star, idx) => {
                  const count = reviews.filter(r => r.rating === star).length
                  const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '40px', flexShrink: 0 }}>
                        {star} star
                      </span>
                      <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: 'var(--bg-muted)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: '0%' }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true, margin: '-50px' }}
                          transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.08 }}
                          style={{ height: '100%', background: 'var(--text-primary)', borderRadius: '999px' }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '30px', textAlign: 'right', flexShrink: 0 }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <select
                value={reviewSort}
                onChange={(e) => { setReviewSort(e.target.value as 'newest' | 'highest' | 'lowest'); setReviewPage(1) }}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          )}

          {reviewSuccess && (
            <p style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '16px' }}>
              Thank you! Your review has been posted.
            </p>
          )}

          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', fontSize: '14px',
                      border: `1px solid ${reviewErrors.name ? 'var(--danger)' : 'var(--border-strong)'}`,
                      borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-primary)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {reviewErrors.name && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{reviewErrors.name}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    City (optional)
                  </label>
                  <input
                    type="text"
                    value={reviewCity}
                    onChange={(e) => setReviewCity(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', fontSize: '14px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-primary)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Your Rating *
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{
                        fontSize: '28px',
                        cursor: 'pointer',
                        color: star <= reviewRating ? 'var(--text-primary)' : 'var(--text-muted)',
                        lineHeight: 1,
                      }}
                    >
                      {star <= reviewRating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                {reviewErrors.rating && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{reviewErrors.rating}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Your Review *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  style={{
                    width: '100%', height: '100px', padding: '10px 14px', fontSize: '14px',
                    border: `1px solid ${reviewErrors.text ? 'var(--danger)' : 'var(--border-strong)'}`,
                    borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-primary)',
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
                {reviewErrors.text && <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{reviewErrors.text}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Add Photos (optional, up to 4)
                </label>
                <input
                  id="review-image-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReviewImageSelect}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {reviewImagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeReviewImage(index)}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          width: '18px', height: '18px', background: 'var(--danger)',
                          color: 'white', border: 'none', borderRadius: '50%',
                          fontSize: '10px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {reviewImages.length < 4 && (
                    <label
                      htmlFor="review-image-input"
                      style={{
                        width: '64px', height: '64px', borderRadius: '8px',
                        border: '2px dashed var(--border-strong)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', background: 'var(--bg)',
                      }}
                    >
                      <ImagePlus size={20} />
                    </label>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                style={{
                  background: 'var(--brand)', color: 'white', border: 'none',
                  padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                  cursor: submittingReview ? 'not-allowed' : 'pointer', opacity: submittingReview ? 0.7 : 1,
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              {reviewSubmitError && (
                <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '10px' }}>{reviewSubmitError}</p>
              )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {reviews.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No reviews yet</p>
          ) : (
            <div>
              {sortedReviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE).map((review) => (
                <div
                  key={review.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{review.customer_name}</span>
                      {review.customer_city && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{review.customer_city}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>{renderStars(review.rating)}</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{review.review_text}</p>
                  {review.images && review.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {review.images.map((img, i) => (
                        <Image
                          key={i}
                          src={img}
                          alt={`Review photo ${i + 1}`}
                          width={64}
                          height={64}
                          style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setLightbox({ images: review.images, index: i })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {reviews.length > REVIEWS_PER_PAGE && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                  <button
                    onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      color: 'var(--text-primary)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: reviewPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: reviewPage === 1 ? 0.4 : 1,
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.ceil(reviews.length / REVIEWS_PER_PAGE) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setReviewPage(p)}
                      style={{
                        minWidth: '36px', height: '36px', borderRadius: '8px', padding: '0 8px',
                        border: p === reviewPage ? '1px solid var(--brand)' : '1px solid var(--border)',
                        background: p === reviewPage ? 'var(--brand-light)' : 'var(--bg)',
                        color: p === reviewPage ? 'var(--brand)' : 'var(--text-secondary)',
                        fontWeight: p === reviewPage ? 600 : 400,
                        fontSize: '13px', cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setReviewPage(p => Math.min(Math.ceil(reviews.length / REVIEWS_PER_PAGE), p + 1))}
                    disabled={reviewPage === Math.ceil(reviews.length / REVIEWS_PER_PAGE)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      color: 'var(--text-primary)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: reviewPage === Math.ceil(reviews.length / REVIEWS_PER_PAGE) ? 'not-allowed' : 'pointer',
                      opacity: reviewPage === Math.ceil(reviews.length / REVIEWS_PER_PAGE) ? 0.4 : 1,
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '80px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '24px' }}>
              You May Also Like
            </h2>
            <div className="related-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {relatedProducts.map((relProduct, index) => (
                <motion.div
                  key={relProduct.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/products/${relProduct.slug}`} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const overlay = e.currentTarget.querySelector('.product-overlay') as HTMLElement
                        const name = e.currentTarget.querySelector('.product-name') as HTMLElement
                        if (overlay) overlay.style.background = 'rgba(0,0,0,0.04)'
                        if (name) name.style.color = 'var(--brand)'
                      }}
                      onMouseLeave={(e) => {
                        const overlay = e.currentTarget.querySelector('.product-overlay') as HTMLElement
                        const name = e.currentTarget.querySelector('.product-name') as HTMLElement
                        if (overlay) overlay.style.background = 'transparent'
                        if (name) name.style.color = 'var(--text-primary)'
                      }}
                    >
                      <div style={{
                        aspectRatio: '1/1',
                        background: 'var(--bg-muted)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {relProduct.images && relProduct.images[0] ? (
                          <Image
                            src={relProduct.images[0]}
                            alt={relProduct.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', zIndex: 1 }}>
                            Product Image
                          </p>
                        )}
                        <div className="product-overlay" style={{ position: 'absolute', inset: 0, transition: 'background 0.3s ease' }} />
                      </div>
                      <div style={{ paddingTop: '14px' }}>
                        <p className="product-name" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px', transition: 'color 0.3s ease' }}>
                          {relProduct.name}
                        </p>
                        <RatingBadge reviews={(relProduct as any).product_reviews} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px', display: 'block' }}>
                          {formatPrice(relProduct.price)}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
        </div>
        <div style={{ height: '120px' }} />
      </main>

      <Footer />

      <AnimatePresence>
        {showAddedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '32px',
              left: '50%',
              translateX: '-50%',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '16px 24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              zIndex: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              minWidth: '280px',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--success-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={18} color="var(--success)" />
            </motion.div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Added to cart!
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {product?.name}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              cursor: 'zoom-out',
            }}
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close"
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001,
              }}
            >
              <X size={20} />
            </button>

            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev)
                }}
                aria-label="Previous image"
                style={{
                  position: 'fixed',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1001,
                }}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <motion.img
              key={lightbox.index}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={lightbox.images[lightbox.index]}
              alt="Review photo"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(90vw, 700px)',
                height: 'min(85vh, 700px)',
                borderRadius: '12px',
                objectFit: 'contain',
                cursor: 'default',
              }}
            />

            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev)
                }}
                aria-label="Next image"
                style={{
                  position: 'fixed',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1001,
                }}
              >
                <ChevronRight size={22} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .product-title {
            font-size: 22px !important;
            margin-bottom: 12px !important;
          }
          .product-detail-right {
            padding-top: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .product-page-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </>
  )
}