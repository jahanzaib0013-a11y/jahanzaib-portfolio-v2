import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { styles } from '../style'
import { SectionWrapper } from '../hoc'
import { fadeIn, textVariant } from '../utils/motion'
import { qubitarsAppreciation } from '../assets'

const Lightbox = ({ src, onClose }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm cursor-zoom-out'
    >
      <motion.img
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        src={src} alt='Qubitars Work Appreciation — Jahanzaib Iftikhar'
        className='max-w-[92vw] max-h-[88vh] rounded-2xl border border-white/15'
      />
    </motion.div>
  );
};

const IconAward = () => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='8' r='5' /><path d='M8.5 12.5L7 22l5-3 5 3-1.5-9.5' />
  </svg>
)
const IconPen = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 19l7-7 3 3-7 7-3-3z' /><path d='M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z' /><path d='M2 2l7.586 7.586' /><circle cx='11' cy='11' r='2' />
  </svg>
)

const WorkCard = ({ onZoom }) => (
  <motion.div variants={fadeIn('up', 'spring', 0.1, 0.7)} className='relative'>
    <span className='absolute -left-[34px] top-7 w-4 h-4 rounded-full bg-primary border-[3px] border-[#915eff] shadow-[0_0_14px_rgba(145,94,255,0.7)]' />
    <div className='bg-tertiary border border-white/5 rounded-2xl p-6 sm:p-7 transition-colors hover:border-[#915eff]/60'>
      <div className='flex justify-between items-start gap-4 flex-wrap'>
        <div>
          <p className='text-[#915eff] text-[10px] tracking-[0.2em] font-medium mb-1.5'>WORK</p>
          <h3 className='text-white font-bold text-[20px]'>Back End Developer</h3>
          <p className='text-[#00cea8] text-[14.5px] font-medium mt-1'>
            Qubitars Technologies <span className='text-secondary font-normal text-[13px]'>· Full-time · On-site · Gujranwala, PK</span>
          </p>
        </div>
        <span className='flex items-center gap-2 text-[#00cea8] text-[12px] font-medium px-3 py-1.5 rounded-full bg-[#00cea8]/10 border border-[#00cea8]/25 whitespace-nowrap'>
          <span className='w-1.5 h-1.5 rounded-full bg-[#00cea8] shadow-[0_0_8px_#00cea8]' /> May 2025 – Present
        </span>
      </div>

      <ul className='mt-4 pl-5 flex flex-col gap-2.5 list-disc marker:text-[#915eff]'>
        <li className='text-secondary text-[14.5px] leading-[23px]'>Build and ship full-stack web applications end to end — designing data models and REST/webhook APIs on Node.js/Express, and building React/Next.js (TypeScript) front-ends through to production deployment.</li>
        <li className='text-secondary text-[14.5px] leading-[23px]'>Integrate LLM capabilities (OpenAI/Anthropic) into live products — retrieval-augmented generation, AI agents, and prompt-engineered workflows serving real end users.</li>
        <li className='text-secondary text-[14.5px] leading-[23px]'>Build and maintain production data pipelines and third-party API integrations (payment terminals, CMS sync, webhooks) with an emphasis on reliability and correctness.</li>
      </ul>

      <div className='mt-4 flex flex-wrap gap-2'>
        {['#nodejs', '#nextjs', '#supabase', '#aws', '#llm'].map((t) => (
          <span key={t} className='text-[#915eff] text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#915eff]/15'>{t}</span>
        ))}
      </div>

      <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5'>
        {/* recognition */}
        <div className='flex items-center gap-5 p-5 rounded-xl bg-primary border border-white/5'>
          <img
            src={qubitarsAppreciation}
            alt='Qubitars Work Appreciation post recognizing Jahanzaib Iftikhar, Backend Developer'
            loading='lazy'
            onClick={() => onZoom(qubitarsAppreciation)}
            className='w-[120px] h-[120px] shrink-0 rounded-xl object-cover border border-white/10 cursor-zoom-in transition-transform hover:scale-[1.04]'
          />
          <div>
            <p className='text-[#00cea8] text-[11px] tracking-[0.2em] mb-2'>★ RECOGNITION</p>
            <p className='text-secondary text-[14px] leading-[21px]'>Recognized by Qubitars with a Work Appreciation award for dedication and impact as a Backend Developer.</p>
          </div>
        </div>
        {/* writing */}
        <a href='https://qubitars.com/blogs/what-happens-when-software-goes-down' target='_blank' rel='noreferrer'
          className='flex items-start gap-4 p-4 rounded-xl bg-primary border border-white/5 transition-colors hover:border-[#915eff]/60'>
          <div className='w-11 h-11 shrink-0 rounded-xl bg-[#915eff]/15 flex items-center justify-center text-[#915eff]'>
            <IconPen />
          </div>
          <div>
            <p className='text-[#915eff] text-[10px] tracking-[0.2em] mb-1.5'>✎ WRITING</p>
            <p className='text-white text-[13px] font-semibold leading-[18px] mb-1'>"What Happens to Your Business When Your Software Goes Down"</p>
            <p className='text-secondary text-[12px] leading-[17px]'>Published on the Qubitars blog. <span className='text-[#00cea8] font-semibold whitespace-nowrap'>Read article →</span></p>
          </div>
        </a>
      </div>
    </div>
  </motion.div>
)

const EduCard = () => (
  <motion.div variants={fadeIn('up', 'spring', 0.25, 0.7)} className='relative'>
    <span className='absolute -left-[34px] top-7 w-4 h-4 rounded-full bg-primary border-[3px] border-[#00cea8] shadow-[0_0_14px_rgba(0,206,168,0.6)]' />
    <div className='bg-tertiary border border-white/5 rounded-2xl p-6 sm:p-7'>
      <div className='flex justify-between items-start gap-4 flex-wrap'>
        <div>
          <p className='text-[#00cea8] text-[10px] tracking-[0.2em] font-medium mb-1.5'>EDUCATION</p>
          <h3 className='text-white font-bold text-[20px]'>Associate's Degree, Computer Science</h3>
          <p className='text-[#00cea8] text-[14.5px] font-medium mt-1'>University of Central Punjab (UCP)</p>
        </div>
        <span className='text-secondary text-[12px] font-medium px-3 py-1.5 rounded-full bg-primary border border-white/10 whitespace-nowrap'>
          May 2021 – Jun 2023
        </span>
      </div>
    </div>
  </motion.div>
)

const Experience = () => {
  const [zoom, setZoom] = React.useState(null);
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>My journey</p>
        <h2 className={styles.sectionHeadText}>Experience & Education.</h2>
      </motion.div>

      <div className='mt-12 relative pl-8'>
        <span className='absolute left-[7px] top-2 bottom-2 w-0.5 rounded bg-gradient-to-b from-[#915eff] via-[#00cea8] to-transparent' />
        <div className='flex flex-col gap-7'>
          <WorkCard onZoom={setZoom} />
          <EduCard />
        </div>
      </div>

      <AnimatePresence>
        {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
      </AnimatePresence>
    </>
  )
}

export default SectionWrapper(Experience, "experience")
