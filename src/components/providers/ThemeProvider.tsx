'use client'

import { createContext, useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme }>({ theme: 'light' })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const theme: Theme = isAdmin ? 'dark' : 'light'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)