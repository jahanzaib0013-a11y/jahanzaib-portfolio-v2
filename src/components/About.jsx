import { motion } from 'framer-motion'

import { fadeIn } from '../utils/motion'
import { motionGated } from '../utils/gsapClient'


import { SectionWrapper } from '../hoc'
import SectionHead from './SectionHead'
import WipeReveal from './WipeReveal'
import Reveal from './Reveal'
import CountUp from './CountUp'
import FrameMock from './FrameMock'
import { AiIcon, SystemsIcon, WebIcon } from './icons/FocusIcons'
import {
  AwsIcon, LangchainIcon, NextjsIcon, OllamaIcon, PostgresIcon, ReactIcon, SupabaseIcon,
} from './icons/TechLogos'

const CAPABILITIES = [
  {
    k: 'Web',
    Icon: WebIcon,
    v: 'Full-stack systems built on Next.js App Router, React and TypeScript, with Tailwind doing the design work.',
  },
  {
    k: 'AI',
    Icon: AiIcon,
    v: 'Production RAG pipelines, vector retrieval, tool-calling agents and structured outputs that survive real traffic.',
  },
  {
    k: 'Systems',
    Icon: SystemsIcon,
    v: 'AWS SQS FIFO queues, Lambda workers and automated daily reconciliation over normalized Postgres schemas.',
  },
]

const STACK_ROLES = [
  { title: 'Next.js & React',    logos: [NextjsIcon, ReactIcon],        desc: 'TypeScript-first client architecture, server components, edge rendering.' },
  { title: 'Agentic AI & RAG',   logos: [LangchainIcon, OllamaIcon],   desc: 'Vector search, multi-agent flows, LangChain and self-hosted inference.' },
  { title: 'Supabase & Postgres',logos: [SupabaseIcon, PostgresIcon],  desc: 'Normalized schemas, ACID guarantees, row-level security.' },
  { title: 'Backend & AWS',      logos: [AwsIcon],                     desc: 'Distributed pipelines, FIFO queues, serverless workers.' },
]

const STATS = [
  { value: 5, label: 'Products shipped' },
  { value: 1200, label: 'AI generations / month', suffix: '+', locale: true },
  { value: 360, label: 'Transactions reconciled daily', suffix: '+' },
]

// The first two rows earn their video; the other two get a designed frame
// until their real recordings exist. A 'mock' entry swaps to a 'video'/'image'
// entry in one line — nothing else reads this list.
const WIPE_MEDIA = [
  { type: 'video', src: '/assets/wipe-reveal-01.mp4' },
  { type: 'video', src: '/assets/wipe-reveal-02.mp4', fit: 'blurred' },
  { type: 'mock', variant: 'terminal', seed: 'agentic-runs' },
  { type: 'mock', variant: 'blueprint', seed: 'system-design' },
]

const About = () => {
  return (
    <>
      <SectionHead
        index='01'
        title='Engineering focus'
        meta='Overview'
        blurb='I build end-to-end applications where resilient backend architecture and applied LLM work meet — the pipeline and the page.'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start'>
        {/* Capabilities */}
        <motion.div variants={fadeIn('', '', 0.1, 1)}>
          <dl>
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.k} delay={i * 0.06} y={20} duration={0.8}>
                <div className='grid grid-cols-[64px_1fr] gap-4 py-6 border-t border-rule'>
                  <dt className='font-mono text-eyebrow uppercase text-blueprint'>
                    {/* Inherits text-blueprint through currentColor; the label beside it
                        stays the accessible name, so the glyph adds no text to read out. */}
                    <c.Icon size={19} strokeWidth={1.4} aria-hidden='true' className='mb-3 block' />
                    {c.k}
                  </dt>
                  <dd className='text-body text-graphite'>{c.v}</dd>
                </div>
              </Reveal>
            ))}
          </dl>

          {/* One column below 480px: "TRANSACTIONS" needs ~109px and three equal
              columns cannot give it that on small phones — the row would push the
              page sideways. Stacked, each label gets the full width instead. */}
          <div className='grid grid-cols-1 xs:grid-cols-3 gap-6 mt-10 pt-8 border-t border-rule'>
            {STATS.map((s) => (
              <div key={s.label}>
                <div className='font-display text-stat text-ink'>
                  <CountUp
                    value={s.value}
                    suffix={s.suffix ?? ''}
                    format={s.locale ? (n) => Math.round(n).toLocaleString('en-US') : undefined}
                  />
                </div>
                <div className='mt-2 font-mono text-eyebrow uppercase text-mute leading-snug'>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Practice areas */}
        <motion.ul variants={fadeIn('up', 'spring', 0.25, 0.7)}>
          {STACK_ROLES.map((r, i) => (
            <li
              key={r.title}
              className={`border-b border-rule ${
                i === 0 ? 'border-t border-rule' : ''
              }`}
            >
              <WipeReveal className='py-6'>
                {/* The media sits behind the text; wiping the canvas reveals it. */}
                {WIPE_MEDIA[i].type === 'video' ? (
                  <>
                    {WIPE_MEDIA[i].fit === 'blurred' && (
                      <video
                        src={WIPE_MEDIA[i].src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className='pointer-events-none absolute inset-0 w-full h-full object-cover scale-125 blur-2xl'
                        aria-hidden='true'
                      />
                    )}
                    <video
                      src={WIPE_MEDIA[i].src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className={`pointer-events-none absolute inset-0 w-full h-full ${
                        WIPE_MEDIA[i].fit === 'blurred' ? 'object-contain' : 'object-cover'
                      } ${WIPE_MEDIA[i].fit !== 'blurred' && motionGated() ? 'ken-burns' : ''}`}
                      aria-hidden='true'
                    />
                  </>
                ) : WIPE_MEDIA[i].type === 'mock' ? (
                  <FrameMock
                    variant={WIPE_MEDIA[i].variant}
                    seed={WIPE_MEDIA[i].seed}
                    className='pointer-events-none absolute inset-0 w-full h-full border-0 rounded-none'
                  />
                ) : (
                  <img
                    src={WIPE_MEDIA[i].src}
                    alt=''
                    className='pointer-events-none absolute inset-0 w-full h-full object-cover'
                    aria-hidden='true'
                  />
                )}
                {/* pointer-events-none: the canvas above must receive every cursor
                    event, or the wipe stalls wherever the cursor crosses the text. */}
                <div className='pointer-events-none relative z-10 flex gap-5 px-4'>
                  <span className='font-mono text-eyebrow text-mute pt-1.5 w-6 shrink-0'>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className='font-display text-h3 text-ink flex items-center gap-2.5'>
                      {/* The actual marks, two where the title names two products. They
                          inherit text-ink and only sit at 70% so the title stays the
                          loudest thing in the row. */}
                      <span className='flex shrink-0 items-center gap-1.5 opacity-70'>
                        {r.logos.map((Logo, li) => (
                          <Logo key={li} size={15} />
                        ))}
                      </span>
                      {r.title}
                    </h3>
                    <p className='mt-1.5 text-caption text-graphite leading-relaxed'>{r.desc}</p>
                  </div>
                </div>
              </WipeReveal>
            </li>
          ))}
        </motion.ul>
      </div>
    </>
  )
}

export default SectionWrapper(About, 'about')
