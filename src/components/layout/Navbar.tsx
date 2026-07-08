

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, X, ChevronDown, Home, MapPin, Package } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useAppData } from '@/components/providers/AppDataProvider'
import { useCartStore } from '@/store/cartStore'
import { formatPhoneWhatsApp } from '@/lib/phone'

export default function Navbar() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const { categories, settings } = useAppData()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const isDark = theme === 'dark'
  const totalItems = useCartStore(state => state.getTotalItems())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const parentCategories = categories.filter(c => !c.parent_id)
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const isAdmin = pathname?.startsWith('/admin')

  const announcementLines = settings?.announcement_bar_lines && settings.announcement_bar_lines.length > 0
    ? settings.announcement_bar_lines
    : ['Free delivery on orders above Rs 2,000']
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const announcementLinesRef = useRef(announcementLines)
  announcementLinesRef.current = announcementLines

  useEffect(() => {
    const id = setInterval(() => {
      setAnnouncementIndex(i => (i + 1) % announcementLinesRef.current.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const logoContent = settings?.logo_url
    ? <img src={settings.logo_url} alt={settings.store_name} style={{ height: '32px', objectFit: 'contain', display: 'block' }} />
    : <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>{settings?.store_name || 'Store'}</span>

  return (
    <>
      {settings?.announcement_bar_active && !isAdmin && (
        <div className="announcement-bar" style={{
          width: '100%', height: '36px', background: 'var(--brand)', color: 'white',
          textAlign: 'center', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center',
          justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
          padding: '0 16px', boxSizing: 'border-box', overflow: 'hidden',
        }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={announcementIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
            >
              {announcementLines[announcementIndex % announcementLines.length]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      <header className={`navbar-header ${settings?.announcement_bar_active && !isAdmin ? 'has-announcement' : ''}`} style={{
        position: 'fixed',
        top: settings?.announcement_bar_active && !isAdmin ? '36px' : 0,
        left: 0, right: 0, zIndex: 100,
        height: '64px',
        display: 'flex', alignItems: 'center',
        padding: '0 32px',
        background: isDark ? 'rgba(15,15,14,0.88)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled
          ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
          : '1px solid transparent',
        transition: 'border-color 0.25s ease, background 0.25s ease',
      }}>

        {/* ── MOBILE LAYOUT ── */}
        <div className="mobile-nav" style={{
          display: 'none', width: '100%',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Hamburger */}
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="mobile-hamburger" style={{
            width: '44px', height: '44px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', borderRadius: '12px',
            background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)',
            flexShrink: 0, transition: 'background 0.15s ease, transform 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>

          {/* Logo - center */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {logoContent}
          </Link>

          {/* Cart */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Link href="/cart" aria-label="Cart" className="mobile-cart-btn" style={{
              width: '44px', height: '44px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: '12px', color: 'var(--text-primary)',
              textDecoration: 'none', transition: 'background 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
            </Link>
            {mounted && totalItems > 0 && (
              <span className="cart-badge-pulse" style={{
                position: 'absolute', top: '4px', right: '4px',
                minWidth: '18px', height: '18px', padding: '0 5px', background: 'var(--brand)', color: '#fff',
                fontSize: '10px', fontWeight: 700, borderRadius: '99px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 2px var(--bg)',
              }}>{totalItems}</span>
            )}
          </div>
        </div>

        {/* ── DESKTOP LAYOUT ── */}
        <div className="desktop-nav" style={{
          display: 'flex', width: '100%', alignItems: 'center', position: 'relative',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, marginRight: '32px' }}>
            {logoContent}
          </Link>

          {/* Nav links */}
          <nav style={{
            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Link href="/" style={{
              fontSize: '13px', fontWeight: pathname === '/' ? 600 : 400,
              color: pathname === '/' ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
              letterSpacing: '0.02em', textTransform: 'uppercase',
            }}>Home</Link>

            {parentCategories.length > 0 && (
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setOpenDropdown('categories-menu')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <span style={{
                  fontSize: '13px', fontWeight: pathname.startsWith('/categories') ? 600 : 400,
                  color: pathname.startsWith('/categories') ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'default',
                  letterSpacing: '0.02em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>Categories<ChevronDown size={12} /></span>

                <AnimatePresence>
                  {openDropdown === 'categories-menu' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: '10px', padding: '12px', minWidth: '320px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 200,
                        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px 16px',
                      }}
                    >
                      {parentCategories.map((category, index) => {
                        const children = getChildren(category.id)
                        return (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 + index * 0.04, ease: 'easeOut' }}
                          >
                            <Link href={`/categories/${category.slug}`} style={{
                              display: 'block', padding: '7px 10px', fontSize: '13px', fontWeight: 600,
                              color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '6px',
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >{category.name}</Link>
                            {children.map(child => (
                              <Link key={child.id} href={`/categories/${child.slug}`} style={{
                                display: 'block', padding: '6px 10px 6px 20px', fontSize: '12px',
                                color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '6px',
                              }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                              >{child.name}</Link>
                            ))}
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <Link href="/track-order" style={{
              fontSize: '13px', fontWeight: pathname === '/track-order' ? 600 : 400,
              color: pathname === '/track-order' ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
              letterSpacing: '0.02em', textTransform: 'uppercase',
            }}>Track Order</Link>

            <Link href="/faqs" style={{
              fontSize: '13px', fontWeight: pathname === '/faqs' ? 600 : 400,
              color: pathname === '/faqs' ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
              letterSpacing: '0.02em', textTransform: 'uppercase',
            }}>FAQs</Link>

            <Link href="/contact" style={{
              fontSize: '13px', fontWeight: pathname === '/contact' ? 600 : 400,
              color: pathname === '/contact' ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: 'none', padding: '8px 16px', borderRadius: '8px',
              letterSpacing: '0.02em', textTransform: 'uppercase',
            }}>Contact Us</Link>
          </nav>

          {/* Cart */}
          <div style={{ position: 'relative', flexShrink: 0, marginLeft: 'auto' }}>
            <Link href="/cart" aria-label="Cart" style={{
              width: '40px', height: '40px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: '10px', color: 'var(--text-primary)',
              textDecoration: 'none', transition: 'background 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ShoppingBag size={19} strokeWidth={1.75} />
            </Link>
            {mounted && totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '16px', height: '16px', background: 'var(--brand)', color: '#fff',
                fontSize: '9px', fontWeight: 700, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{totalItems}</span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              }}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 'min(85vw, 340px)', minWidth: '300px',
                zIndex: 201, background: 'var(--bg)',
                borderRight: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
                boxShadow: '8px 0 32px rgba(0,0,0,0.18)',
              }}
            >
              {/* Brand accent strip */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-hover) 100%)',
                zIndex: 1,
              }} />

              {/* Drawer header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '24px 24px 20px',
                background: isDark
                  ? 'linear-gradient(180deg, var(--brand-light) 0%, transparent 100%)'
                  : 'linear-gradient(180deg, rgba(184,139,103,0.08) 0%, transparent 100%)',
                borderBottom: '1px solid var(--border)',
              }}>
                <Link href="/" onClick={() => setDrawerOpen(false)} style={{
                  textDecoration: 'none', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-start',
                }}>
                  {settings?.logo_url
                    ? <img src={settings.logo_url} alt={settings.store_name} style={{ height: '36px', objectFit: 'contain', display: 'block' }} />
                    : <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>{settings?.store_name || 'Store'}</span>}
                </Link>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{
                  width: '36px', height: '36px', border: '1px solid var(--border)',
                  borderRadius: '99px', background: 'var(--bg)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--text-secondary)',
                  position: 'absolute', right: '20px', top: '20px',
                  transition: 'background 0.15s ease, color 0.15s ease, transform 0.15s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 16px 16px', flex: 1, overflowY: 'auto' }}>

                {/* Home */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  <Link href="/" onClick={() => setDrawerOpen(false)} className="drawer-quick-link" style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    minHeight: '48px', padding: '12px 16px', borderRadius: '12px',
                    color: pathname === '/' ? 'var(--brand)' : 'var(--text-primary)',
                    background: pathname === '/' ? 'var(--brand-light)' : 'transparent',
                    textDecoration: 'none', fontSize: '14px', fontWeight: pathname === '/' ? 600 : 500,
                    borderLeft: pathname === '/' ? '3px solid var(--brand)' : '3px solid transparent',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                    onMouseEnter={e => { if (pathname !== '/') e.currentTarget.style.background = 'var(--bg-muted)' }}
                    onMouseLeave={e => { if (pathname !== '/') e.currentTarget.style.background = 'transparent' }}
                  >
                    <Home size={18} strokeWidth={1.75} />
                    <span>Home</span>
                  </Link>
                </div>

                {/* Categories dropdown */}
                {parentCategories.length > 0 && (
                  <div style={{ marginBottom: '4px' }}>
                    <button
                      onClick={() => setCategoriesOpen(!categoriesOpen)}
                      className="drawer-quick-link"
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        minHeight: '48px', padding: '12px 16px', borderRadius: '12px',
                        color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer',
                        borderLeft: '3px solid transparent',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500 }}>
                        <Package size={18} strokeWidth={1.75} />
                        Categories
                      </span>
                      <motion.span
                        animate={{ rotate: categoriesOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ display: 'flex', color: 'var(--text-muted)' }}
                      >
                        <ChevronDown size={18} strokeWidth={1.75} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {categoriesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden', paddingLeft: '12px' }}
                        >
                {parentCategories.map((category, idx) => {
                  const href = `/categories/${category.slug}`
                  const children = getChildren(category.id)
                  const hasChildren = children.length > 0
                  const isExpanded = expandedCategory === category.id
                  const isActive = pathname === href
                  return (
                    <div key={category.id} style={{
                      borderBottom: idx < parentCategories.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href={hasChildren ? '#' : href}
                          onClick={(e) => {
                            if (hasChildren) { e.preventDefault(); setExpandedCategory(isExpanded ? null : category.id) }
                            else setDrawerOpen(false)
                          }}
                          style={{
                            display: 'flex', alignItems: 'center',
                            minHeight: '48px', padding: '12px 16px', borderRadius: '12px',
                            color: isActive ? 'var(--brand)' : 'var(--text-primary)',
                            background: isActive ? 'var(--brand-light)' : 'transparent',
                            textDecoration: 'none', fontSize: '15px', fontWeight: isActive ? 600 : 500,
                            flex: 1, borderLeft: isActive ? '3px solid var(--brand)' : '3px solid transparent',
                            transition: 'background 0.15s ease, color 0.15s ease',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-muted)' }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                        >{category.name}</Link>
                        {hasChildren && (
                          <button onClick={() => setExpandedCategory(isExpanded ? null : category.id)} aria-label="Toggle submenu" className="drawer-chevron" style={{
                            width: '40px', height: '40px', border: 'none', borderRadius: '10px',
                            background: 'transparent', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                            marginRight: '8px', flexShrink: 0,
                            transition: 'background 0.15s ease, transform 0.25s ease',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <ChevronDown size={20} strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {hasChildren && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '4px 0 8px' }}>
                              {children.map(child => {
                                const childActive = pathname === `/categories/${child.slug}`
                                return (
                                  <Link key={child.id} href={`/categories/${child.slug}`}
                                    onClick={() => setDrawerOpen(false)}
                                    className="drawer-sub-link"
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '12px',
                                      minHeight: '44px', padding: '10px 16px 10px 40px',
                                      borderRadius: '10px', textDecoration: 'none',
                                      color: childActive ? 'var(--brand)' : 'var(--text-secondary)',
                                      fontSize: '14px', fontWeight: childActive ? 600 : 400,
                                      transition: 'background 0.15s ease, color 0.15s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <span>{child.name}</span>
                                  </Link>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Track Order */}
                <Link href="/track-order" onClick={() => setDrawerOpen(false)} className="drawer-quick-link" style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  minHeight: '48px', padding: '12px 16px', borderRadius: '12px',
                  color: 'var(--text-primary)', background: 'transparent',
                  textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                  borderLeft: '3px solid transparent', marginTop: '4px',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={18} strokeWidth={1.75} />
                  <span>Track Order</span>
                </Link>
              </nav>

              {/* Bottom section */}
              <div style={{
                marginTop: 'auto', padding: '16px 16px 20px',
                borderTop: '1px solid var(--border)',
                background: isDark ? 'var(--bg-subtle)' : 'rgba(0,0,0,0.015)',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}>

                {/* My Cart link */}
                <Link href="/cart" onClick={() => setDrawerOpen(false)} className="drawer-cart-link" style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '12px',
                  background: 'var(--brand)', color: 'var(--brand-fg)',
                  textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                  transition: 'background 0.15s ease, transform 0.15s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-hover)'}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = 'scale(1)' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <ShoppingBag size={20} strokeWidth={1.75} />
                  <span style={{ flex: 1 }}>My Cart</span>
                  {mounted && totalItems > 0 && (
                    <span style={{
                      minWidth: '24px', height: '22px', padding: '0 8px',
                      background: 'var(--brand-fg)', color: 'var(--brand)',
                      fontSize: '11px', fontWeight: 700, borderRadius: '99px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{totalItems}</span>
                  )}
                </Link>

                {/* Social links card */}
                {(settings?.whatsapp_number || settings?.instagram_handle) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'var(--text-muted)',
                      padding: '0 4px',
                    }}>Follow Us</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {settings?.whatsapp_number && (
                        <a href={`https://wa.me/${formatPhoneWhatsApp(settings.whatsapp_number)}`} target="_blank" rel="noopener noreferrer"
                          className="drawer-social-link" style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 14px', borderRadius: '10px',
                            background: 'var(--bg-muted)',
                            color: 'var(--text-primary)',
                            textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                            transition: 'background 0.15s ease, transform 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.transform = 'translateX(0)' }}
                          onMouseDown={e => e.currentTarget.style.transform = 'translateX(2px)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                          <span style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: '#25D366', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          </span>
                          <span style={{ flex: 1 }}>WhatsApp</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chat</span>
                        </a>
                      )}
                      {settings?.instagram_handle && (
                        <a href={`https://instagram.com/${settings.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                          className="drawer-social-link" style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 14px', borderRadius: '10px',
                            background: 'var(--bg-muted)',
                            color: 'var(--text-primary)',
                            textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                            transition: 'background 0.15s ease, transform 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.transform = 'translateX(0)' }}
                          onMouseDown={e => e.currentTarget.style.transform = 'translateX(2px)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                          <span style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                          </span>
                          <span style={{ flex: 1 }}>{settings.instagram_handle}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Follow</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .mobile-nav { display: flex !important; }
          .desktop-nav { display: none !important; }
          .navbar-header { padding: 0 16px !important; }
          .navbar-header.has-announcement { top: 38px !important; }
        }

        @media (max-width: 768px) {
          .announcement-bar {
            height: 38px !important;
            font-size: 14px !important;
          }
        }

        @keyframes cartBadgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .cart-badge-pulse {
          animation: cartBadgePulse 1.8s ease-in-out infinite;
        }

        @media (hover: none) {
          .mobile-hamburger:active {
            background: var(--bg-muted) !important;
            transform: scale(0.95) !important;
          }
          .drawer-quick-link:active,
          .drawer-sub-link:active,
          .drawer-chevron:active,
          .drawer-social-link:active {
            background: var(--bg-muted) !important;
          }
          .drawer-cart-link:active {
            background: var(--brand-hover) !important;
          }
        }
      `}</style>
    </>
  )
}