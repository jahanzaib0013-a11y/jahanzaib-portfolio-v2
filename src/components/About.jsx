import React from 'react'
import { motion } from 'framer-motion'
import { styles } from '../style'
import { fadeIn, textVariant } from '../utils/motion'
import { SectionWrapper } from '../hoc'

const stats = [
  { num: '5', label: 'live products' },
  { num: '1,200+', label: 'AI gens / month' },
  { num: '360+', label: 'txns reconciled' },
]

const IconCube = () => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2zM12 12l9-4.5M12 12v10M12 12L3 7.5' />
  </svg>
)
const IconAI = () => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='3' /><path d='M12 2v4M12 18v4M2 12h4M18 12h4' />
  </svg>
)
const IconDB = () => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <ellipse cx='12' cy='5' rx='8' ry='3' /><path d='M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3' />
  </svg>
)
const IconServer = () => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='4' width='18' height='12' rx='2' /><path d='M7 20h10' />
  </svg>
)

const roles = [
  { icon: <IconCube />, title: 'Next.js & React', desc: 'TypeScript-first, fast modern UIs.' },
  { icon: <IconAI />, title: 'AI & LLMs', desc: 'RAG, agents, OpenAI · Anthropic · Ollama.' },
  { icon: <IconDB />, title: 'Supabase & Postgres', desc: 'Schemas, auth, RLS, data pipelines.' },
  { icon: <IconServer />, title: 'Backend & AWS', desc: 'Node/Express, SQS → Lambda pipelines.' },
]

const RoleCard = ({ icon, title, desc, index }) => (
  <motion.div
    variants={fadeIn('up', 'spring', 0.2 + index * 0.12, 0.6)}
    whileHover={{ y: -4 }}
    className='group relative overflow-hidden rounded-2xl bg-tertiary border border-white/5 p-5 transition-colors duration-300 hover:border-[#915eff]/70'
  >
    <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#915eff] to-[#00cea8] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
    <div className='w-11 h-11 rounded-xl bg-[#915eff]/15 flex items-center justify-center text-[#00cea8] mb-4'>
      {icon}
    </div>
    <h3 className='text-white font-semibold text-[16px]'>{title}</h3>
    <p className='text-secondary text-[13.5px] mt-1.5 leading-[20px]'>{desc}</p>
  </motion.div>
)

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview.</h2>
      </motion.div>

      <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start'>
        {/* left: copy + stats */}
        <motion.div variants={fadeIn('', '', 0.1, 1)}>
          <p className='text-secondary text-[17px] max-w-2xl leading-[30px]'>
            I'm a Full Stack AI Developer building AI-powered web applications end to end — from
            schema and APIs to production deployment. My work spans <span className='text-white font-medium'>React/Next.js</span> front-ends,
            <span className='text-white font-medium'> Node.js/Express</span> services, and <span className='text-white font-medium'>Supabase/PostgreSQL</span> data
            layers, with <span className='text-white font-medium'>LLM integrations</span> (RAG, AI agents, prompt engineering) wired into real,
            live products. I've built production pipelines on AWS (SQS, Lambda), integrated payment
            terminals like Nayax and NMI, and shipped AI SaaS handling 1,200+ generations a month.
          </p>

          <div className='mt-9 flex flex-wrap gap-10'>
            {stats.map((s) => (
              <div key={s.label}>
                <div className='text-[34px] font-black leading-none bg-gradient-to-r from-[#915eff] to-[#00cea8] bg-clip-text text-transparent'>
                  {s.num}
                </div>
                <div className='text-secondary text-[13px] mt-2'>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* right: role cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {roles.map((r, i) => (
            <RoleCard key={r.title} index={i} {...r} />
          ))}
        </div>
      </div>
    </>
  )
}

export default SectionWrapper(About, "about")
