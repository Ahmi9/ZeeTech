'use client'

import { useState, useEffect } from 'react'
import PageSpacer from '@/components/layout/PageSpacer'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/sections/Footer'

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, appliedCoupon, getFinalPrice, removeCoupon } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState('COD')
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cities, setCities] = useState<string[]>([])
  const [citiesError, setCitiesError] = useState(false)
  const [shippingFee, setShippingFee] = useState(150)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000)
  const [placeOrderError, setPlaceOrderError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart')
    }
  }, [mounted, items.length])

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

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

  useEffect(() => {
    fetch('/api/postex/cities')
      .then(res => res.json())
      .then(data => {
        if (data.cities) setCities(data.cities)
        else setCitiesError(true)
      })
      .catch(() => setCitiesError(true))
  }, [])

  const fetchPaymentMethods = async () => {
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    if (data) setPaymentMethods(data)
    const { data: banks } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    if (banks) setBankAccounts(banks)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address.trim()) newErrors.address = 'Full address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee
  const total = getFinalPrice() + shipping

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    setLoading(true)
    setPlaceOrderError('')
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          customer_email: formData.email || null,
          customer_address: formData.address,
          customer_city: formData.city,
          notes: formData.notes || null,
          payment_type: selectedPayment,
          subtotal,
          discount: appliedCoupon?.discount_amount || 0,
          total,
          coupon_code: appliedCoupon?.code || null,
          coupon_discount: appliedCoupon?.discount_amount || 0,
          items,
        }),
      })

      const orderData = await res.json()
      if (!res.ok) throw new Error(orderData.error || 'Failed to place order')

      // PostEx booking happens later from the admin panel (manual confirm),
      // not automatically here — avoids booking courier pickups for fake/prank COD orders.

      if (appliedCoupon) {
        removeCoupon()
      }

      clearCart()
      window.location.href = '/order-confirmation?id=' + orderData.id
    } catch (error: any) {
      console.error('Order error:', error)
      setPlaceOrderError(error?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border-strong)',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--text-primary)',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    display: 'block',
  }

  if (!mounted) return null

  return (
    <div style={{ width: '100%', background: 'var(--bg)' }}>
      <PageSpacer />
      <div className="checkout-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '8px' }}>
          CHECKOUT
        </p>
        <h1 className="checkout-title" style={{ fontSize: '32px', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '48px' }}>
          Complete your order
        </h1>

        <div className="checkout-layout" style={{ display: 'flex', gap: '60px' }}>
          <div className="checkout-left" style={{ flex: 2 }}>
            <div className="checkout-card" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <p style={{ ...labelStyle, marginBottom: '16px' }}>CONTACT INFORMATION</p>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, borderColor: errors.fullName ? 'var(--danger)' : 'var(--border-strong)' }}
                />
                {errors.fullName && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.fullName}</p>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+92 300 0000000"
                  style={{ ...inputStyle, borderColor: errors.phone ? 'var(--danger)' : 'var(--border-strong)' }}
                />
                {errors.phone && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.phone}</p>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="optional"
                  style={inputStyle}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />
              <p style={{ ...labelStyle, marginBottom: '16px' }}>DELIVERY INFORMATION</p>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, height: '80px', resize: 'none', borderColor: errors.address ? 'var(--danger)' : 'var(--border-strong)' }}
                />
                {errors.address && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.address}</p>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>City *</label>
                {citiesError || cities.length === 0 ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.city ? 'var(--danger)' : 'var(--border-strong)' }}
                  />
                ) : (
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.city ? 'var(--danger)' : 'var(--border-strong)', cursor: 'pointer' }}
                  >
                    <option value="">Select your city</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                )}
                {errors.city && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{errors.city}</p>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions?"
                  style={{ ...inputStyle, height: '60px', resize: 'none' }}
                />
              </div>
            </div>

            <div className="checkout-card" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '16px' }}>PAYMENT METHOD</p>

              {/* COD Option */}
              <div
                onClick={() => setSelectedPayment('COD')}
                style={{
                  padding: '14px 16px',
                  border: `1px solid ${selectedPayment === 'COD' ? 'var(--brand)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  background: selectedPayment === 'COD' ? 'var(--brand-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                }}
              >
                <div style={{ width: '20px', height: '20px', border: `2px solid ${selectedPayment === 'COD' ? 'var(--brand)' : 'var(--border)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedPayment === 'COD' && <div style={{ width: '10px', height: '10px', background: 'var(--brand)', borderRadius: '50%' }} />}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Cash on Delivery</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Pay when your order arrives</p>
                </div>
              </div>

              {/* Advance Payment Option — only show if bank accounts exist */}
              {bankAccounts.length > 0 && (
                <div>
                  <div
                    onClick={() => setSelectedPayment('Advance Payment')}
                    style={{
                      padding: '14px 16px',
                      border: `1px solid ${selectedPayment === 'Advance Payment' ? 'var(--brand)' : 'var(--border)'}`,
                      borderRadius: '8px',
                      marginBottom: '0px',
                      cursor: 'pointer',
                      background: selectedPayment === 'Advance Payment' ? 'var(--brand-light)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'border-color 0.2s ease, background 0.2s ease',
                    }}
                  >
                    <div style={{ width: '20px', height: '20px', border: `2px solid ${selectedPayment === 'Advance Payment' ? 'var(--brand)' : 'var(--border)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedPayment === 'Advance Payment' && <div style={{ width: '10px', height: '10px', background: 'var(--brand)', borderRadius: '50%' }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Advance Payment</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Transfer to our bank account before delivery</p>
                    </div>
                  </div>

                  {/* Bank details shown when Advance Payment is selected */}
                  <div style={{
                    maxHeight: selectedPayment === 'Advance Payment' ? '2000px' : '0px',
                    overflow: 'hidden',
                    opacity: selectedPayment === 'Advance Payment' ? 1 : 0,
                    transition: 'max-height 0.35s ease, opacity 0.25s ease',
                  }}>
                    <div style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: '0 0 8px 8px', border: '1px solid var(--border)', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', margin: 0 }}>
                        BANK ACCOUNT DETAILS
                      </p>
                      {bankAccounts.map((bank) => (
                        <div key={bank.id} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{bank.method_name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Account Name: {bank.account_title}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Account No: {bank.account_number}</p>
                          {bank.iban && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>IBAN: {bank.iban}</p>}
                        </div>
                      ))}
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        Please transfer the total amount and place your order. We will confirm after payment verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="place-order-btn-desktop"
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--brand)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '24px',
                opacity: loading ? 0.7 : 1,
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.opacity = loading ? '0.7' : '1'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
            >
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
            {placeOrderError && (
              <p className="place-order-btn-desktop" style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '10px' }}>{placeOrderError}</p>
            )}
          </div>

          <div className="checkout-right" style={{ flex: 1 }}>
            <div className="checkout-card" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'sticky', top: '100px' }}>
              <p style={{ ...labelStyle, marginBottom: '20px' }}>ORDER SUMMARY</p>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
                      {item.name} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>x{item.quantity}</span>
                    </p>
                    {item.variantCombination && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {Object.entries(item.variantCombination).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Rs {Math.round(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Rs {Math.round(subtotal).toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--success)' }}>Coupon ({appliedCoupon.code})</span>
                  <span style={{ fontSize: '14px', color: 'var(--success)' }}>- Rs {Math.round(appliedCoupon.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{shipping === 0 ? 'Free' : `Rs ${Math.round(shipping)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Rs {Math.round(total).toLocaleString()}</span>
              </div>

              <Link
                href="/cart"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                Edit cart
              </Link>
            </div>
          </div>
        </div>

        <button
          className="place-order-btn-mobile"
          onClick={handlePlaceOrder}
          disabled={loading}
          style={{
            display: 'none',
            width: '100%',
            padding: '14px',
            background: 'var(--brand)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '24px',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
        {placeOrderError && (
          <p className="place-order-btn-mobile" style={{ display: 'none', fontSize: '12px', color: 'var(--danger)', marginTop: '10px' }}>{placeOrderError}</p>
        )}
      </div>

      <div style={{ height: '120px' }} />
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .checkout-container {
            padding: 0 16px !important;
          }
          .checkout-title {
            font-size: 22px !important;
            margin-bottom: 24px !important;
          }
          .checkout-card {
            padding: 16px !important;
          }
          .place-order-btn-desktop {
            display: none !important;
          }
          .place-order-btn-mobile {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}