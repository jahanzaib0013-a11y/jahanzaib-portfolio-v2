import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { SectionWrapper } from '../hoc'
import { fadeIn } from '../utils/motion'
import { useTilt } from '../utils/tilt'
import { noHoverDevice, prefersReducedMotion, prefersSaveData } from '../utils/scroll'
import useVisible from '../utils/useVisible'
import { projects } from '../constants'
import SectionHead from './SectionHead'

const Icon = ({ path, size = 16, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.6'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    {...rest}
  >
    {path}
  </svg>
)

const icons = {
  close: <Icon path={<path d='M18 6L6 18M6 6l12 12' />} />,
  prev: <Icon path={<path d='M15 18l-6-6 6-6' />} size={18} />,
  next: <Icon path={<path d='M9 18l6-6-6-6' />} size={18} />,
  external: <Icon path={<><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' /><path d='M15 3h6v6' /><path d='M10 14L21 3' /></>} size={14} />,
  code: (
    <Icon
      size={15}
      path={
        <>
          <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' />
        </>
      }
    />
  ),
};

const Star = ({ filled }) => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill={filled ? '#1f3a93' : 'none'} stroke={filled ? '#1f3a93' : '#a9a4b8'} strokeWidth='1.4' strokeLinejoin='round' aria-hidden='true'>
    <path d='M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z' />
  </svg>
);

const ProjectModal = ({ project, onClose, onPrev, onNext }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  useEffect(() => { setRating(0); setHover(0); setComment(''); setSent(false); }, [project?.name]);

  if (!project) return null;
  const { name, description, tags, image, video, source_code_link, live_demo_link, highlights } = project;

  const sendFeedback = () => {
    const subject = `Portfolio feedback: ${name}${rating ? ` — ${rating}/5` : ''}`;
    const body = `Project: ${name}\nRating: ${rating ? `${rating}/5 stars` : '(not rated)'}\n\nFeedback:\n${comment || '(no comment)'}`;
    window.open(`mailto:jahanzaib0013@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-8 bg-ink/70'
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        role='dialog'
        aria-modal='true'
        aria-label={`${name} case study`}
        onClick={(e) => e.stopPropagation()}
        /* The gallery is night; the case study is a printed sheet pulled out
           of it. data-tone='light' escapes the section's dark token flips. */
        data-tone='light'
        className='relative w-full max-w-4xl max-h-dvh overflow-y-auto bg-paper border border-rule shadow-lift'
      >
        <div className='sticky top-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-8 h-14 bg-paper border-b border-rule'>
          <p className='font-mono text-eyebrow uppercase text-mute truncate'>{name}</p>
          <div className='flex items-center gap-1 text-graphite'>
            <button type='button' onClick={onPrev} aria-label='Previous project' className='w-9 h-9 flex items-center justify-center hover:text-ink transition-colors duration-200 cursor-pointer'>{icons.prev}</button>
            <button type='button' onClick={onNext} aria-label='Next project' className='w-9 h-9 flex items-center justify-center hover:text-ink transition-colors duration-200 cursor-pointer'>{icons.next}</button>
            <button type='button' onClick={onClose} aria-label='Close' className='w-9 h-9 flex items-center justify-center hover:text-ink transition-colors duration-200 cursor-pointer'>{icons.close}</button>
          </div>
        </div>

        <div className='bg-ink'>
          {video ? (
            <video key={video} poster={image} controls autoPlay muted loop playsInline className='w-full max-h-[52vh] object-contain'>
              <source src={video} type='video/webm' />
            </video>
          ) : (
            <img src={image} alt={`${name} preview`} className='w-full max-h-[52vh] object-contain' />
          )}
        </div>

        <div className='px-5 sm:px-8 py-8'>
          <div className='flex flex-wrap items-start justify-between gap-x-8 gap-y-4'>
            <h3 className='font-display text-h2 text-ink'>{name}</h3>
            <div className='flex flex-wrap gap-x-6 gap-y-2'>
              {live_demo_link && (
                <a href={live_demo_link} target='_blank' rel='noreferrer' className='inline-flex items-center gap-2 h-11 px-5 rounded-card bg-ink text-white text-[0.9375rem] font-medium transition-colors duration-200 hover:bg-blueprint'>
                  Visit live site {icons.external}
                </a>
              )}
              {source_code_link && (
                <a href={source_code_link} target='_blank' rel='noreferrer' className='inline-flex items-center gap-2 h-11 px-5 rounded-card border border-rule bg-surface text-ink text-[0.9375rem] font-medium transition-colors duration-200 hover:border-blueprint hover:text-blueprint'>
                  Source {icons.code}
                </a>
              )}
            </div>
          </div>

          <p className='mt-5 text-body text-graphite max-w-measure'>{description}</p>

          {highlights?.length > 0 && (
            <div className='mt-8 pt-8 border-t border-rule'>
              <p className='font-mono text-eyebrow uppercase text-mute'>Highlights</p>
              <ul className='mt-4 space-y-3'>
                {highlights.map((h) => (
                  <li key={h} className='flex gap-4 text-caption text-graphite leading-relaxed'>
                    <span className='mt-2.5 w-3 h-px bg-rule shrink-0' aria-hidden='true' />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className='mt-8 font-mono text-eyebrow uppercase text-mute'>
            {tags.map((t) => t.name).join(' · ')}
          </p>

          {/* Feedback */}
          <div className='mt-8 pt-8 border-t border-rule'>
            <p className='text-[0.9375rem] font-medium text-ink'>Rate this project</p>
            <p className='mt-1 text-caption text-graphite'>
              Pick a rating and leave a note — it comes straight to my inbox.
            </p>

            <div className='mt-4 flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type='button'
                  onClick={() => { setRating(n); setSent(false); }}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${n} of 5 stars`}
                  aria-pressed={rating === n}
                  className='p-1 cursor-pointer transition-transform duration-150 ease-out hover:scale-110'
                >
                  <Star filled={(hover || rating) >= n} />
                </button>
              ))}
              {rating > 0 && <span className='ml-3 font-mono text-eyebrow text-mute'>{rating}/5</span>}
            </div>

            <label className='block mt-4'>
              <span className='sr-only'>Feedback comment</span>
              <textarea
                value={comment}
                onChange={(e) => { setComment(e.target.value); setSent(false); }}
                rows={3}
                placeholder='Optional — what stood out?'
                className='w-full bg-surface border border-rule rounded-card p-3.5 text-[0.9375rem] text-ink placeholder:text-mute outline-none focus:border-blueprint resize-none'
              />
            </label>

            <button
              type='button'
              onClick={sendFeedback}
              disabled={!rating && !comment.trim()}
              className='mt-4 px-6 h-11 rounded-card bg-ink text-white text-[0.9375rem] font-medium transition-colors duration-200 hover:bg-blueprint disabled:opacity-35 disabled:cursor-not-allowed'
            >
              {sent ? 'Feedback ready to send' : 'Send feedback'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProjectCard = ({ index, featured, name, description, tags, image, video, source_code_link, live_demo_link, onOpen }) => {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  // Perspective lives on the wrapper, the tilt on the card, so framer-motion keeps
  // ownership of the entrance transform.
  useTilt(cardRef, { max: 4.5, lift: 16 });

  // On a device with no hover, the mouseenter that plays the demo below can never
  // fire — so the demo plays itself while the card is on screen instead. Evaluated
  // once: a visitor does not grow a hover mid-visit. `initial: false` keeps play()
  // from firing for every card at mount, before the observer has looked.
  const [touchAuto] = useState(() => noHoverDevice() && !prefersReducedMotion() && !prefersSaveData());
  const cardVisible = useVisible(cardRef, '200px', false);
  useEffect(() => {
    if (!touchAuto || !video) return;
    const node = videoRef.current;
    if (!node) return;
    if (cardVisible) node.play().catch(() => {});
    else node.pause();
  }, [touchAuto, video, cardVisible]);

  return (
    <motion.article
      variants={fadeIn('up', 'spring', index * 0.08, 0.6)}
      className={`group h-full [perspective:1200px] ${featured ? 'sm:col-span-2' : ''}`}
    >
      <div
        ref={cardRef}
        className='flex flex-col h-full border border-rule bg-surface rounded-card overflow-hidden [transform-style:preserve-3d] transition-[border-color,box-shadow] duration-200 ease-out hover:border-white/25 hover:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_60px_-24px_rgba(0,0,0,.8)]'
      >
      <button
        type='button'
        onClick={onOpen}
        aria-label={`Open ${name} case study`}
        className={`relative block w-full bg-ink border-b border-rule overflow-hidden cursor-pointer text-left ${
          featured ? 'h-[240px] lg:h-[380px]' : 'h-[200px]'
        }`}
        onMouseEnter={() => videoRef.current?.play()}
        onMouseLeave={() => videoRef.current?.pause()}
      >
        {video ? (
          <>
            <video ref={videoRef} poster={image} muted loop playsInline preload='metadata' className='w-full h-full object-cover object-top'>
              <source src={video} type='video/webm' />
            </video>
            {/* Hover-revealed cover. On touch the video's own poster attribute
                already is the still, so the overlay would only be a second copy of
                the same image — rendered only for visitors whose hover can lift it. */}
            {!touchAuto && (
              <img src={image} alt='' aria-hidden='true' className='absolute inset-0 w-full h-full object-cover object-top pointer-events-none transition-opacity duration-500 group-hover:opacity-0' />
            )}
            <span className='absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-ink/85 to-transparent font-mono text-eyebrow uppercase text-white/90'>
              Recorded demo
            </span>
          </>
        ) : (
          <img src={image} alt={`${name} preview`} className='w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]' />
        )}
      </button>

      <div className='flex flex-col flex-1 p-5'>
        <h3 className='font-display text-h3 text-ink'>{name}</h3>
        <p className='mt-2 text-caption text-graphite leading-relaxed flex-1'>{description}</p>

        <p className='mt-5 pt-4 border-t border-rule font-mono text-eyebrow uppercase text-mute truncate'>
          {tags.map((t) => t.name).join(' · ')}
        </p>

        <div className='mt-4 flex items-center gap-5 text-[0.8125rem] font-medium'>
          <button type='button' onClick={onOpen} className='rule-link text-ink hover:text-blueprint cursor-pointer'>
            Case study
          </button>
          {live_demo_link && (
            <a href={live_demo_link} target='_blank' rel='noreferrer' className='rule-link text-graphite hover:text-blueprint inline-flex items-center gap-1.5'>
              Live {icons.external}
            </a>
          )}
          {source_code_link && (
            <a href={source_code_link} target='_blank' rel='noreferrer' aria-label={`${name} source code`} className='ml-auto text-graphite hover:text-blueprint transition-colors duration-200'>
              {icons.code}
            </a>
          )}
        </div>
      </div>
      </div>
    </motion.article>
  );
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'ai', label: 'AI / LLM' },
  { key: 'fullstack', label: 'Full-stack' },
  { key: 'payments', label: 'Payments' },
];

const Works = () => {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? projects : projects.filter((p) => p.category === filter);
  const step = (dir) => {
    if (!selected) return;
    const i = visible.indexOf(selected);
    setSelected(visible[(i + dir + visible.length) % visible.length]);
  };

  return (
    <>
      <SectionHead
        index='05'
        title='Selected work'
        meta={`${projects.length} projects`}
        blurb='Products I have shipped end to end. Open any card for the recorded demo, the live site and the source.'
      />

      <div role='group' aria-label='Filter projects' className='flex flex-wrap gap-x-7 gap-y-2 border-b border-rule'>
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type='button'
              aria-pressed={isActive}
              onClick={() => setFilter(f.key)}
              className={`relative -mb-px px-1 py-3 font-mono text-eyebrow uppercase transition-colors duration-200 cursor-pointer ${
                isActive ? 'text-ink' : 'text-mute hover:text-graphite'
              }`}
            >
              {f.label}
              <span
                className={`absolute left-0 -bottom-px h-px w-full origin-left transition-transform duration-200 ease-out ${
                  isActive ? 'scale-x-100 bg-blueprint' : 'scale-x-0'
                }`}
                aria-hidden='true'
              />
            </button>
          );
        })}
      </div>

      <motion.div
        key={filter}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      >
        {visible.map((project, index) => (
          <ProjectCard
            key={project.name}
            {...project}
            index={index}
            /* The first card of the unfiltered view leads the gallery — a wide
               screen in a wall of equal frames breaks the monotony. */
            featured={filter === 'all' && index === 0}
            onOpen={() => setSelected(project)}
          />
        ))}
      </motion.div>

      {visible.length === 0 && (
        <p className='mt-10 py-10 border-t border-rule font-mono text-eyebrow uppercase text-mute'>
          No projects in this category yet.
        </p>
      )}

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} onPrev={() => step(-1)} onNext={() => step(1)} />}
      </AnimatePresence>
    </>
  );
}

// Dark moment #2: the night gallery. Cards read as screens lit in a dark room;
// the case study opens as a printed light sheet (ProjectModal escapes the tone).
export default SectionWrapper(Works, 'work', { dark: true })
