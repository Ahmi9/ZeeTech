import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { normalizePhonePK } from '@/lib/phone'
import { formatPrice } from '@/lib/format'
import { sendPushToAdmins } from '@/lib/push'

function getBaseProductId(itemId: string) {
  return String(itemId).split('-').slice(0, 5).join('-')
}

function normalizeCombination(combination: Record<string, string> | null | undefined) {
  if (!combination) return ''
  return Object.keys(combination)
    .sort()
    .map(key => `${key}:${combination[key]}`)
    .join('|')
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    customer_name, customer_phone, customer_email, customer_address, customer_city,
    notes, payment_type, coupon_code, items,
  } = body

  if (!customer_name || !customer_phone || !customer_address || !customer_city || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 })
  }

  const normalizedPhone = normalizePhonePK(customer_phone)
  if (normalizedPhone.length !== 11) {
    return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 })
  }

  try {
    // Re-derive each item's price and product id from the database — never trust
    // client-submitted prices, they can be tampered with to defraud COD orders.
    const resolvedItems: { productId: string; name: string; image: string; price: number; quantity: number; variant: any; variantId: string | null }[] = []

    for (const item of items) {
      const quantity = Number(item.quantity) || 0
      if (quantity <= 0) {
        return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 })
      }

      const productId = getBaseProductId(item.id)

      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, name, price, images')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        return NextResponse.json({ error: 'One or more products in your cart are no longer available' }, { status: 400 })
      }

      // Determine server-side whether this product actually has active variants —
      // never trust the client's claim of whether a variant was selected.
      const { data: activeVariants } = await supabaseAdmin
        .from('product_variants')
        .select('id, price, variant_combination')
        .eq('product_id', productId)
        .eq('is_active', true)

      let price = product.price
      let selectedVariant: any = null
      let variantId: string | null = null

      if (activeVariants && activeVariants.length > 0) {
        const wanted = normalizeCombination(item.variantCombination)
        const matched = wanted
          ? activeVariants.find(v => normalizeCombination(v.variant_combination) === wanted)
          : null

        if (!matched) {
          return NextResponse.json({ error: 'Please select a valid product variant' }, { status: 400 })
        }
        price = matched.price
        selectedVariant = item.variantCombination
        variantId = matched.id
      }

      resolvedItems.push({
        productId,
        name: product.name,
        image: Array.isArray(product.images) ? product.images[0] : item.image,
        price,
        quantity,
        variant: selectedVariant,
        variantId,
      })
    }

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    let couponDiscount = 0
    let appliedCouponCode: string | null = null

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', String(coupon_code).trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle()

      const notExpired = !coupon?.expiry_date || new Date(coupon.expiry_date) >= new Date()
      const underUsageLimit = coupon?.max_uses == null || coupon.used_count < coupon.max_uses
      const meetsMinOrder = !coupon || subtotal >= coupon.min_order_amount

      if (coupon && notExpired && underUsageLimit && meetsMinOrder) {
        couponDiscount = coupon.discount_type === 'percentage'
          ? Math.round((subtotal * coupon.discount_value) / 100)
          : coupon.discount_value
        couponDiscount = Math.min(couponDiscount, subtotal)
        appliedCouponCode = coupon.code
      }
    }

    const { data: settings } = await supabaseAdmin
      .from('site_settings')
      .select('shipping_fee, free_shipping_threshold')
      .eq('id', 1)
      .single()

    const afterDiscount = subtotal - couponDiscount
    const shippingFee = settings?.shipping_fee ?? 0
    const freeShippingThreshold = settings?.free_shipping_threshold ?? Infinity
    const shipping = afterDiscount >= freeShippingThreshold ? 0 : shippingFee
    const total = afterDiscount + shipping

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_phone: normalizedPhone,
        customer_email: customer_email || null,
        customer_address,
        customer_city,
        notes: notes || null,
        payment_type,
        payment_status: 'pending',
        status: 'pending',
        subtotal,
        discount: couponDiscount,
        total,
        coupon_code: appliedCouponCode,
        coupon_discount: couponDiscount,
      })
      .select()
      .single()

    if (orderError) throw orderError

    for (const item of resolvedItems) {
      await supabaseAdmin.from('order_items').insert({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        selected_variant: item.variant,
      })

      if (item.variantId) {
        const { error: stockError } = await supabaseAdmin.rpc('decrease_variant_stock', {
          variant_id: item.variantId,
          quantity: item.quantity,
        })
        if (stockError) {
          console.error('decrease_variant_stock failed', { orderId: orderData.id, variantId: item.variantId, quantity: item.quantity, stockError })
        }
      } else {
        const { error: stockError } = await supabaseAdmin.rpc('decrease_stock', {
          product_id: item.productId,
          quantity: item.quantity,
        })
        if (stockError) {
          console.error('decrease_stock failed', { orderId: orderData.id, productId: item.productId, quantity: item.quantity, stockError })
        }
      }
    }

    if (appliedCouponCode) {
      await supabaseAdmin.rpc('increment_coupon_usage', { coupon_code: appliedCouponCode })
    }

    const itemCount = resolvedItems.reduce((sum, i) => sum + i.quantity, 0)
    after(() =>
      sendPushToAdmins({
        title: `🛒 New Order ${orderData.order_number}`,
        body: `${customer_name} — ${formatPrice(total)} (${itemCount} ${itemCount === 1 ? 'item' : 'items'}) · ${customer_city}`,
        url: '/admin/orders',
        tag: `order-${orderData.id}`,
      }).catch((err) => console.error('order push failed', err))
    )

    return NextResponse.json({ id: orderData.id, order_number: orderData.order_number })
  } catch (err: any) {
    console.error('Order create error:', err)
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 })
  }
}
