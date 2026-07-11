import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ''}https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://udipolufcorssishkpsa.supabase.co https://ekdfiscojnfovolceszg.supabase.co https://www.googletagmanager.com https://www.google-analytics.com",
  "media-src 'self' blob: https://udipolufcorssishkpsa.supabase.co https://ekdfiscojnfovolceszg.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://udipolufcorssishkpsa.supabase.co https://ekdfiscojnfovolceszg.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
  images: {
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 65, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'udipolufcorssishkpsa.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ekdfiscojnfovolceszg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;