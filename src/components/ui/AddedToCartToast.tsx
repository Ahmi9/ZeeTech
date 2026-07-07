'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

interface AddedToCartToastProps {
  show: boolean
  productName: string
}

export default function AddedToCartToast({ show, productName }: AddedToCartToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            translateX: '-50%',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px 24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            minWidth: '280px',
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShoppingBag size={18} color="var(--success)" />
          </motion.div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Added to cart!
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {productName}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
