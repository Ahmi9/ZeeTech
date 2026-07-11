import { Check, X } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const ROWS: [string, string, string][] = [
  ['Monthly cost', 'Rs 7,000 – 8,000/month', 'Rs 0/month'],
  ['Yearly cost', '~Rs 1,00,000/year', 'One-time build cost only'],
  ['Order confirmation', 'Manual calling / extra app + fee', 'Semi-automatic WhatsApp confirmation'],
  ['COD + courier booking', 'Third-party app required', 'Built into your admin panel'],
  ['Store ownership', 'Rented — pay forever to keep it live', 'Yours — built specifically for you'],
  ['Customization', 'Limited by theme/app ecosystem', 'Built exactly around your business'],
]

// Same story, compressed for narrow screens — short enough that both sides
// sit side-by-side and the winner is obvious at a glance.
const MOBILE_ROWS: [string, string, string][] = [
  ['Monthly cost', 'Rs 7–8,000 / month', 'Rs 0 / month'],
  ['Yearly cost', '~Rs 1,00,000', 'One-time only'],
  ['Order confirmation', 'Manual calls', 'WhatsApp — semi auto'],
  ['COD + courier', 'Extra apps needed', 'Built-in'],
  ['Ownership', 'Rented forever', 'Yours forever'],
  ['Customization', 'Theme limits', 'Built for you'],
]

export default function ComparisonTable() {
  return (
    <>
      {/* Desktop / tablet: table */}
      <ScrollReveal delay={0.1} className="hidden md:block">
        <table className="w-full border-collapse rounded-[var(--radius-xl)] overflow-hidden border border-[var(--sc-border)] bg-[var(--sc-surface)]">
          <thead>
            <tr className="border-b border-[var(--sc-border)]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--sc-muted)]">&nbsp;</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--sc-ink)]">Shopify</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--sc-accent-dark)]">Us</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ROWS.map(([label, shopify, us], i) => (
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

      {/* Mobile: one dark versus panel, same visual language as the hero/preloader */}
      <div className="md:hidden">
        <ScrollReveal delay={0.05}>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[#12140F] text-white shadow-xl">
            {/* faint dot texture, faded toward the bottom */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                maskImage: 'radial-gradient(ellipse 90% 65% at 50% 0%, black 15%, transparent 78%)',
                WebkitMaskImage: 'radial-gradient(ellipse 90% 65% at 50% 0%, black 15%, transparent 78%)',
              }}
            />

            <div className="relative p-5 pt-7">
              {/* face-off header */}
              <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="text-center">
                  <p className="text-base font-semibold text-white/55 line-through decoration-[#e0685c]/80 decoration-2">
                    Shopify
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#e0685c]/90">
                    ~Rs 1 lakh / year
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold ring-1 ring-white/20">
                  VS
                </span>
                <div className="text-center">
                  <p className="text-base font-semibold text-[#7ee2bd]">Ahmi Makes</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                    Rs 0 / month
                  </p>
                </div>
              </div>

              {/* comparison rows */}
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] divide-y divide-white/10">
                {MOBILE_ROWS.map(([label, shopify, us]) => (
                  <div key={label} className="px-4 py-3">
                    <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{label}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <span className="flex items-start justify-center gap-1.5 text-center text-[12.5px] leading-snug text-white/45">
                        <X size={13} className="mt-[3px] shrink-0 text-[#e0685c]" />
                        {shopify}
                      </span>
                      <span className="flex items-start justify-center gap-1.5 text-center text-[12.5px] font-medium leading-snug text-white">
                        <Check size={13} strokeWidth={3} className="mt-[3px] shrink-0 text-[#7ee2bd]" />
                        {us}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* punchline */}
              <div
                className="mt-5 rounded-[var(--radius-md)] px-4 py-4 text-center"
                style={{ background: 'linear-gradient(135deg, #1F7A5C 0%, #155C44 100%)' }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">You keep</p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-white">~Rs 1,00,000</p>
                <p className="text-[12px] font-medium text-[#7ee2bd]">every single year</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </>
  )
}
