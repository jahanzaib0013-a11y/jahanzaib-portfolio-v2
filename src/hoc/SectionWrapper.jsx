import { motion } from 'framer-motion'
import { styles } from '../style'
import { staggerContainer } from '../utils/motion'

// The third argument is the section's tone. `dark` paints the theater room
// behind the content — and because the column itself is max-w-shell, the night
// band wraps it full-bleed so the page has no paper gutters beside it.
// index.css `[data-tone='dark']` then flips every token class the section
// writes; light sections never send it and change nothing.
const SectionWrapper = (Component, idName, { dark = false } = {}) =>
  function HOC() {
    const section = (
      <motion.section
        variants={staggerContainer()}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.25 }}
        data-stage={idName}
        className={`${styles.padding} w-full max-w-shell mx-auto relative z-10 border-t border-rule`}
      >
        <span className='hash-span' id={idName}>
          &nbsp;
        </span>
        <Component />
      </motion.section>
    )

    if (!dark) return section

    return <div data-tone='dark'>{section}</div>
  }

export default SectionWrapper
