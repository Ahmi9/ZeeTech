const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/showcase`

export const showcaseImages = {
  hero: `${BASE}/hero.png`,
  zeroMonthlyFees: `${BASE}/first-feature.png`,
  adminPanel: `${BASE}/fourth-feature.png`,
} as const

export const showcaseVideos = {
  whatsappConfirmation: `${BASE}/second-feature.mp4`,
  codCourierBooking: `${BASE}/third-feature.mp4`,
} as const
