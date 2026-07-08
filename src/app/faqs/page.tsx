'use client'

import { useState } from 'react'
import PageSpacer from '@/components/layout/PageSpacer'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '@/components/sections/Footer'

const faqs = [
  {
    question: 'Are your products genuine?',
    answer: 'Yes, all our products are 100% genuine and sourced directly from authorized distributors. Every item comes with warranty coverage where applicable.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'We deliver across Pakistan within 3-5 business days. Same day delivery is available in Karachi, Lahore, and Islamabad for orders placed before 2pm.',
  },
  {
    question: 'Do you offer cash on delivery?',
    answer: 'Yes, we offer cash on delivery across all major cities in Pakistan. Online payment via JazzCash and EasyPaisa is also available.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy on all unused products in their original condition. Please contact us on WhatsApp to initiate a return.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order is dispatched, you will receive a tracking number via SMS and WhatsApp. You can use this to track your order in real time.',
  },
  {
    question: 'Do your products come with a warranty?',
    answer: 'Most electronics and accessories come with a manufacturer or seller warranty ranging from 7 days to 1 year, depending on the product. Warranty details are listed on each product page.',
  },
  {
    question: 'What if my product arrives faulty or damaged?',
    answer: 'Contact us on WhatsApp within 48 hours of delivery with photos/video of the issue, and we will arrange a free replacement or repair.',
  },
]

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '0px' }}>
      <PageSpacer />
      <div className="policy-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px 100px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Support
          </p>
          <h1 className="policy-title" style={{ fontSize: '44px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Everything you need to know about our products and services
          </p>
        </div>

        <div>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                borderTop: '1px solid var(--border)',
                borderBottom: index === faqs.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  padding: '20px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ fontSize: '20px', color: 'var(--brand)', fontWeight: 300 }}
                >
                  +
                </motion.div>
              </div>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, paddingBottom: '20px' }}>
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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
