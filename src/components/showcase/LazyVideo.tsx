'use client'

import { useEffect, useRef, useState } from 'react'

// Downloads the video with fetch() the moment the page opens. Mobile browsers
// ignore preload="auto" to save data, so relying on the <video> element means
// nothing downloads until playback — fetch() has no such restriction, and the
// blob URL plays instantly once set. Playback is still gated on visibility to
// save CPU/battery.
export default function LazyVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [videoSrc, setVideoSrc] = useState<string>()

  useEffect(() => {
    let cancelled = false
    let blobUrl: string | undefined
    fetch(src)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`${res.status}`))))
      .then((blob) => {
        if (cancelled) return
        blobUrl = URL.createObjectURL(blob)
        setVideoSrc(blobUrl)
      })
      // fetch blocked (offline, extension, CSP) — let the video element load it itself
      .catch(() => !cancelled && setVideoSrc(src))
    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [src])

  useEffect(() => {
    const el = ref.current
    if (!el || !videoSrc) return
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
  }, [videoSrc])

  return (
    <video
      ref={ref}
      src={videoSrc}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className="w-full h-auto block bg-[var(--sc-surface-subtle)]"
      aria-label={label}
    />
  )
}
