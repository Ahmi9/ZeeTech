'use client'

import ScrollReveal from './ScrollReveal'

// Add brands here: { name, tag, logo? } — logo is an optional /public path;
// when absent, a letter mark is rendered.
const BRANDS: { name: string; tag: string; logo?: string }[] = [
  { name: 'ZeeTech', tag: 'Tech accessories store' },
]

function BrandChip({ name, tag, logo }: (typeof BRANDS)[number]) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-[9999px] border border-[var(--sc-border)] bg-[var(--sc-surface)] py-2.5 pl-3 pr-6 shadow-sm">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} className="h-9 w-9 rounded-[var(--radius-md)] object-contain" loading="lazy" decoding="async" />
      ) : (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--sc-ink) 0%, var(--sc-accent-dark) 100%)' }}
        >
          {name[0]}
        </span>
      )}
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-[var(--sc-ink)]">{name}</span>
        {tag && <span className="block text-xs text-[var(--sc-muted)]">{tag}</span>}
      </span>
    </div>
  )
}

function NextChip() {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-[9999px] border-2 border-dashed border-[var(--sc-accent)] bg-[var(--sc-accent-light)] py-2.5 pl-3 pr-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--sc-accent)] text-sm font-bold text-white">
        ?
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-[var(--sc-accent-dark)]">Your brand next</span>
        <span className="block text-xs text-[var(--sc-accent-dark)] opacity-70">This spot is waiting</span>
      </span>
    </div>
  )
}

export default function WorkedWith() {
  const row = (
    <>
      {BRANDS.map((brand) => (
        <BrandChip key={brand.name} {...brand} />
      ))}
      <NextChip />
    </>
  )

  return (
    <section className="py-16 md:py-24">
      <ScrollReveal className="page-container text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Brands We&apos;ve Worked With</h2>
        <p className="text-[var(--sc-ink-soft)] max-w-lg mx-auto">
          Real stores, running on their own platforms — not on rented ones.
        </p>
      </ScrollReveal>
      <div
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        }}
      >
        <div className="ww-track flex w-max gap-5 px-5">
          {row}
          {row}
          {row}
          {row}
        </div>
      </div>
      <style>{`
        .ww-track { animation: ww-marquee 26s linear infinite; }
        @keyframes ww-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }
      `}</style>
    </section>
  )
}
