'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Product } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLoader from '@/components/ui/AdminLoader'

interface ProductWithCategory extends Product {
  categories: { name: string } | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [deleteProductName, setDeleteProductName] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(json => {
        if (json.products) setProducts(json.products)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', boxSizing: 'border-box' }}>
      {loading ? (
        <AdminLoader />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="products-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Products
              </h1>
              <p className="admin-page-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Manage your products
              </p>
            </div>
            <Link href="/admin/products/new" style={{
              background: 'var(--brand)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
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
              Add Product
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}
          >
            <div className="scroll-x">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Image</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Stock</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      No products yet
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg-muted)' }} />
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                        {product.categories?.name || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', verticalAlign: 'middle' }}>
                        {product.original_price ? (
                          <span>
                            <span style={{ color: 'var(--brand)', fontWeight: 500 }}>Rs {Math.round(product.price).toLocaleString()}</span>
                            {' '}
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>Rs {Math.round(product.original_price).toLocaleString()}</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Rs {Math.round(product.price).toLocaleString()}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: product.stock === 0 ? 'var(--badge-danger)' : 'var(--text-secondary)', verticalAlign: 'middle' }}>
                        {product.stock}
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: product.is_active ? 'var(--badge-success-bg)' : 'var(--badge-danger-bg)',
                          color: product.is_active ? 'var(--badge-success)' : 'var(--badge-danger)',
                        }}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <Link href={`/admin/products/${product.id}/edit`} style={{ fontSize: '13px', color: 'var(--brand)', textDecoration: 'none' }}>
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            setDeleteProductId(product.id)
                            setDeleteProductName(product.name)
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: 'var(--danger)',
                            marginLeft: '12px',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {deleteProductId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteProductId(null)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)', zIndex: 300,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="products-list-modal"
              style={{
                position: 'fixed', top: '50%', left: '50%',
                translateX: '-50%', translateY: '-50%',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '32px', width: '400px',
                zIndex: 301, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Delete Product
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteProductName}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteProductId(null)}
                  style={{
                    background: 'var(--bg-muted)', color: 'var(--text-primary)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '9px 20px', fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true)

                    const res = await fetch(`/api/admin/products?id=${deleteProductId}`, { method: 'DELETE' })
                    if (res.ok) {
                      setProducts(prev => prev.filter(p => p.id !== deleteProductId))
                      setDeleteProductId(null)
                    } else {
                      const json = await res.json()
                      alert(json.error || 'Failed to delete product')
                    }
                    setDeleting(false)
                  }}
                  style={{
                    background: 'var(--danger)', color: 'white',
                    border: 'none', borderRadius: '8px',
                    padding: '9px 20px', fontSize: '13px', cursor: 'pointer',
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 768px) {
          .products-list-header {
            margin-bottom: 24px !important;
            gap: 12px !important;
          }
          .products-list-header > div {
            min-width: 0;
            flex: 1;
          }
          .products-list-header h1 {
            font-size: 19px !important;
          }
          .products-list-header a {
            flex-shrink: 0;
            padding: 8px 14px !important;
            font-size: 12px !important;
            white-space: nowrap;
          }
          .products-list-modal {
            width: calc(100vw - 32px) !important;
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
