import type { Metadata } from 'next'
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ZeeTech',
  description: 'Your online store',
}

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