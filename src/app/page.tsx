import Image from 'next/image'
import Link from 'next/link'
import ScrollReveal from '@/components/showcase/ScrollReveal'
import ScrollProgressBar from '@/components/showcase/ScrollProgressBar'
import VelocityMarquee from '@/components/showcase/VelocityMarquee'
import CostCounter from '@/components/showcase/CostCounter'
import ComparisonTable from '@/components/showcase/ComparisonTable'
import FeaturesSection from '@/components/showcase/FeaturesSection'
import SmoothScroll from '@/components/showcase/SmoothScroll'
import WordReveal from '@/components/showcase/WordReveal'
import HeroShot from '@/components/showcase/HeroShot'
import TrustBadges from '@/components/showcase/TrustBadges'
import WorkedWith from '@/components/showcase/WorkedWith'
import Testimonials from '@/components/showcase/Testimonials'
import StepsConnector from '@/components/showcase/StepsConnector'
import CtaGlow from '@/components/showcase/CtaGlow'
import ShinyCta from '@/components/showcase/ShinyCta'
import Preloader from '@/components/showcase/Preloader'
import { showcaseImages } from '@/lib/showcase-images'

export const metadata = {
  title: 'Your Own Online Store — Without the Shopify Bill',
  description: 'A custom-built online store for your business — semi-automatic WhatsApp confirmation, COD + courier booking, full admin panel. No monthly subscription.',
}

const WHATSAPP_MESSAGE = "Hi! I'm interested in getting my own online store built. Can you share the details?"
const WHATSAPP_LINK = `https://wa.me/923446666133?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

const THEME = {
  '--sc-bg': '#FDFCF9',
  '--sc-ink': '#12140F',
  '--sc-ink-soft': '#4B4E44',
  '--sc-muted': '#7A7D71',
  '--sc-border': '#E7E4D8',
  '--sc-surface': '#FFFFFF',
  '--sc-surface-subtle': '#F6F4EC',
  '--sc-accent': '#1F7A5C',
  '--sc-accent-dark': '#155C44',
  '--sc-accent-light': '#E4F2EB',
  '--sc-danger': '#C0362A',
} as React.CSSProperties

export default function ShowcasePage() {
  return (
    <div
      className="min-h-screen overflow-x-clip bg-[var(--sc-bg)] text-[var(--sc-ink)]"
      style={THEME}
    >
      <Preloader />
      <SmoothScroll />
      <ScrollProgressBar />
      {/* Header — floating glass pill */}
      <header className="sticky top-3 md:top-4 z-50 px-3 md:px-4">
        {/* full-width fade so content scrolling past doesn't show through the gutters beside the pill */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-3 md:-top-4 h-[108px] -z-10"
          style={{ background: 'linear-gradient(to bottom, var(--sc-bg) 66%, color-mix(in srgb, var(--sc-bg) 55%, transparent) 84%, transparent 100%)' }}
        />
        <div className="mx-auto flex h-14 max-w-[880px] items-center justify-between rounded-[9999px] border border-[var(--sc-border)] bg-[var(--sc-bg)] md:bg-[var(--sc-bg)]/90 md:backdrop-blur-xl pl-2.5 pr-2 shadow-[0_8px_30px_-12px_rgba(18,20,15,0.18)]">
          <a href="#" className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--sc-border)] bg-[var(--sc-surface)]"
            >
              <Image src="/brand/ahmi-makes-mark.png" alt="" width={20} height={20} className="h-5 w-5" />
            </span>
            <span className="text-[17px] font-semibold tracking-tight">Ahmi Makes</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[var(--sc-ink-soft)]">
            {[
              ['#features', 'Features'],
              ['#comparison', 'Shopify vs Us'],
              ['#testimonials', 'Testimonials'],
              ['#how-it-works', 'How It Works'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="group relative py-1 hover:text-[var(--sc-ink)] transition-colors"
              >
                {label}
                <span className="absolute left-0 -bottom-0.5 h-[2px] w-full origin-left scale-x-0 rounded-full bg-[var(--sc-accent)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[9999px] bg-[var(--sc-accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--sc-accent-dark)] transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Get Started
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative page-container pt-16 pb-16 md:pt-20 md:pb-24">
        {/* dot-grid texture, faded at the edges */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(var(--sc-border) 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse 75% 75% at 50% 35%, black 25%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 35%, black 25%, transparent 72%)',
            opacity: 0.8,
          }}
        />
        <div className="relative grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <ScrollReveal className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[9999px] text-xs font-medium bg-[var(--sc-accent-light)] text-[var(--sc-accent-dark)] mb-6">
              Built for Pakistani sellers
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] mb-6">
              <WordReveal text="Your Own Online Store." delay={0.1} />
              <br />
              <WordReveal text="Without Shopify’s Monthly Bill." delay={0.4} />
            </h1>
            <p className="text-lg text-[var(--sc-ink-soft)] max-w-lg mx-auto md:mx-0 mb-10 leading-relaxed">
              We build you a complete online store — with semi-automatic WhatsApp confirmation, COD, and courier booking built in.
              One-time build. No recurring platform fee, ever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <ShinyCta
                href={WHATSAPP_LINK}
                className="inline-flex w-full sm:w-auto items-center justify-center px-7 py-3 text-base rounded-[var(--radius-md)] font-medium bg-[var(--sc-accent)] text-white hover:bg-[var(--sc-accent-dark)] transition-colors"
              >
                Get Your Store Built
              </ShinyCta>
              <Link
                href="/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center px-7 py-3 text-base rounded-[var(--radius-md)] font-medium border border-[var(--sc-border)] text-[var(--sc-ink)] hover:bg-[var(--sc-surface-subtle)] transition-colors"
              >
                See Live Demo
              </Link>
            </div>
          </ScrollReveal>
          <HeroShot src={showcaseImages.hero} />
        </div>
      </section>

      {/* Feature ticker — speed reacts to your scroll */}
      <VelocityMarquee />

      {/* Trust badges */}
      <TrustBadges />

      {/* Shopify vs Us */}
      <section id="comparison" className="page-container py-16 md:py-24 section-padding">
        <div className="mb-16 md:mb-24">
          <CostCounter />
        </div>
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Shopify vs Us</h2>
          <p className="text-[var(--sc-ink-soft)] max-w-lg mx-auto">
            Same result — your own store, taking orders — for a fraction of the yearly cost.
          </p>
        </ScrollReveal>
        <ComparisonTable />
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Worked with */}
      <WorkedWith />

      {/* Testimonials */}
      <Testimonials />

      {/* How it works */}
      <section id="how-it-works" className="page-container py-16 md:py-24 section-padding">
        <ScrollReveal className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">How It Works</h2>
          <p className="text-[var(--sc-ink-soft)] max-w-lg mx-auto">
            This isn&apos;t a self-serve app you install. We build it for you, end to end.
          </p>
        </ScrollReveal>
        <div className="relative">
        <StepsConnector />
        <div className="relative z-10 grid md:grid-cols-3 gap-8">
          {[
            ['1', 'Tell us about your business', 'Share your products, branding, and how you currently take orders.'],
            ['2', 'We build your store', 'A fully working storefront and admin panel, built around your business — not a generic template.'],
            ['3', 'You start selling', 'No monthly fee. Take orders, manage stock, and confirm orders via semi-automatic WhatsApp messages — all from day one.'],
          ].map(([num, title, desc], i) => (
            <ScrollReveal key={num} delay={i * 0.12} className="h-full">
              <div className="h-full rounded-[var(--radius-xl)] border border-[var(--sc-border)] bg-[var(--sc-surface)] p-8">
                <div className="w-10 h-10 rounded-[9999px] bg-[var(--sc-ink)] text-[var(--sc-bg)] flex items-center justify-center font-semibold mb-5">
                  {num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-[var(--sc-ink-soft)] leading-relaxed">{desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-container pb-20 md:pb-28">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[32px] bg-[var(--sc-ink)] text-white px-8 py-16 md:py-20 text-center">
            <CtaGlow />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                Stop paying Shopify every month.
              </h2>
              <p className="text-base md:text-lg opacity-70 max-w-xl mx-auto mb-9">
                Get a store built specifically for your business — with semi-automatic WhatsApp confirmation and COD handling built in.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ShinyCta
                  href={WHATSAPP_LINK}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3 text-base rounded-[var(--radius-md)] bg-[var(--sc-accent)] text-white font-medium hover:bg-[var(--sc-accent-dark)] transition-colors"
                >
                  Get Your Store Built
                </ShinyCta>
                <Link
                  href="/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center px-7 py-3 text-base rounded-[var(--radius-md)] font-medium border border-white/25 text-white hover:bg-white/5 transition-colors"
                >
                  See Live Demo
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-[#12140F] text-white">
        {/* dot texture fading downward — same language as the hero and preloader */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 0%, black 12%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 0%, black 12%, transparent 75%)',
          }}
        />

        <div className="page-container relative pt-14 pb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
            {/* brand */}
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/15 bg-white/5">
                  <Image src="/brand/ahmi-makes-mark-white.png" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
                </span>
                <span className="text-lg font-semibold tracking-tight">Ahmi Makes</span>
              </div>
              <p className="max-w-[300px] text-sm leading-relaxed text-white/50">
                Custom online stores for Pakistani sellers — one-time build, zero monthly fees, everything built in.
              </p>
            </div>

            {/* link columns */}
            <div className="flex gap-14 sm:gap-20">
              <div>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Explore</p>
                {[
                  ['#features', 'Features'],
                  ['#comparison', 'Shopify vs Us'],
                  ['#testimonials', 'Testimonials'],
                  ['#how-it-works', 'How It Works'],
                ].map(([href, label]) => (
                  <a key={href} href={href} className="mb-2 block text-sm text-white/65 transition-colors hover:text-white">
                    {label}
                  </a>
                ))}
              </div>
              <div>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Get in touch</p>
                <Link href="/demo" target="_blank" rel="noopener noreferrer" className="mb-2 block text-sm text-white/65 transition-colors hover:text-white">
                  Live Demo Store
                </Link>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mb-2 block text-sm text-white/65 transition-colors hover:text-white">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* oversized watermark wordmark */}
          <div
            aria-hidden
            className="pointer-events-none select-none mt-10 -mb-4 whitespace-nowrap text-center text-[17vw] md:text-[9rem] font-bold leading-none tracking-tight text-white/[0.05]"
          >
            Ahmi Makes
          </div>

          <div className="relative mt-4 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
            <span>© {new Date().getFullYear()} Ahmi Makes</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7ee2bd]" />
              Building stores that sell
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
