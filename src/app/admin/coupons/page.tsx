'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Coupon } from '@/lib/types'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLoader from '@/components/ui/AdminLoader'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null)
  const [deleteCouponCode, setDeleteCouponCode] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    const res = await fetch('/api/admin/coupons')
    const json = await res.json()
    if (json.coupons) setCoupons(json.coupons)
    setLoading(false)
  }

  function resetForm() {
    setCode('')
    setDiscountType('percentage')
    setDiscountValue('')
    setMinOrderAmount('')
    setMaxUses('')
    setExpiryDate('')
    setIsActive(true)
    setFormError('')
    setEditingId(null)
  }

  function openAddForm() {
    resetForm()
    setShowForm(true)
  }

  function openEditForm(coupon: Coupon) {
    setCode(coupon.code)
    setDiscountType(coupon.discount_type)
    setDiscountValue(coupon.discount_value.toString())
    setMinOrderAmount(coupon.min_order_amount.toString())
    setMaxUses(coupon.max_uses?.toString() || '')
    setExpiryDate(formatDateForInput(coupon.expiry_date))
    setIsActive(coupon.is_active)
    setEditingId(coupon.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    resetForm()
  }

  async function handleSave() {
    setFormError('')

    if (!code.trim()) {
      setFormError('Coupon code is required')
      return
    }
    if (!discountValue.trim()) {
      setFormError('Discount value is required')
      return
    }

    setSaving(true)

    const couponData = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      min_order_amount: parseFloat(minOrderAmount) || 0,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expiry_date: expiryDate || null,
      is_active: isActive,
    }

    try {
      const res = editingId
        ? await fetch('/api/admin/coupons', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...couponData }),
          })
        : await fetch('/api/admin/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(couponData),
          })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error)
      }

      closeForm()
      fetchCoupons()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteCouponId) return
    setDeleting(true)
    const res = await fetch(`/api/admin/coupons?id=${deleteCouponId}`, { method: 'DELETE' })
    if (res.ok) {
      setCoupons(prev => prev.filter(c => c.id !== deleteCouponId))
    }
    setDeleting(false)
    setConfirmOpen(false)
    setDeleteCouponId(null)
  }

  function formatValue(coupon: Coupon): string {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`
    }
    return `Rs ${coupon.discount_value.toLocaleString()}`
  }

  function formatMinOrder(coupon: Coupon): string {
    if (coupon.min_order_amount === 0) return '—'
    return `Rs ${coupon.min_order_amount.toLocaleString()}`
  }

  function formatUses(coupon: Coupon): string {
    if (coupon.max_uses === null) return `${coupon.used_count} / ∞`
    return `${coupon.used_count} / ${coupon.max_uses}`
  }

  function formatExpiry(coupon: Coupon): string {
    if (!coupon.expiry_date) return 'No expiry'
    const date = new Date(coupon.expiry_date)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  const getCouponStatus = (coupon: any) => {
    if (!coupon.is_active) return { label: 'Inactive', style: 'danger' }
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) return { label: 'Expired', style: 'danger' }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return { label: 'Limit Reached', style: 'danger' }
    return { label: 'Active', style: 'success' }
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
            <div className="coupons-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Coupons
                </h1>
                <p className="admin-page-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Create and manage discount codes
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
                Add Coupon
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="coupon-form-card"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}
          >
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
            {editingId ? 'Edit Coupon' : 'New Coupon'}
          </h2>

          <div className="coupon-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Coupon Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
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
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
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
                  cursor: 'pointer',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs)</option>
              </select>
            </div>
          </div>

          <div className="coupon-form-grid coupon-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Discount Value
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => {
                  if (discountType === 'percentage') {
                    const val = Number(e.target.value)
                    if (val > 100) return
                    setDiscountValue(e.target.value)
                  } else {
                    setDiscountValue(e.target.value)
                  }
                }}
                max={discountType === 'percentage' ? 100 : undefined}
                placeholder="e.g. 20"
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
              {discountType === 'percentage' && Number(discountValue) > 100 && (
                <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>Percentage cannot exceed 100%</p>
              )}
            </div>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Minimum Order Amount (Rs)
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="e.g. 1000"
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
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Max Uses
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Leave empty for unlimited"
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

          <div className="coupon-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
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
            <div className="coupon-form-active-toggle" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
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
              {saving ? 'Saving...' : 'Save Coupon'}
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

      <motion.div initial={{ opacity: 0, y: 16 }} animate={loading ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="scroll-x">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Code
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Type
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Value
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Min Order
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Uses
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Expiry
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Status
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No coupons yet. Create your first discount code.
                </td>
              </tr>
            ) : (
              coupons.map((coupon, index) => (
                <motion.tr
                  key={coupon.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-muted)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      {coupon.code}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formatValue(coupon)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formatMinOrder(coupon)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formatUses(coupon)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formatExpiry(coupon)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {(() => {
                      const status = getCouponStatus(coupon)
                      return (
                        <span style={{
                          background: status.style === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                          color: status.style === 'success' ? 'var(--success)' : 'var(--danger)',
                          padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 500
                        }}>
                          {status.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => openEditForm(coupon)}
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
                        setDeleteCouponId(coupon.id)
                        setDeleteCouponCode(coupon.code)
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
              ))
            )}
          </tbody>
        </table>
        </div>
        </motion.div>
        </motion.div>
      )}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Coupon"
        message={<>Are you sure you want to delete coupon <strong style={{ color: 'var(--text-primary)' }}>{deleteCouponCode}</strong>? This action cannot be undone.</>}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmDanger={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteCouponId(null)
        }}
      />
      <style jsx>{`
        @media (max-width: 768px) {
          .coupons-page-header {
            margin-bottom: 24px !important;
            gap: 12px !important;
          }
          .coupons-page-header > div {
            min-width: 0;
            flex: 1;
          }
          .coupons-page-header h1 {
            font-size: 19px !important;
          }
          .coupons-page-header button {
            flex-shrink: 0;
            padding: 8px 14px !important;
            font-size: 12px !important;
            white-space: nowrap;
          }
          .coupon-form-card {
            padding: 16px !important;
          }
          .coupon-form-grid {
            grid-template-columns: 1fr !important;
          }
          .coupon-form-grid > div {
            min-width: 0;
          }
          .coupon-form-grid input,
          .coupon-form-grid select {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
          .coupon-form-grid input[type="date"] {
            font-size: 13px !important;
            padding: 10px 8px !important;
          }
          .coupon-form-grid-3 {
            gap: 16px !important;
          }
          .coupon-form-active-toggle {
            margin-top: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
