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

      {/* Mobile: stacked cards, no horizontal scroll */}
      <div className="md:hidden space-y-4">
        {ROWS.map(([label, shopify, us], i) => (
          <ScrollReveal key={label} delay={i * 0.06}>
            <div className="rounded-[var(--radius-lg)] border border-[var(--sc-border)] bg-[var(--sc-surface)] overflow-hidden">
              <div className="px-4 py-2.5 bg-[var(--sc-surface-subtle)] border-b border-[var(--sc-border)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--sc-muted)]">{label}</p>
              </div>
              <div className="divide-y divide-[var(--sc-border)]">
                <div className="flex items-start gap-2.5 px-4 py-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sc-danger)]/10">
                    <X size={12} className="text-[var(--sc-danger)]" />
                  </span>
                  <span className="text-sm text-[var(--sc-ink-soft)] leading-snug">{shopify}</span>
                </div>
                <div className="flex items-start gap-2.5 px-4 py-3 bg-[var(--sc-accent-light)]/40">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sc-accent)]">
                    <Check size={12} className="text-white" />
                  </span>
                  <span className="text-sm font-medium text-[var(--sc-ink)] leading-snug">{us}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </>
  )
}
