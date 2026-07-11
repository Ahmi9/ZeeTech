import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // app_metadata is set via the service-role admin API and cannot be edited by the
  // user themselves (unlike user_metadata) — safe to use as an authorization claim.
  if (user && user.app_metadata?.role === 'admin') {
    return response
  }

  // Demo/client role: full read access to the admin panel, mutations blocked.
  // The client-side popup is cosmetic — this is the actual enforcement.
  if (user && user.app_metadata?.role === 'client') {
    const path = request.nextUrl.pathname
    const method = request.method

    // Courier booking/cancellation triggers real (billable) PostEx actions.
    if (path.startsWith('/api/postex/')) {
      return NextResponse.json(
        { error: 'Demo account — ye feature in credentials se available nahi hai.', demo: true },
        { status: 403 }
      )
    }

    if (path.startsWith('/api/admin/')) {
      const allowed =
        method === 'GET' ||
        // Orders page stays functional for demo users: status updates and
        // WhatsApp confirmations are allowed, deletion/PostEx are not.
        (path === '/api/admin/orders' && method === 'PATCH') ||
        path === '/api/admin/orders/send-confirmation'
      if (!allowed) {
        return NextResponse.json(
          { error: 'Demo account — is se modifications allowed nahi hain.', demo: true },
          { status: 403 }
        )
      }
    }

    return response
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/admin-login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    // These trigger real (billable) courier actions and are only ever called
    // from the admin orders page — they must not be reachable unauthenticated.
    '/api/postex/cancel-order',
    '/api/postex/create-order',
  ],
}
