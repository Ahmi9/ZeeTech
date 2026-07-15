'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'
import { useDemoMode } from '@/lib/demo-mode'

type PushState = 'unsupported' | 'loading' | 'off' | 'on' | 'denied' | 'busy'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

// Per-device toggle for new-order push notifications. Each browser/device has
// its own subscription — enabling here only affects this device.
// variant 'icon': compact header button (desktop). variant 'nav': full-width
// labelled row for the mobile sidebar drawer.
export default function PushBell({ variant = 'icon' }: { variant?: 'icon' | 'nav' }) {
  const { isDemo } = useDemoMode()
  const [state, setState] = useState<PushState>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('unsupported'))
  }, [])

  async function enable() {
    setState('busy')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!res.ok) {
        await sub.unsubscribe()
        setState('off')
        return
      }
      setState('on')
    } catch {
      setState('off')
    }
  }

  async function disable() {
    setState('busy')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/admin/push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {})
        await sub.unsubscribe()
      }
      setState('off')
    } catch {
      setState('on')
    }
  }

  // Demo users can't save subscriptions (mutations are blocked) — hide entirely.
  if (isDemo || state === 'loading') return null

  const isOn = state === 'on'
  const disabled = state === 'busy' || state === 'denied' || state === 'unsupported'

  // iOS Safari only exposes PushManager once the site is installed via
  // Add to Home Screen — surface that instead of silently hiding in the nav.
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)

  const title =
    state === 'unsupported'
      ? isIOS
        ? 'Add this site to your Home Screen to enable notifications'
        : 'Notifications are not supported in this browser'
      : state === 'denied'
        ? 'Notifications blocked — allow them in browser settings'
        : isOn
          ? 'Order notifications on (this device) — click to turn off'
          : 'Get notified on this device when a new order arrives'

  const icon =
    state === 'denied' || state === 'unsupported' ? (
      <BellOff size={variant === 'nav' ? 16 : 17} strokeWidth={1.75} />
    ) : isOn ? (
      <BellRing size={variant === 'nav' ? 16 : 17} strokeWidth={1.75} />
    ) : (
      <Bell size={variant === 'nav' ? 16 : 17} strokeWidth={1.75} />
    )

  if (variant === 'nav') {
    const label =
      state === 'unsupported'
        ? isIOS
          ? 'Notifications — add to Home Screen first'
          : 'Notifications not supported'
        : state === 'denied'
          ? 'Notifications blocked in browser'
          : isOn
            ? 'Order notifications: On'
            : 'Enable order notifications'
    return (
      <button
        onClick={isOn ? disable : enable}
        disabled={disabled}
        title={title}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          border: 'none',
          background: 'transparent',
          cursor: disabled ? 'default' : 'pointer',
          color: disabled ? 'var(--text-muted)' : isOn ? 'var(--brand)' : 'var(--text-secondary)',
          fontSize: '13px',
          textAlign: 'left',
          opacity: state === 'busy' ? 0.6 : 1,
        }}
      >
        {icon}
        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
      </button>
    )
  }

  if (state === 'unsupported') return null

  return (
    <button
      onClick={isOn ? disable : enable}
      disabled={disabled}
      aria-label={title}
      title={title}
      style={{
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        background: isOn ? 'var(--brand-light)' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        color: state === 'denied' ? 'var(--text-muted)' : isOn ? 'var(--brand)' : 'var(--text-secondary)',
        flexShrink: 0,
        transition: 'background 0.15s ease, color 0.15s ease',
        opacity: state === 'busy' ? 0.6 : 1,
      }}
    >
      {icon}
    </button>
  )
}
