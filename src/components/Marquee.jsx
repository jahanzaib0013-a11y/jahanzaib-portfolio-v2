import { useEffect, useRef } from 'react'

import { gsap, motionGated } from '../utils/gsapClient'

// The band now sells disciplines, not logos — the same words a recruiter would
// underline in the CV, set in the display face at section-heading size.
// Alternating solid / outlined items are the editorial tell.
const DISCIPLINES = [
  'LLM pipelines',
  'Full-stack systems',
  'Payment ledgers',
  'Agentic AI',
  'Design engineering',
  'AWS infrastructure',
]

// ✳ — the house asterisk, in flare so it reads as a mark, not punctuation.
const Star = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className='text-flare shrink-0 sm:w-6 sm:h-6'>
    <path d='M12 2.5l1.8 6.1 5.9-2.3-4 4.9 6.1 1.3-6.1 1.3 4 4.9-5.9-2.3L12 22.5l-1.8-6.1-5.9 2.3 4-4.9L2.2 12.5l6.1-1.3-4-4.9 5.9 2.3z' />
  </svg>
)

const Marquee = () => {
  const trackRef = useRef(null)

  // Velocity skew: scroll fast and the band leans into the motion, then settles.
  // Desktop-only, gated out for reduced motion / save data — no listener at all
  // for those visitors, so the fallback isn't "run then undo", it's "never run".
  useEffect(() => {
    const node = trackRef.current
    if (!node || !motionGated() || !window.matchMedia('(min-width: 900px)').matches) return

    const skew = gsap.quickTo(node, 'skewX', { duration: 0.5, ease: 'power3.out' })
    let lastY = window.scrollY
    let raf = 0

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        // px/frame → degrees, capped at ±3° so it reads as momentum, not distortion.
        const velocity = Math.max(-60, Math.min(60, (y - lastY) * 2))
        lastY = y
        skew(velocity * 0.05)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
      skew(0)
    }
  }, [])

  // Doubled so the -50% translate loops seamlessly; aria-hidden either way —
  // this is atmosphere, the sections below carry the actual claims.
  const items = [...DISCIPLINES, ...DISCIPLINES]

  return (
    <div className='relative w-full border-y border-rule bg-surface py-6 sm:py-8 overflow-hidden' aria-hidden='true'>
      <div className='marquee-mask overflow-hidden'>
        <div ref={trackRef} className='animate-marquee flex w-max items-center gap-8 sm:gap-12'>
          {items.map((label, i) => (
            <div key={i} className='flex items-center gap-8 sm:gap-12 shrink-0'>
              <span
                className={`font-display font-bold uppercase tracking-[-0.02em] whitespace-nowrap text-h2 sm:text-h1 ${
                  i % 2 ? 'type-outline' : 'text-ink'
                }`}
              >
                {label}
              </span>
              <Star />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Marquee
