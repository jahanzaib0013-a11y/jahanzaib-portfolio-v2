import React from 'react'
import { Tilt } from 'react-tilt'
import {motion} from 'framer-motion'
import {styles} from '../style'
import { services } from '../constants'
import {fadeIn,textVariant} from '../utils/motion'
import { SectionWrapper } from '../hoc'
const ServiceCard=({index,title,icon})=>{
  return(
    <Tilt className="xs:w-[250px] w-full">
      <motion.div
      variants={fadeIn("right","spring",0.5*index,0.75)}
      className='w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card'
      >
        <div
        options={{
          max:45,
          scale:1,
          speed:450,
        }}
        className='bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col'
        >
          <img src={icon} alt={title} className='w-16 h-16 object-contain' />
          <h3 className='text-white text-[20px] font-bold text-center'>{title}</h3>
        </div>

      </motion.div>
    </Tilt>
  )
}
const About = () => {
  return (
   <>
   <motion.div variants={textVariant()}>
    <p className={styles.sectionSubText}>Introduction</p>
    <h2 className={styles.sectionHeadText}>Overview.</h2>
   </motion.div>
   <motion.p
   variants={fadeIn("","",0.1,1)}
   className='mt-4 text-secondary text-17px max-w-3xl leading-[30px]'
   >
    I'm a Full Stack AI Developer building AI-powered web applications end to end — from schema and APIs to production deployment. My work spans React/Next.js front-ends, Node.js/Express services, and LLM integrations (RAG, AI agents, prompt engineering) wired into real, live products serving thousands of users. I've built production data pipelines on AWS (SQS, Lambda), integrated payment terminals like Nayax and NMI, and shipped AI SaaS platforms handling 1,200+ generations per month. Strong bias toward clean data models, reliable APIs, and software that holds up under real users.
   </motion.p>
   <div className='mt-20 flex flex-wrap gap-10'>
    {services.map((service,index)=>(
      <ServiceCard key={service.title} index={index} {...service}/>
    ))}
   </div>
   </>
  )
}

export default SectionWrapper(About,"about")