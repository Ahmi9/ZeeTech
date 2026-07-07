'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function PromoBanner() {
  return (
    <>
      <section className="promo-banner" style={{ width: '100%', height: '500px', display: 'flex', overflow: 'hidden' }}>
        <motion.div
          className="promo-left"
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{
            width: '50%',
            background: 'white',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        <div style={{
          textAlign: 'center',
          padding: '24px',
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <p style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--brand)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Limited Offer
          </p>
          <h2 style={{
            fontSize: 'clamp(22px, 2.6vw, 40px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}>
            Built For Everyday Carry
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginTop: '16px',
            maxWidth: '320px',
            textAlign: 'center',
          }}>
            Genuine tech accessories, backed by warranty and real support
          </p>
          <motion.a
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--brand)',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textDecoration: 'none',
              marginTop: '32px',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
            whileHover={{ scale: 1.03 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.opacity = '1'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
          >
            Shop Now
          </motion.a>
        </div>
      </motion.div>

      <motion.div
        className="promo-right"
        initial={{ x: 40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{
          width: '50%',
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/Pics/Banner.jpg"
          alt="Banner"
          fill
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>
    </section>

    <style>{`
      @media (max-width: 768px) {
        .promo-left {
          height: 50% !important;
        }
        .promo-right {
          height: 50% !important;
        }
        .promo-banner {
          height: 600px !important;
        }
        .promo-left h2 {
          white-space: normal !important;
        }
      }
    `}</style>
    </>
  )
}
