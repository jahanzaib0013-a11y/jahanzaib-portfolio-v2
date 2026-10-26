import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { styles } from '../style'
import { jahanzaib } from '../assets'
import { stagePlates } from '../constants/stages'
import { stageFilmAutoEnabled, usePinActive } from '../utils/scroll'
import useVisible from '../utils/useVisible'
import StagePin from './StagePin'
import TheaterScreen from './TheaterScreen'

// The one plate this section owns, and the only thing <StagePin /> publishes to.
const HERO_PLATE = stagePlates.find((p) => p.id === 'hero')

// three.js is heavy (~700 KB) — load the WebGL scene in an async chunk so the
// headline text paints without waiting on it.
const HeroModelCanvas = lazy(() => import('./canvas/HeroModelCanvas'))

const SPECS = [
  { k: 'Focus', v: 'LLM pipelines · APIs · Frontend systems' },
  { k: 'Now', v: 'Back End Developer, Qubitars Technologies' },
  { k: 'Experience', v: '5+ shipped applications' },
  { k: 'Based', v: 'Pakistan · Remote' },
]

const rise = (reduce, i) => ({
  initial: reduce ? false : { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: reduce
    ? { duration: 0 }
    : { duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
})

const Plate = ({ children }) => (
  <div className='relative border border-rule bg-surface p-2 rounded-card shadow-card'>
    {children}
  </div>
)

const count = (n) => (n ? Math.round(n).toLocaleString('en-US') : '—')

// When a piece of the hero copy lands on the film, as a fraction of the reel.
// Read by `.reel-piece` in index.css; inert when no film is playing.
const at = (t) => ({ '--at': t })

const Hero = () => {
  const reduce = useReducedMotion()
  // Whether the <StagePin /> holding this screen is running the film. False on
  // reduced motion, save data or a narrow window. Flips once; it never re-renders
  // on scroll.
  const theater = usePinActive('hero')
  // The other way the film gets an audience. Below 900px nothing pins, so on a
  // narrow, calm, unmetered screen the screen below clocks through the same travel
  // on its own. Never true at the same time as `theater` — the scrub rule and the
  // auto rule are mutually exclusive by construction. Reduced-motion changes come
  // free: `useReducedMotion` above already re-renders this component.
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 899px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)')
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const filmAuto = narrow && stageFilmAutoEnabled()
  // The film is worth painting only while the hero is on screen; off it the auto
  // clock parks instead of easing a canvas nobody can see.
  const sectionRef = useRef(null)
  const heroVisible = useVisible(sectionRef)
  // The specimen card keeps its own clock (--card): it leaves with the lights,
  // but after the film it waits for the closing frame to wash out, then makes an
  // entrance of its own and stays for a hold the reader can play in.
  const cardFade = theater || filmAuto
    ? {
        opacity: 'var(--card, 1)',
        transform: 'translateY(calc((1 - var(--card, 1)) * 16px)) scale(calc(0.96 + 0.04 * var(--card, 1)))',
        filter: 'blur(calc((1 - var(--card, 1)) * 6px))',
      }
    : undefined
  // If the 3D scan can't load, the portrait is still a usable specimen plate.
  const [modelFailed, setModelFailed] = useState(false)
  // Read off the loaded asset itself, so the spec block can never drift from the model.
  const [specs, setSpecs] = useState(null)

  // Stable identities: the loader effect keys on these, and a re-render must not
  // re-fetch the GLB.
  const handleModelError = useCallback(() => setModelFailed(true), [])
  const handleSpecs = useCallback((next) => setSpecs(next), [])

  const caption = modelFailed ? 'Fig. 01' : 'Fig. 01 · 3D scan';

  return (
    <>
    {/* The opening screen is the one plate worth holding: it stays put for the whole
        generated sequence and only lets go once the last still has been reached. */}
    <StagePin stage='hero'>
      {/* Exactly one screen tall, so the opening page is seen whole — the hold is
          a theatre, and nothing of the room should hang below the fold. */}
      <section ref={sectionRef} className='relative w-full min-h-dvh mx-auto overflow-hidden flex flex-col'>
      {/* The film. Mounted inside this section rather than in the fixed layer behind
          the page, because the hero paints its own background. As the reader starts
          to scroll the house lights go down (--house, written by the screen): the
          copy and terrain fade, the room goes dark and the screen comes up to its
          true colour; they come back up before the hold lets go. On a narrow screen
          the same screen plays the same travel once, off its own clock. */}
      {(theater || filmAuto) && (
        <TheaterScreen plate={HERO_PLATE} auto={filmAuto} paused={!heroVisible} />
      )}

      <div className='relative flex-1 flex flex-col'>
      {/* Background removed — the video now plays on a clean white canvas */}

      <div className={`${styles.shell} ${styles.paddingX} relative z-10 flex-1 flex flex-col justify-center pt-24 pb-8 [@media(max-height:760px)]:pt-20 [@media(max-height:760px)]:pb-5`}>
        {/* A phone reads top-down: identity first, portrait under it, close enough
            to read as one block. From lg up the row is exactly as it ever was —
            text left, card right. */}
        <div className='flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-20'>
          {/* Identity. With the lights down it stays on screen as the film's titles:
              each piece leaves with the lights, then comes back over the picture at
              its own point in the clip (`--at`, 0–1 of the reel), so by the closing
              frames the whole block is sitting on the film. */}
          <div className='max-w-2xl text-center lg:text-left'>
            <motion.p
              {...rise(reduce, 0)}
              className='font-mono text-eyebrow uppercase text-blueprint reel-accent mb-7 [@media(max-height:760px)]:mb-4'
            >
              <span className='reel-piece inline-block' style={at(0.03)}>Full-Stack AI Engineer</span>
            </motion.p>

            <motion.h1 {...rise(reduce, 1)} className='font-display text-h1 text-ink reel-ink'>
              <span className='reel-piece inline-block' style={at(0.1)}>Jahanzaib</span>
              {/* Below lg the subtitle carries its own readable size instead of a
                  fraction of the display heading; from lg up it is 0.42em of the h1
                  with the tighter leading, exactly as before. */}
              <span
                className='block text-graphite reel-soft font-normal text-subtitle lg:text-[0.42em] lg:leading-[1.3]'
                style={{ letterSpacing: '-0.01em', marginTop: '0.5em' }}
              >
                <span className='reel-piece inline-block' style={at(0.22)}>I build the pipeline and the page:</span>
                <br className='hidden sm:block' />{' '}
                <span className='reel-piece inline-block' style={at(0.32)}>production AI systems end to end.</span>
              </span>
            </motion.h1>

            <motion.p
              {...rise(reduce, 2)}
              className='mt-8 [@media(max-height:760px)]:mt-5 text-lead text-graphite reel-soft max-w-measure mx-auto lg:mx-0 text-balance'
            >
              <span className='reel-piece' style={at(0.45)}>
                Data schemas, high-throughput APIs, RAG pipelines and the frontend
                systems that put them in front of people.
              </span>{' '}
              <span className='reel-piece' style={at(0.56)}>Next.js, Node.js, Supabase, LLMs.</span>
            </motion.p>

            <motion.div
              {...rise(reduce, 3)}
              className='mt-10 [@media(max-height:760px)]:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-4'
            >
              <a
                href='#work'
                style={at(0.68)}
                className='reel-piece reel-cta inline-flex items-center gap-2.5 h-12 px-7 rounded-card bg-ink text-white text-[0.9375rem] font-medium tracking-[-0.01em] transition-all duration-200 ease-out hover:bg-blueprint hover:-translate-y-px'
              >
                Selected work
                <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='M5 12h14M13 6l6 6-6 6' />
                </svg>
              </a>

              <a
                href={`${import.meta.env.BASE_URL}Jahanzaib-Iftikhar-CV.pdf`}
                download
                style={at(0.75)}
                className='reel-piece reel-ink rule-link text-[0.9375rem] font-medium text-ink hover:text-blueprint'
              >
                Download résumé
              </a>

              <a
                href='https://github.com/jahanzaib0013-a11y'
                target='_blank'
                rel='noreferrer'
                style={at(0.81)}
                className='reel-piece reel-ink rule-link text-[0.9375rem] font-medium text-ink hover:text-blueprint'
              >
                GitHub
              </a>
            </motion.div>
          </div>

          {/* Specimen plate — photogrammetry model, portrait as fallback */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className='shrink-0'
          >
            {/* Leaves with the lights; its own wrapper so it never fights the
                entrance opacity framer-motion writes on the parent. */}
            <div data-card style={cardFade}>
            <figure className='w-[220px] sm:w-[264px] [@media(max-height:760px)]:w-[216px]'>
              <Plate>
                {modelFailed ? (
                  <img
                    src={jahanzaib}
                    alt='Portrait of Jahanzaib'
                    width={264}
                    height={264}
                    className='w-full aspect-square object-cover rounded-[3px]'
                  />
                ) : (
                  <Suspense
                    fallback={
                      <div className='w-full aspect-square rounded-[3px] bg-paper' aria-hidden='true' />
                    }
                  >
                    <HeroModelCanvas
                      reducedMotion={!!reduce}
                      onError={handleModelError}
                      onSpecs={handleSpecs}
                    />
                  </Suspense>
                )}
              </Plate>
              <figcaption className='mt-3 flex items-baseline justify-between gap-3 font-mono text-eyebrow uppercase text-mute'>
                <span>{caption}</span>
                <span className='inline-flex items-center gap-2 normal-case tracking-normal'>
                  <span className='w-1.5 h-1.5 rounded-full bg-flare' aria-hidden='true' />
                  Open to roles
                </span>
              </figcaption>
              {!modelFailed && specs && (
                <dl className='mt-4 pt-4 border-t border-rule font-mono text-eyebrow uppercase'>
                  {[
                    ['Geometry', `${count(specs.verts)} verts · ${count(specs.tris)} tris`],
                    ['Texture', specs.texture ? `${specs.texture}² webp` : 'unlit'],
                    ['Pipeline', 'meshopt · quantised'],
                    ['Input', reduce ? 'static · reduced motion' : 'cursor · scroll'],
                  ].map(([k, v]) => (
                    <div key={k} className='flex items-baseline justify-between gap-4 py-0.5'>
                      <dt className='text-mute'>{k}</dt>
                      <dd className='text-graphite tabular-nums'>{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {!modelFailed && (
                <span className='sr-only'>
                  Interactive 3D scan of Jahanzaib, facing forward and turning with
                  the cursor.
                </span>
              )}
            </figure>
            </div>
          </motion.div>
        </div>
      </div>

      </div>
      </section>
    </StagePin>

    {/* Title block — a band of the page below the theater, not part of the hold:
        the pin sizes its track from the section alone, so this only scrolls into
        view once the card's moment is over. It never feels the film's lights. */}
    <motion.div
      {...rise(reduce, 4)}
      className='border-t border-rule bg-surface/70'
    >
      <dl className={`${styles.shell} ${styles.paddingX} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`}>
        {SPECS.map((s, i) => (
          <div
            key={s.k}
            className='py-5 lg:py-6 lg:px-7 lg:border-l lg:border-rule lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0'
          >
            <dt className='font-mono text-eyebrow uppercase text-mute'>
              {String(i + 1).padStart(2, '0')} / {s.k}
            </dt>
            <dd className='mt-1.5 text-caption text-ink leading-relaxed'>{s.v}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
    </>
  )
}

export default Hero
