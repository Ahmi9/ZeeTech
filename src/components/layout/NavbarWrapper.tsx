'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isShowcase = pathname === '/'
  // Render nothing until mounted: Vercel's ISR can regenerate a page's HTML
  // under a different request path (seen live: showcase "/" cached with the
  // store navbar in it), and any SSR output that branches on usePathname then
  // hydration-mismatches (React #418), which stalls the whole page on mobile.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isAdmin) {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [isAdmin])

  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  if (!mounted || isAdmin || isShowcase) return null
  return <Navbar />
}
