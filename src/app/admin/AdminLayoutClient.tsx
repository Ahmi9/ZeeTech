'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, FolderOpen, ShoppingBag, Tag, Settings2, Menu, X, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase-clients/browser'

const navLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Settings', href: '/admin/settings', icon: Settings2 },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push('/admin-login')
    router.refresh()
  }
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  useEffect(() => {
    setMobileDrawerOpen(false)
  }, [pathname])
  useEffect(() => {
    const fetchPendingCount = () => {
      fetch('/api/admin/pending-count')
        .then(res => res.json())
        .then(json => setPendingOrdersCount(json.count || 0))
        .catch(() => {})
    }
    fetchPendingCount()
    window.addEventListener('admin:orders-updated', fetchPendingCount)
    return () => window.removeEventListener('admin:orders-updated', fetchPendingCount)
  }, [pathname])
  useEffect(() => {
    document.body.style.overflow = mobileDrawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileDrawerOpen])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="admin-header" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '60px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open menu"
          className="admin-hamburger"
          style={{
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderRadius: '8px',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-primary)', flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <span style={{
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          paddingLeft: '24px',
        }}>
          ZeeTech Admin
        </span>
        <div style={{ width: '44px' }} className="admin-header-spacer" />
      </header>

      <div style={{ paddingTop: '60px', display: 'flex', minHeight: '100vh' }}>
        <aside className={`admin-sidebar ${mobileDrawerOpen ? 'is-open' : ''}`} style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          width: '220px',
          height: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-subtle)',
          borderRight: '1px solid var(--border)',
        }}>
          <div className="admin-sidebar-mobile-header" style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Menu</span>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close menu"
              className="admin-sidebar-close"
              style={{
                width: '32px', height: '32px',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                background: 'var(--bg)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={16} />
            </button>
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px', paddingTop: '16px' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 14px',
                    margin: '1px 8px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: isActive ? 500 : 400,
                    background: 'transparent',
                    transition: 'color 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-active"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'var(--brand-light)',
                        borderRadius: '8px',
                        zIndex: 0,
                      }}
                      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}
                  >
                    <Icon size={16} />
                  </motion.div>
                  <span style={{ position: 'relative', zIndex: 1, flex: 1 }}>{link.label}</span>
                  {link.href === '/admin/orders' && pendingOrdersCount > 0 && (
                    <span style={{
                      position: 'relative',
                      zIndex: 1,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 5px',
                      borderRadius: '999px',
                      background: 'var(--brand)',
                      color: 'var(--brand-fg)',
                      fontSize: '10px',
                      fontWeight: 700,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}>
                      {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Theme</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                style={{
                  width: '32px', height: '32px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="admin-backdrop"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 90,
              }}
            />
          )}
        </AnimatePresence>

        <main className="admin-main" style={{
          marginLeft: '220px',
          width: 'calc(100% - 220px)',
          minHeight: 'calc(100vh - 60px)',
          background: 'var(--bg)',
          padding: '32px',
          boxSizing: 'border-box',
        }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <style>{`
        .admin-hamburger { display: none !important; }
        .admin-header-spacer { display: none !important; }
        .admin-sidebar-close { display: none !important; }
        .admin-sidebar-mobile-header { display: none !important; }

        @media (max-width: 768px) {
          .admin-hamburger {
            display: flex !important;
          }
          .admin-hamburger:hover {
            background: var(--bg-muted);
          }
          .admin-header-spacer {
            display: block !important;
          }

          .admin-header {
            padding: 0 16px !important;
          }

          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            z-index: 95;
          }
          .admin-sidebar.is-open {
            transform: translateX(0);
          }

          .admin-sidebar-mobile-header {
            display: flex !important;
          }

          .admin-sidebar-close {
            display: flex !important;
          }

          .admin-main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}