'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface ErrorToastProps {
  message: string
}

export default function ErrorToast({ message }: ErrorToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            translateX: '-50%',
            background: 'var(--bg)',
            border: '1px solid #e5484d',
            borderRadius: '14px',
            padding: '14px 20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '90vw',
          }}
        >
          <AlertCircle size={18} color="#e5484d" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
