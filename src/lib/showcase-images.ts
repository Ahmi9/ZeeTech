const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/showcase`

export const showcaseImages = {
  hero: `${BASE}/hero.png`,
  zeroMonthlyFees: `${BASE}/first-feature.png`,
} as const
