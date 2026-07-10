'use client'

import { motion } from 'framer-motion'
import {
  Check,
  DollarSign,
  LayoutDashboard,
  MessageCircle,
  Megaphone,
  Smartphone,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import FeatureParallax from './FeatureParallax'
import LazyVideo from './LazyVideo'
import ScrollReveal from './ScrollReveal'
import { showcaseImages, showcaseVideos } from '@/lib/showcase-images'

type Chip = { text: string; dot: string; position: string; drift?: number }

const FEATURES: {
  icon: LucideIcon
  title: string
  description: string
  points: string[]
  screenshot: string
  image?: string
  video?: string
  orientation?: 'portrait'
  tone?: 'dark'
  chips: Chip[]
}[] = [
  {
    icon: DollarSign,
    title: 'Zero Monthly Fees',
    description:
      "Shopify charges you every single month whether you sell anything or not. We build your store once — after that, it's yours.",
    points: [
      'No monthly subscription',
      'No per-transaction cut on top of your payment gateway',
      'Built around your products, not a generic theme',
    ],
    screenshot: 'Pricing comparison',
    image: showcaseImages.zeroMonthlyFees,
    chips: [
      { text: 'Rs 0/month', dot: 'var(--sc-accent)', position: '-top-4 -left-2 md:-left-5', drift: -7 },
      { text: 'One-time build', dot: 'var(--sc-ink)', position: '-bottom-4 -right-2 md:-right-4', drift: 8 },
    ],
  },
  {
    icon: MessageCircle,
    title: 'Semi-Automatic WhatsApp Confirmation',
    description:
      'The moment an order is placed, your customer gets a WhatsApp message to confirm or cancel it themselves — cutting down fake orders and returns.',
    points: [
      'Customer confirms or cancels with one tap',
      'Reduces fake/COD-return orders',
      'Semi-automatic — one tap from your admin panel to send it',
    ],
    screenshot: 'Semi-auto WhatsApp confirmation flow',
    video: showcaseVideos.whatsappConfirmation,
    tone: 'dark',
    chips: [
      { text: 'Confirmed by customer ✓', dot: '#25D366', position: '-top-4 -left-2 md:-left-5', drift: -8 },
      { text: 'Fake orders ↓', dot: 'var(--sc-danger)', position: '-bottom-4 -right-2 md:-right-4', drift: 7 },
    ],
  },
  {
    icon: Truck,
    title: 'COD + Courier Booking, Built In',
    description:
      'No separate app or manual booking. Cash on delivery and courier (PostEx) booking are handled right from your own admin panel.',
    points: [
      'One-click courier booking per order',
      'Live order status tracking',
      'No extra courier app subscription',
    ],
    screenshot: 'Order detail with courier booking',
    video: showcaseVideos.codCourierBooking,
    chips: [
      { text: 'Courier booked in 1 click', dot: 'var(--sc-accent)', position: '-top-4 -right-2 md:-right-4', drift: -7 },
    ],
  },
  {
    icon: LayoutDashboard,
    title: 'Full Admin Panel',
    description:
      'Manage products, variants, stock, coupons, categories and orders — all from a clean dashboard built for how you actually run your business.',
    points: [
      'Products, variants & stock management',
      'Coupons & discounts',
      'Order tracking & status updates',
    ],
    screenshot: 'Admin dashboard',
    image: showcaseImages.adminPanel,
    chips: [
      { text: 'Everything in one place', dot: 'var(--sc-ink)', position: '-bottom-4 -left-2 md:-left-5', drift: 8 },
    ],
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Storefront',
    description:
      'Most of your customers will land on your store from a phone. Every page is built and tested mobile-first, not adapted as an afterthought.',
    points: [
      'Fast-loading on mobile networks',
      'Smooth checkout on any screen size',
      'Optimized for ad traffic landing directly on product pages',
    ],
    screenshot: 'Mobile storefront view',
    video: showcaseVideos.mobileStorefront,
    orientation: 'portrait',
    chips: [
      { text: 'Loads fast on 4G', dot: 'var(--sc-accent)', position: 'top-6 -left-2 md:left-0', drift: -7 },
      { text: 'Thumb-friendly checkout', dot: 'var(--sc-ink)', position: 'bottom-8 -right-2 md:right-0', drift: 8 },
    ],
  },
  {
    icon: Megaphone,
    title: 'Marketing Tools Built In',
    description:
      'A rotating announcement bar, coupon codes, and out-of-stock badges — small details that help you run promotions without touching code.',
    points: [
      'Rotating announcement bar, editable from admin',
      'Coupon codes & discounts',
      'Automatic out-of-stock badges',
    ],
    screenshot: 'Announcement bar & coupons',
    video: showcaseVideos.marketingTools,
    chips: [
      { text: 'SALE10 applied', dot: 'var(--sc-accent)', position: '-top-4 -left-2 md:-left-5', drift: -7 },
    ],
  },
]

const itemVariant = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
}

function FloatingChip({ chip, dark }: { chip: Chip; dark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.5 }}
      className={`absolute z-20 ${chip.position}`}
    >
      <motion.div
        animate={{ y: [0, chip.drift ?? -8, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        className={`flex items-center gap-2 rounded-[9999px] px-3.5 py-2 text-xs md:text-sm font-medium shadow-lg border ${
          dark
            ? 'bg-white text-[var(--sc-ink)] border-transparent'
            : 'bg-white text-[var(--sc-ink)] border-[var(--sc-border)]'
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: chip.dot }} />
        {chip.text}
      </motion.div>
    </motion.div>
  )
}

function FeatureBlock({
  icon: Icon,
  index,
  title,
  description,
  points,
  screenshot,
  image,
  video,
  orientation,
  tone,
  chips,
  reverse,
}: (typeof FEATURES)[number] & { index: number; reverse: boolean }) {
  const isPortrait = orientation === 'portrait'
  const dark = tone === 'dark'

  const media = isPortrait ? (
    /* Phone-frame mockup for 9:16 portrait media */
    <div className="mx-auto w-full max-w-[240px] sm:max-w-[270px]">
      <div className="relative">
        {/* side hardware buttons */}
        <div className="absolute -left-[2px] top-[88px] h-8 w-[3px] rounded-l-md bg-[#3a3d36]" />
        <div className="absolute -left-[2px] top-[128px] h-12 w-[3px] rounded-l-md bg-[#3a3d36]" />
        <div className="absolute -right-[2px] top-[104px] h-16 w-[3px] rounded-r-md bg-[#3a3d36]" />

        {/* metallic body */}
        <div
          className="relative rounded-[44px] p-[3px]"
          style={{
            background: 'linear-gradient(160deg, #6b6f66 0%, #23251f 30%, #4a4d44 50%, #1a1c17 75%, #565a51 100%)',
            boxShadow:
              '0 30px 60px -20px rgba(18,20,15,0.45), 0 12px 24px -12px rgba(18,20,15,0.35)',
          }}
        >
          <div className="relative rounded-[41px] bg-[#0c0d0a] p-[7px]">
            <div className="relative rounded-[34px] overflow-hidden bg-black">
              {video ? (
                <LazyVideo src={video} label={screenshot} />
              ) : image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={screenshot} className="w-full h-auto block" loading="lazy" decoding="async" />
              ) : (
                <div className="aspect-[9/16] flex items-center justify-center bg-[var(--sc-surface-subtle)]">
                  <Icon size={40} className="text-[var(--sc-accent)] opacity-40" />
                </div>
              )}

              {/* soft diagonal screen glare */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 22%, transparent 40%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div
      className={`relative w-full rounded-[var(--radius-xl)] overflow-hidden shadow-lg border ${
        dark ? 'border-white/15' : 'border-[var(--sc-border)]'
      } bg-[var(--sc-surface)]`}
    >
      <div
        className={`flex items-center gap-1.5 px-3 py-2 border-b ${
          dark ? 'border-white/15 bg-[#1c1f19]' : 'border-[var(--sc-border)] bg-[var(--sc-surface)]'
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-[9999px] bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-[9999px] bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-[9999px] bg-[#28c840]" />
      </div>
      {video ? (
        <LazyVideo src={video} label={screenshot} />
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={screenshot} className="w-full h-auto block" loading="lazy" decoding="async" />
      ) : (
        <div
          className="relative aspect-[16/10] flex flex-col items-center justify-center gap-3 overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, var(--sc-accent-light) 0%, var(--sc-surface) 55%, var(--sc-surface-subtle) 100%)',
          }}
        >
          <Icon
            aria-hidden
            className="absolute -bottom-8 -right-8 text-[var(--sc-accent)] opacity-[0.08]"
            size={180}
            strokeWidth={1.2}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-white shadow-md">
            <Icon size={26} className="text-[var(--sc-accent)]" />
          </div>
          <p className="text-sm font-medium text-[var(--sc-ink-soft)] px-6 text-center">{screenshot}</p>
          <span className="rounded-full border border-[var(--sc-border)] bg-white/70 px-3 py-1 text-xs text-[var(--sc-muted)]">
            screenshot coming soon
          </span>
        </div>
      )}
    </div>
  )

  return (
    <section
      className={`relative overflow-visible rounded-[28px] md:rounded-[36px] px-5 py-10 md:px-14 md:py-14 ${
        dark
          ? 'bg-[var(--sc-ink)] text-white'
          : index % 2 === 0
            ? 'bg-[var(--sc-surface-subtle)]'
            : 'bg-[var(--sc-surface)] border border-[var(--sc-border)]'
      }`}
    >
      {/* faint oversized index number in the panel corner */}
      <span
        aria-hidden
        className={`absolute top-4 right-5 md:top-6 ${reverse ? 'md:right-auto md:left-8' : 'md:right-8'} text-[64px] md:text-[96px] font-bold leading-none select-none ${
          dark ? 'text-white/[0.07]' : 'text-[var(--sc-ink)]/[0.05]'
        }`}
      >
        0{index + 1}
      </span>

      <div className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
        {/* Text side — staggered reveal */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        >
          <motion.div variants={itemVariant} className="flex items-center gap-4 mb-6">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--sc-accent) 0%, var(--sc-accent-dark) 100%)',
                boxShadow: '0 10px 26px -10px color-mix(in srgb, var(--sc-accent) 70%, transparent)',
              }}
            >
              <Icon size={22} color="#fff" />
            </div>
            <span className={`text-sm font-bold tracking-[0.25em] ${dark ? 'text-white/50' : 'text-[var(--sc-muted)]'}`}>
              0{index + 1} <span className="opacity-50">/ 06</span>
            </span>
          </motion.div>
          <motion.h3
            variants={itemVariant}
            className={`text-2xl md:text-3xl font-semibold mb-3 ${dark ? 'text-white' : 'text-[var(--sc-ink)]'}`}
          >
            {title}
          </motion.h3>
          <motion.p
            variants={itemVariant}
            className={`text-base leading-relaxed mb-6 ${dark ? 'text-white/70' : 'text-[var(--sc-ink-soft)]'}`}
          >
            {description}
          </motion.p>
          <ul className="space-y-3">
            {points.map((point) => (
              <motion.li
                key={point}
                variants={itemVariant}
                className={`flex items-start gap-3 text-sm ${dark ? 'text-white/80' : 'text-[var(--sc-ink-soft)]'}`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    dark ? 'bg-[var(--sc-accent)]' : 'bg-[var(--sc-accent-light)]'
                  }`}
                >
                  <Check size={12} strokeWidth={3} className={dark ? 'text-white' : 'text-[var(--sc-accent-dark)]'} />
                </span>
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Media side — parallax + floating chips carried over from the hero */}
        <FeatureParallax offset={24}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="relative"
          >
            {!dark && (
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[32px]"
                style={{
                  background: 'radial-gradient(60% 60% at 50% 50%, var(--sc-accent-light) 0%, transparent 75%)',
                  filter: 'blur(24px)',
                  opacity: 0.9,
                }}
              />
            )}
            {media}
            {chips.map((chip) => (
              <FloatingChip key={chip.text} chip={chip} dark={dark} />
            ))}
          </motion.div>
        </FeatureParallax>
      </div>
    </section>
  )
}

export default function FeaturesSection() {
  return (
    <section id="features" className="page-container py-16 md:py-24 section-padding">
      <ScrollReveal className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[9999px] text-xs font-medium bg-[var(--sc-accent-light)] text-[var(--sc-accent-dark)] mb-5">
          What you get
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
          Everything your store needs — built in
        </h2>
        <p className="text-[var(--sc-ink-soft)] max-w-lg mx-auto">
          No apps to install, no add-on fees. Six things every Pakistani seller fights Shopify for, working from day one.
        </p>
      </ScrollReveal>
      <div className="space-y-6 md:space-y-10">
        {FEATURES.map((feature, i) => (
          <FeatureBlock key={feature.title} {...feature} index={i} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}
