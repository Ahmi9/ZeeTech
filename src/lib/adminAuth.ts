const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const ADMIN_SESSION_COOKIE = 'admin_session'

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured')
  return secret
}

async function hmac(value: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createAdminSession(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS
  const signature = await hmac(`admin:${expires}`)
  return `${expires}.${signature}`
}

export async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const [expiresStr, signature] = token.split('.')
  const expires = Number(expiresStr)
  if (!expires || !signature || Date.now() > expires) return false
  const expected = await hmac(`admin:${expires}`)
  return expected === signature
}
