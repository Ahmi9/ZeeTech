'use client'

import { useEffect, useState } from 'react'
import PageSpacer from '@/components/layout/PageSpacer'
import Footer from '@/components/sections/Footer'
import { supabase } from '@/lib/supabase'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { formatPhonePKDisplay, formatPhoneWhatsApp } from '@/lib/phone'

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => { if (data) setSettings(data) })
  }, [])

  const cards = [
    {
      icon: Phone,
      title: 'Phone',
      value: settings?.store_phone ? formatPhonePKDisplay(settings.store_phone) : 'Not available',
      href: settings?.store_phone ? `tel:+${formatPhoneWhatsApp(settings.store_phone)}` : undefined,
    },
    {
      icon: Mail,
      title: 'Email',
      value: settings?.store_email || 'Not available',
      href: settings?.store_email ? `mailto:${settings.store_email}` : undefined,
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: settings?.whatsapp_number ? formatPhonePKDisplay(settings.whatsapp_number) : 'Not available',
      href: settings?.whatsapp_number ? `https://wa.me/${formatPhoneWhatsApp(settings.whatsapp_number)}` : undefined,
    },
    {
      icon: MapPin,
      title: 'Address',
      value: [settings?.store_address, settings?.store_city].filter(Boolean).join(', ') || 'Not available',
      href: undefined,
    },
  ]

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '0px' }}>
      <PageSpacer />
      <div className="policy-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px 100px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Get In Touch
          </p>
          <h1 className="policy-title" style={{ fontSize: '44px', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Contact Us
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Have a question? Reach out to us through any of these channels
          </p>
        </div>

        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {cards.map((card) => {
            const Icon = card.icon
            const content = (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--bg-subtle)',
                height: '100%',
                boxSizing: 'border-box',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: 'var(--brand-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color="var(--brand)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>
                    {card.value}
                  </p>
                </div>
              </div>
            )
            return card.href ? (
              <a key={card.title} href={card.href} target={card.title === 'WhatsApp' ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                {content}
              </a>
            ) : (
              <div key={card.title}>{content}</div>
            )
          })}
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
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
