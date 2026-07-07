import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: ordersCount },
    { count: productsCount },
    { count: activeProductsCount },
    { count: activeCatsCount },
    { count: pendingCount },
    { count: couponsCount },
    { data: revenueData },
    { data: ordersData },
    { count: codCount },
    { count: advanceCount },
    { count: outOfStockCount },
    { count: cancelledCount },
    { count: todayOrdersCount },
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('coupons').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('orders').select('total'),
    supabaseAdmin.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('payment_type', 'COD'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).neq('payment_type', 'COD'),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).eq('is_active', true),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today + 'T00:00:00').lte('created_at', today + 'T23:59:59'),
  ])

  const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0

  const { data: allProducts } = await supabaseAdmin.from('products').select('id, cost_price')
  const { data: profitOrders } = await supabaseAdmin
    .from('orders')
    .select('total, subtotal, coupon_discount, order_items(price, quantity, product_id)')
    .not('status', 'eq', 'cancelled')

  const productCostMap: Record<string, number> = {}
  allProducts?.forEach(p => { productCostMap[p.id] = Number(p.cost_price || 0) })

  const profit = profitOrders?.reduce((sum, order) => {
    const itemsCost = order.order_items?.reduce((iSum: number, item: any) => {
      const costPrice = productCostMap[item.product_id] || 0
      return iSum + (costPrice * Number(item.quantity))
    }, 0) || 0
    return sum + (Number(order.total) - itemsCost)
  }, 0) || 0

  return NextResponse.json({
    totalRevenue: revenue,
    totalOrders: ordersCount || 0,
    totalProducts: productsCount || 0,
    activeProducts: activeProductsCount || 0,
    activeCategories: activeCatsCount || 0,
    pendingOrders: pendingCount || 0,
    activeCoupons: couponsCount || 0,
    recentOrders: ordersData || [],
    todayOrders: todayOrdersCount || 0,
    codOrders: codCount || 0,
    advanceOrders: advanceCount || 0,
    outOfStock: outOfStockCount || 0,
    cancelledOrders: cancelledCount || 0,
    totalProfit: profit,
  })
}
