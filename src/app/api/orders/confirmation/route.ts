import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function sanitizePhone(phone: string) {
  return phone.replace(/\D/g, '').slice(-10)
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  const phone = request.nextUrl.searchParams.get('phone')
  if (!id || !phone) {
    return NextResponse.json({ error: 'Missing id or phone' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const dbPhone = sanitizePhone(data.customer_phone || '')
  const inputPhone = sanitizePhone(phone)

  if (dbPhone !== inputPhone || dbPhone.length < 9) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order: data })
}
