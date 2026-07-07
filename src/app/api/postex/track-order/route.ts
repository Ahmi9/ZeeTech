import { NextRequest, NextResponse } from 'next/server'
import { trackPostexOrder } from '@/lib/postex'

export async function GET(request: NextRequest) {
  const trackingNumber = request.nextUrl.searchParams.get('trackingNumber')
  if (!trackingNumber) {
    return NextResponse.json({ error: 'Missing trackingNumber' }, { status: 400 })
  }

  try {
    const result = await trackPostexOrder(trackingNumber)
    return NextResponse.json({
      status: result.transactionStatus,
      history: result.transactionStatusHistory || [],
    })
  } catch (err: any) {
    console.error('PostEx track-order error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch tracking' }, { status: 502 })
  }
}
