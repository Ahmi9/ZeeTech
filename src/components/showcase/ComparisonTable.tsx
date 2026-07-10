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

      {/* Mobile: versus cards, no horizontal scroll */}
      <div className="md:hidden space-y-4">
        {ROWS.map(([label, shopify, us], i) => (
          <ScrollReveal key={label} delay={i * 0.05}>
            <div className="relative rounded-[var(--radius-lg)] border border-[var(--sc-border)] bg-[var(--sc-surface)] overflow-hidden shadow-sm">
              {/* category label */}
              <div className="flex items-center justify-center gap-2.5 px-4 pt-3.5 pb-2.5">
                <span className="h-px flex-1 bg-[var(--sc-border)]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sc-muted)]">{label}</p>
                <span className="h-px flex-1 bg-[var(--sc-border)]" />
              </div>

              <div className="relative">
                {/* Shopify half */}
                <div className="flex items-center gap-3 px-4 pt-2.5 pb-5 bg-[color-mix(in_srgb,var(--sc-danger)_4%,var(--sc-surface))]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--sc-danger)_12%,var(--sc-surface))]">
                    <X size={13} className="text-[var(--sc-danger)]" />
                  </span>
                  <span className="flex-1 text-[13px] leading-snug text-[var(--sc-ink-soft)]">{shopify}</span>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[var(--sc-danger)] opacity-70">
                    Shopify
                  </span>
                </div>

                {/* VS badge on the divider */}
                <span className="absolute left-1/2 top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--sc-ink)] text-[9px] font-bold text-white ring-4 ring-[var(--sc-surface)]">
                  VS
                </span>

                {/* Us half */}
                <div className="flex items-center gap-3 px-4 pt-5 pb-3.5 bg-[var(--sc-accent-light)]/60 border-t border-[var(--sc-accent)]/20">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sc-accent)] shadow-[0_4px_10px_-3px_var(--sc-accent)]">
                    <Check size={13} strokeWidth={3} className="text-white" />
                  </span>
                  <span className="flex-1 text-[13px] font-semibold leading-snug text-[var(--sc-ink)]">{us}</span>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[var(--sc-accent-dark)]">
                    Us
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {/* savings summary */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center justify-center gap-2 rounded-[9999px] border border-[var(--sc-accent)]/30 bg-[var(--sc-accent-light)] px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-[var(--sc-accent)]" />
            <p className="text-[13px] font-semibold text-[var(--sc-accent-dark)]">
              You keep ~Rs 1,00,000 every single year
            </p>
          </div>
        </ScrollReveal>
      </div>
    </>
  )
}
