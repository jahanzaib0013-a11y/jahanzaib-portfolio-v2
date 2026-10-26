import React from 'react'
import { Tilt } from 'react-tilt'
import {motion, AnimatePresence} from 'framer-motion'
import {styles} from '../style'
import { github } from '../assets'
import { SectionWrapper } from '../hoc'
import { projects } from '../constants'
import { fadeIn,textVariant } from '../utils/motion'

const ProjectModal=({project,onClose,onPrev,onNext})=>{
  React.useEffect(()=>{
    const onKey = (e)=>{
      if(e.key==='Escape') onClose();
      if(e.key==='ArrowLeft') onPrev();
      if(e.key==='ArrowRight') onNext();
    };
    window.addEventListener('keydown',onKey);
    document.body.style.overflow='hidden';
    return ()=>{ window.removeEventListener('keydown',onKey); document.body.style.overflow=''; };
  },[onClose,onPrev,onNext]);
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [sent, setSent] = React.useState(false);
  React.useEffect(()=>{ setRating(0); setHover(0); setComment(''); setSent(false); }, [project && project.name]);
  if(!project) return null;
  const {name,description,tags,image,video,source_code_link,live_demo_link,highlights} = project;
  const sendFeedback = () => {
    const subject = `Portfolio feedback: ${name}${rating ? ` — ${rating}★` : ''}`;
    const body = `Project: ${name}\nRating: ${rating ? `${rating}/5 stars` : '(not rated)'}\n\nFeedback:\n${comment || '(no comment)'}`;
    window.open(`mailto:jahanzaib0013@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    setSent(true);
  };
  return(
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm'
      onClick={onClose}
    >
      <motion.div
        initial={{opacity:0, scale:0.92, y:30}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}}
        transition={{type:'spring', damping:24, stiffness:300}}
        className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-tertiary border border-white/10 shadow-[0_40px_120px_-20px_rgba(145,94,255,0.35)]'
        onClick={(e)=>e.stopPropagation()}
      >
        <button onClick={onClose} title='Close'
          className='absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[16px] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#915eff]'>
          ✕
        </button>
        <button onClick={(e)=>{e.stopPropagation();onPrev();}} title='Previous project'
          className='absolute left-3 top-[27vh] z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[20px] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#915eff]'>
          ‹
        </button>
        <button onClick={(e)=>{e.stopPropagation();onNext();}} title='Next project'
          className='absolute right-3 top-[27vh] z-20 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[20px] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#915eff]'>
          ›
        </button>

        <div className='w-full bg-black'>
          {video ? (
            <video key={video} poster={image} controls autoPlay muted loop playsInline className='w-full max-h-[55vh] object-contain'>
              <source src={video} type='video/webm' />
            </video>
          ) : (
            <img src={image} alt={name} className='w-full max-h-[55vh] object-contain' />
          )}
        </div>

        <div className='p-6 sm:p-8'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <h3 className='text-white font-bold text-[26px]'>{name}</h3>
            <div className='flex gap-3'>
              {live_demo_link && (
                <button onClick={()=>window.open(live_demo_link,'_blank')}
                  className='flex items-center gap-2 px-4 h-10 rounded-full bg-[#915eff] text-white text-[14px] font-semibold cursor-pointer transition-transform hover:scale-105'>
                  <span className='w-2 h-2 rounded-full bg-green-300 animate-pulse'/>
                  Visit Live Site
                </button>
              )}
              {source_code_link && (
                <button onClick={()=>window.open(source_code_link,'_blank')}
                  className='flex items-center gap-2 px-4 h-10 rounded-full bg-white/10 border border-white/15 text-white text-[14px] font-semibold cursor-pointer transition-colors hover:bg-white/20'>
                  <img src={github} alt='' className='w-4 h-4 object-contain'/>
                  Source Code
                </button>
              )}
            </div>
          </div>

          <p className='mt-4 text-secondary text-[15px] leading-[26px]'>{description}</p>

          {highlights && highlights.length > 0 && (
            <div className='mt-5'>
              <p className='text-white font-semibold text-[15px] mb-3'>Highlights</p>
              <ul className='space-y-2'>
                {highlights.map((h,i)=>(
                  <li key={i} className='flex items-start gap-2.5 text-secondary text-[14px] leading-[23px]'>
                    <span className='mt-[7px] w-1.5 h-1.5 rounded-full bg-[#915eff] shrink-0'/>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className='mt-5 pt-5 border-t border-white/5 flex flex-wrap gap-2'>
            {tags.map((tag)=>(
              <span key={tag.name} className={`text-[13px] font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 ${tag.color}`}>
                #{tag.name}
              </span>
            ))}
          </div>

          {/* star feedback */}
          <div className='mt-6 pt-6 border-t border-white/5'>
            <p className='text-white font-semibold text-[15px]'>Rate this project</p>
            <p className='text-secondary text-[13px] mt-1'>Tap the stars and leave a note — your feedback comes straight to me.</p>
            <div className='mt-3 flex items-center gap-1.5'>
              {[1,2,3,4,5].map((n)=>(
                <button key={n}
                  onClick={()=>{setRating(n); setSent(false);}}
                  onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                  aria-label={`${n} star${n>1?'s':''}`}
                  className='text-[28px] leading-none transition-transform hover:scale-125 cursor-pointer'
                  style={{ color: (hover||rating) >= n ? '#ffc93c' : '#3a3a52' }}>★</button>
              ))}
              {rating>0 && <span className='ml-2 text-secondary text-[13px]'>{rating}/5</span>}
            </div>
            <textarea value={comment} onChange={(e)=>{setComment(e.target.value); setSent(false);}} rows={2}
              placeholder='Optional — what did you think?'
              className='mt-3 w-full bg-primary border border-white/10 rounded-lg p-3 text-white text-[14px] placeholder:text-secondary outline-none focus:border-[#915eff] resize-none' />
            <button onClick={sendFeedback} disabled={!rating && !comment.trim()}
              className='mt-3 px-5 h-10 rounded-full bg-[#915eff] text-white text-[14px] font-semibold transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'>
              {sent ? 'Thanks for the feedback! ✓' : 'Send Feedback'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ProjectCard=({index,name,description,tags,image,video,source_code_link,live_demo_link,onOpen})=>{
  const videoRef = React.useRef(null);
  const handleEnter = () => { if (videoRef.current) videoRef.current.play(); };
  const handleLeave = () => { if (videoRef.current) videoRef.current.pause(); };
  return(
    <motion.div variants={fadeIn("up","spring",index*0.15,0.6)} initial="hidden" animate="show">
        <Tilt
        options={{
          max:8,
          scale:1.02,
          speed:450
        }}
        className="w-full h-full group/card"
        >
        <div className='relative rounded-2xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent transition-all duration-300 group-hover/card:from-[#915eff]/70 group-hover/card:via-[#915eff]/20 group-hover/card:shadow-[0_20px_60px_-15px_rgba(145,94,255,0.45)]'>
        <div className='bg-tertiary rounded-2xl overflow-hidden cursor-pointer' onClick={onOpen}>

          <div className='relative w-full h-[215px] group' onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          {video ? (
            <>
            <video key={video} ref={videoRef} poster={image} muted loop playsInline preload="metadata"
            className='w-full h-full object-cover object-top'>
              <source src={video} type='video/webm' />
            </video>
            <img src={image} alt={name}
            className='absolute inset-0 w-full h-full object-cover object-top pointer-events-none transition-opacity duration-500 opacity-100 group-hover:opacity-0'/>
            </>
          ) : (
            <img src={image} alt={name}
            className='w-full h-full object-cover object-top transition-[object-position] duration-[8000ms] ease-linear group-hover:object-bottom'/>
          )}

          {/* top action buttons */}
          <div className='absolute top-3 right-3 flex gap-2 z-10'>
            {live_demo_link && (
              <button onClick={(e)=>{e.stopPropagation();window.open(live_demo_link,"_blank")}} title="Open live site"
              className='flex items-center gap-1.5 px-3 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[12px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#915eff] hover:border-[#915eff]'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse'/>
                Live
              </button>
            )}
            {source_code_link && (
              <button onClick={(e)=>{e.stopPropagation();window.open(source_code_link,"_blank")}} title="View source code"
              className='flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 cursor-pointer transition-all duration-200 hover:bg-[#915eff] hover:border-[#915eff]'>
                <img src={github} alt="github" className='w-4 h-4 object-contain' />
              </button>
            )}
          </div>

          {/* video affordances */}
          {video && (
            <>
              {/* centered play button — always visible at rest, fades while playing */}
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300'>
                <div className='relative flex items-center justify-center w-14 h-14 rounded-full bg-black/55 backdrop-blur-md border border-white/25 shadow-[0_6px_20px_rgba(0,0,0,0.4)]'>
                  <span className='absolute inline-flex w-full h-full rounded-full bg-white/20 animate-ping' />
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='#fff' className='relative ml-1'><path d='M8 5v14l11-7z' /></svg>
                </div>
              </div>
              {/* at-rest hint */}
              <div className='absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center gap-2 pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300'>
                <svg width='11' height='11' viewBox='0 0 24 24' fill='#fff'><path d='M8 5v14l11-7z' /></svg>
                <span className='text-white text-[11px] font-medium tracking-[0.12em] uppercase'>Hover to play demo</span>
              </div>
              {/* playing state */}
              <div className='absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse' />
                <span className='text-white text-[11px] font-medium tracking-[0.12em] uppercase'>Playing demo</span>
              </div>
            </>
          )}
          </div>

          <div className='p-5'>
            <div className='flex items-center justify-between'>
              <p className='text-white font-bold text-[21px] leading-snug'>{name}</p>
              <span className='text-[12px] text-secondary opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 whitespace-nowrap'>View details →</span>
            </div>
            <p className='mt-2.5 text-secondary text-[13.5px] leading-[22px]'>{description}</p>

            <div className='mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2'>
            {
              tags.map((tag)=>(
                <span key={tag.name}
                className={`text-[12px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${tag.color}`}>
                  #{tag.name}
                </span>
              ))
            }
            </div>
          </div>

        </div>
        </div>
        </Tilt>
    </motion.div>
  )
}
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'ai', label: 'AI / LLM' },
  { key: 'fullstack', label: 'Full-Stack' },
  { key: 'payments', label: 'Payments' },
];

const Works = () => {
  const [selected, setSelected] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const visible = filter === 'all' ? projects : projects.filter(p => p.category === filter);
  const step = (dir) => {
    if (!selected) return;
    const i = visible.indexOf(selected);
    setSelected(visible[(i + dir + visible.length) % visible.length]);
  };
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
          Real-world products I've shipped end to end. <span className='text-white font-medium'>Hover any card to watch a recorded demo</span>, or click it to open the full walkthrough with the live-site and source links.
    </motion.p>
    </div>
    <div className='mt-12 flex flex-wrap gap-3'>
      {FILTERS.map(f=>(
        <button key={f.key} onClick={()=>setFilter(f.key)}
        className={`px-5 h-10 rounded-full text-[14px] font-semibold cursor-pointer transition-all duration-200 border ${
          filter===f.key
            ? 'bg-[#915eff] border-[#915eff] text-white shadow-[0_8px_24px_-8px_rgba(145,94,255,0.7)]'
            : 'bg-white/5 border-white/10 text-secondary hover:border-[#915eff]/50 hover:text-white'
        }`}>
          {f.label}
        </button>
      ))}
    </div>
    <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7'>
    {
      visible.map((project,index)=>(
        <ProjectCard key={project.name}
        {...project}
        index={index}
        onOpen={()=>setSelected(project)}
        />
      ))

    }
    </div>
    <AnimatePresence>
      {selected && <ProjectModal project={selected} onClose={()=>setSelected(null)} onPrev={()=>step(-1)} onNext={()=>step(1)} />}
    </AnimatePresence>
    </>
  )
}

export default SectionWrapper(Works,"work")