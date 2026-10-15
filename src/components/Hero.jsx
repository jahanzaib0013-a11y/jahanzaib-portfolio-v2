import React from 'react'
import {motion} from 'framer-motion'
import {styles} from '../style'
import { ComputersCanvas } from './canvas'
import {jahanzaib} from '../assets'

const Hero = () => {
  return (
    <section className='relative w-full h-screen mx-auto '>

            <img src={jahanzaib} className='absolute w-[240px] mt-[120px] hidden xl:block custom-range:hidden'  alt="" />
      <div className={`${styles.paddingX} absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-row items-start gap-5`}>
        <div className='flex flex-col justify-center items-center mt-5'>
          <div className='w-5 h-5 rounded-full bg-[#915eff]'/>
          <div className='w-1 sm:h-80 h-40 violet-gradient'/>

        </div>
          
          <div>
           
            <h1 className={`${styles.heroHeadText} text-white `}>Hi, I'm <span className='text-[#915eff]'>Jahanzaib</span></h1>


            <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            Full-Stack Developer<br className='sm:block hidden'/> building modern web apps with<br className='sm:block hidden'/> Next.js, TypeScript &amp; the MERN stack.

            </p>
          </div>
          <img src={jahanzaib} className='absolute right-0 w-[240px] hidden lg:block xl:hidden 2xl:hidden  custom-range2:block' alt="" />
      </div>
      <ComputersCanvas/>
      <div className='absolute xs:bottom-10 bottom-0 w-full flex justify-center items-center'>
        <a href="#about">
          <div className='w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2'>
            <motion.dev 
            animate={
              {y:[0,24,0]}
              }
              transition={
                {duration:1.5,
                repeat:Infinity,
                repeatType:"loop"
              }
              }
              className="w-3 h-3 rounded-full bg-secondary mb-1"
              />
          </div>
        </a>
      </div>
    </section>
  )
}

export default Hero