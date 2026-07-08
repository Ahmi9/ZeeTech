'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PageSpacer from '@/components/layout/PageSpacer'
import Footer from '@/components/sections/Footer'
import AdminLoader from '@/components/ui/AdminLoader'
import AnimatedCheckmark from '@/components/ui/AnimatedCheckmark'
import { XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPhoneWhatsApp } from '@/lib/phone'

type ConfirmationState = 'ready' | 'expired' | 'already_confirmed' | 'already_cancelled' | 'not_found'

function ConfirmOrderContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<ConfirmationState | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [storeName, setStoreName] = useState('')

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

    supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => { if (data) setBankAccounts(data) })

    supabase
      .from('site_settings')
      .select('whatsapp_number, store_name')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
        if (data?.store_name) setStoreName(data.store_name)
      })
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

  function renderBankDetails() {
    if (order?.payment_type !== 'Advance Payment' || bankAccounts.length === 0) return null
    return (
      <div style={{
        background: 'var(--brand-light)',
        border: '1px solid var(--brand)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        textAlign: 'left',
      }}>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '12px', fontWeight: 600 }}>
          PAYMENT REQUIRED
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
          Please transfer <strong style={{ color: 'var(--text-primary)' }}>Rs {Math.round(order?.total || 0).toLocaleString()}</strong> to one of the accounts below and send the payment screenshot on WhatsApp to confirm your order.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {bankAccounts.map((bank) => (
            <div key={bank.id} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px 14px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{bank.method_name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Account Name: {bank.account_title}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Account No: {bank.account_number}</p>
              {bank.iban && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>IBAN: {bank.iban}</p>}
            </div>
          ))}
        </div>

        {whatsappNumber && (
          <a
            href={`https://wa.me/${formatPhoneWhatsApp(whatsappNumber)}?text=${encodeURIComponent(`Hi! I'm confirming Order #${order?.order_number} on ${storeName} for Rs ${Math.round(order?.total || 0).toLocaleString()}. Here is my payment screenshot.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              background: '#25D366',
              color: 'white',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L0 24l6.335-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.52-5.16-1.426L3 21.5l.95-3.762A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Send Payment Screenshot on WhatsApp
          </a>
        )}
      </div>
    )
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
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: confirmed ? '24px' : 0 }}>
            {order?.order_number && <>Order {order.order_number} — </>}
            {confirmed
              ? "Thank you! We're preparing your order for dispatch."
              : 'This order has been cancelled. If this was a mistake, please contact us on WhatsApp.'}
          </p>
          {confirmed && renderBankDetails()}
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
          {order?.order_number}
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
              <div>
                <span style={{ color: 'var(--text-primary)' }}>{item.product_name} × {item.quantity}</span>
                {item.selected_variant && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {Object.entries(item.selected_variant).map(([k, v]: [string, any]) => `${k}: ${v}`).join(' | ')}
                  </p>
                )}
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>Rs {Math.round(item.total).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span style={{ color: 'var(--text-secondary)' }}>Rs {Math.round(order?.subtotal || 0).toLocaleString()}</span>
          </div>
          {order?.coupon_code && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
              <span style={{ color: 'var(--success)' }}>Coupon ({order.coupon_code})</span>
              <span style={{ color: 'var(--success)' }}>- Rs {Math.round(order.coupon_discount || 0).toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {(order?.subtotal || 0) >= 2000 ? 'Free' : `Rs ${Math.round((order?.total || 0) - (order?.subtotal || 0) + (order?.discount || 0)).toLocaleString()}`}
            </span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-primary)' }}>Total</span>
            <span style={{ color: 'var(--text-primary)' }}>Rs {Math.round(order?.total || 0).toLocaleString()}</span>
          </div>
        </div>

        {renderBankDetails()}

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
