const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/showcase`

// v2 assets are uploaded with cacheControl: 1 year (originals were 7 days);
// bump the suffix when replacing an asset so caches never serve a stale file.
export const showcaseImages = {
  hero: { src: `${BASE}/hero-v2.png`, width: 2880, height: 1344 },
  zeroMonthlyFees: { src: `${BASE}/first-feature-v2.png`, width: 2160, height: 1100 },
  adminPanel: { src: `${BASE}/fourth-feature-v2.png`, width: 2880, height: 1620 },
} as const

export type ShowcaseImage = (typeof showcaseImages)[keyof typeof showcaseImages]

export const showcaseVideos = {
  whatsappConfirmation: `${BASE}/second-feature-v2.mp4`,
  codCourierBooking: `${BASE}/third-feature-v2.mp4`,
  mobileStorefront: `${BASE}/fifth-feature-v3.mp4`,
  marketingTools: `${BASE}/sixth-feature-v2.mp4`,
} as const
