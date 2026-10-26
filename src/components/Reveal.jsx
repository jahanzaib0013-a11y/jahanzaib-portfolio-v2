import { useEffect, useRef } from 'react'

import { revealOnEnter } from '../utils/gsapClient'

/**
 * Reveal — the house entrance. A child rises out of a clipped line (mask-up)
 * or simply fades through a short translate, once, when it enters view.
 *
 * The child renders in its final state on the server and on every device the
 * motion is gated out of (narrow screen, reduced motion, save data) — the
 * hiding only ever happens inside the wide/calm branch, mirroring the stage
 * rule that a page must read fully when the film never plays.
 */
const Reveal = ({
  children,
  className = '',
  delay = 0,
  y = 28,
  duration = 0.9,
  mask = true,
  as: Tag = 'div',
}) => {
  const innerRef = useRef(null)

  useEffect(() => {
    const node = innerRef.current
    if (!node) return
    // Only a function may reach React as a cleanup — see gsapClient.
    const cleanup = revealOnEnter(
      node,
      { y, opacity: mask ? 1 : 0 },
      { y: 0, opacity: 1, duration, delay },
    )
    return typeof cleanup === 'function' ? cleanup : undefined
    // Intentionally once per mount: the trigger is self-contained, and
    // re-running a finished entrance on a prop change would re-hide content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mask) {
    // No inner box to travel — the element itself fades and lifts. (A
    // display:contents wrapper would swallow every transform, so the ref
    // goes straight on the Tag here.)
    return (
      <Tag ref={innerRef} className={className}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag className={`overflow-hidden ${className}`.trim()}>
      {/* The mask: the inner node travels, the clip makes the line. */}
      <div ref={innerRef}>
        {children}
      </div>
    </Tag>
  )
}

export default Reveal
