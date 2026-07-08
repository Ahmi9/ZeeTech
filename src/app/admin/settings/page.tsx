'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SiteSettings } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLoader from '@/components/ui/AdminLoader'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [storeName, setStoreName] = useState('')
  const [storeEmail, setStoreEmail] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [storeCity, setStoreCity] = useState('')

  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')

  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')

  const [announcementLines, setAnnouncementLines] = useState<string[]>([])
  const [announcementActive, setAnnouncementActive] = useState(false)
  const [showAddAnnouncementLine, setShowAddAnnouncementLine] = useState(false)
  const [newAnnouncementLine, setNewAnnouncementLine] = useState('')

  const [freeShippingThreshold, setFreeShippingThreshold] = useState('')
  const [shippingFee, setShippingFee] = useState('')

  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [showBankForm, setShowBankForm] = useState(false)
  const [bankForm, setBankForm] = useState({ method_name: '', account_title: '', account_number: '', iban: '' })
  const [bankFormErrors, setBankFormErrors] = useState<Record<string, string>>({})
  const [savingBank, setSavingBank] = useState(false)


  useEffect(() => {
    fetchSettings()
    fetchBankAccounts()
  }, [])

  async function fetchSettings() {
    const json = await fetch('/api/admin/settings').then(res => res.json())
    const data = json.settings

    if (data) {
      setStoreName(data.store_name || '')
      setStoreEmail(data.store_email || '')
      setStorePhone(data.store_phone || '')
      setStoreAddress(data.store_address || '')
      setStoreCity(data.store_city || '')
      setWhatsappNumber(data.whatsapp_number || '')
      setInstagramHandle(data.instagram_handle || '')
      setHeroTitle(data.hero_title || '')
      setHeroSubtitle(data.hero_subtitle || '')
      setAnnouncementLines(data.announcement_bar_lines || [])
      setAnnouncementActive(data.announcement_bar_active || false)
      setFreeShippingThreshold(data.free_shipping_threshold?.toString() || '')
      setShippingFee(data.shipping_fee?.toString() || '')
    }
    setLoading(false)
  }

  function addAnnouncementLine() {
    if (!newAnnouncementLine.trim() || announcementLines.length >= 5) return
    setAnnouncementLines(prev => [...prev, newAnnouncementLine.trim()])
    setNewAnnouncementLine('')
    setShowAddAnnouncementLine(false)
  }

  function cancelAddAnnouncementLine() {
    setNewAnnouncementLine('')
    setShowAddAnnouncementLine(false)
  }

  function deleteAnnouncementLine(index: number) {
    setAnnouncementLines(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSuccessMessage('')
    setErrorMessage('')
    setSaving(true)

    const settings = {
      store_name: storeName,
      store_email: storeEmail,
      store_phone: storePhone,
      store_address: storeAddress,
      store_city: storeCity,
      whatsapp_number: whatsappNumber,
      instagram_handle: instagramHandle,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      announcement_bar_lines: announcementLines,
      announcement_bar_active: announcementActive,
      free_shipping_threshold: parseFloat(freeShippingThreshold) || 0,
      shipping_fee: parseFloat(shippingFee) || 0,
    }

    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })

    if (!res.ok) {
      setErrorMessage('Failed to save settings')
      setTimeout(() => setErrorMessage(''), 3000)
    } else {
      setSuccessMessage('Settings saved successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
    setSaving(false)
  }

  async function fetchBankAccounts() {
    const json = await fetch('/api/admin/bank-accounts').then(res => res.json())
    if (json.bankAccounts) setBankAccounts(json.bankAccounts)
  }

  async function handleAddBank() {
    const errs: Record<string, string> = {}
    if (!bankForm.method_name.trim()) errs.method_name = 'Bank name is required'
    if (!bankForm.account_title.trim()) errs.account_title = 'Account name is required'
    if (!bankForm.account_number.trim()) errs.account_number = 'Account number is required'
    setBankFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSavingBank(true)
    await fetch('/api/admin/bank-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method_name: bankForm.method_name,
        account_title: bankForm.account_title,
        account_number: bankForm.account_number,
        iban: bankForm.iban || null,
        display_order: bankAccounts.length + 1,
        is_active: true,
      }),
    })
    setBankForm({ method_name: '', account_title: '', account_number: '', iban: '' })
    setBankFormErrors({})
    setShowBankForm(false)
    setSavingBank(false)
    fetchBankAccounts()
  }

  async function handleDeleteBank(id: string) {
    await fetch('/api/admin/bank-accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: false }),
    })
    fetchBankAccounts()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border-strong)',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    display: 'block',
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  }

  if (loading) {
    return <AdminLoader />
  }

  return (
    <motion.div
      style={{ width: '100%' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
        Settings
      </h1>
      <p className="admin-page-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Manage your store configuration
      </p>

      <div className="settings-columns" style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 2, minWidth: 0 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Store Information
            </h2>
            <label style={labelStyle}>Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
            <label style={labelStyle}>Store Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
            <label style={labelStyle}>Store Phone</label>
            <input
              type="text"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
            <label style={labelStyle}>Store Address</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
            <label style={labelStyle}>Store City</label>
            <input
              type="text"
              value={storeCity}
              onChange={(e) => setStoreCity(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Social & Contact
            </h2>
            <label style={labelStyle}>WhatsApp Number</label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+92 300 0000000"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
            <label style={{ ...labelStyle, marginBottom: 0 }}>Instagram Handle</label>
            <input
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="@yourstore"
              style={{ ...inputStyle, marginBottom: 0 }}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Hero Section
            </h2>
            <label style={labelStyle}>Hero Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Crafted For You"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
            <label style={labelStyle}>Hero Subtitle</label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Discover our latest arrivals"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Announcement Bar
            </h2>
            <label style={labelStyle}>Announcement Lines (up to 5)</label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {announcementLines.map((line, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '10px 14px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{line}</span>
                  <button
                    type="button"
                    onClick={() => deleteAnnouncementLine(index)}
                    aria-label="Delete line"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--danger)',
                      fontSize: '16px',
                      lineHeight: 1,
                      padding: '4px',
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {showAddAnnouncementLine ? (
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={newAnnouncementLine}
                  onChange={(e) => setNewAnnouncementLine(e.target.value)}
                  placeholder="e.g. Free delivery on orders above Rs 2,000"
                  autoFocus
                  style={{ ...inputStyle, marginBottom: '10px' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                  onKeyDown={(e) => { if (e.key === 'Enter') addAnnouncementLine() }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={addAnnouncementLine}
                    style={{
                      background: 'var(--brand)',
                      color: 'white',
                      padding: '9px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddAnnouncementLine}
                    style={{
                      background: 'var(--bg-muted)',
                      color: 'var(--text-secondary)',
                      padding: '9px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : announcementLines.length < 5 && (
              <button
                type="button"
                onClick={() => setShowAddAnnouncementLine(true)}
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  border: '1px solid var(--border-strong)',
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}
              >
                + Add Line
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                onClick={() => setAnnouncementActive(!announcementActive)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '999px',
                  background: announcementActive ? 'var(--brand)' : 'var(--border-strong)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: announcementActive ? '22px' : '2px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Show announcement bar on storefront</span>
            </div>
          </div>

        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Shipping & Pricing
            </h2>
            <label style={labelStyle}>Free Shipping Threshold (Rs)</label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
            <label style={labelStyle}>Shipping Fee (Rs)</label>
            <input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Bank Accounts
            </h2>

            {bankAccounts.length > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bankAccounts.map((bank) => (
                  <div key={bank.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{bank.method_name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{bank.account_title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{bank.account_number}</p>
                      {bank.iban && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>IBAN: {bank.iban}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteBank(bank.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--danger)', padding: '4px 8px', borderRadius: '6px' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div style={{
                maxHeight: showBankForm ? '0px' : '48px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease, opacity 0.3s ease',
                opacity: showBankForm ? 0 : 1,
              }}>
                <button
                  onClick={() => setShowBankForm(true)}
                  style={{ width: '100%', padding: '10px', border: '1px dashed var(--border-strong)', borderRadius: '8px', background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
                >
                  + Add Bank Account
                </button>
              </div>

              <div style={{
                maxHeight: showBankForm ? '600px' : '0px',
                overflow: 'hidden',
                opacity: showBankForm ? 1 : 0,
                transition: 'max-height 0.35s ease, opacity 0.25s ease',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', paddingTop: '4px' }}>
                  <label style={labelStyle}>Bank Name *</label>
                  <input type="text" value={bankForm.method_name} onChange={(e) => setBankForm(p => ({ ...p, method_name: e.target.value }))} placeholder="e.g. HBL, Meezan" style={{ ...inputStyle, marginBottom: bankFormErrors.method_name ? '4px' : '12px', borderColor: bankFormErrors.method_name ? 'var(--danger)' : 'var(--border-strong)' }} onFocus={(e) => e.target.style.borderColor = 'var(--brand)'} onBlur={(e) => e.target.style.borderColor = bankFormErrors.method_name ? 'var(--danger)' : 'var(--border-strong)'} />
                  {bankFormErrors.method_name && <p style={{ fontSize: '11px', color: 'var(--danger)', marginBottom: '10px' }}>{bankFormErrors.method_name}</p>}

                  <label style={labelStyle}>Account Name *</label>
                  <input type="text" value={bankForm.account_title} onChange={(e) => setBankForm(p => ({ ...p, account_title: e.target.value }))} placeholder="Muhammad Ahmed" style={{ ...inputStyle, marginBottom: bankFormErrors.account_title ? '4px' : '12px', borderColor: bankFormErrors.account_title ? 'var(--danger)' : 'var(--border-strong)' }} onFocus={(e) => e.target.style.borderColor = 'var(--brand)'} onBlur={(e) => e.target.style.borderColor = bankFormErrors.account_title ? 'var(--danger)' : 'var(--border-strong)'} />
                  {bankFormErrors.account_title && <p style={{ fontSize: '11px', color: 'var(--danger)', marginBottom: '10px' }}>{bankFormErrors.account_title}</p>}

                  <label style={labelStyle}>Account Number *</label>
                  <input type="text" value={bankForm.account_number} onChange={(e) => setBankForm(p => ({ ...p, account_number: e.target.value }))} placeholder="0123456789" style={{ ...inputStyle, marginBottom: bankFormErrors.account_number ? '4px' : '12px', borderColor: bankFormErrors.account_number ? 'var(--danger)' : 'var(--border-strong)' }} onFocus={(e) => e.target.style.borderColor = 'var(--brand)'} onBlur={(e) => e.target.style.borderColor = bankFormErrors.account_number ? 'var(--danger)' : 'var(--border-strong)'} />
                  {bankFormErrors.account_number && <p style={{ fontSize: '11px', color: 'var(--danger)', marginBottom: '10px' }}>{bankFormErrors.account_number}</p>}

                  <label style={labelStyle}>IBAN (optional)</label>
                  <input type="text" value={bankForm.iban} onChange={(e) => setBankForm(p => ({ ...p, iban: e.target.value }))} placeholder="PK00XXXX0000000000000000" style={{ ...inputStyle, marginBottom: '16px' }} onFocus={(e) => e.target.style.borderColor = 'var(--brand)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'} />

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleAddBank} disabled={savingBank} style={{ flex: 1, padding: '10px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: savingBank ? 'not-allowed' : 'pointer', opacity: savingBank ? 0.7 : 1 }}>
                      {savingBank ? 'Saving...' : 'Done'}
                    </button>
                    <button onClick={() => { setShowBankForm(false); setBankForm({ method_name: '', account_title: '', account_number: '', iban: '' }); setBankFormErrors({}) }} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(successMessage || errorMessage) && (
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
              padding: '14px 24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              zIndex: 500,
              fontSize: '13px',
              fontWeight: 500,
              color: successMessage ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {successMessage || errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: 'var(--brand)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
          width: '100%',
          marginTop: '24px',
          transition: 'transform 0.15s ease, opacity 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)'
          e.currentTarget.style.opacity = saving ? '0.7' : '1'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.97)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>

      <style>{`
        @media (max-width: 768px) {
          .settings-columns {
            flex-direction: column !important;
          }
        }
      `}</style>
    </motion.div>
  )
}