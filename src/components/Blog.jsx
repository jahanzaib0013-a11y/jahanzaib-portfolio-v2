import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SectionWrapper } from '../hoc'
import { fadeIn } from '../utils/motion'
import { blogs } from '../constants/blogs'
import SectionHead from './SectionHead'
import FrameMock from './FrameMock'

const IconClose = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
    <path d='M18 6L6 18M6 6l12 12' />
  </svg>
)

const BlogModal = ({ post, onClose }) => {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  if (!post) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-ink/70 overflow-y-auto'
    >
      <motion.article
        initial={{ opacity: 0, scale: 0.98, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.99, y: 10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-label={post.title}
        className='relative w-full max-w-3xl my-6 rounded-card bg-surface border border-rule shadow-lift'
      >
        <div className='sticky top-0 z-10 flex items-center justify-between gap-4 px-6 sm:px-9 py-4 bg-surface border-b border-rule'>
          <p className='flex items-center gap-3 font-mono text-eyebrow uppercase text-mute min-w-0 truncate'>
            <span className='text-blueprint'>{post.tag}</span>
            <span aria-hidden='true'>/</span>
            <span className='tabular-nums'>{post.readTime}</span>
          </p>
          <div className='flex items-center gap-5 shrink-0'>
            <a href={post.url} target='_blank' rel='noreferrer' className='rule-link font-mono text-eyebrow uppercase'>
              GitHub ↗
            </a>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label='Close article'
              className='w-9 h-9 rounded-pill border border-rule text-graphite flex items-center justify-center cursor-pointer transition-colors duration-200 hover:border-ink hover:text-ink'
            >
              <IconClose />
            </button>
          </div>
        </div>
        <div className='px-6 sm:px-9 py-8 blog-prose'>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </motion.article>
    </motion.div>
  );
};

const BlogCard = ({ post, index, onOpen }) => (
  <motion.div
    variants={fadeIn('up', 'spring', index * 0.1, 0.6)}
    className='h-full'
  >
    <article className='h-full flex flex-col border border-rule bg-surface rounded-card overflow-hidden transition-all duration-300 ease-out hover:border-graphite/40 hover:shadow-lift'>
      <div className='relative aspect-[16/9] overflow-hidden bg-paper group/cover'>
        {post.cover ? (
          <img
            src={post.cover}
            alt=''
            loading='lazy'
            /* Duotone by default, full colour when the card is lit — art
               direction that also forgives a mismatched screenshot. */
            className='absolute inset-0 w-full h-full object-cover grayscale contrast-[1.05] transition-all duration-300 ease-out group-hover/cover:grayscale-0'
          />
        ) : (
          // Missing cover: the drawing sheet stands in until the real art lands.
          <FrameMock variant='blueprint' seed={post.slug} className='absolute inset-0 w-full h-full' />
        )}
        <span className='absolute top-3 left-3 rounded-card bg-paper/85 backdrop-blur-sm border border-rule px-2 py-1 font-mono text-eyebrow text-graphite tabular-nums'>
          № {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className='flex flex-col flex-1 p-6'>
        <p className='flex flex-wrap items-center gap-x-3 font-mono text-eyebrow uppercase text-mute'>
          <span className='text-blueprint'>{post.tag}</span>
          <span aria-hidden='true'>/</span>
          <time className='tabular-nums'>{post.date}</time>
          <span aria-hidden='true'>/</span>
          <span className='tabular-nums'>{post.readTime}</span>
        </p>
        <h3 className='mt-3 font-display text-h3 text-ink'>
          <button onClick={onOpen} className='text-left cursor-pointer hover:text-blueprint transition-colors duration-200'>
            {post.title}
          </button>
        </h3>
        <p className='mt-2.5 text-caption text-graphite leading-relaxed flex-1 line-clamp-3'>
          {post.excerpt}
        </p>
        <button
          onClick={onOpen}
          className='mt-5 pt-4 border-t border-rule self-start flex items-center gap-2 text-label font-medium text-ink cursor-pointer group'
        >
          <span className='rule-link'>Read the breakdown</span>
          <span aria-hidden='true' className='transition-transform duration-200 ease-out group-hover:translate-x-1'>→</span>
        </button>
      </div>
    </article>
  </motion.div>
)

const Blog = () => {
  const [selected, setSelected] = React.useState(null);
  return (
    <>
      <SectionHead
        index='06'
        title='Engineering writing'
        meta='Published articles'
        blurb={<>
          Hard-won lessons from building real-world AI, cloud infrastructure and fault-tolerant financial pipelines.
          Read any piece in full here, or on{' '}
          <a href='https://github.com/jahanzaib0013-a11y/dev-blog' target='_blank' rel='noreferrer' className='rule-link'>GitHub</a>.
        </>}
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {blogs.map((post, i) => (
          <BlogCard key={post.slug} post={post} index={i} onOpen={() => setSelected(post)} />
        ))}
      </div>

      <AnimatePresence>
        {selected && <BlogModal post={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  )
}

export default SectionWrapper(Blog, "blog")
