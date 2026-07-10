'use client'

import { useEffect, useRef, useState } from 'react'

// Only starts loading/playing once the video scrolls near the viewport,
// instead of every feature video competing for bandwidth on page load.
export default function LazyVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={shouldLoad ? src : undefined}
      autoPlay={shouldLoad}
      loop
      muted
      playsInline
      preload="none"
      className="w-full h-auto block bg-[var(--sc-surface-subtle)]"
      aria-label={label}
    />
  )
}
