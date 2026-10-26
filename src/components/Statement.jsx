import { useEffect, useRef } from 'react'

import { gsap } from '../utils/gsapClient'

// The line, as words. Split locally rather than by a plugin — the sentence is
// fixed copy, so a plain map is the whole splitter.
const LINE = ['Production', 'AI', 'isn’t', 'a', 'prompt.', 'It’s', 'a', 'pipeline.']

/**
 * Statement — the first dark moment. Full-bleed night room, the manifesto held
 * one screen tall, words landing as the reader scrolls them in. The hero dims
 * its room for a film; this dims yours for a sentence.
 *
 * Wide + calm screens get the scrub; everything else simply reads the line.
 */
const Statement = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          node.querySelectorAll('.statement-word'),
          { y: 26, opacity: 0.08 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              end: '+=60%',
              scrub: 0.5,
            },
          },
        )
        // The oversized mark drifts against the scroll — depth without a canvas.
        gsap.to(node.querySelector('.statement-mark'), {
          xPercent: 18,
          scrollTrigger: {
            trigger: node,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }, node)
      return () => ctx.revert()
    })
    return () => mm.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      data-tone='dark'
      className='relative w-full py-28 sm:py-36 overflow-hidden'
      aria-label='Statement'
    >
      {/* Grain and the slow lamp behind the manifesto. Both decoration. */}
      <div className='grain absolute inset-0 pointer-events-none' aria-hidden='true' />
      <div
        className='glow-drift absolute -top-1/3 left-1/2 -translate-x-1/2 w-[60vw] aspect-square rounded-full bg-night-accent/10 blur-[120px] pointer-events-none'
        aria-hidden='true'
      />
      {/* Oversized outline mark, half off-stage, parallaxing. */}
      <span
        className='statement-mark absolute -right-6 sm:-right-10 bottom-4 font-display font-bold text-[12rem] sm:text-[18rem] leading-none text-transparent select-none pointer-events-none'
        style={{ WebkitTextStroke: '1px rgba(246,244,250,0.14)' }}
        aria-hidden='true'
      >
        ✳
      </span>

      <div className='shell relative z-10'>
        <p className='font-mono text-eyebrow uppercase text-night-soft/70'>— Interlude</p>

        <h2 className='mt-8 font-display font-bold tracking-[-0.03em] leading-[0.98] text-[clamp(2.25rem,1.4rem+4vw,4.5rem)] max-w-[16ch]'>
          {LINE.map((word, i) => (
            <span key={i} className='inline-block overflow-hidden align-baseline'>
              <span
                className={`statement-word inline-block ${
                  word.endsWith('.') && i === LINE.length - 1 ? 'text-night-accent' : ''
                }`}
              >
                {word}
                {/* Inline-block swallows the spaces between words. */}
                {i < LINE.length - 1 ? '\u00A0' : ''}
              </span>
            </span>
          ))}
        </h2>

        <p className='mt-8 max-w-measure font-mono text-caption text-night-soft leading-relaxed'>
          Every system on this page has shipped, failed, been hardened, and shipped again.
        </p>
      </div>
    </section>
  )
}

export default Statement
