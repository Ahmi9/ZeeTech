'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PageSpacer from '@/components/layout/PageSpacer'
import Footer from '@/components/sections/Footer'
import AdminLoader from '@/components/ui/AdminLoader'
import { formatPrice } from '@/lib/format'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Search, Loader2, Package, CheckCircle2, Truck, Check, AlertCircle, ShoppingBag, ArrowRight, ExternalLink, Navigation } from 'lucide-react'

const RETURN_CODES = ['0002', '0006', '0007']

const CODE_META: Record<string, { label: string; icon: any }> = {
  '0003': { label: 'At PostEx Warehouse', icon: Package },
  '0004': { label: 'Out for Delivery', icon: Navigation },
}

interface PostexHistoryEntry {
  transactionStatusMessage: string
  transactionStatusMessageCode: string
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '')
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any | null>(null)
  const [postexHistory, setPostexHistory] = useState<PostexHistoryEntry[]>([])

  const sanitizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    return digits.slice(-10)
  }

  const runTrack = async (orderNumberArg: string, phoneNumberArg: string) => {
    if (!orderNumberArg.trim()) {
      setError('Please enter your order number')
      return
    }
    if (!phoneNumberArg.trim()) {
      setError('Please enter your phone number')
      return
    }

    setLoading(true)
    setError(null)

    const orderNumberVal = orderNumberArg
    const phoneNumberVal = phoneNumberArg

    const isSameOrder = order && order.order_number === orderNumberVal.trim().toUpperCase() && sanitizePhone(order.customer_phone) === sanitizePhone(phoneNumberVal)
    if (!isSameOrder) {
      setOrder(null)
      setPostexHistory([])
    }

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumberVal.trim().toUpperCase())}&phone=${encodeURIComponent(phoneNumberVal)}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Failed to fetch tracking data.')
        setOrder(null)
        setLoading(false)
        return
      }

      const data = json.order
      setOrder(data)

      if (data.postex_tracking_number) {
        fetch(`/api/postex/track-order?trackingNumber=${data.postex_tracking_number}`)
          .then(r => r.json())
          .then(j => { if (!j.error && j.history) setPostexHistory(j.history) })
          .catch(() => {})
      } else {
        setPostexHistory([])
      }
    } catch (err: any) {
      console.error('Tracking query error:', err)
      setError('Failed to fetch tracking data. Please try again later.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    runTrack(orderNumber, phoneNumber)
  }

  useEffect(() => {
    const prefilledOrderNumber = searchParams.get('orderNumber')
    const prefilledPhone = searchParams.get('phone')
    if (prefilledOrderNumber && prefilledPhone) {
      runTrack(prefilledOrderNumber, prefilledPhone)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const seenCodes = new Set(postexHistory.map(h => h.transactionStatusMessageCode))
  const latestCode = postexHistory[postexHistory.length - 1]?.transactionStatusMessageCode
  const isReturned = latestCode ? RETURN_CODES.includes(latestCode) : false

  const steps = [
    { label: 'Order Placed', step: 1, icon: ShoppingBag, desc: 'Your order has been recorded', pendingDesc: 'Order pending confirmation' },
    { label: 'Order Confirmed', step: 2, icon: CheckCircle2, desc: 'Payment and order verified', pendingDesc: 'Awaiting order confirmation' },
    { label: 'Dispatched', step: 3, icon: Truck, desc: 'Booked with courier for pickup', pendingDesc: 'Awaiting courier pickup' },
    { label: CODE_META['0003'].label, step: 4, icon: CODE_META['0003'].icon, desc: 'Package received at courier hub', pendingDesc: 'Awaiting courier warehouse scan' },
    { label: CODE_META['0004'].label, step: 5, icon: CODE_META['0004'].icon, desc: 'Package is on the way to you', pendingDesc: 'Awaiting dispatch for delivery' },
    { label: 'Delivered', step: 6, icon: Check, desc: 'Package received successfully', pendingDesc: 'Awaiting delivery to address' },
  ]

  const currentStep = (() => {
    if (!order) return 0
    if (order.status === 'cancelled') return -1
    if (order.status === 'returned' || isReturned) return -1

    let s = 1
    if (order.status === 'confirmed' || order.status === 'dispatched' || order.status === 'delivered' || order.postex_tracking_number) s = 2
    if (order.status === 'dispatched' || order.status === 'delivered' || order.postex_tracking_number) s = 3
    if (seenCodes.has('0003')) s = 4
    if (seenCodes.has('0004')) s = 5
    if (seenCodes.has('0005') || order.status === 'delivered') s = 6

    return s
  })()

  const getStepDate = (stepData: { label: string }) => {
    if (!order) return ''
    if (stepData.label === 'Order Placed') {
      return new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    }
    if (stepData.label === 'Order Confirmed') return 'Verified'
    if (stepData.label === 'Dispatched') return order.postex_tracking_number ? 'With PostEx' : 'In Transit'
    if (stepData.label === 'Delivered') return 'Completed'
    return 'Updated'
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: 40 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
        when: 'beforeChildren',
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' as const }
    }
  }

  const listContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
  }

  const listItem: Variants = {
    hidden: { opacity: 0, x: -12 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring' as const, stiffness: 200, damping: 20 }
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '0px' }}>
      <PageSpacer />

      <div className="track-page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 100px 40px' }}>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Secure Portal
          </p>
          <h1 className="track-page-title" style={{ fontSize: '44px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Track Your Order
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Enter your transaction details to view live fulfillment updates
          </p>
        </motion.div>

        <div className="grid-layout">

          <div>
            <div
              className="track-form-card"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.015)',
                height: order ? 'auto' : '100%',
                boxSizing: 'border-box',
                minHeight: order ? 'auto' : '400px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} color="var(--brand)" />
                Order Information
              </h2>

              <form onSubmit={handleTrack}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
                    Order Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-12345"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-strong)', borderRadius: '10px', background: 'var(--surface)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-strong)', borderRadius: '10px', background: 'var(--surface)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500, letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.75 : 1 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner" /> Searching...
                    </>
                  ) : (
                    <>
                      Track Status <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--danger-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '13px' }}
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {order && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Delivery Details
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Recipient: </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{order.customer_name}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Method: </span>
                          <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{order.payment_type}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Address: </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{order.customer_address}, {order.customer_city}</strong>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <AnimatePresence mode="wait">
              {!order ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    border: '1px dashed var(--border-strong)',
                    borderRadius: '16px',
                    padding: '80px 32px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'var(--brand-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand)',
                      marginBottom: '20px'
                    }}
                  >
                    <Package size={28} />
                  </motion.div>
                  <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>Awaiting Information</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', margin: '8px auto 0 auto', lineHeight: 1.5 }}>
                    Provide your order and phone number on the left to display the live shipping status
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
                >
                  {currentStep === -1 ? (
                    <motion.div
                      variants={itemVariants}
                      style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: '16px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}
                    >
                      <AlertCircle size={24} color="var(--danger)" />
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)' }}>
                          {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Returned'}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--danger)', opacity: 0.9 }}>
                          {order.status === 'cancelled'
                            ? 'This order has been cancelled. Please contact customer support for details.'
                            : 'This order has been returned by the courier. Please contact customer support for details.'}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={itemVariants}
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'var(--brand)', textTransform: 'uppercase', fontWeight: 600 }}>Order # {order.order_number}</span>
                          <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                            Status: <span style={{ textTransform: 'capitalize', color: 'var(--brand)' }}>{order.status}</span>
                          </h2>
                        </div>
                        {order.postex_tracking_number && (
                          <a
                            href={`https://postex.pk/tracking?track=${order.postex_tracking_number}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'var(--brand-light)', color: 'var(--brand)', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none', fontWeight: 500 }}
                          >
                            Courier: {order.postex_tracking_number} <ExternalLink size={12} />
                          </a>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                        {steps.map((stepData, idx) => {
                          const isDone = currentStep >= stepData.step
                          const isNext = currentStep + 1 === stepData.step
                          const StepIcon = stepData.icon

                          // Explicit state-driven colors to avoid Framer Motion inheritance bugs
                          const circleStyle = isDone
                            ? { backgroundColor: 'var(--brand)', borderColor: 'var(--brand)', color: '#ffffff' }
                            : isNext
                            ? { backgroundColor: 'var(--surface)', borderColor: 'var(--brand)', color: 'var(--brand)' }
                            : { backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }

                          return (
                            <div key={stepData.step} style={{ display: 'flex', gap: '20px' }}>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', flexShrink: 0 }}>
                                <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.12, duration: 0.3, type: 'spring', stiffness: 260, damping: 18 }}
                                    style={{ 
                                      width: '40px', 
                                      height: '40px', 
                                      borderRadius: '50%', 
                                      borderWidth: '2px',
                                      borderStyle: 'solid',
                                      backgroundColor: circleStyle.backgroundColor,
                                      borderColor: circleStyle.borderColor,
                                      color: circleStyle.color,
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      zIndex: 1
                                    }}
                                  >
                                    <StepIcon size={16} />
                                  </motion.div>
                                </div>

                                {idx < steps.length - 1 && (
<div style={{ width: '2px', height: '48px', background: 'var(--border)', position: 'relative' }}>
  <motion.div
    initial={{ height: '0%' }}
    animate={{ height: idx < currentStep ? '100%' : '0%' }}
    transition={{ duration: 0.35, delay: idx * 0.12 + 0.2, ease: 'easeInOut' }}
    style={{ width: '100%', background: 'var(--brand)', position: 'absolute', top: 0, left: 0 }}
  />
</div>
                                )}
                              </div>

                              <div style={{ paddingBottom: idx < steps.length - 1 ? '32px' : 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <motion.p
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.12 + 0.05, duration: 0.25, ease: 'easeOut' }}
                                  style={{ fontSize: '14px', fontWeight: isDone ? 600 : 500, color: isDone || isNext ? 'var(--text-primary)' : 'var(--text-muted)', margin: 0 }}
                                >
                                  {stepData.label} {isDone && '✓'}
                                </motion.p>
                                <motion.p
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.12 + 0.1, duration: 0.25, ease: 'easeOut' }}
                                  style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}
                                >
                                  {isDone ? stepData.desc : stepData.pendingDesc}
                                </motion.p>
                                {isDone && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.12 + 0.15, duration: 0.2 }}
                                    style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 500, marginTop: '4px', margin: 0 }}
                                  >
                                    {getStepDate(stepData)}
                                  </motion.p>
                                )}
                              </div>

                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    variants={itemVariants}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                      Items Ordered
                    </h3>

                    <motion.div
                      variants={listContainer}
                      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      {order.order_items?.map((item: any) => (
                        <motion.div
                          key={item.id}
                          variants={listItem}
                          style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}
                        >
                          <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--bg-muted)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Package size={20} color="var(--text-muted)" />
                            )}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{item.product_name}</h4>
                            {item.selected_variant && (
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
                                {Object.entries(item.selected_variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              </p>
                            )}
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatPrice(order.subtotal)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                          <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                          <span>-{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Shipping Fee</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {(() => {
                            const shipping = Number(order.total) - Number(order.subtotal) + Number(order.discount)
                            return shipping <= 0 ? 'Free' : formatPrice(shipping)
                          })()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '12px', fontSize: '15px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-primary)' }}>Total</span>
                        <span style={{ color: 'var(--brand)' }}>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .grid-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
        }
        @media (max-width: 1023px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .track-page-container {
            padding: 0 16px 60px 16px !important;
          }
          .track-page-title {
            font-size: 28px !important;
            margin-bottom: 12px !important;
          }
          .track-form-card {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div style={{ width: '100%', background: 'var(--bg)' }}>
        <AdminLoader />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}