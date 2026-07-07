import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createPostexOrder } from '@/lib/postex'

export async function POST(request: NextRequest) {
  const { orderId } = await request.json().catch(() => ({}))
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const totalItems = (order.order_items || []).reduce((sum: number, item: any) => sum + item.quantity, 0) || 1
  const orderDetail = (order.order_items || [])
    .map((item: any) => `${item.product_name} x${item.quantity}`)
    .join(', ')

  // Advance Payment orders are already paid online — PostEx shouldn't collect
  // cash on delivery for them. The admin UI only allows booking an Advance
  // Payment order once payment_status is 'paid', so this is safe to trust here.
  const invoicePayment = order.payment_type === 'Advance Payment' ? 0 : order.total

  try {
    const result = await createPostexOrder({
      orderRefNumber: order.order_number,
      invoicePayment,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      deliveryAddress: order.customer_address,
      cityName: order.customer_city,
      items: totalItems,
      orderDetail,
    })

    await supabaseAdmin
      .from('orders')
      .update({
        postex_tracking_number: result.trackingNumber,
        postex_status: result.orderStatus,
      })
      .eq('id', orderId)

    return NextResponse.json({ trackingNumber: result.trackingNumber })
  } catch (err: any) {
    console.error('PostEx create-order error:', err)
    // Order already exists locally — courier booking failure shouldn't block checkout.
    // Leave postex_tracking_number null so it can be retried/booked manually from admin.
    return NextResponse.json({ error: err.message || 'PostEx booking failed' }, { status: 502 })
  }
}
