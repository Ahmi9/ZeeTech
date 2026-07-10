'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

// NOTE: seed content — replace with real client quotes as they come in.
// Brand names here are mirrored in WorkedWith.tsx — keep the two in sync.
type Testimonial = {
  quote: string
  name: string
  business: string
  tone?: 'dark'
  tilt: number
}

const ROW_ONE: Testimonial[] = [
  {
    quote:
      'Pehle har order pe call karna parta tha confirm karne ke liye. Ab customer khud WhatsApp pe confirm karta hai — fake orders almost khatam.',
    name: 'Zeeshan',
    business: 'ZeeTech',
    tone: 'dark',
    tilt: -1.2,
  },
  {
    quote: 'Shopify pe har mahine bill dekh kar dil dukhta tha. Ab wo paisa ads mein lagta hai aur sales upar ja rahi hain.',
    name: 'Areeba K.',
    business: 'Veloura',
    tilt: 1,
  },
  {
    quote: 'Courier booking admin panel se hi ho jati hai. Pehle PostEx portal pe har order ka address copy-paste karte the.',
    name: 'Hamza R.',
    business: 'HavenHome',
    tilt: -0.8,
  },
  {
    quote: 'Store 2 hafte mein live tha, bilkul mere brand ke hisaab se. Kahin se template jaisa nahi lagta.',
    name: 'Mahnoor S.',
    business: 'GlowNest',
    tilt: 1.4,
  },
]

const ROW_TWO: Testimonial[] = [
  {
    quote: 'Mobile pe checkout itna smooth hai ke same ad budget pe conversion khud behtar ho gaya.',
    name: 'Bilal A.',
    business: 'StrideCo',
    tilt: 1.1,
  },
  {
    quote: 'Sab kuch ek jagah — products, stock, coupons, orders. Aaj tak kisi extra app ki zaroorat nahi pari.',
    name: 'Fatima N.',
    business: 'Auren',
    tone: 'dark',
    tilt: -1,
  },
  {
    quote: 'COD returns pehle 30% the, WhatsApp confirmation lagne ke baad 10% se neeche aa gaye hain.',
    name: 'Usman T.',
    business: 'GizmoDen',
    tilt: 0.9,
  },
  {
    quote: 'One-time payment, apna store, koi monthly tension nahi. Business mein yehi sukoon chahiye tha.',
    name: 'Ayesha M.',
    business: 'Mahera',
    tilt: -1.3,
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className="text-[#F5A623]" fill="#F5A623" strokeWidth={0} />
      ))}
    </div>
  )
}

function TestimonialCard({ quote, name, business, tone, tilt }: Testimonial) {
  const dark = tone === 'dark'
  return (
    <figure
      className={`w-[250px] p-5 md:w-[340px] md:p-6 shrink-0 rounded-[var(--radius-xl)] border shadow-sm ${
        dark
          ? 'bg-[var(--sc-ink)] border-transparent text-white'
          : 'bg-[var(--sc-surface)] border-[var(--sc-border)] text-[var(--sc-ink)]'
      }`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <Stars />
      <blockquote className={`text-[13px] md:text-sm leading-relaxed mb-4 md:mb-5 ${dark ? 'text-white/85' : 'text-[var(--sc-ink-soft)]'}`}>
        “{quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--sc-accent) 0%, var(--sc-accent-dark) 100%)' }}
        >
          {name[0]}
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">{name}</span>
          <span className={`block text-xs ${dark ? 'text-white/60' : 'text-[var(--sc-muted)]'}`}>{business}</span>
        </span>
      </figcaption>
    </figure>
  )
}

function MarqueeRow({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
  // Two identical sets inside the animated track; translateX(-50%) lands
  // exactly on the second set's start, so the loop point is invisible.
  const set = (suffix: string) => (
    <div className="flex gap-5 pr-5 shrink-0">
      {items.map((t) => (
        <TestimonialCard key={`${t.name}-${suffix}`} {...t} />
      ))}
    </div>
  )

  return (
    <div
      className="overflow-hidden py-3"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div className={`flex w-max ${reverse ? 'tm-track-reverse' : 'tm-track'}`}>
        {set('a')}
        {set('b')}
      </div>
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-16 md:py-24 overflow-hidden">
      {/* dot-grid texture, same language as the hero */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--sc-border) 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 40%, black 20%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 40%, black 20%, transparent 72%)',
          opacity: 0.8,
        }}
      />

      <div className="relative">
        <ScrollReveal className="page-container text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[9999px] text-xs font-medium bg-[var(--sc-accent-light)] text-[var(--sc-accent-dark)] mb-5">
            Wall of love
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Sellers who stopped renting their store
          </h2>
          <p className="text-[var(--sc-ink-soft)] max-w-lg mx-auto">
            Real problems — fake orders, monthly bills, courier chaos — actually solved.
          </p>
        </ScrollReveal>

        {/* floating rating chips, hero-style */}
        <div className="relative flex justify-center gap-4 mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-2 rounded-[9999px] border border-[var(--sc-border)] bg-white px-4 py-2 text-xs md:text-sm font-medium shadow-lg"
            >
              <Star size={14} className="text-[#F5A623]" fill="#F5A623" strokeWidth={0} />
              5.0 average rating
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="flex items-center gap-2 rounded-[9999px] border border-[var(--sc-border)] bg-white px-4 py-2 text-xs md:text-sm font-medium shadow-lg"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--sc-accent)]" />
              Stores that own themselves
            </motion.div>
          </motion.div>
        </div>

        <MarqueeRow items={ROW_ONE} />
        <MarqueeRow items={ROW_TWO} reverse />
      </div>

      <style>{`
        .tm-track { animation: tm-marquee 38s linear infinite; }
        .tm-track-reverse { animation: tm-marquee 44s linear infinite reverse; }
        @keyframes tm-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
