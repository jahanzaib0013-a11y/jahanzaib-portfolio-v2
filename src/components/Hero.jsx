import React from 'react'
import { motion } from 'framer-motion'
import { styles } from '../style'
import { github, jahanzaib } from '../assets'
import { ParticleField } from './canvas'

const Hero = () => {
  return (
    <section className='relative w-full h-screen mx-auto overflow-hidden'>
      {/* interactive particle network background */}
      <div className='absolute inset-0 z-0'>
        <ParticleField />
      </div>

      {/* ambient glows */}
      <div className='absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#915eff] opacity-20 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full bg-[#00cea8] opacity-10 blur-[120px] pointer-events-none' />

      <div className={`${styles.paddingX} absolute inset-0 top-[110px] max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center lg:items-center justify-center lg:justify-between gap-10`}>
        {/* left: text */}
        <div className='z-10 max-w-2xl'>
          {/* availability badge */}
          <span className='inline-flex items-center gap-2.5 text-secondary text-[12px] tracking-[0.06em] font-medium border border-white/10 bg-tertiary/70 backdrop-blur px-3.5 py-2 rounded-full mb-6'>
            <span className='w-[7px] h-[7px] rounded-full bg-[#00cea8] animate-pulse shadow-[0_0_10px_#00cea8]' />
            Open to full-stack AI roles
          </span>

          <h1 className={`${styles.heroHeadText} text-white`}>
            Hi, I'm <span className='bg-gradient-to-r from-[#915eff] to-[#00cea8] bg-clip-text text-transparent'>Jahanzaib</span>
          </h1>

          <p className='mt-3 text-[#dfd9ff] font-medium lg:text-[26px] sm:text-[22px] text-[18px]'>
            <span className='text-white'>Full-Stack AI Developer</span>
            <span className='text-secondary'> · Next.js · Node.js · Supabase · LLMs</span>
          </p>

          <p className='mt-5 text-secondary text-[17px] leading-[28px] max-w-xl'>
            I build AI-powered web apps end to end — schema, APIs, LLM integrations, deploy.
            Currently Back End Developer at Qubitars Technologies, shipping products with real users.
          </p>

          <div className='mt-8 flex flex-wrap gap-4'>
            <a href='#work'
              className='px-7 h-12 flex items-center gap-2 rounded-full bg-[#915eff] text-white font-semibold transition-transform hover:scale-105 shadow-[0_10px_30px_-8px_rgba(145,94,255,0.7)]'>
              View My Work →
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

        {/* right: profile photo with spinning gradient ring + hover Download CV */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='relative z-10 shrink-0 flex flex-col items-center group'
        >
          <div className='relative p-[3px] rounded-full'>
            <div className='absolute inset-0 rounded-full blur-2xl opacity-40 scale-110 bg-gradient-to-tr from-[#915eff] to-[#00cea8]' />
            <div
              className='absolute inset-0 rounded-full animate-[spin_8s_linear_infinite]'
              style={{ background: 'conic-gradient(from 180deg, #915eff, #00cea8, #915eff)' }}
            />
            <img
              src={jahanzaib}
              alt='Jahanzaib'
              className='relative w-[240px] sm:w-[300px] lg:w-[350px] aspect-square rounded-full border-4 border-primary object-cover'
            />
          </div>

          {/* Download CV — reveals on hover */}
          <a
            href={`${import.meta.env.BASE_URL}Jahanzaib-Iftikhar-CV.pdf`}
            download
            className='mt-4 inline-flex items-center gap-2 px-5 h-11 rounded-full bg-[#915eff] text-white text-[14px] font-semibold shadow-[0_10px_30px_-8px_rgba(145,94,255,0.7)] opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto hover:scale-105'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' /><path d='M7 10l5 5 5-5' /><path d='M12 15V3' />
            </svg>
            Download CV
          </a>
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
