'use client'

import { useCartStore } from '@/store/cartStore'
import PageSpacer from '@/components/layout/PageSpacer'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/sections/Footer'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, appliedCoupon, applyCoupon, removeCoupon, getFinalPrice } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [shippingFee, setShippingFee] = useState(150)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('shipping_fee, free_shipping_threshold')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setShippingFee(Number(data.shipping_fee))
          setFreeShippingThreshold(Number(data.free_shipping_threshold))
        }
      })
  }, [])

  if (!mounted) return null

  const totalPrice = getTotalPrice()
  const shipping = totalPrice >= freeShippingThreshold ? 0 : shippingFee
  const finalTotal = getFinalPrice() + shipping

  const handleApplyCoupon = async () => {
    setCouponError('')
    setCouponSuccess('')

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      setCouponError('Invalid coupon code')
      return
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      setCouponError('Coupon has expired')
      return
    }

    if (coupon.min_order_amount && totalPrice < coupon.min_order_amount) {
      setCouponError(`Minimum order Rs ${coupon.min_order_amount} required`)
      return
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      setCouponError('Coupon usage limit reached')
      return
    }

    let discount = 0
    if (coupon.discount_type === 'percentage') {
      discount = (totalPrice * coupon.discount_value) / 100
    } else {
      discount = coupon.discount_value
    }

    applyCoupon({ code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value, discount_amount: discount })
    setCouponSuccess(`Coupon applied! Rs ${discount} off`)
  }

  const handleQuantityChange = (id: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta
    if (newQty < 1) {
      removeItem(id)
    } else {
      updateQuantity(id, newQty)
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)' }}>
      <PageSpacer />
      <div className="cart-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '8px' }}>
          YOUR CART
        </p>
        <h1 className="cart-title" style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '48px' }}>
          {items.length} item{items.length !== 1 ? 's' : ''} in your cart
        </h1>

        {items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '40px', padding: '0 16px' }}>
            <ShoppingBag size={48} color="var(--text-muted)" />
            <p style={{ fontSize: '20px', fontWeight: 300, color: 'var(--text-primary)', marginTop: '16px' }}>
              Your cart is empty
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '24px',
                padding: '12px 32px',
                border: '1px solid var(--border-strong)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout" style={{ display: 'flex', gap: '60px' }}>
            <div style={{ flex: 2 }}>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {items.map((item) => (
                  <div key={item.id} className="cart-item-row" style={{ padding: '24px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
                    <div className="cart-item-image" style={{ width: '100px', height: '100px', borderRadius: '8px', background: 'var(--bg-muted)', overflow: 'hidden', flexShrink: 0 }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={100} height={100} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%' }} />
                      )}
                    </div>
                    <div className="cart-item-details" style={{ flex: 1, minWidth: 0 }}>
                      {item.category && (
                        <p style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {item.category}
                        </p>
                      )}
                      <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {item.name}
                      </p>
                      {item.variantCombination && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {Object.entries(item.variantCombination).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Rs {Math.round(item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="cart-item-actions" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          style={{ width: '32px', height: '32px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '16px' }}
                        >
                          -
                        </button>
                        <span style={{ width: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-primary)' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          style={{ width: '32px', height: '32px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '16px' }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          marginTop: '12px',
                          display: 'block',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        Remove
                      </button>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                        Rs {Math.round(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="cart-summary" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '24px' }}>
                  Order Summary
                </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Rs {Math.round(totalPrice).toLocaleString()}</span>
                  </div>
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--success)' }}>Coupon ({appliedCoupon.code})</span>
                    <span style={{ fontSize: '14px', color: 'var(--success)' }}>- Rs {Math.round(appliedCoupon.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Shipping</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{shipping === 0 ? 'Free' : `Rs ${shipping}`}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Rs {Math.round(finalTotal).toLocaleString()}</span>
                  </div>

                <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Coupon Code
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success-light)', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 500 }}>
                        {appliedCoupon.code}
                      </span>
                      <button
                        onClick={removeCoupon}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-strong)', borderRadius: '6px', background: 'var(--bg)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        style={{ width: '100%', padding: '10px 18px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'transform 0.15s ease, opacity 0.15s ease' }}
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
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p style={{ fontSize: '12px', color: 'var(--brand)' }}>{couponSuccess}</p>
                  )}
                </div>

                <Link
                  href="/checkout"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--brand)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'block',
                    marginTop: '24px',
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
                  Checkout
                </Link>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                  Secure checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-container {
            padding: 0 16px !important;
          }
          .cart-title {
            font-size: 22px !important;
            margin-bottom: 24px !important;
          }
          .cart-layout {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .cart-summary {
            padding: 20px !important;
          }
          .cart-item-row {
            gap: 12px !important;
            padding: 16px 0 !important;
          }
          .cart-item-image {
            width: 72px !important;
            height: 72px !important;
            flex-shrink: 0;
          }
          .cart-item-actions {
            flex: 1 0 100% !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            text-align: left !important;
          }
          .cart-item-actions > button {
            margin-top: 0 !important;
          }
          .cart-item-actions > p {
            margin-top: 0 !important;
          }
        }
      `}</style>
      <div style={{ height: '120px' }} />
      <Footer />
    </div>
  )
}