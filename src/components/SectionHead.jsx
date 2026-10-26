/**
 * Section title block: index / heading / right-aligned meta, closed by a rule.
 * The recurring "drawing sheet" header for every section.
 */
const SectionHead = ({ index, title, meta, blurb }) => (
  <div className='mb-12'>
    <div className='flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pb-6 border-b border-rule'>
      <h2 className='flex items-baseline gap-4 font-display text-h2 text-ink'>
        {index && (
          <span className='font-mono text-eyebrow text-blueprint translate-y-[-0.35em]'>
            {index}
          </span>
        )}
        {title}
      </h2>
      {meta && (
        <span className='font-mono text-eyebrow uppercase text-mute'>{meta}</span>
      )}
    </div>
    {blurb && (
      <p className='mt-6 text-lead text-graphite max-w-measure text-balance'>{blurb}</p>
    )}
  </div>
)

export default SectionHead
