'use client'

import Footer from '@/components/sections/Footer'
import PageSpacer from '@/components/layout/PageSpacer'

export default function ShippingPolicyPage() {
  const sections = [
    {
      title: 'DELIVERY TIMEFRAME',
      body: 'We deliver across all major cities in Pakistan within 3-5 business days. For remote areas, delivery may take 5-7 business days. Same day delivery is available in Karachi, Lahore, and Islamabad for orders placed before 2:00 PM.',
    },
    {
      title: 'SHIPPING CHARGES',
      body: 'We offer free shipping on all orders above Rs 2,000. For orders below Rs 2,000, a flat shipping fee of Rs 150 is charged. Cash on delivery orders may incur an additional handling fee of Rs 50.',
    },
    {
      title: 'ORDER TRACKING',
      body: 'Once your order is dispatched, you will receive a tracking number via SMS and WhatsApp within 24 hours. You can use this tracking number to monitor your shipment in real time through our courier partner\'s website.',
    },
    {
      title: 'CASH ON DELIVERY',
      body: 'We offer cash on delivery across Pakistan. Please ensure someone is available at the delivery address to receive and pay for the order. Our courier partners will attempt delivery twice before returning the order.',
    },
    {
      title: 'FAILED DELIVERIES',
      body: 'If a delivery attempt fails due to an incorrect address or unavailability of the recipient, the order will be returned to us. Re-shipping charges will apply for resending the order.',
    },
    {
      title: 'INTERNATIONAL SHIPPING',
      body: 'We currently do not offer international shipping. We only deliver within Pakistan.',
    },
  ]

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '0px' }}>
      <PageSpacer />
      <div className="policy-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px 100px 40px' }}>
        <div style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Policies
          </p>
          <h1 className="policy-title" style={{ fontSize: '44px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Shipping Policy
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Everything you need to know about our shipping and delivery
          </p>
        </div>

        <div>
          {sections.map((section, index) => (
            <div key={index}>
              <h2 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px' }}>
                {section.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '40px' }}>
                {section.body}
              </p>
              {index < sections.length - 1 && (
                <div style={{ borderTop: '1px solid var(--border)', marginBottom: '40px' }} />
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          .policy-page {
            padding: 0 16px 60px 16px !important;
          }
          .policy-title {
            font-size: 28px !important;
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}
