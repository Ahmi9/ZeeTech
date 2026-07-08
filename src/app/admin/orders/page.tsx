'use client'

import { useEffect, useState } from 'react'
import { Order, OrderItem } from '@/lib/types'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLoader from '@/components/ui/AdminLoader'
import { normalizePhonePK, formatPhoneWhatsApp } from '@/lib/phone'

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled' | 'returned'

const STATUS_TABS: { label: string; value: OrderStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Dispatched', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Dispatched', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Returned', value: 'returned' },
]

interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

function getStatusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'pending':
      return { background: 'var(--warning-light)', color: 'var(--warning)' }
    case 'confirmed':
      return { background: 'var(--success-light)', color: 'var(--success)' }
    case 'dispatched':
      return { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }
    case 'delivered':
      return { background: 'var(--success-light)', color: 'var(--success)' }
    case 'cancelled':
      return { background: 'var(--danger-light)', color: 'var(--danger)' }
    case 'returned':
      return { background: 'var(--danger-light)', color: 'var(--danger)' }
    default:
      return { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatPrice(price: number): string {
  return `PKR ${Math.round(price).toLocaleString()}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<OrderStatus>('all')
  const [statusFilterOpen, setStatusFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [deleteOrderNumber, setDeleteOrderNumber] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false)
  const [bookingPostex, setBookingPostex] = useState(false)
  const [postexError, setPostexError] = useState('')
  const [sendingConfirmation, setSendingConfirmation] = useState(false)
  const [confirmationError, setConfirmationError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const res = await fetch('/api/admin/orders')
    const json = await res.json()
    if (json.orders) {
      setOrders(json.orders)
    }
    setLoading(false)
  }

  async function updateOrderStatus() {
    if (!selectedOrder || !newStatus) return

    setUpdatingStatus(true)
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedOrder.id, status: newStatus }),
    })

    if (res.ok) {
      setSuccessMessage('Order status updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchOrders()
      setSelectedOrder({ ...selectedOrder, status: newStatus })
      window.dispatchEvent(new Event('admin:orders-updated'))

      if (newStatus === 'cancelled' && selectedOrder.postex_tracking_number) {
        fetch('/api/postex/cancel-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: selectedOrder.id }),
        }).catch(err => console.error('PostEx cancel-order error:', err))
      }
    }
    setUpdatingStatus(false)
  }

  async function updatePaymentStatus(status: string) {
    if (!selectedOrder) return
    setUpdatingPaymentStatus(true)
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedOrder.id, payment_status: status }),
    })
    if (res.ok) {
      setSuccessMessage('Payment status updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchOrders()
      setSelectedOrder({ ...selectedOrder, payment_status: status })
    }
    setUpdatingPaymentStatus(false)
  }

  async function bookWithPostex() {
    if (!selectedOrder) return
    setBookingPostex(true)
    setPostexError('')
    try {
      const res = await fetch('/api/postex/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Booking failed')
      setSelectedOrder({ ...selectedOrder, postex_tracking_number: json.trackingNumber })
      fetchOrders()
    } catch (err: any) {
      setPostexError(err.message || 'Booking failed')
    } finally {
      setBookingPostex(false)
    }
  }

  async function sendWhatsAppConfirmation() {
    if (!selectedOrder) return
    setSendingConfirmation(true)
    setConfirmationError('')
    // Open the tab synchronously, in the same tick as the click, so the browser
    // doesn't treat it as an unrequested popup — we fill in its URL once the
    // fetch below resolves. Opening it only after an `await` gets silently
    // popup-blocked with no error in most browsers.
    const waWindow = window.open('', '_blank')
    try {
      const res = await fetch('/api/admin/orders/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send confirmation')

      const link = `${window.location.origin}/confirm-order?token=${json.token}`
      const message = `Assalam-o-Alaikum ${selectedOrder.customer_name}, thank you for your order ${selectedOrder.order_number} (Rs ${Math.round(selectedOrder.total).toLocaleString()}). Please confirm your order here: ${link}`
      const waUrl = `https://wa.me/${formatPhoneWhatsApp(selectedOrder.customer_phone)}?text=${encodeURIComponent(message)}`
      if (waWindow) waWindow.location.href = waUrl
      else window.open(waUrl, '_blank')

      const sentAt = new Date().toISOString()
      setSelectedOrder({ ...selectedOrder, confirmation_sent_at: sentAt })
      fetchOrders()
    } catch (err: any) {
      waWindow?.close()
      setConfirmationError(err.message || 'Failed to send confirmation')
    } finally {
      setSendingConfirmation(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab
    const matchesSearch =
      searchQuery === '' ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div>
      {loading ? (
        <AdminLoader />
      ) :
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Orders
            </h1>
            <p className="admin-page-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Manage and track your orders
            </p>
          </div>

          <div className="order-status-tabs-desktop" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: 'none',
                  background: activeTab === tab.value ? 'var(--brand)' : 'var(--bg-subtle)',
                  color: activeTab === tab.value ? 'white' : 'var(--text-secondary)',
                  borderWidth: activeTab === tab.value ? 'none' : '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border)',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            className="order-status-filter-mobile"
            onClick={() => setStatusFilterOpen(true)}
            style={{
              display: 'none',
              width: '100%',
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <SlidersHorizontal size={15} />
            Filter: {STATUS_TABS.find(t => t.value === activeTab)?.label}
          </button>

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                border: '1px solid var(--border-strong)',
                borderRadius: '8px',
                fontSize: '13px',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              No orders found
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}
            >
            <div className="scroll-x">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Order #
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Customer
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Phone
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Items
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Total
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Payment
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Date
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.order_number}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{order.customer_name}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    {normalizePhonePK(order.customer_phone)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    {order.order_items?.length || 0}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatPrice(order.total)}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: 'var(--bg-muted)',
                        color: 'var(--text-secondary)',
                        marginRight: order.payment_type === 'Advance Payment' ? '6px' : '0px',
                      }}
                    >
                      {order.payment_type === 'COD' || order.payment_type === 'cod' ? 'COD' : 'Advance'}
                    </span>
                    {order.payment_type === 'Advance Payment' && (
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: order.payment_status === 'paid' ? 'var(--success-light)' : 'var(--warning-light)',
                          color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)',
                        }}
                      >
                        {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    <span style={{ ...getStatusBadgeStyle(order.status), padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, textTransform: 'capitalize' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    {formatDate(order.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setNewStatus(order.status)
                      }}
                      style={{
                        fontSize: '12px',
                        color: 'var(--brand)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setDeleteOrderId(order.id)
                        setDeleteOrderNumber(order.order_number)
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'var(--danger)',
                        marginLeft: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
            </div>
          </motion.div>
          )}
        </motion.div>
      }

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 300,
              }}
            />
            <motion.div
              className="order-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: 'min(480px, 100vw)',
                background: 'var(--bg)',
                borderLeft: '1px solid var(--border)',
                zIndex: 301,
                overflowY: 'auto',
                padding: '32px',
                boxSizing: 'border-box',
              }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="order-drawer-close"
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} color="var(--text-secondary)" />
              </button>

              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {selectedOrder.order_number}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {formatDate(selectedOrder.created_at)}
              </p>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '12px' }}>
                  Customer Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Name</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{normalizePhonePK(selectedOrder.customer_phone)}</span>
                      <a
                        href={`https://wa.me/${formatPhoneWhatsApp(selectedOrder.customer_phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat on WhatsApp"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#25D366',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  {selectedOrder.customer_email && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Email</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedOrder.customer_email}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Address</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedOrder.customer_address}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>City</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedOrder.customer_city}</span>
                  </div>
                </div>

                {selectedOrder.status === 'pending' && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={sendWhatsAppConfirmation}
                      disabled={sendingConfirmation}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-strong)',
                        background: 'var(--bg)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: sendingConfirmation ? 'not-allowed' : 'pointer',
                        opacity: sendingConfirmation ? 0.6 : 1,
                      }}
                    >
                      {sendingConfirmation ? 'Preparing...' : '📱 Send WhatsApp Confirmation'}
                    </button>
                    {selectedOrder.confirmation_sent_at && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Confirmation link sent {formatDate(selectedOrder.confirmation_sent_at)}
                      </p>
                    )}
                    {confirmationError && (
                      <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '6px' }}>{confirmationError}</p>
                    )}
                  </div>
                )}
              </div>

              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '12px' }}>
                  Order Items
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '6px',
                          background: 'var(--bg-muted)',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.product_name}
                        </p>
                        {item.selected_variant && (
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {Object.entries(item.selected_variant).map(([k, v]: [string, any]) => `${k}: ${v}`).join(' | ')}
                          </p>
                        )}
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                          {item.quantity} x {formatPrice(item.price)} = {formatPrice(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '12px' }}>
                  Order Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.coupon_code && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: 'var(--success)' }}>Coupon ({selectedOrder.coupon_code})</span>
                      <span style={{ fontSize: '13px', color: 'var(--success)' }}>-{formatPrice(selectedOrder.coupon_discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Total</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '12px' }}>
                  Update Status
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      background: 'var(--bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={updateOrderStatus}
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                    style={{
                      padding: '9px 20px',
                      background: 'var(--brand)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: updatingStatus || newStatus === selectedOrder.status ? 'not-allowed' : 'pointer',
                      opacity: updatingStatus || newStatus === selectedOrder.status ? 0.6 : 1,
                      transition: 'transform 0.15s ease, opacity 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)'
                      e.currentTarget.style.opacity = (updatingStatus || newStatus === selectedOrder.status) ? '0.6' : '1'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.97)'
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                  >
                    {updatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
                {successMessage && (
                  <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>
                    {successMessage}
                  </p>
                )}
              </div>

              {selectedOrder.payment_type === 'Advance Payment' && (
                <>
                  <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>
                      Payment Status
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Current: <span style={{
                        fontWeight: 600,
                        color: selectedOrder.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)',
                      }}>
                        {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updatePaymentStatus('pending')}
                        disabled={updatingPaymentStatus || selectedOrder.payment_status === 'pending'}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          background: selectedOrder.payment_status === 'pending' ? 'var(--warning-light)' : 'var(--bg-muted)',
                          color: selectedOrder.payment_status === 'pending' ? 'var(--warning)' : 'var(--text-secondary)',
                          border: `1px solid ${selectedOrder.payment_status === 'pending' ? 'var(--warning)' : 'var(--border)'}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: selectedOrder.payment_status === 'pending' ? 'not-allowed' : 'pointer',
                          opacity: updatingPaymentStatus ? 0.6 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => updatePaymentStatus('paid')}
                        disabled={updatingPaymentStatus || selectedOrder.payment_status === 'paid'}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          background: selectedOrder.payment_status === 'paid' ? 'var(--success-light)' : 'var(--bg-muted)',
                          color: selectedOrder.payment_status === 'paid' ? 'var(--success)' : 'var(--text-secondary)',
                          border: `1px solid ${selectedOrder.payment_status === 'paid' ? 'var(--success)' : 'var(--border)'}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: selectedOrder.payment_status === 'paid' ? 'not-allowed' : 'pointer',
                          opacity: updatingPaymentStatus ? 0.6 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {updatingPaymentStatus ? 'Updating...' : 'Mark as Paid'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '12px' }}>
                  Courier (PostEx)
                </h3>
                {selectedOrder.postex_tracking_number ? (
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Tracking Number: <strong>{selectedOrder.postex_tracking_number}</strong>
                    </p>
                    {selectedOrder.postex_status && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Status: {selectedOrder.postex_status}
                      </p>
                    )}
                  </div>
                ) : selectedOrder.payment_type === 'Advance Payment' && selectedOrder.payment_status !== 'paid' ? (
                  <p style={{ fontSize: '12px', color: 'var(--warning)' }}>
                    Verify payment first — mark it as Paid above before booking with PostEx.
                  </p>
                ) : (
                  <>
                    <button
                      onClick={bookWithPostex}
                      disabled={bookingPostex}
                      style={{
                        padding: '9px 20px',
                        background: 'var(--brand)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: bookingPostex ? 'not-allowed' : 'pointer',
                        opacity: bookingPostex ? 0.6 : 1,
                      }}
                    >
                      {bookingPostex ? 'Booking...' : 'Book with PostEx'}
                    </button>
                    {postexError && (
                      <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px' }}>
                        {postexError}
                      </p>
                    )}
                  </>
                )}
              </div>

              {selectedOrder.notes && (
                <>
                  <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />
                  <div>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '12px' }}>
                      Notes
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      {selectedOrder.notes}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}

        {deleteOrderId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteOrderId(null)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)', zIndex: 300,
              }}
            />
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '24px',
              width: 'calc(100vw - 32px)', maxWidth: '400px', boxSizing: 'border-box',
              zIndex: 301, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Delete Order
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                Are you sure you want to delete order <strong style={{ color: 'var(--text-primary)' }}>{deleteOrderNumber}</strong>? This will also delete all order items and cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteOrderId(null)}
                  style={{
                    background: 'var(--bg-muted)', color: 'var(--text-primary)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '9px 20px', fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true)
                    const res = await fetch(`/api/admin/orders?id=${deleteOrderId}`, { method: 'DELETE' })
                    if (res.ok) {
                      setOrders(prev => prev.filter(o => o.id !== deleteOrderId))
                      setDeleteOrderId(null)
                      if (selectedOrder?.id === deleteOrderId) setSelectedOrder(null)
                      window.dispatchEvent(new Event('admin:orders-updated'))
                    }
                    setDeleting(false)
                  }}
                  style={{
                    background: 'var(--danger)', color: 'white',
                    border: 'none', borderRadius: '8px',
                    padding: '9px 20px', fontSize: '13px', cursor: 'pointer',
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete Order'}
                </button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusFilterOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)', zIndex: 400,
              }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                zIndex: 401, background: 'var(--bg)',
                borderTop: '1px solid var(--border)',
                borderRadius: '20px 20px 0 0',
                padding: '20px 24px 40px',
              }}
            >
              <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: 'var(--border-strong)', margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Filter by Status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => { setActiveTab(tab.value); setStatusFilterOpen(false) }}
                    style={{
                      padding: '14px 16px', borderRadius: '10px', textAlign: 'left',
                      fontSize: '14px', border: 'none', cursor: 'pointer',
                      background: activeTab === tab.value ? 'var(--brand-light)' : 'transparent',
                      color: activeTab === tab.value ? 'var(--brand)' : 'var(--text-primary)',
                      fontWeight: activeTab === tab.value ? 500 : 400,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    {tab.label}
                    {activeTab === tab.value && <span style={{ color: 'var(--brand)', fontSize: '16px' }}>✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .order-drawer {
            padding: 20px !important;
          }
          .order-drawer-close {
            top: 16px !important;
            right: 16px !important;
          }
        }
        @media (max-width: 768px) {
          .order-status-tabs-desktop {
            display: none !important;
          }
          .order-status-filter-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}
