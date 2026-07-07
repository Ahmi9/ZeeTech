interface RatingBadgeProps {
  reviews: { rating: number; is_approved: boolean }[] | null | undefined
  size?: number
}

export default function RatingBadge({ reviews, size = 12 }: RatingBadgeProps) {
  const approved = (reviews || []).filter(r => r.is_approved)

  if (approved.length === 0) {
    return (
      <div style={{ height: `${size}px`, marginTop: '4px', visibility: 'hidden' }} aria-hidden="true">
        &nbsp;
      </div>
    )
  }

  const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
  const rounded = Math.round(avg)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
      <span style={{ display: 'flex', fontSize: `${size}px` }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: star <= rounded ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {star <= rounded ? '★' : '☆'}
          </span>
        ))}
      </span>
      <span style={{ fontSize: `${size}px`, color: 'var(--text-muted)' }}>
        {avg.toFixed(1)} ({approved.length})
      </span>
    </div>
  )
}
