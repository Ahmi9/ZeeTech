import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('id', body.orderId)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending orders can be sent a confirmation link' }, { status: 400 })
  }

  const token = randomBytes(24).toString('hex')

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ confirmation_token: token, confirmation_sent_at: new Date().toISOString() })
    .eq('id', body.orderId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ token })
}
