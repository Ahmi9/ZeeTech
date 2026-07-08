'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from './Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (!isAdmin) {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [isAdmin])

  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  if (isAdmin) return null
  return <Navbar />
}