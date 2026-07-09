'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase-clients/browser'
import ErrorToast from '@/components/ui/ErrorToast'

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(''), 5000)
    return () => clearTimeout(timer)
  }, [error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const supabase = createBrowserSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Incorrect email or password')
        return
      }
      router.push('/admin')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const supabase = createBrowserSupabaseClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin-reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setMessage('If that email has an account, a reset link has been sent.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '24px',
      }}
    >
      <ErrorToast message={error} />
      <motion.form
        key={mode}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onSubmit={mode === 'signin' ? handleSubmit : handleResetRequest}
        noValidate
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          padding: '40px 32px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        <motion.div
          custom={0}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '4px' }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 16 }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--brand-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand)',
            }}
          >
            <Lock size={22} strokeWidth={1.75} />
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              {mode === 'signin' ? 'Admin Sign In' : 'Reset Password'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {mode === 'signin' ? 'Demo Store control panel' : 'We’ll email you a reset link'}
            </p>
          </div>
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className="admin-input"
            style={{
              padding: '11px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'signin' && (
            <motion.div
              key="password-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}
            >
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input"
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ color: 'var(--success)', fontSize: '13px', margin: 0, textAlign: 'center', overflow: 'hidden' }}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: loading ? 1 : 1.015 }}
          whileTap={{ scale: loading ? 1 : 0.985 }}
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--brand)',
            color: 'var(--brand-fg)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {loading && <Loader2 size={16} className="spin" />}
          {loading
            ? (mode === 'signin' ? 'Signing in...' : 'Sending...')
            : (mode === 'signin' ? 'Sign in' : 'Send reset link')}
        </motion.button>

        <motion.button
          custom={3}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'reset' : 'signin')
            setError('')
            setMessage('')
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            cursor: 'pointer',
            textAlign: 'center',
            padding: 0,
          }}
        >
          {mode === 'signin' ? 'Forgot password?' : 'Back to sign in'}
        </motion.button>
      </motion.form>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .admin-input:focus { border-color: var(--brand) !important; box-shadow: 0 0 0 3px var(--brand-light); }
        .admin-input:invalid { box-shadow: none; }
      `}</style>
    </div>
  )
}
