'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Category, SiteSettings } from '@/lib/types'

interface AppDataContextValue {
  categories: Category[]
  settings: SiteSettings | null
}

const AppDataContext = createContext<AppDataContextValue>({
  categories: [],
  settings: null,
})

export function useAppData() {
  return useContext(AppDataContext)
}

interface AppDataProviderProps {
  children: React.ReactNode
  initialCategories?: Category[]
  initialSettings?: SiteSettings | null
}

export function AppDataProvider({ children, initialCategories, initialSettings }: AppDataProviderProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? [])
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings ?? null)

  useEffect(() => {
    if (!initialCategories) {
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .then(({ data }) => {
          if (data) setCategories(data)
        })
    }

    if (!initialSettings) {
      supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single()
        .then(({ data }) => {
          if (data) setSettings(data)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppDataContext.Provider value={{ categories, settings }}>
      {children}
    </AppDataContext.Provider>
  )
}
