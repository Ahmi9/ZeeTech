'use client'

import Footer from '@/components/sections/Footer'
import PageSpacer from '@/components/layout/PageSpacer'

export default function ReturnPolicyPage() {
  const sections = [
    {
      title: 'RETURN ELIGIBILITY',
      body: 'We accept returns within 7 days of delivery. Products must be unused, unwashed, and in their original condition with all tags and packaging intact. Custom or personalized products are not eligible for return.',
    },
    {
      title: 'HOW TO INITIATE A RETURN',
      body: 'To initiate a return, contact us on WhatsApp at +92 300 0000000 within 7 days of receiving your order. Share your order number and reason for return. Our team will guide you through the process.',
    },
    {
      title: 'RETURN SHIPPING',
      body: 'Customers are responsible for return shipping costs unless the product received was defective or incorrect. We recommend using a trackable courier service for returns as we cannot be held responsible for lost return shipments.',
    },
    {
      title: 'REFUNDS',
      body: 'Once we receive and inspect the returned product, we will process your refund within 5-7 business days. Refunds are issued to the original payment method. Cash on delivery orders will be refunded via EasyPaisa or JazzCash.',
    },
    {
      title: 'EXCHANGES',
      body: 'We offer exchanges on all eligible products subject to availability. If you wish to exchange a product for a different size or color, please mention this when contacting us on WhatsApp.',
    },
    {
      title: 'DEFECTIVE OR INCORRECT PRODUCTS',
      body: 'If you receive a defective or incorrect product, please contact us within 48 hours of delivery with photos of the issue. We will arrange a free return pickup and send a replacement at no extra cost.',
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
            Return Policy
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Everything you need to know about returns and refunds
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
