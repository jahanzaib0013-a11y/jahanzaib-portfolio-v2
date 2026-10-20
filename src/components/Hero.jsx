import React from 'react'
import { motion } from 'framer-motion'
import { styles } from '../style'
import { github, jahanzaib } from '../assets'
import { ParticleField } from './canvas'

const roles = [
  'Full Stack AI Developer',
  'Next.js & React Engineer',
  'Node.js API Developer',
  'LLM & RAG Integrations',
];

const Hero = () => {
  const [roleIdx, setRoleIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className='relative w-full h-screen mx-auto overflow-hidden'>
      {/* interactive particle network background */}
      <div className='absolute inset-0 z-0'>
        <ParticleField />
      </div>

      {/* ambient glows */}
      <div className='absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#915eff] opacity-20 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full bg-[#00cea8] opacity-10 blur-[120px] pointer-events-none' />

      <div className={`${styles.paddingX} absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center lg:items-start justify-center lg:justify-between gap-10`}>
        {/* left: text */}
        <div className='flex flex-row items-start gap-5 z-10'>
          <div className='flex flex-col justify-center items-center mt-5'>
            <div className='w-5 h-5 rounded-full bg-[#915eff]' />
            <div className='w-1 sm:h-80 h-40 violet-gradient' />
          </div>

          <div>
            <h1 className={`${styles.heroHeadText} text-white`}>
              Hi, I'm <span className='text-[#915eff]'>Jahanzaib</span>
            </h1>

            <div className='mt-2 h-[44px] lg:h-[52px] overflow-hidden'>
              <motion.div
                key={roleIdx}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className='text-[#dfd9ff] font-semibold lg:text-[34px] sm:text-[28px] text-[22px]'
              >
                {roles[roleIdx]}
              </motion.div>
            </div>

            <p className={`${styles.heroSubText} mt-3 text-white-100 max-w-xl`}>
              Building AI-powered web apps end to end —<br className='sm:block hidden' />
              from schema and APIs to production deployment.
            </p>

            <div className='mt-8 flex flex-wrap gap-4'>
              <a href='#work'
                className='px-7 h-12 flex items-center rounded-full bg-[#915eff] text-white font-semibold transition-transform hover:scale-105 shadow-[0_10px_30px_-8px_rgba(145,94,255,0.7)]'>
                View My Work
              </a>
              <a href='#contact'
                className='px-7 h-12 flex items-center rounded-full bg-white/10 border border-white/20 text-white font-semibold transition-colors hover:bg-white/20'>
                Get in Touch
              </a>
              <a href='https://github.com/jahanzaib0013-a11y' target='_blank' rel='noreferrer'
                className='w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/20 transition-colors hover:bg-white/20'
                title='GitHub'>
                <img src={github} alt='GitHub' className='w-5 h-5 object-contain' />
              </a>
            </div>
          </div>
        </div>

        {/* right: profile photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='relative z-10 shrink-0'
        >
          <div className='absolute inset-0 rounded-full bg-gradient-to-tr from-[#915eff] to-[#00cea8] blur-2xl opacity-40 scale-110' />
          <img
            src={jahanzaib}
            alt='Jahanzaib'
            className='relative w-[240px] sm:w-[300px] lg:w-[360px] rounded-full border-4 border-white/10 object-cover'
          />
        </motion.div>
      </div>

      {/* scroll indicator */}
      <div className='absolute xs:bottom-10 bottom-24 w-full flex justify-center items-center z-10'>
        <a href='#about'>
          <div className='w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2'>
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
              className='w-3 h-3 rounded-full bg-secondary mb-1'
            />
          </div>
        </a>
      </div>
    </section>
  )
}

export default Hero
