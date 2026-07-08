'use client'

import { Suspense, useEffect, useState } from 'react'
import PageSpacer from '@/components/layout/PageSpacer'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Footer from '@/components/sections/Footer'
import AdminLoader from '@/components/ui/AdminLoader'
import AnimatedCheckmark from '@/components/ui/AnimatedCheckmark'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const phone = searchParams.get('phone')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [storeName, setStoreName] = useState('')
  const [bankAccounts, setBankAccounts] = useState<any[]>([])

  useEffect(() => {
    if (orderId && phone) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
    fetchSiteSettings()
    fetchBankAccounts()
  }, [orderId, phone])

  const fetchOrderDetails = async () => {
    const res = await fetch(`/api/orders/confirmation?id=${orderId}&phone=${encodeURIComponent(phone || '')}`)
    const json = await res.json()
    if (res.ok && json.order) setOrder(json.order)
    setLoading(false)
  }

  const fetchSiteSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('whatsapp_number, store_name')
      .eq('id', 1)
      .single()
    if (data) setWhatsappNumber(data.whatsapp_number)
    if (data?.store_name) setStoreName(data.store_name)
  }

  const fetchBankAccounts = async () => {
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    if (data) setBankAccounts(data)
  }

  const labelStyle = {
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '12px',
    display: 'block',
  }

  if (loading) {
    return (
      <div style={{ width: '100%', background: 'var(--bg)' }}>
        <AdminLoader />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', background: 'var(--bg)' }}>
        <PageSpacer />
      <div className="confirm-page" style={{ maxWidth: '640px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <AnimatedCheckmark size={64} />
        </div>
        <h1 className="confirm-title" style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Thank you for your order. We'll contact you shortly to confirm.
        </p>
        <span
          style={{
            background: 'var(--brand-light)',
            color: 'var(--brand)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '6px 16px',
            borderRadius: '999px',
            display: 'inline-block',
            marginTop: '16px',
            marginBottom: '40px',
          }}
        >
          Order #{order?.order_number}
        </span>

        {order && (
          <div className="confirm-card" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'left', marginBottom: '24px' }}>
            <p style={labelStyle}>DELIVERY TO</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{order.customer_name}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.customer_phone}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.customer_address}, {order.customer_city}</p>

            <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            <p style={labelStyle}>ORDER ITEMS</p>
            {order.order_items?.map((item: any, index: number) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {item.product_name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    x{item.quantity}
                  </span>
                  {item.selected_variant && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {Object.entries(item.selected_variant).map(([k, v]: [string, any]) => `${k}: ${v}`).join(' | ')}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                  Rs {Math.round(Number(item.total)).toLocaleString()}
                </span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Rs {Math.round(order.subtotal).toLocaleString()}</span>
            </div>
            {order.coupon_code && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: '13px', color: 'var(--success)' }}>Coupon ({order.coupon_code})</span>
                <span style={{ fontSize: '13px', color: 'var(--success)' }}>- Rs {Math.round(order.coupon_discount).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{order.subtotal >= 2000 ? 'Free' : `Rs ${Math.round(order.total - order.subtotal + order.discount).toLocaleString()}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Rs {Math.round(order.total).toLocaleString()}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Payment</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{order.payment_type}</span>
            </div>
          </div>
        )}

        {order?.payment_type === 'Advance Payment' && bankAccounts.length > 0 && (
          <div className="confirm-card" style={{
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
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I just placed Order #${order?.order_number} on ${storeName} for Rs ${Math.round(order?.total || 0).toLocaleString()}. Here is my payment screenshot.`)}`}
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
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L0 24l6.335-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.52-5.16-1.426L3 21.5l.95-3.762A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Send Payment Screenshot on WhatsApp
              </a>
            )}
          </div>
        )}

        <div className="confirm-buttons" style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            href="/"
            className="confirm-btn"
            style={{
              border: '1px solid var(--border-strong)',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'transform 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = 'var(--bg-muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.background = 'transparent'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
          >
            Continue Shopping
          </Link>
          <Link
            href="/track-order"
            className="confirm-btn"
            style={{
              background: 'var(--brand)',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '13px',
              textDecoration: 'none',
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
            Track Order
          </Link>
        </div>

        <div style={{ marginTop: '32px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Questions about your order?</p>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber?.replace(/\D/g, '')}`}
              style={{ fontSize: '13px', color: 'var(--brand)', textDecoration: 'none', marginTop: '8px', display: 'block' }}
            >
              Chat with us on WhatsApp
            </a>
          )}
        </div>

        </div>
      <div style={{ height: '120px' }} />
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .confirm-page {
            padding: 0 16px !important;
          }
          .confirm-title {
            font-size: 24px !important;
          }
          .confirm-card {
            padding: 16px !important;
          }
          .confirm-buttons {
            flex-direction: column !important;
            margin-top: 24px !important;
          }
          .confirm-btn {
            width: 100% !important;
            box-sizing: border-box !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ width: '100%', background: 'var(--bg)' }}>
        <AdminLoader />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}