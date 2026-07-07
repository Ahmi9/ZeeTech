import React from 'react'

export default function AdminLoader() {
  return (
      <div style={{
        width: '100%',
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}>
      <div style={{
        width: '200px',
        height: '2px',
        background: 'var(--border)',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '40%',
          background: 'var(--brand)',
          borderRadius: '999px',
          animation: 'adminSlide 1.4s ease-in-out infinite',
        }} />
      </div>
      <style>{`
        @keyframes adminSlide {
          0% { left: -40%; }
          50% { left: 100%; }
          100% { left: -40%; }
        }
      `}</style>
    </div>
  )
}
