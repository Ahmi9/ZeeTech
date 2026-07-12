import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AppDataProvider } from '@/components/providers/AppDataProvider'
import NavbarWrapper from '@/components/layout/NavbarWrapper'
import ScrollToTopButton from '@/components/layout/ScrollToTopButton'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import { supabase } from '@/lib/supabase'

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Demo Store',
  description: 'Your online store',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Without this, categories/site_settings fetched here get baked into the
// static build and only change on the next deploy — admin panel edits
// (announcement bar, hero text, contact info, etc.) wouldn't show up on
// the live site until a redeploy happened to coincidentally refresh them.
export const revalidate = 60

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ data: categories }, { data: settings }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single(),
  ])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://udipolufcorssishkpsa.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ekdfiscojnfovolceszg.supabase.co" crossOrigin="anonymous" />
      </head>
      <body className={inter.variable}>
        {GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="lazyOnload"
            />
            <Script id="ga4-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_ID}');
              `}
            </Script>
          </>
        )}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel-init" strategy="lazyOnload">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <ThemeProvider>
          <AppDataProvider initialCategories={categories ?? []} initialSettings={settings ?? null}>
            <NavbarWrapper />
            {children}
            <WhatsAppButton />
            <ScrollToTopButton />
          </AppDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}