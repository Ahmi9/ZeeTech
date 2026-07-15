import webpush from 'web-push'
import { supabaseAdmin } from './supabaseAdmin'

let vapidConfigured = false

function ensureVapid(): boolean {
  if (vapidConfigured) return true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    publicKey,
    privateKey
  )
  vapidConfigured = true
  return true
}

export interface PushPayload {
  title: string
  body: string
  url: string
  tag?: string
}

// Sends a notification to every browser/device subscribed from the admin
// panel. Expired or revoked subscriptions (404/410) are deleted as we go so
// the table never accumulates dead endpoints.
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  if (!ensureVapid()) return

  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error || !subs || subs.length === 0) return

  const json = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json
        )
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('web-push send failed', { endpoint: sub.endpoint, statusCode: err?.statusCode })
        }
      }
    })
  )
}
