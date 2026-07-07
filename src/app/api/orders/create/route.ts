import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    customer_name, customer_phone, customer_email, customer_address, customer_city,
    notes, payment_type, subtotal, discount, total, coupon_code, coupon_discount, items,
  } = body

  if (!customer_name || !customer_phone || !customer_address || !customer_city || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 })
  }

  try {
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        customer_address,
        customer_city,
        notes: notes || null,
        payment_type,
        payment_status: 'pending',
        status: 'pending',
        subtotal,
        discount: discount || 0,
        total,
        coupon_code: coupon_code || null,
        coupon_discount: coupon_discount || 0,
      })
      .select()
      .single()

    if (orderError) throw orderError

    for (const item of items) {
      const realProductId = item.variantCombination
        ? String(item.id).split('-').slice(0, 5).join('-')
        : item.id

      await supabaseAdmin.from('order_items').insert({
        order_id: orderData.id,
        product_id: realProductId,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        selected_variant: item.variantCombination || null,
      })

      await supabaseAdmin.rpc('decrease_stock', {
        product_id: realProductId,
        quantity: item.quantity,
      })
    }

    if (coupon_code) {
      await supabaseAdmin.rpc('increment_coupon_usage', { coupon_code })
    }

    return NextResponse.json({ id: orderData.id, order_number: orderData.order_number })
  } catch (err: any) {
    console.error('Order create error:', err)
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 })
  }
}
