import React from 'react'
import { motion } from 'framer-motion'
import { styles } from '../style'
import { SectionWrapper } from '../hoc'
import { fadeIn, textVariant } from '../utils/motion'
import { technologies } from '../constants'

const Tech = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>What I work with</p>
        <h2 className={styles.sectionHeadText}>Technologies.</h2>
      </motion.div>

      <div className='mt-14 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5'>
        {technologies.map((technology, index) => (
          <motion.div
            key={technology.name}
            variants={fadeIn('up', 'spring', index * 0.06, 0.55)}
            whileHover={{ y: -6, scale: 1.05 }}
            className='group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-tertiary border border-white/5 transition-colors duration-300 hover:border-[#915eff]/60'
          >
            <div className='absolute inset-0 rounded-2xl bg-[#915eff] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300' />
            <img
              src={technology.icon}
              alt={technology.name}
              className='w-12 h-12 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110'
            />
            <span className='text-secondary text-[12px] font-medium text-center relative z-10 group-hover:text-white transition-colors duration-300'>
              {technology.name}
            </span>
          </motion.div>
        ))}
      </div>
    </>
  )
}

export default SectionWrapper(Tech, "")
