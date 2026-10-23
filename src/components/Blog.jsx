import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { styles } from '../style'
import { SectionWrapper } from '../hoc'
import { fadeIn, textVariant } from '../utils/motion'
import { blogs } from '../constants/blogs'

const BlogModal = ({ post, onClose }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  if (!post) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto'
    >
      <motion.article
        initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-3xl my-4 rounded-2xl bg-tertiary border border-white/10 shadow-[0_40px_120px_-20px_rgba(145,94,255,0.35)]'
      >
        <div className='sticky top-0 z-10 flex items-center justify-between gap-4 px-6 sm:px-9 py-4 bg-tertiary/95 backdrop-blur border-b border-white/5 rounded-t-2xl'>
          <div className='flex items-center gap-3 text-[12px] text-secondary'>
            <span className='text-[#00cea8]'>{post.tag}</span>
            <span>·</span><span>{post.readTime}</span>
          </div>
          <div className='flex items-center gap-2'>
            <a href={post.url} target='_blank' rel='noreferrer'
              className='text-[12px] font-semibold text-secondary hover:text-white transition-colors whitespace-nowrap'>
              Read on GitHub ↗
            </a>
            <button onClick={onClose} className='w-9 h-9 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center hover:bg-[#915eff] transition-colors'>✕</button>
          </div>
        </div>
        <div className='px-6 sm:px-9 py-7 blog-prose'>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </motion.article>
    </motion.div>
  );
};

const BlogCard = ({ post, index, onOpen }) => (
  <motion.div
    variants={fadeIn('up', 'spring', index * 0.12, 0.6)}
    whileHover={{ y: -5 }}
    onClick={onOpen}
    className='group relative flex flex-col rounded-2xl bg-tertiary border border-white/5 overflow-hidden cursor-pointer transition-colors duration-300 hover:border-[#915eff]/70'
  >
    <div className='relative h-[150px] overflow-hidden'>
      <img src={post.cover} alt={post.title} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
      <div className='absolute inset-0 bg-gradient-to-t from-tertiary via-transparent to-transparent' />
    </div>
    <div className='flex flex-col flex-1 p-6'>
      <div className='flex items-center gap-3 text-[12px] mb-3'>
        <span className='text-[#915eff] font-medium px-2.5 py-1 rounded-full bg-[#915eff]/15'>{post.tag}</span>
        <span className='text-secondary'>{post.date} · {post.readTime}</span>
      </div>
      <h3 className='text-white font-bold text-[19px] leading-snug'>{post.title}</h3>
      <p className='mt-3 text-secondary text-[14px] leading-[22px] flex-1'>{post.excerpt}</p>
      <span className='mt-5 text-[#00cea8] text-[14px] font-semibold inline-flex items-center gap-1.5'>
        Read article <span className='transition-transform group-hover:translate-x-1'>→</span>
      </span>
    </div>
  </motion.div>
)

const Blog = () => {
  const [selected, setSelected] = React.useState(null);
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Writing</p>
        <h2 className={styles.sectionHeadText}>Blog.</h2>
      </motion.div>

      <motion.p variants={fadeIn('', '', 0.1, 1)} className='mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]'>
        Notes from building AI-powered products end to end — the lessons that only show up once real
        users, and real money, arrive. Also published on{' '}
        <a href='https://github.com/jahanzaib0013-a11y/dev-blog' target='_blank' rel='noreferrer' className='text-[#00cea8] font-semibold hover:underline'>
          GitHub
        </a>.
      </motion.p>

      <div className='mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
