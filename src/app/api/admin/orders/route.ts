import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getRequestRole } from '@/lib/auth-role'

// Columns holding real customer PII. The demo ('client') account may browse the
// orders UI but must never receive real names/phones/addresses — they're masked
// so the panel stays functional without leaking customer data.
const PII_COLUMNS = [
  'customer_name',
  'customer_phone',
  'customer_email',
  'customer_address',
  'customer_city',
] as const

// Only these order columns may be changed through the admin PATCH endpoint.
// Anything else (totals, customer PII, tracking numbers, confirmation tokens)
// is set by trusted server flows only — never by a request body.
const PATCHABLE_COLUMNS = ['status', 'payment_status'] as const

function maskPii(order: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...order }
  for (const col of PII_COLUMNS) {
    if (col in masked) masked[col] = '••• (demo)'
  }
  return masked
}

export async function GET() {
  const role = await getRequestRole()

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orders = role === 'client' ? (data ?? []).map(maskPii) : data
  return NextResponse.json({ orders })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { id } = body
  const updates: Record<string, unknown> = {}
  for (const col of PATCHABLE_COLUMNS) {
    if (col in body) updates[col] = body[col]
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.from('orders').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order: data })
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await supabaseAdmin.from('order_items').delete().eq('order_id', id)
  const { error } = await supabaseAdmin.from('orders').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
