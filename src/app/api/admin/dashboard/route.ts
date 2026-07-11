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
    { data: activeCouponRows },
    { data: revenueData },
    { data: ordersData },
    { count: codCount },
    { count: advanceCount },
    { data: stockRows },
    { count: cancelledCount },
    { count: todayOrdersCount },
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('coupons').select('max_uses, used_count, expiry_date').eq('is_active', true),
    supabaseAdmin.from('orders').select('total'),
    supabaseAdmin.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('payment_type', 'COD'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).neq('payment_type', 'COD'),
    supabaseAdmin.from('products').select('id, stock').eq('is_active', true),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today + 'T00:00:00').lte('created_at', today + 'T23:59:59'),
  ])

  const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0

  // A coupon is only "active" if it's enabled AND hasn't hit its usage limit
  // AND hasn't expired.
  const now = new Date()
  const activeCouponsCount = (activeCouponRows || []).filter(c =>
    (c.max_uses == null || Number(c.used_count) < Number(c.max_uses)) &&
    (c.expiry_date == null || new Date(c.expiry_date) >= now)
  ).length

  // Variant products keep their real stock on product_variants, not on the
  // base products.stock column — mirror the products page aggregation here,
  // otherwise variant products never count as out of stock.
  const { data: variantRows } = await supabaseAdmin
    .from('product_variants')
    .select('product_id, stock')
    .eq('is_active', true)
  const variantStockByProduct = new Map<string, number>()
  for (const v of variantRows || []) {
    variantStockByProduct.set(v.product_id, (variantStockByProduct.get(v.product_id) || 0) + (Number(v.stock) || 0))
  }
  const outOfStockCount = (stockRows || []).filter(p => {
    const stock = variantStockByProduct.has(p.id) ? variantStockByProduct.get(p.id)! : Number(p.stock) || 0
    return stock <= 0
  }).length

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
    activeCoupons: activeCouponsCount,
    recentOrders: ordersData || [],
    todayOrders: todayOrdersCount || 0,
    codOrders: codCount || 0,
    advanceOrders: advanceCount || 0,
    outOfStock: outOfStockCount,
    cancelledOrders: cancelledCount || 0,
    totalProfit: profit,
  })
}
