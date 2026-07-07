import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function sanitizePhone(phone: string) {
  return phone.replace(/\D/g, '').slice(-10)
}

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('orderNumber')
  const phone = request.nextUrl.searchParams.get('phone')

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: 'Missing orderNumber or phone' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber.trim().toUpperCase())
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Order not found. Please double-check the order number.' }, { status: 404 })
  }

  const dbPhone = sanitizePhone(data.customer_phone || '')
  const inputPhone = sanitizePhone(phone)

  if (dbPhone !== inputPhone || dbPhone.length < 9) {
    return NextResponse.json({ error: 'The phone number entered does not match our records for this order.' }, { status: 403 })
  }

  return NextResponse.json({ order: data })
}
