'use client'

export default function AnimatedCheckmark({ size = 64 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, display: 'inline-flex' }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="confirm-check-pop"
        style={{ transformOrigin: 'center' }}
      >
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="6"
          strokeLinecap="round"
          className="confirm-check-circle"
        />
        <path
          d="M28 52 L43 67 L74 33"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="confirm-check-tick"
        />
      </svg>
      <style>{`
        .confirm-check-circle {
          stroke-dasharray: 264;
          stroke-dashoffset: 264;
          animation: confirmDrawCircle 0.5s ease forwards;
        }
        .confirm-check-tick {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: confirmDrawTick 0.35s ease forwards;
          animation-delay: 0.5s;
        }
        .confirm-check-pop {
          animation: confirmPop 0.4s ease both;
          animation-delay: 0.85s;
        }
        @keyframes confirmDrawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes confirmDrawTick {
          to { stroke-dashoffset: 0; }
        }
        @keyframes confirmPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
