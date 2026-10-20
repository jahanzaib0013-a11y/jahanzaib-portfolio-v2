import React from 'react'
import { motion } from 'framer-motion'
import { styles } from '../style'
import { SectionWrapper } from '../hoc'
import { fadeIn, textVariant } from '../utils/motion'

const groups = [
  {
    label: 'Frontend',
    items: [
      { glyph: 'TS', name: 'TypeScript' },
      { glyph: 'JS', name: 'JavaScript' },
      { glyph: '⚛', name: 'React' },
      { glyph: 'N', name: 'Next.js' },
      { glyph: '⟲', name: 'Redux Toolkit' },
      { glyph: '~', name: 'Tailwind CSS' },
    ],
  },
  {
    label: 'Backend & Data',
    items: [
      { glyph: '⬢', name: 'Node.js' },
      { glyph: 'ex', name: 'Express' },
      { glyph: '⚡', name: 'Supabase' },
      { glyph: '⛁', name: 'PostgreSQL' },
      { glyph: '⬡', name: 'MongoDB' },
      { glyph: '⇄', name: 'REST & Webhooks' },
    ],
  },
  {
    label: 'AI & LLMs',
    items: [
      { glyph: '✦', name: 'OpenAI API' },
      { glyph: '⟡', name: 'Anthropic API' },
      { glyph: '◦', name: 'Ollama' },
      { glyph: '⌕', name: 'RAG' },
      { glyph: '◈', name: 'AI Agents' },
      { glyph: '✎', name: 'Prompt Eng.' },
    ],
  },
  {
    label: 'Infra & Tools',
    items: [
      { glyph: 'λ', name: 'AWS Lambda' },
      { glyph: '⊞', name: 'AWS SQS' },
      { glyph: '▲', name: 'Vercel' },
      { glyph: '◆', name: 'Nayax / NMI' },
      { glyph: '⎇', name: 'Git & GitHub' },
      { glyph: '⇆', name: 'Postman' },
    ],
  },
]

const TechTile = ({ glyph, name, index }) => (
  <motion.div
    variants={fadeIn('up', 'spring', index * 0.04, 0.5)}
    whileHover={{ y: -4 }}
    className='flex flex-col items-center gap-3 p-5 rounded-2xl bg-tertiary border border-white/5 transition-colors duration-200 hover:border-[#915eff]/70'
  >
    <span className='w-10 h-10 rounded-xl bg-primary border border-white/5 flex items-center justify-center text-[#00cea8] text-[19px] font-medium'>
      {glyph}
    </span>
    <span className='text-secondary text-[13px] text-center'>{name}</span>
  </motion.div>
)

const Tech = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>What I work with</p>
        <h2 className={styles.sectionHeadText}>Technologies.</h2>
      </motion.div>

      <div className='mt-12 flex flex-col gap-9'>
        {groups.map((group) => (
          <div key={group.label}>
            <div className='flex items-center gap-4 mb-4'>
              <span className='text-secondary text-[12px] tracking-[0.18em] uppercase whitespace-nowrap'>
                {group.label}
              </span>
              <span className='flex-1 h-px bg-white/10' />
            </div>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
              {group.items.map((item, i) => (
                <TechTile key={item.name} index={i} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SectionWrapper(Tech, "")
