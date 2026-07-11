'use client'

import { useEffect, useRef } from 'react'

// Starts downloading immediately on page load (preload="auto") so the video
// is already buffered by the time the visitor scrolls to it. Playback is
// still gated on visibility to save CPU/battery — the loop only runs while
// the video is on screen.
export default function LazyVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      preload="auto"
      className="w-full h-auto block bg-[var(--sc-surface-subtle)]"
      aria-label={label}
    />
  )
}
