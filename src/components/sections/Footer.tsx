'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppData } from '@/components/providers/AppDataProvider'
import { formatPhonePKDisplay, formatPhoneWhatsApp } from '@/lib/phone'
import {
  ChevronRight, ChevronDown, HelpCircle, Truck, RotateCcw, MapPin, Phone,
  Shield, Headphones, BadgeCheck, Zap, Watch, Plug, Speaker, Package,
} from 'lucide-react'

function getCategoryIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('power') || n.includes('bank')) return Zap
  if (n.includes('watch')) return Watch
  if (n.includes('cable') || n.includes('adapter') || n.includes('charger')) return Plug
  if (n.includes('speaker') || n.includes('sound')) return Speaker
  if (n.includes('airpod') || n.includes('earbud') || n.includes('headphone')) return Headphones
  return Package
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L0 24l6.335-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.52-5.16-1.426L3 21.5l.95-3.762A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}

export default function Footer() {
  const { categories, settings } = useAppData()
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  const parentCategories = categories.filter(c => !c.parent_id)
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId)

  return (
    <footer className="footer-root" style={{
      width: '100%',
      background: 'var(--bg-subtle)',
      borderTop: '1px solid var(--border)',
      padding: '80px 0 40px',
    }}>
      <div className="footer-inner footer-desktop" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px',
          }}
        >
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}>
              {settings?.store_name || 'Store'}
            </h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '12px',
              maxWidth: '200px',
              lineHeight: 1.6,
            }}>
              {settings?.store_name || 'Store'} — Premium tech accessories crafted for the modern lifestyle
            </p>
          </div>

          <div>
            <h4 style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
            }}>
              Shop
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {parentCategories.map((cat) => {
                const children = getChildren(cat.id)
                const hasChildren = children.length > 0
                const isExpanded = expandedCat === cat.id
                return (
                  <div key={cat.id}>
                    <Link
                      href={hasChildren ? '#' : `/categories/${cat.slug}`}
                      onClick={(e) => { if (hasChildren) { e.preventDefault(); setExpandedCat(isExpanded ? null : cat.id) } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        lineHeight: '2.2',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {cat.name}
                      {hasChildren && (
                        <ChevronDown
                          size={12}
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                        />
                      )}
                    </Link>
                    <AnimatePresence initial={false}>
                      {hasChildren && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          {children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/categories/${child.slug}`}
                              style={{
                                display: 'block',
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                textDecoration: 'none',
                                paddingLeft: '12px',
                                lineHeight: '2',
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
            }}>
              Help
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link
                href="/faqs"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  lineHeight: '2.2',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                FAQs
              </Link>
              <Link
                href="/shipping-policy"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  lineHeight: '2.2',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Shipping Policy
              </Link>
              <Link
                href="/return-policy"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  lineHeight: '2.2',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Return Policy
              </Link>
              <Link
                href="/track-order"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  lineHeight: '2.2',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Track Order
              </Link>
              <Link
                href="/contact"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  lineHeight: '2.2',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
            }}>
              Contact
            </h4>
            <a
              href={`https://wa.me/${formatPhoneWhatsApp(settings?.whatsapp_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                display: 'block',
                marginTop: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {settings?.whatsapp_number ? formatPhonePKDisplay(settings.whatsapp_number) : '+92 300 0000000'}
            </a>
            <a
              href={`mailto:${settings?.store_email}`}
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                display: 'block',
                marginTop: '8px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {settings?.store_email || 'store@email.com'}
            </a>
            <a
              href={`https://instagram.com/${settings?.instagram_handle?.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                display: 'block',
                marginTop: '8px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {settings?.instagram_handle || '@store'}
            </a>
          </div>
        </div>

        <div
          className="footer-bottom"
          style={{
            borderTop: '1px solid var(--border)',
            marginTop: '60px',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2026 {settings?.store_name || 'Store'}. All rights reserved.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Made in Pakistan
          </p>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="footer-mobile" style={{ display: 'none', padding: '0 16px' }}>
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Shop
          </h3>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '4px' }} />
          {parentCategories.map((cat) => {
            const children = getChildren(cat.id)
            const hasChildren = children.length > 0
            const isExpanded = expandedCat === cat.id
            const Icon = getCategoryIcon(cat.name)
            return (
              <div key={cat.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Link
                    href={hasChildren ? '#' : `/categories/${cat.slug}`}
                    onClick={(e) => { if (hasChildren) { e.preventDefault(); setExpandedCat(isExpanded ? null : cat.id) } }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 4px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '14px',
                    }}
                  >
                    <Icon size={18} color="var(--brand)" />
                    <span style={{ flex: 1 }}>{cat.name}</span>
                    {hasChildren ? (
                      <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    ) : (
                      <ChevronRight size={16} color="var(--text-muted)" />
                    )}
                  </Link>
                </div>
                <AnimatePresence initial={false}>
                  {hasChildren && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: 'hidden', paddingLeft: '30px' }}
                    >
                      <div style={{ paddingBottom: '4px' }}>
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.slug}`}
                            style={{ display: 'block', padding: '8px 4px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Help &amp; Support
          </h3>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '4px' }} />
          {[
            { icon: HelpCircle, label: 'FAQs', href: '/faqs' },
            { icon: Truck, label: 'Shipping Policy', href: '/shipping-policy' },
            { icon: RotateCcw, label: 'Return Policy', href: '/return-policy' },
            { icon: MapPin, label: 'Track Order', href: '/track-order' },
            { icon: Phone, label: 'Contact Us', href: '/contact' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 4px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '14px',
              }}
            >
              <item.icon size={18} color="var(--brand)" />
              <span style={{ flex: 1 }}>{item.label}</span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>
          ))}
        </div>

        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <Shield size={22} color="var(--brand)" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>100% Genuine</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Products</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Truck size={22} color="var(--brand)" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>Free Delivery</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Above Rs {Math.round(settings?.free_shipping_threshold || 2000).toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Headphones size={22} color="var(--brand)" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>Customer Support</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>7 Days a Week</p>
            </div>
          </div>

          {settings?.whatsapp_number && (
            <a
              href={`https://wa.me/${formatPhoneWhatsApp(settings.whatsapp_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '12px', background: '#075E54', color: 'white',
                borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              <WhatsAppIcon size={16} />
              Chat on WhatsApp
            </a>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { icon: Shield, label: 'Secure Payments' },
            { icon: RotateCcw, label: '7 Days Return' },
            { icon: BadgeCheck, label: '1 Year Warranty' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <item.icon size={13} color="var(--text-muted)" />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '24px' }}>
          © 2026 {settings?.store_name || 'Store'}. All rights reserved.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-root {
            padding: 32px 0 0 !important;
          }
          .footer-desktop {
            display: none !important;
          }
          .footer-mobile {
            display: block !important;
          }
        }
      `}</style>
    </footer>
  )
}