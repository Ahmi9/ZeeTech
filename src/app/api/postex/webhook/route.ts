import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// PostEx's merchant portal lets you configure a "Status Updates Webhook" URL plus a
// single custom header (Header Key / Header Value) that gets sent with every request.
// There's no signature scheme documented, so that header acts as a shared secret —
// set POSTEX_WEBHOOK_HEADER_KEY/VALUE here to whatever you enter in their portal.
const HEADER_KEY = process.env.POSTEX_WEBHOOK_HEADER_KEY
const HEADER_VALUE = process.env.POSTEX_WEBHOOK_HEADER_VALUE

export async function POST(request: NextRequest) {
  if (HEADER_KEY && HEADER_VALUE) {
    const incoming = request.headers.get(HEADER_KEY)
    if (incoming !== HEADER_VALUE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // PostEx's docs don't publish the exact webhook payload shape, so we accept the
  // common field-name variants seen across their other APIs (Track Order, List Orders, etc).
  const trackingNumber: string | undefined =
    body.trackingNumber || body.TrackingNumber || body.tracking_number

  const status: string | undefined =
    body.transactionStatus || body.orderStatus || body.status

  if (!trackingNumber) {
    console.warn('PostEx webhook: no trackingNumber in payload', body)
    return NextResponse.json({ error: 'Missing trackingNumber' }, { status: 400 })
  }

  const update: { postex_status: string | null; status?: string } = { postex_status: status ?? null }

  // Mirror PostEx's cancellation/return states onto our own order.status so
  // admin sees a cancelled/returned order without having to read postex_status separately.
  const normalized = status?.toLowerCase() ?? ''
  if (normalized.includes('cancel')) {
    update.status = 'cancelled'
  } else if (normalized.includes('return')) {
    update.status = 'returned'
  } else if (normalized.includes('delivered')) {
    update.status = 'delivered'
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('postex_tracking_number', trackingNumber)

  if (error) {
    console.error('PostEx webhook: failed to update order', error)
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
