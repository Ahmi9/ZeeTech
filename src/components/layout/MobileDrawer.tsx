'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
} from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/deals', label: 'Deals' },
  { href: '/about', label: 'About' },
]

export function MobileDrawer() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost p-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden"
              style={{ background: 'var(--surface)' }}
            >
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Menu
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="btn-ghost p-2"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 rounded-md text-sm font-medium transition-colors"
                    style={{
                      color: 'var(--text-secondary)',
                      background: pathname === link.href ? 'var(--bg-muted)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div
                className="flex items-center gap-4 p-4 border-t mt-4"
                style={{ borderColor: 'var(--border)' }}
              >
                <Link
                  href="/wishlist"
                  className="btn-ghost p-2 relative"
                  aria-label="Wishlist"
                >
                  <Heart size={20} />
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-medium flex items-center justify-center"
                    style={{
                      background: 'var(--brand)',
                      color: 'var(--brand-fg)',
                    }}
                  >
                    0
                  </span>
                </Link>
                <Link
                  href="/cart"
                  className="btn-ghost p-2 relative"
                  aria-label="Cart"
                >
                  <ShoppingCart size={20} />
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-medium flex items-center justify-center"
                    style={{
                      background: 'var(--brand)',
                      color: 'var(--brand-fg)',
                    }}
                  >
                    0
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}