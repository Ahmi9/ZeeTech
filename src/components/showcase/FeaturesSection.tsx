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
import { showcaseImages, showcaseVideos } from '@/lib/showcase-images'

const FEATURES: {
  icon: LucideIcon
  title: string
  description: string
  points: string[]
  screenshot: string
  image?: string
  video?: string
  orientation?: 'portrait'
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
  },
]

const itemVariant = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
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
  reverse,
}: (typeof FEATURES)[number] & { index: number; reverse: boolean }) {
  const isPortrait = orientation === 'portrait'
  return (
    <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
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
          <span className="text-sm font-bold tracking-[0.25em] text-[var(--sc-muted)]">
            0{index + 1} <span className="opacity-50">/ 06</span>
          </span>
        </motion.div>
        <motion.h3 variants={itemVariant} className="text-2xl md:text-3xl font-semibold mb-3 text-[var(--sc-ink)]">
          {title}
        </motion.h3>
        <motion.p variants={itemVariant} className="text-[var(--sc-ink-soft)] text-base leading-relaxed mb-6">
          {description}
        </motion.p>
        <ul className="space-y-3">
          {points.map((point) => (
            <motion.li
              key={point}
              variants={itemVariant}
              className="flex items-start gap-3 text-sm text-[var(--sc-ink-soft)]"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sc-accent-light)]">
                <Check size={12} strokeWidth={3} className="text-[var(--sc-accent-dark)]" />
              </span>
              <span>{point}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Visual side — designed panel with glow, gradient and icon watermark */}
      <FeatureParallax offset={30}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[32px]"
            style={{
              background: 'radial-gradient(60% 60% at 50% 50%, var(--sc-accent-light) 0%, transparent 75%)',
              filter: 'blur(24px)',
              opacity: 0.9,
            }}
          />
          {isPortrait ? (
            /* Phone-frame mockup for 9:16 portrait media */
            <div className="mx-auto w-full max-w-[240px] sm:max-w-[270px]">
              <div className="relative rounded-[36px] border-[6px] border-[var(--sc-ink)] bg-[var(--sc-ink)] shadow-xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-4 w-20 rounded-b-2xl bg-[var(--sc-ink)]" />
                <div className="rounded-[30px] overflow-hidden">
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
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full rounded-[var(--radius-xl)] border border-[var(--sc-border)] bg-[var(--sc-surface)] overflow-hidden shadow-lg">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--sc-border)] bg-[var(--sc-surface)]">
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
          )}
        </motion.div>
      </FeatureParallax>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section id="features" className="page-container py-16 md:py-24 section-padding space-y-20 md:space-y-32">
      {FEATURES.map((feature, i) => (
        <FeatureBlock key={feature.title} {...feature} index={i} reverse={i % 2 === 1} />
      ))}
    </section>
  )
}
