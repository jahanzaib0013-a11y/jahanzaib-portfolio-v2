import { useEffect, useRef, useState } from 'react'

import { gsap, motionGated } from '../utils/gsapClient'

/**
 * CountUp — a stat that counts from `from` to `value` the first time it enters
 * view. Gated visitors (narrow screen, reduced motion, save data) get the
 * finished number immediately — the number is the content, the count is the
 * performance around it.
 *
 * `format(v)` receives the interpolated number (e.g. to insert thousand
 * separators); `suffix` rides along after the digits the whole time.
 */
const CountUp = ({ value, from = 0, decimals = 0, duration = 1.4, suffix = '', format, delay = 0, className = '' }) => {
  const ref = useRef(null)
  // The honest number is the default paint; the animation is applied over it.
  const [display] = useState(() => (format ? format(value) : value.toFixed(decimals)))

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (
      !motionGated() ||
      !window.matchMedia('(min-width: 900px)').matches ||
      typeof window === 'undefined'
    ) {
      return
    }

    const state = { n: from }
    // Only the digits are rewritten while counting — the suffix is the
    // JSX's own text node; claiming it here would print "1,200++".
    const render = () => {
      node.textContent = format ? format(state.n) : state.n.toFixed(decimals)
    }
    render()

    const tween = gsap.to(state, {
      n: value,
      duration,
      delay,
      ease: 'power3.out',
      onUpdate: render,
      scrollTrigger: { trigger: node, start: 'top 85%', once: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
    // Once per mount; the counted value is static data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span ref={ref} className={`tabular-nums ${className}`.trim()}>
      {display}
      {suffix}
    </span>
  )
}

export default CountUp
