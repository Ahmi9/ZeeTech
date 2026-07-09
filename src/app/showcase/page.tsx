import Link from 'next/link'
import { Check, X, MessageCircle, Truck, LayoutDashboard, Smartphone, Megaphone, DollarSign } from 'lucide-react'

export const metadata = {
  title: 'ZeeTech — Your Own Online Store, Without the Shopify Bill',
  description: 'A custom-built online store for your business — WhatsApp order confirmation, COD + courier booking, full admin panel. No monthly subscription.',
}

const WHATSAPP_LINK = 'https://wa.me/923000000000'

function Placeholder({ label }: { label: string }) {
  return (
    <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-muted)]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="aspect-[16/10] flex items-center justify-center px-6">
        <p className="text-sm text-[var(--text-muted)] text-center">Screenshot: {label}</p>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
  points,
  screenshot,
  reverse,
}: {
  icon: React.ReactNode
  title: string
  description: string
  points: string[]
  screenshot: string
  reverse?: boolean
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
      <div>
        <div className="w-12 h-12 rounded-xl bg-[var(--brand-light)] flex items-center justify-center mb-5">
          {icon}
        </div>
        <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-[var(--text-primary)]">{title}</h3>
        <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-5">{description}</p>
        <ul className="space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
              <Check size={16} className="text-[var(--success)] mt-0.5 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <Placeholder label={screenshot} />
    </div>
  )
}

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]" data-theme="light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/90 backdrop-blur border-b border-[var(--border)]">
        <div className="page-container flex items-center justify-between h-16">
          <span className="text-lg font-semibold tracking-tight">ZeeTech</span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#comparison" className="hover:text-[var(--text-primary)] transition-colors">Shopify vs ZeeTech</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How It Works</a>
          </nav>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-brand">
            Get Started
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="page-container pt-20 pb-16 md:pt-28 md:pb-24 text-center">
        <div className="badge badge-brand mb-6">Built for Pakistani sellers</div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08] max-w-3xl mx-auto mb-6">
          Your Own Online Store.
          <br />
          Without Shopify&apos;s Monthly Bill.
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
          We build you a complete online store — with WhatsApp order confirmation, COD, and courier booking built in.
          One-time build. No recurring platform fee, ever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-primary px-7 py-3 text-base">
            See Live Demo
          </Link>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-outline px-7 py-3 text-base">
            Get Your Store Built
          </a>
        </div>
        <div className="mt-16">
          <Placeholder label="Storefront homepage (hero + products)" />
        </div>
      </section>

      {/* Shopify vs ZeeTech */}
      <section id="comparison" className="page-container py-16 md:py-24 section-padding">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Shopify vs ZeeTech</h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Same result — your own store, taking orders — for a fraction of the yearly cost.
          </p>
        </div>
        <div className="scroll-x">
          <table className="w-full border-collapse rounded-xl overflow-hidden card">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-muted)]">&nbsp;</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">Shopify</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--brand)]">ZeeTech</th>
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
              ].map(([label, shopify, zeetech], i) => (
                <tr key={label} className={i % 2 === 0 ? '' : 'bg-[var(--bg-subtle)]'}>
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{label}</td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-2">
                      <X size={15} className="text-[var(--danger)] shrink-0" />
                      {shopify}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-primary)] font-medium">
                    <span className="inline-flex items-center gap-2">
                      <Check size={15} className="text-[var(--success)] shrink-0" />
                      {zeetech}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="page-container py-16 md:py-24 section-padding space-y-20 md:space-y-32">
        <Feature
          icon={<DollarSign size={22} className="text-[var(--brand)]" />}
          title="Zero Monthly Fees"
          description="Shopify charges you every single month whether you sell anything or not. We build your store once — after that, it's yours."
          points={[
            'No monthly subscription',
            'No per-transaction cut on top of your payment gateway',
            'Built around your products, not a generic theme',
          ]}
          screenshot="Pricing comparison"
        />
        <Feature
          icon={<MessageCircle size={22} className="text-[var(--brand)]" />}
          title="WhatsApp Order Confirmation"
          description="The moment an order is placed, your customer gets a WhatsApp message to confirm or cancel it themselves — cutting down fake orders and returns."
          points={[
            'Customer confirms or cancels with one tap',
            'Reduces fake/COD-return orders',
            'Semi-automatic — one tap from your admin panel to send it',
          ]}
          screenshot="WhatsApp order confirmation flow"
          reverse
        />
        <Feature
          icon={<Truck size={22} className="text-[var(--brand)]" />}
          title="COD + Courier Booking, Built In"
          description="No separate app or manual booking. Cash on delivery and courier (PostEx) booking are handled right from your own admin panel."
          points={[
            'One-click courier booking per order',
            'Live order status tracking',
            'No extra courier app subscription',
          ]}
          screenshot="Order detail with courier booking"
        />
        <Feature
          icon={<LayoutDashboard size={22} className="text-[var(--brand)]" />}
          title="Full Admin Panel"
          description="Manage products, variants, stock, coupons, categories and orders — all from a clean dashboard built for how you actually run your business."
          points={[
            'Products, variants & stock management',
            'Coupons & discounts',
            'Order tracking & status updates',
          ]}
          screenshot="Admin dashboard"
          reverse
        />
        <Feature
          icon={<Smartphone size={22} className="text-[var(--brand)]" />}
          title="Mobile-First Storefront"
          description="Most of your customers will land on your store from a phone. Every page is built and tested mobile-first, not adapted as an afterthought."
          points={[
            'Fast-loading on mobile networks',
            'Smooth checkout on any screen size',
            'Optimized for ad traffic landing directly on product pages',
          ]}
          screenshot="Mobile storefront view"
        />
        <Feature
          icon={<Megaphone size={22} className="text-[var(--brand)]" />}
          title="Marketing Tools Built In"
          description="A rotating announcement bar, coupon codes, and out-of-stock badges — small details that help you run promotions without touching code."
          points={[
            'Rotating announcement bar, editable from admin',
            'Coupon codes & discounts',
            'Automatic out-of-stock badges',
          ]}
          screenshot="Announcement bar & coupons"
          reverse
        />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="page-container py-16 md:py-24 section-padding">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">How It Works</h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            This isn&apos;t a self-serve app you install. We build it for you, end to end.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            ['1', 'Tell us about your business', 'Share your products, branding, and how you currently take orders.'],
            ['2', 'We build your store', 'A fully working storefront and admin panel, built around your business — not a generic template.'],
            ['3', 'You start selling', 'No monthly fee. Take orders, manage stock, and confirm orders over WhatsApp — all from day one.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="card p-8">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-semibold mb-5">
                {num}
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-container pb-20 md:pb-28">
        <div className="rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)] px-8 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Stop paying Shopify every month.
          </h2>
          <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto mb-9">
            Get a store built specifically for your business — with WhatsApp confirmation and COD handling built in.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="btn-outline px-7 py-3 text-base !border-white/30 !text-white">
              See Live Demo
            </Link>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-base rounded-md bg-white text-[var(--accent)] font-medium hover:opacity-90 transition-opacity"
            >
              Get Your Store Built
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-10">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <span>© {new Date().getFullYear()} ZeeTech</span>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">
            Contact on WhatsApp
          </a>
        </div>
      </footer>
    </div>
  )
}
