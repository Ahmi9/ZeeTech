'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, ImagePlus, X, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/lib/types'
import { motion } from 'framer-motion'
import RichTextEditor from '@/components/ui/RichTextEditor'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params as { id: string }
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingProduct, setFetchingProduct] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [attributes, setAttributes] = useState<{ id: string, name: string, values: string[] }[]>([])
  const [variants, setVariants] = useState<{ combination: Record<string,string>, price: string, stock: string, sku: string }[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(json => {
        if (json.categories) setCategories(json.categories)
      })
  }, [])

  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/products?id=${id}`)
      .then(res => res.json())
      .then(json => {
        const data = json.product
        if (data) {
          setName(data.name)
          setSlug(data.slug)
          setDescription(data.description || '')
          setPrice(data.price.toString())
          setCostPrice(data.cost_price?.toString() || '')
          setOriginalPrice(data.original_price?.toString() || '')
          setStock(data.stock?.toString() || '')
          setCategoryId(data.category_id || '')
          setIsActive(data.is_active)
          setIsFeatured(data.is_featured)
          setExistingImages(data.images || [])
        }

        if (json.attributes) {
          setAttributes(json.attributes.map((a: any) => ({
            id: a.id,
            name: a.attribute_name,
            values: (a.product_attribute_values as { value: string }[] | null)?.map((v) => v.value) || []
          })))
        }

        if (json.variants) {
          setVariants(json.variants.map((v: any) => ({
            combination: v.variant_combination as Record<string, string>,
            price: v.price.toString(),
            stock: v.stock.toString(),
            sku: v.sku || '',
          })))
        }

        setFetchingProduct(false)
      })
  }, [id])

  useEffect(() => {
    if (name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setSlug(generatedSlug)
    }
  }, [name])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setNewImages(prev => [...prev, ...newFiles])

    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNewImagePreviews(prev => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Product name is required'
    if (!price.trim()) newErrors.price = 'Price is required'
    if (!categoryId) newErrors.categoryId = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const cartesian = (arrays: string[][]): string[][] => {
    return arrays.reduce((acc, arr) => acc.flatMap(a => arr.map(b => [...a, b])), [[]] as string[][])
  }

  const generateVariants = () => {
    const validAttrs = attributes.filter(a => a.name && a.values.length > 0)
    if (validAttrs.length === 0) return
    const attrNames = validAttrs.map(a => a.name)
    const attrValues = validAttrs.map(a => a.values)
    const combos = cartesian(attrValues)
    const newVariants = combos.map(combo => ({
      combination: Object.fromEntries(attrNames.map((name, i) => [name, combo[i]])),
      price: price,
      stock: '',
      sku: '',
    }))
    setVariants(newVariants)
  }

  const addAttribute = () => {
    setAttributes(prev => [...prev, { id: Date.now().toString(), name: '', values: [] }])
  }

  const updateAttributeName = (id: string, name: string) => {
    setAttributes(prev => prev.map(a => a.id === id ? { ...a, name } : a))
  }

  const deleteAttribute = (id: string) => {
    setAttributes(prev => prev.filter(a => a.id !== id))
    setVariants([])
  }

  const addAttributeValue = (id: string, value: string) => {
    if (!value.trim()) return
    setAttributes(prev => prev.map(a => a.id === id ? { ...a, values: [...a.values, value.trim()] } : a))
  }

  const removeAttributeValue = (attrId: string, valueIndex: number) => {
    setAttributes(prev => prev.map(a => a.id === attrId ? { ...a, values: a.values.filter((_, i) => i !== valueIndex) } : a))
    setVariants([])
  }

  const updateVariant = (index: number, field: 'price' | 'stock' | 'sku', value: string) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const deleteVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setLoading(true)
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error || 'Failed to delete product')
      setLoading(false)
    } else {
      router.push('/admin/products')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)

    try {
      const newImageUrls: string[] = []

      for (const file of newImages) {
        const filename = `${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filename, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename)

        newImageUrls.push(urlData.publicUrl)
      }

      const allImages = [...existingImages, ...newImageUrls]
      const validAttrs = attributes.filter(a => a.name && a.values.length > 0)

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: name.trim(),
          slug,
          description: description.trim() || null,
          price: parseFloat(price),
          cost_price: costPrice ? Number(costPrice) : 0,
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          images: allImages,
          category_id: categoryId,
          stock: stock ? parseInt(stock) : 0,
          is_active: isActive,
          is_featured: isFeatured,
          attributes: validAttrs,
          variants,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update product')

      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingProduct) {
    return (
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading product...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ width: '100%', maxWidth: '1200px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link
          href="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          Products
        </Link>
        <button
          onClick={handleDelete}
          style={{
            background: 'transparent',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            padding: '9px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Delete Product
        </button>
      </div>

      <h1 style={{
        fontSize: '24px',
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color: 'var(--text-primary)',
        marginBottom: '4px',
      }}>
        Edit Product
      </h1>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Update product details below
      </p>

      <form onSubmit={handleSubmit}>
        <div className="product-form-layout" style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 2 }}>
            <motion.div
              className="product-form-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 * 0.08 }}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                Basic Information
              </h2>

              <label style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                display: 'block',
              }}>
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border-strong)'}`,
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = errors.name ? 'var(--danger)' : 'var(--border-strong)'}
              />
              {errors.name && (
                <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                  {errors.name}
                </span>
              )}

              <label style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                marginTop: '16px',
                display: 'block',
              }}>
                Description
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter product description"
              />
            </motion.div>

            <motion.div
              className="product-form-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1 * 0.08 }}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
              marginBottom: '16px',
              }}
            >
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                Pricing
              </h2>

              <div className="product-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'block',
                  }}>
                    Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: `1px solid ${errors.price ? 'var(--danger)' : 'var(--border-strong)'}`,
                      borderRadius: '8px',
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={(e) => e.target.style.borderColor = errors.price ? 'var(--danger)' : 'var(--border-strong)'}
                  />
                  {errors.price && (
                    <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                      {errors.price}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'block',
                  }}>
                    Cost Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="Enter cost price"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '8px',
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                  />
                </div>

                <div>
                  <label style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'block',
                  }}>
                    Original Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Leave empty if no sale"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '8px',
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                  />
                </div>
              </div>

              {originalPrice && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  If original price is set, product will show as on sale
                </p>
              )}
            </motion.div>

            <motion.div
              className="product-form-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 2 * 0.08 }}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                Images
              </h2>

              <label style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                display: 'block',
              }}>
                Product Images
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              <div
                className="product-form-upload"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg)',
                }}
              >
                <ImagePlus size={32} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Click to upload images
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PNG, JPG up to 5MB each
                </p>
              </div>

              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '16px',
                }}>
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} style={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`Existing ${index + 1}`}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          width: '18px',
                          height: '18px',
                          background: 'var(--danger)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          width: '18px',
                          height: '18px',
                          background: 'var(--danger)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {variants.length === 0 && (
              <motion.div
                className="product-form-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 3 * 0.08 }}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '16px',
                }}
              >
                <h2 style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}>
                  Stock
                </h2>

                <label style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  display: 'block',
                }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="product-form-stock"
                  style={{
                    width: '50%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '8px',
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </motion.div>
            )}

            <motion.div
              className="product-form-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 4 * 0.08 }}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <h3 style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}>
                PRODUCT VARIANTS
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Add attributes like Size, Color etc. Variants will be created from combinations.
              </p>

              <button
                type="button"
                onClick={addAttribute}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} />
                Add Attribute
              </button>

              {attributes.map((attr) => (
                <div key={attr.id} style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginTop: '12px',
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                      placeholder="e.g. Size, Color, Material"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        background: 'var(--bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                    />
                    <button
                      type="button"
                      onClick={() => deleteAttribute(attr.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <p style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                    }}>
                      VALUES
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      {attr.values.map((val, valIndex) => (
                        <span key={valIndex} style={{
                          background: 'var(--brand-light)',
                          color: 'var(--brand)',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          {val}
                          <span
                            onClick={() => removeAttributeValue(attr.id, valIndex)}
                            style={{ cursor: 'pointer', fontSize: '10px' }}
                          >
                            ×
                          </span>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Add value..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault()
                            addAttributeValue(attr.id, (e.target as HTMLInputElement).value)
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }}
                        style={{
                          padding: '4px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: '999px',
                          fontSize: '12px',
                          background: 'var(--bg)',
                          color: 'var(--text-primary)',
                          width: '120px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {attributes.some(a => a.name && a.values.length > 0) && (
                <button
                  type="button"
                  onClick={generateVariants}
                  style={{
                    background: 'var(--brand)',
                    color: 'white',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '16px',
                  }}
                >
                  Generate Variants
                </button>
              )}

              {variants.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div className="scroll-x">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--text-muted)',
                          padding: '8px 12px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          Variant
                        </th>
                        <th style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--text-muted)',
                          padding: '8px 12px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          Price (Rs)
                        </th>
                        <th style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--text-muted)',
                          padding: '8px 12px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          Stock
                        </th>
                        <th style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--text-muted)',
                          padding: '8px 12px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          SKU
                        </th>
                        <th style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--text-muted)',
                          padding: '8px 12px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--border)',
                        }}>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant, index) => (
                        <tr key={index}>
                          <td style={{
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            padding: '8px 12px',
                            borderBottom: '1px solid var(--border)',
                          }}>
                            {Object.values(variant.combination).join(' / ')}
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', e.target.value)}
                              style={{
                                padding: '6px 10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                width: '100px',
                                background: 'var(--bg)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                              style={{
                                padding: '6px 10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                width: '80px',
                                background: 'var(--bg)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                              placeholder="optional"
                              style={{
                                padding: '6px 10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                width: '120px',
                                background: 'var(--bg)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                            <button
                              type="button"
                              onClick={() => deleteVariant(index)}
                              aria-label="Delete variant"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--danger)',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div style={{ flex: 1 }}>
            <motion.div
              className="product-form-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 * 0.08 }}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                Product Status
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <div
                  onClick={() => setIsActive(!isActive)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    background: isActive ? 'var(--brand)' : 'var(--border-strong)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 150ms',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: isActive ? '22px' : '2px',
                      transition: 'left 150ms',
                    }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Product is visible on storefront
                </p>
              </div>

              <div>
                <div
                  onClick={() => setIsFeatured(!isFeatured)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    background: isFeatured ? 'var(--brand)' : 'var(--border-strong)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 150ms',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: isFeatured ? '22px' : '2px',
                      transition: 'left 150ms',
                    }}
                  />
                </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Show on homepage featured section
                  </p>
                </div>
              </motion.div>

            <motion.div
              className="product-form-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1 * 0.08 }}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                Category
              </h2>

              <label style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                display: 'block',
              }}>
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  border: `1px solid ${errors.categoryId ? 'var(--danger)' : 'var(--border-strong)'}`,
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: categoryId ? 'var(--text-primary)' : 'var(--text-muted)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = errors.categoryId ? 'var(--danger)' : 'var(--border-strong)'}
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                  {errors.categoryId}
                </span>
              )}
            </motion.div>

            <motion.div
              className="product-form-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 2 * 0.08 }}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}>
                SEO (Slug)
              </h2>

              <label style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                display: 'block',
              }}>
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="product-slug"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                This will be the URL of the product
              </p>
            </motion.div>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '16px', marginBottom: '16px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="product-form-submit"
          style={{
            background: 'var(--brand)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            width: '100%',
            maxWidth: 'calc(66.67% - 12px)',
            marginTop: '8px',
          }}
        >
          {loading ? 'Updating...' : 'Update Product'}
        </button>
      </form>

      <style jsx>{`
        @media (max-width: 768px) {
          .product-form-layout {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .product-form-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .product-form-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .product-form-card {
            padding: 16px !important;
          }
          .product-form-upload {
            padding: 24px !important;
          }
          .product-form-stock {
            width: 100% !important;
          }
          .product-form-submit {
            max-width: 100% !important;
          }
        }
      `}</style>
    </motion.div>
  )
}
