import { NextResponse } from 'next/server'
import { getPostexOperationalCities } from '@/lib/postex'

export async function GET() {
  try {
    const cities = await getPostexOperationalCities()
    const names = cities
      .filter(c => c.isDeliveryCity)
      .map(c => c.operationalCityName)
      .sort((a, b) => a.localeCompare(b))
    return NextResponse.json({ cities: names })
  } catch (err: any) {
    console.error('PostEx get-operational-city error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch cities' }, { status: 502 })
  }
}
