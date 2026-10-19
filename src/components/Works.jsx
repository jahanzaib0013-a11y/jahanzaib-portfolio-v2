import React from 'react'
import { Tilt } from 'react-tilt'
import {motion} from 'framer-motion'
import {styles} from '../style'
import { github } from '../assets'
import { SectionWrapper } from '../hoc'
import { projects } from '../constants'
import { fadeIn,textVariant } from '../utils/motion'
const ProjectCard=({index,name,description,tags,image,video,source_code_link,live_demo_link})=>{
  const videoRef = React.useRef(null);
  const handleEnter = () => { if (videoRef.current) videoRef.current.play(); };
  const handleLeave = () => { if (videoRef.current) videoRef.current.pause(); };
  return(
    <motion.div variants={fadeIn("up","spring",index*0.5,0.75)}>
        <Tilt
        options={{
          max:45,
          scale:1,
          speed:450

        }}
        className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full"
        >
          <div className='relative w-full h-[230px] group overflow-hidden rounded-2xl' onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          {video ? (
            <>
            <video ref={videoRef} poster={image} muted loop playsInline preload="metadata"
            className='w-full h-full object-cover object-top rounded-2xl'>
              <source src={video} type='video/webm' />
            </video>
            <img src={image} alt={name}
            className='absolute inset-0 w-full h-full object-cover object-top rounded-2xl pointer-events-none transition-opacity duration-500 opacity-100 group-hover:opacity-0'/>
            </>
          ) : (
            <img src={image} alt={name}
            className='w-full h-full object-cover object-top rounded-2xl transition-[object-position] duration-[8000ms] ease-linear group-hover:object-bottom'/>
          )}
          <div className='absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
            <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse'/>
            <span className='text-white text-[12px] tracking-wide'>Video demo — hover to play</span>
          </div>
          <div className='absolute inset-0 flex justify-end gap-2 m-3 card-img_hover'>
            {live_demo_link && (
              <div onClick={()=>window.open(live_demo_link,"_blank")} title="Live demo" className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer'>
                <span className='text-white text-[18px]'>🔗</span>
              </div>
            )}
            {source_code_link && (
              <div onClick={()=>window.open(source_code_link,"_blank")} className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer'>
                <img src={github} alt="github" className='w-1/2 h-1/2 object-contain' />
              </div>
            )}
          </div>

          </div>

          <div className='mt-5'>
          <p className='text-white font-bold text-[24px]'>{name}</p>
          <h3 className='mt-2 text-secondary font-[14px]'>{description}</h3>
          </div>

          <div className='mt-4 flex flex-wrap gap-2'>
          {
            tags.map((tag)=>(
              <p key={tag.name} className={`text-[14px] ${tag.color}`}>
                #{tag.name}
              </p>
            ))
          }
          </div>
        </Tilt>
    </motion.div>
  )
}
const Works = () => {
  return (
    <>
    <motion.div>
      <p className={styles.sectionSubText}>
        My work
      </p>
      <h2 className={styles.sectionHeadText}>
        Projects.
      </h2>
    </motion.div>
    <div className='w-full flex'>
    <motion.p
    variants={fadeIn("","",0.1,1)}
    className='mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]'>
          Following projects showcases my skills and experience through
          real-world examples of my work. Each project is briefly described with
          links to code repositories and live demos in it. It reflects my
          ability to solve complex problems, work with different technologies,
          and manage projects effectively.
    </motion.p>
    </div>
    <div className='mt-20 flex flex-wrap gap-7'>
    {
      projects.map((project,index)=>(
        <ProjectCard key={`project-${index}`}
        {...project}
        index={index}
        />
      ))

    }
    </div>
    </>
  )
}

export default SectionWrapper(Works,"")