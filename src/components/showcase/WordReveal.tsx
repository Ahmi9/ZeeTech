'use client'

import { motion } from 'framer-motion'

export default function WordReveal({
  text,
  delay = 0,
  className,
}: {
  text: string
  delay?: number
  className?: string
}) {
  const words = text.split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.28em] last:mr-0 pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="inline-block"
            initial={{ y: '115%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
