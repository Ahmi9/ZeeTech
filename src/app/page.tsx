import Link from 'next/link'
import { Check, X } from 'lucide-react'
import ScrollReveal from '@/components/showcase/ScrollReveal'
import ScrollProgressBar from '@/components/showcase/ScrollProgressBar'
import VelocityMarquee from '@/components/showcase/VelocityMarquee'
import CostCounter from '@/components/showcase/CostCounter'
import FeaturesSection from '@/components/showcase/FeaturesSection'
import SmoothScroll from '@/components/showcase/SmoothScroll'
import WordReveal from '@/components/showcase/WordReveal'
import HeroShot from '@/components/showcase/HeroShot'
import TrustBadges from '@/components/showcase/TrustBadges'
import WorkedWith from '@/components/showcase/WorkedWith'
import StepsConnector from '@/components/showcase/StepsConnector'
import CtaGlow from '@/components/showcase/CtaGlow'
import ShinyCta from '@/components/showcase/ShinyCta'

export const metadata = {
  title: 'Your Own Online Store — Without the Shopify Bill',
  description: 'A custom-built online store for your business — WhatsApp order confirmation, COD + courier booking, full admin panel. No monthly subscription.',
}

const WHATSAPP_LINK = 'https://wa.me/923000000000'

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
      <SmoothScroll />
      <ScrollProgressBar />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--sc-bg)]/90 backdrop-blur border-b border-[var(--sc-border)]">
        <div className="page-container flex items-center justify-between h-16">
          <span className="text-lg font-semibold tracking-tight">[Your Brand]</span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--sc-ink-soft)]">
            <a href="#features" className="hover:text-[var(--sc-ink)] transition-colors">Features</a>
            <a href="#comparison" className="hover:text-[var(--sc-ink)] transition-colors">Shopify vs Us</a>
            <a href="#how-it-works" className="hover:text-[var(--sc-ink)] transition-colors">How It Works</a>
          </nav>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium bg-[var(--sc-accent)] text-white hover:bg-[var(--sc-accent-dark)] transition-colors"
          >
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
              We build you a complete online store — with WhatsApp order confirmation, COD, and courier booking built in.
              One-time build. No recurring platform fee, ever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <ShinyCta
                href={WHATSAPP_LINK}
                className="inline-flex items-center justify-center px-7 py-3 text-base rounded-[var(--radius-md)] font-medium bg-[var(--sc-accent)] text-white hover:bg-[var(--sc-accent-dark)] transition-colors"
              >
                Get Your Store Built
              </ShinyCta>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-7 py-3 text-base rounded-[var(--radius-md)] font-medium border border-[var(--sc-border)] text-[var(--sc-ink)] hover:bg-[var(--sc-surface-subtle)] transition-colors"
              >
                See Live Demo
              </Link>
            </div>
          </ScrollReveal>
          <HeroShot src="/showcase/hero.png" />
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
        <ScrollReveal delay={0.1} className="scroll-x">
          <table className="w-full border-collapse rounded-[var(--radius-xl)] overflow-hidden border border-[var(--sc-border)] bg-[var(--sc-surface)]">
            <thead>
              <tr className="border-b border-[var(--sc-border)]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--sc-muted)]">&nbsp;</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--sc-ink)]">Shopify</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--sc-accent-dark)]">Us</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                ['Monthly cost', 'Rs 7,000 – 8,000/month', 'Rs 0/month'],
                ['Yearly cost', '~Rs 1,00,000/year', 'One-time build cost only'],
                ['Order confirmation', 'Manual calling / extra app + fee', 'Built-in WhatsApp confirmation'],
                ['COD + courier booking', 'Third-party app required', 'Built into your admin panel'],
                ['Store ownership', 'Rented — pay forever to keep it live', 'Yours — built specifically for you'],
                ['Customization', 'Limited by theme/app ecosystem', 'Built exactly around your business'],
              ].map(([label, shopify, us], i) => (
                <tr key={label} className={i % 2 === 0 ? '' : 'bg-[var(--sc-surface-subtle)]'}>
                  <td className="px-6 py-4 font-medium text-[var(--sc-ink)]">{label}</td>
                  <td className="px-6 py-4 text-[var(--sc-ink-soft)]">
                    <span className="inline-flex items-center gap-2">
                      <X size={15} className="text-[var(--sc-danger)] shrink-0" />
                      {shopify}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--sc-ink)] font-medium">
                    <span className="inline-flex items-center gap-2">
                      <Check size={15} className="text-[var(--sc-accent)] shrink-0" />
                      {us}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollReveal>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Worked with */}
      <WorkedWith />

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
            ['3', 'You start selling', 'No monthly fee. Take orders, manage stock, and confirm orders over WhatsApp — all from day one.'],
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
                Get a store built specifically for your business — with WhatsApp confirmation and COD handling built in.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ShinyCta
                  href={WHATSAPP_LINK}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 text-base rounded-[var(--radius-md)] bg-[var(--sc-accent)] text-white font-medium hover:bg-[var(--sc-accent-dark)] transition-colors"
                >
                  Get Your Store Built
                </ShinyCta>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center px-7 py-3 text-base rounded-[var(--radius-md)] font-medium border border-white/25 text-white hover:bg-white/5 transition-colors"
                >
                  See Live Demo
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--sc-border)] py-10">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--sc-muted)]">
          <span>© {new Date().getFullYear()} [Your Brand]</span>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--sc-ink)] transition-colors">
            Contact on WhatsApp
          </a>
        </div>
      </footer>
    </div>
  )
}
