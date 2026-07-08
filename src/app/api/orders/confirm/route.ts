import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const EXPIRY_DAYS = 3

type ConfirmationState = 'ready' | 'expired' | 'already_confirmed' | 'already_cancelled' | 'not_found'

function getState(order: { status: string; confirmation_sent_at: string | null }): ConfirmationState {
  if (order.status === 'confirmed') return 'already_confirmed'
  if (order.status === 'cancelled') return 'already_cancelled'
  if (order.status !== 'pending') return 'already_confirmed'

  const sentAt = order.confirmation_sent_at ? new Date(order.confirmation_sent_at).getTime() : null
  if (sentAt && Date.now() - sentAt > EXPIRY_DAYS * 24 * 60 * 60 * 1000) return 'expired'

  return 'ready'
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status, total, customer_name, confirmation_sent_at, order_items(*)')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ state: 'not_found' as ConfirmationState })
  }

  return NextResponse.json({ state: getState(order), order })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const token = body?.token
  const action = body?.action

  if (!token || (action !== 'confirm' && action !== 'cancel')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, status, confirmation_sent_at')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ state: 'not_found' as ConfirmationState }, { status: 404 })
  }

  const state = getState(order)
  if (state !== 'ready') {
    return NextResponse.json({ state }, { status: 409 })
  }

  const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled'
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('id', order.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ state: newStatus === 'confirmed' ? 'already_confirmed' : 'already_cancelled' })
}
