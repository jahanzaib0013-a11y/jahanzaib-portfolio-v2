import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { SectionWrapper } from '../hoc'
import { fadeIn } from '../utils/motion'
import { gsap, useGsapScene } from '../utils/gsapClient'
import { qubitarsAppreciation } from '../assets'
import SectionHead from './SectionHead'
import Reveal from './Reveal'

const Lightbox = ({ src, onClose }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label='Qubitars Work Appreciation award, enlarged'
      className='fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/85 cursor-zoom-out'
    >
      <motion.img
        initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }}
        src={src} alt='Qubitars Work Appreciation — Jahanzaib Iftikhar'
        className='max-w-[92vw] max-h-[88vh] border border-white/25 shadow-lift'
      />
    </motion.div>
  );
};

const ROLE = {
  dates: 'May 2025 — Present',
  kind: 'Work experience',
  title: 'Back End Developer',
  org: 'Qubitars Technologies',
  place: 'Full-time · On-site · Gujranwala, PK',
  points: [
    'Build and ship production full-stack applications end to end — REST and webhook APIs on Node.js/Express over PostgreSQL models, with reactive Next.js clients.',
    'Integrate LLM capability (OpenAI, Anthropic) into live user-facing products: retrieval-augmented generation, tool-calling agents and structured schema pipelines.',
    'Maintain high-reliability payment pipelines and automated telemetry sync (Nayax, NMI, CMS) with idempotent reconciliation and zero transaction drop.',
  ],
  stack: 'Node.js · Next.js · Supabase · AWS SQS · RAG · PostgreSQL',
};

const EDUCATION = {
  dates: 'May 2021 — Jun 2023',
  kind: 'Education',
  title: "Associate's Degree, Computer Science",
  org: 'University of Central Punjab',
  place: 'Lahore, PK',
  points: [
    'Foundational coursework in data structures, relational database systems, operating systems and algorithms.',
  ],
};

const Entry = ({ item, children }) => {
  const entryRef = useRef(null)
  const spineRef = useRef(null)

  // The spine draws itself while the entry is being read — a hairline clock
  // hand, not decoration for its own sake.
  useGsapScene(entryRef, () => {
    gsap.fromTo(
      spineRef.current,
      { scaleY: 0, transformOrigin: 'top' },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: entryRef.current,
          start: 'top 75%',
          end: 'bottom 85%',
          scrub: true,
        },
      },
    )
  })

  return (
    <motion.article
      ref={entryRef}
      variants={fadeIn('', '', 0.1, 0.9)}
      className='grid grid-cols-1 md:grid-cols-[168px_1fr] gap-x-10 gap-y-4 py-10 border-t border-rule first:border-t-0'
    >
      {/* Sticky on wide screens: the dates hold their post while the work
          scrolls past — the timeline reads as two columns of a ledger. */}
      <div className='md:sticky md:top-24 self-start'>
        <p className='font-mono text-eyebrow uppercase text-blueprint'>{item.kind}</p>
        <p className='mt-2 font-mono text-caption text-mute'>{item.dates}</p>
        <span
          ref={spineRef}
          aria-hidden='true'
          className='hidden md:block mt-6 w-px h-28 bg-gradient-to-b from-blueprint/50 to-rule'
        />
      </div>

      <div>
        <h3 className='font-display text-h3 text-ink'>{item.title}</h3>
        <p className='mt-1 text-[0.9375rem] text-graphite'>
          {item.org}
          <span className='text-mute'> · {item.place}</span>
        </p>

        <ul className='mt-5 space-y-3'>
          {item.points.map((p) => (
            <li key={p} className='flex gap-4 text-caption text-graphite leading-relaxed'>
              <span className='mt-2.5 w-3 h-px bg-rule shrink-0' aria-hidden='true' />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {item.stack && (
          <p className='mt-6 font-mono text-eyebrow uppercase text-mute'>{item.stack}</p>
        )}

        {children}
      </div>
    </motion.article>
  )
}

const Experience = () => {
  const [zoom, setZoom] = useState(null);

  return (
    <>
      <SectionHead
        index='04'
        title='Experience & education'
        meta='2021 — present'
      />

      <div>
        <Entry item={ROLE}>
          <Reveal mask={false} y={16} duration={0.8} delay={0.15}>
            <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5'>
              {/* Recognition */}
              <div className='flex gap-5 p-5 card transition-shadow duration-200 ease-out hover:shadow-lift'>
              <button
                type='button'
                onClick={() => setZoom(qubitarsAppreciation)}
                aria-label='Enlarge Qubitars Work Appreciation award'
                className='shrink-0 cursor-zoom-in'
              >
                <img
                  src={qubitarsAppreciation}
                  alt='Qubitars Work Appreciation award certificate'
                  loading='lazy'
                  width={92}
                  height={92}
                  className='w-[92px] h-[92px] object-cover border border-rule transition-opacity duration-200 hover:opacity-80'
                />
              </button>
              <div>
                <p className='font-mono text-eyebrow uppercase text-blueprint'>Awarded</p>
                <p className='mt-1.5 text-[0.9375rem] font-medium text-ink'>Work Appreciation Award</p>
                <p className='mt-1.5 text-caption text-graphite leading-relaxed'>
                  Recognised by leadership for high-impact backend engineering and reliability work.
                </p>
              </div>
            </div>

            {/* Published writing */}
            <a
              href='https://qubitars.com/blogs/what-happens-when-software-goes-down'
              target='_blank'
              rel='noreferrer'
              className='group flex flex-col justify-between p-5 card transition-colors duration-200 hover:border-blueprint'
            >
              <div>
                <p className='font-mono text-eyebrow uppercase text-blueprint'>Published</p>
                <p className='mt-1.5 text-[0.9375rem] font-medium text-ink transition-colors duration-200 group-hover:text-blueprint'>
                  What Happens to Your Business When Your Software Goes Down
                </p>
              </div>
              <p className='mt-4 font-mono text-eyebrow uppercase text-mute'>
                Qubitars Blog ↗
              </p>
            </a>
            </div>
          </Reveal>
        </Entry>

        <Entry item={EDUCATION} />
      </div>

      <AnimatePresence>
        {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
      </AnimatePresence>
    </>
  );
}

export default SectionWrapper(Experience, 'experience')
