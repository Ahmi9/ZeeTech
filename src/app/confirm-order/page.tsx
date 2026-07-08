'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PageSpacer from '@/components/layout/PageSpacer'
import Footer from '@/components/sections/Footer'
import AdminLoader from '@/components/ui/AdminLoader'
import AnimatedCheckmark from '@/components/ui/AnimatedCheckmark'
import { XCircle } from 'lucide-react'

type ConfirmationState = 'ready' | 'expired' | 'already_confirmed' | 'already_cancelled' | 'not_found'

function ConfirmOrderContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<ConfirmationState | null>(null)
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (!token) {
      setState('not_found')
      setLoading(false)
      return
    }
    fetch(`/api/orders/confirm?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(json => {
        setState(json.state)
        setOrder(json.order || null)
      })
      .catch(() => setState('not_found'))
      .finally(() => setLoading(false))
  }, [token])

  async function respond(action: 'confirm' | 'cancel') {
    if (!token) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      })
      const json = await res.json()
      if (json.state) setState(json.state)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ width: '100%', background: 'var(--bg)' }}>
        <AdminLoader />
      </div>
    )
  }

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg)',
  }

  const cardTextStyle: React.CSSProperties = {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '0 24px',
    textAlign: 'center',
  }

  if (state === 'not_found') {
    return (
      <div style={wrapperStyle}>
        <PageSpacer />
        <div style={{ ...cardTextStyle, paddingTop: '40px', paddingBottom: '100px' }}>
          <XCircle size={56} color="var(--danger)" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Link Not Found
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            This confirmation link is invalid. If you need help with your order, please contact us on WhatsApp.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (state === 'expired') {
    return (
      <div style={wrapperStyle}>
        <PageSpacer />
        <div style={{ ...cardTextStyle, paddingTop: '40px', paddingBottom: '100px' }}>
          <XCircle size={56} color="var(--danger)" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Link Expired
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            This confirmation link has expired. Please contact us on WhatsApp to confirm order {order?.order_number}.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (state === 'already_confirmed' || state === 'already_cancelled') {
    const confirmed = state === 'already_confirmed'
    return (
      <div style={wrapperStyle}>
        <PageSpacer />
        <div style={{ ...cardTextStyle, paddingTop: '40px', paddingBottom: '100px' }}>
          {confirmed ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <AnimatedCheckmark size={56} />
            </div>
          ) : (
            <XCircle size={56} color="var(--danger)" style={{ marginBottom: '20px' }} />
          )}
          <h1 style={{ fontSize: '24px', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {confirmed ? 'Order Confirmed' : 'Order Cancelled'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {order?.order_number && <>Order {order.order_number} — </>}
            {confirmed
              ? "Thank you! We're preparing your order for dispatch."
              : 'This order has been cancelled. If this was a mistake, please contact us on WhatsApp.'}
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  // state === 'ready'
  return (
    <div style={wrapperStyle}>
      <PageSpacer />
      <div style={{ ...cardTextStyle, paddingTop: '40px', paddingBottom: '100px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '12px' }}>
          Confirm Your Order
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '24px' }}>
          Order {order?.order_number}
        </h1>

        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '32px',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Hi {order?.customer_name}, please confirm the items below:
          </p>
          {order?.order_items?.map((item: any, index: number) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-primary)' }}>{item.product_name} × {item.quantity}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Rs {Math.round(item.total).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-primary)' }}>Total</span>
            <span style={{ color: 'var(--text-primary)' }}>Rs {Math.round(order?.total || 0).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => respond('cancel')}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            ❌ Cancel Order
          </button>
          <button
            onClick={() => respond('confirm')}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--brand)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            ✅ Confirm Order
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function ConfirmOrderPage() {
  return (
    <Suspense fallback={
      <div style={{ width: '100%', background: 'var(--bg)' }}>
        <AdminLoader />
      </div>
    }>
      <ConfirmOrderContent />
    </Suspense>
  )
}
