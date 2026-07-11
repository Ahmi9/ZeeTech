'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase-clients/browser'

// Demo/client role: can browse the whole admin panel, but mutations are
// blocked — server-side in proxy.ts (the real enforcement) and client-side
// here (friendly popup before the request is even attempted).
const DemoModeContext = createContext<{ isDemo: boolean; demoBlock: () => boolean }>({
  isDemo: false,
  demoBlock: () => false,
})

export function useDemoMode() {
  return useContext(DemoModeContext)
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setIsDemo] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsDemo(data.user?.app_metadata?.role === 'client')
    })
  }, [])

  // Returns true when the action should be blocked (demo account) and shows
  // the popup — call at the top of any mutation handler:
  //   if (demoBlock()) return
  const demoBlock = useCallback(() => {
    if (!isDemo) return false
    setPopupOpen(true)
    return true
  }, [isDemo])

  return (
    <DemoModeContext.Provider value={{ isDemo, demoBlock }}>
      {children}
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPopupOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--surface, #fff)',
                borderRadius: '16px',
                padding: '28px 24px',
                maxWidth: '360px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 24px 60px -16px rgba(0,0,0,0.35)',
              }}
            >
              <div
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--brand-light, #eaf0fe)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <ShieldAlert size={24} color="var(--brand, #2563eb)" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #111)', marginBottom: '8px' }}>
                Demo account
              </h3>
              <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: 'var(--text-muted, #666)', marginBottom: '20px' }}>
                In credentials se ye action available nahi hai. Aap panel explore kar
                sakte hain, lekin changes save nahi hongi.
              </p>
              <button
                onClick={() => setPopupOpen(false)}
                style={{
                  width: '100%', padding: '11px 16px', borderRadius: '10px',
                  border: 'none', cursor: 'pointer',
                  background: 'var(--brand, #2563eb)', color: '#fff',
                  fontSize: '14px', fontWeight: 500,
                }}
              >
                Theek hai
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoModeContext.Provider>
  )
}
