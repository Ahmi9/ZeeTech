import { NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

const propertyId = process.env.GA4_PROPERTY_ID

function getClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA4_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  })
}

export async function GET() {
  if (!propertyId || !process.env.GA4_SERVICE_ACCOUNT_EMAIL || !process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return NextResponse.json({ liveVisitors: 0, todaySessions: 0 })
  }

  try {
    const client = getClient()

    const [realtimeResponse] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
      minuteRanges: [{ startMinutesAgo: 5, endMinutesAgo: 0 }],
    })
    const liveVisitors = Number(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || 0)

    const [todayResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      metrics: [{ name: 'sessions' }],
    })
    const todaySessions = Number(todayResponse.rows?.[0]?.metricValues?.[0]?.value || 0)

    return NextResponse.json({ liveVisitors, todaySessions })
  } catch (err: any) {
    console.error('GA4 analytics error:', err)
    return NextResponse.json({ liveVisitors: 0, todaySessions: 0, error: err.message }, { status: 200 })
  }
}
