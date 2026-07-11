'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, ImagePlus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLoader from '@/components/ui/AdminLoader'
import { useDemoMode } from '@/lib/demo-mode'

interface CategoryWithCount {
  id: string
  name: string
  slug: string
  is_active: boolean
  display_order: number
  parent_id: string | null
  image_url: string | null
  created_at: string
  products: { count: number }[] | null
}

export default function CategoriesPage() {
  const { demoBlock } = useDemoMode()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [parentId, setParentId] = useState<string | null>(null)
  const [displayOrder, setDisplayOrder] = useState(categories.length + 1)

  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [deleteCategoryName, setDeleteCategoryName] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (name && !editingId) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      )
    }
  }, [name, editingId])

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const json = await res.json()
    if (json.categories) setCategories(json.categories)
    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setIsActive(true)
    setParentId(null)
    setDisplayOrder(categories.length + 1)
    setFormError('')
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    setExistingImageUrl(null)
  }

  const openAddForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (category: CategoryWithCount) => {
    setName(category.name)
    setSlug(category.slug)
    setIsActive(category.is_active)
    setParentId(category.parent_id)
    setDisplayOrder(category.display_order)
    setExistingImageUrl(category.image_url)
    setImageFile(null)
    setImagePreview(null)
    setEditingId(category.id)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const handleSave = async () => {
    if (demoBlock()) return
    setFormError('')

    if (!name.trim()) {
      setFormError('Category name is required')
      return
    }

    setSaving(true)

    try {
      let image_url = existingImageUrl

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError('Image upload failed: ' + uploadError.message)
          return
        }

        const { data: urlData } = supabase.storage
          .from('category-images')
          .getPublicUrl(fileName)

        image_url = urlData.publicUrl
      }

      if (editingId) {
        const res = await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name, slug, is_active: isActive, parent_id: parentId || null, display_order: displayOrder, image_url }),
        })
        if (!res.ok) {
          const json = await res.json()
          setError('Failed to save: ' + json.error)
          return
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, is_active: isActive, parent_id: parentId || null, display_order: displayOrder, image_url }),
        })
        if (!res.ok) {
          const json = await res.json()
          setError('Failed to save: ' + json.error)
          return
        }
      }

      closeForm()
      await fetchCategories()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (demoBlock()) return
    if (!deleteCategoryId) return
    setDeleting(true)
    const res = await fetch(`/api/admin/categories?id=${deleteCategoryId}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== deleteCategoryId))
    }
    setDeleting(false)
    setConfirmOpen(false)
    setDeleteCategoryId(null)
  }

  return (
    <div style={{ width: '100%' }}>
      {loading ? (
        <AdminLoader />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="categories-page-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
            }}>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}>
                  Categories
                </h1>
                <p className="admin-page-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Manage your store categories
                </p>
              </div>
              <button
                onClick={openAddForm}
                style={{
                  background: 'var(--brand)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.97)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
        {showForm && (
          <motion.div
            className="category-form-card"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}>
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>

            <div className="category-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                display: 'block',
              }}>
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                style={{
                  width: '100%',
                  height: '42px',
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
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="category-slug"
                style={{
                  width: '100%',
                  height: '42px',
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

          <div style={{ marginTop: '16px' }}>
            <label style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              display: 'block',
            }}>
              Category Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setImageFile(file)
                  setImagePreview(URL.createObjectURL(file))
                  setExistingImageUrl(null)
                }
              }}
              style={{ display: 'none' }}
            />
            {!imagePreview && !existingImageUrl && (
              <div
                className="category-form-upload"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg)',
                }}
              >
                <ImagePlus size={28} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Click to upload category image
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}
            {(imagePreview || existingImageUrl) && (
              <div style={{ marginTop: '16px' }}>
                <img
                  src={imagePreview || existingImageUrl || ''}
                  alt="Category preview"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    if (existingImageUrl) setExistingImageUrl(null)
                  }}
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--danger)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '8px',
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="category-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                display: 'block',
              }}>
                Parent Category
              </label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: parentId ? 'var(--text-primary)' : 'var(--text-muted)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
              >
                <option value="">None (Top Level)</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
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
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  height: '42px',
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
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Lower number appears first
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <div
              onClick={() => setIsActive(!isActive)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '999px',
                background: isActive ? 'var(--brand)' : 'var(--border-strong)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
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
                  transition: 'left 0.2s',
                }}
              />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active</span>
          </div>

          {formError && (
            <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '12px' }}>
              {formError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="category-form-save"
              style={{
                background: 'var(--brand)',
                color: 'white',
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.opacity = saving ? '0.7' : '1'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
            >
              {saving ? 'Saving...' : 'Save Category'}
            </button>
            <button
              onClick={closeForm}
              style={{
                background: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {error && (
        <p style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '16px' }}>
          {error}
        </p>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={loading ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div className="scroll-x">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}>Image</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}>Name</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}>Slug</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}>Status</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}>Products</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  textAlign: 'center',
                  padding: '40px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}>
                  No categories yet
                </td>
              </tr>
            ) : (
              categories.map((category, index) => {
                const ownCount = category.products?.[0]?.count || 0
                const childrenCount = categories
                  .filter(c => c.parent_id === category.id)
                  .reduce((sum, c) => sum + (c.products?.[0]?.count || 0), 0)
                const productCount = ownCount + childrenCount
                return (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          background: 'var(--bg-muted)',
                        }} />
                      )}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}>
                      {category.name}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                    }}>
                      {category.slug}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: category.is_active ? 'var(--success-light)' : 'var(--danger-light)',
                        color: category.is_active ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}>
                      {productCount}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => openEditForm(category)}
                        style={{
                          fontSize: '12px',
                          color: 'var(--brand)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteCategoryId(category.id)
                          setDeleteCategoryName(category.name)
                          setConfirmOpen(true)
                        }}
                        style={{
                          fontSize: '12px',
                          color: 'var(--danger)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: '12px',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
        </motion.div>
        </motion.div>
        )}
        <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Category"
        message={<>Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteCategoryName}</strong>? This action cannot be undone.</>}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmDanger={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteCategoryId(null)
        }}
      />

      <style jsx>{`
        @media (max-width: 768px) {
          .categories-page-header {
            margin-bottom: 24px !important;
            gap: 12px !important;
          }
          .categories-page-header > div {
            min-width: 0;
            flex: 1;
          }
          .categories-page-header h1 {
            font-size: 19px !important;
          }
          .categories-page-header button {
            flex-shrink: 0;
            padding: 8px 14px !important;
            font-size: 12px !important;
            white-space: nowrap;
          }
          .category-form-card {
            padding: 16px !important;
          }
          .category-form-grid {
            grid-template-columns: 1fr !important;
          }
          .category-form-upload {
            padding: 20px !important;
          }
          .category-form-save {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
