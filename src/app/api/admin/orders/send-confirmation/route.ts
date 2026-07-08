import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status, confirmation_token')
    .eq('id', body.orderId)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending orders can be sent a confirmation link' }, { status: 400 })
  }

  // Reuse an already-minted token (e.g. from an earlier "prepare" call when the
  // admin opened this order) instead of invalidating it on every call.
  const token = order.confirmation_token || randomBytes(9).toString('base64url')

  const updates: Record<string, string> = { confirmation_token: token }
  if (body.markSent) updates.confirmation_sent_at = new Date().toISOString()

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', body.orderId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ token })
}
