import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cancelPostexOrder } from '@/lib/postex'

export async function POST(request: NextRequest) {
  const { orderId } = await request.json().catch(() => ({}))
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('postex_tracking_number')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (!order.postex_tracking_number) {
    // Never booked with PostEx — nothing to cancel on their side.
    return NextResponse.json({ skipped: true })
  }

  try {
    await cancelPostexOrder(order.postex_tracking_number)
    await supabaseAdmin
      .from('orders')
      .update({ postex_status: 'Cancelled' })
      .eq('id', orderId)
    return NextResponse.json({ cancelled: true })
  } catch (err: any) {
    console.error('PostEx cancel-order error:', err)
    return NextResponse.json({ error: err.message || 'Cancel failed' }, { status: 502 })
  }
}
