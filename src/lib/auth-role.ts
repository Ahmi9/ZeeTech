import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type AdminRole = 'admin' | 'client'

// Re-derives the caller's role from the Supabase session cookie inside a route
// handler. proxy.ts already gates *which* routes each role can reach, but a
// handler that returns PII (or writes) must not trust that alone — it needs the
// role locally to redact/restrict. app_metadata.role is set via the service-role
// admin API and cannot be forged by the user, so it's safe as an auth claim.
export async function getRequestRole(): Promise<AdminRole | null> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Route handlers here only read the session; no cookie refresh needed.
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role
  return role === 'admin' || role === 'client' ? role : null
}
