'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ShoppingBag, Package, Users, BarChart, DollarSign, Calendar, Clock, CreditCard, AlertTriangle, XCircle, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import AdminLoader from '@/components/ui/AdminLoader'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [activeProducts, setActiveProducts] = useState(0)
  const [activeCategories, setActiveCategories] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [activeCoupons, setActiveCoupons] = useState(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [liveVisitors, setLiveVisitors] = useState(0)
  const [todaySessions, setTodaySessions] = useState(0)
  const [todayOrders, setTodayOrders] = useState(0)
  const [codOrders, setCodOrders] = useState(0)
  const [advanceOrders, setAdvanceOrders] = useState(0)
  const [outOfStock, setOutOfStock] = useState(0)
  const [cancelledOrders, setCancelledOrders] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/admin/dashboard')
      const stats = await res.json()

      setTotalRevenue(stats.totalRevenue || 0)
      setTotalOrders(stats.totalOrders || 0)
      setTotalProducts(stats.totalProducts || 0)
      setActiveProducts(stats.activeProducts || 0)
      setActiveCategories(stats.activeCategories || 0)
      setPendingOrders(stats.pendingOrders || 0)
      setActiveCoupons(stats.activeCoupons || 0)
      setRecentOrders(stats.recentOrders || [])

      try {
        const analyticsRes = await fetch('/api/analytics/summary')
        const analyticsData = await analyticsRes.json()
        setLiveVisitors(analyticsData.liveVisitors || 0)
        setTodaySessions(analyticsData.todaySessions || 0)
      } catch {
        setLiveVisitors(0)
        setTodaySessions(0)
      }

      setTodayOrders(stats.todayOrders || 0)
      setCodOrders(stats.codOrders || 0)
      setAdvanceOrders(stats.advanceOrders || 0)
      setOutOfStock(stats.outOfStock || 0)
      setCancelledOrders(stats.cancelledOrders || 0)
      setTotalProfit(stats.totalProfit || 0)
      setLoading(false)
    }

    fetchStats()
  }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { background: 'var(--warning-light)', color: 'var(--warning)' }
      case 'confirmed': return { background: 'var(--success-light)', color: 'var(--success)' }
      case 'delivered': return { background: 'var(--success-light)', color: 'var(--success)' }
      case 'cancelled': return { background: 'var(--danger-light)', color: 'var(--danger)' }
      default: return { background: 'var(--bg-muted)', color: 'var(--text-secondary)' }
    }
  }

  const statsCardsRow1 = [
    { label: 'Live Visitors Now', icon: Users, value: liveVisitors.toString(), iconColor: 'var(--brand)' },
    { label: "Today's Sessions", icon: BarChart, value: todaySessions.toString(), iconColor: 'var(--brand)' },
    { label: 'Total Revenue', icon: TrendingUp, value: 'Rs ' + Math.round(totalRevenue).toLocaleString(), iconColor: 'var(--success)' },
    { label: 'Total Profit', icon: DollarSign, value: 'Rs ' + Math.round(totalProfit).toLocaleString(), iconColor: 'var(--success)' },
  ]

  const statsCardsRow2 = [
    { label: "Today's Orders", icon: Calendar, value: todayOrders.toString(), iconColor: 'var(--brand)' },
    { label: 'Pending Orders', icon: Clock, value: pendingOrders.toString(), iconColor: 'var(--brand)' },
    { label: 'COD Orders', icon: ShoppingBag, value: codOrders.toString(), iconColor: 'var(--brand)' },
    { label: 'Advance Payment Orders', icon: CreditCard, value: advanceOrders.toString(), iconColor: 'var(--brand)' },
  ]

  const statsCardsRow3 = [
    { label: 'Total Products', icon: Package, value: totalProducts.toString(), iconColor: 'var(--brand)' },
    { label: 'Out of Stock', icon: AlertTriangle, value: outOfStock.toString(), iconColor: outOfStock > 0 ? 'var(--danger)' : 'var(--brand)' },
    { label: 'Cancelled Orders', icon: XCircle, value: cancelledOrders.toString(), iconColor: cancelledOrders > 0 ? 'var(--danger)' : 'var(--brand)' },
    { label: 'Active Coupons', icon: Tag, value: activeCoupons.toString(), iconColor: 'var(--brand)' },
  ]

  if (loading) return <AdminLoader />

  return (
    <div style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box' }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={loading ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p className="admin-page-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Welcome back
        </p>
      </motion.div>

      <div className="dashboard-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {statsCardsRow1.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={loading ? { opacity: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
              className='dashboard-stat-card' style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                  {stat.label}
                </span>
                <Icon size={20} color={stat.iconColor} />
              </div>
              <div className='dashboard-stat-value' style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginTop: '12px' }}>
                {stat.value}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="dashboard-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
        {statsCardsRow2.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={loading ? { opacity: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: (index + 4) * 0.07 }}
              className='dashboard-stat-card' style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                  {stat.label}
                </span>
                <Icon size={20} color={stat.iconColor} />
              </div>
              <div className='dashboard-stat-value' style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginTop: '12px' }}>
                {stat.value}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="dashboard-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
        {statsCardsRow3.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={loading ? { opacity: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: (index + 8) * 0.07 }}
              className='dashboard-stat-card' style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                  {stat.label}
                </span>
                <Icon size={20} color={stat.iconColor} />
              </div>
              <div className='dashboard-stat-value' style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginTop: '12px' }}>
                {stat.value}
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={loading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Recent Orders</h2>
          <div className="scroll-x">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: 'var(--text-muted)' }}>No orders yet</td>
                </tr>
              ) : recentOrders.map((order, index) => {
                const statusStyle = getStatusStyle(order.status)
                const date = new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{order.order_number}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{order.customer_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{order.order_items?.length || 0} items</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>Rs {Math.round(Number(order.total)).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, textTransform: 'capitalize', ...statusStyle }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{date}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .dashboard-stat-card {
            padding: 14px 16px !important;
          }
          .dashboard-stat-value {
            font-size: 20px !important;
            margin-top: 8px !important;
          }
        }
        @media (max-width: 400px) {
          .dashboard-stats-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}