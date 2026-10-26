import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { prefersReducedMotion, prefersSaveData } from './scroll'

// Registered once for the whole page; every section imports `gsap` from here
// instead of the package directly, so there is exactly one ScrollTrigger instance.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/**
 * Whether the visitor wants motion at all. Reduced-motion and save-data visitors
 * get the page fully rendered and still — same philosophy as the stage rules in
 * utils/scroll.js: when the motion never runs, the content must simply be there.
 */
export const motionGated = () => !prefersReducedMotion() && !prefersSaveData()

/**
 * The one rule for every scroll scene in this file's consumers: tweens and
 * triggers are built inside a gsap.matchMedia() that demands a wide window and
 * an explicit no-preference motion query. Narrow screens, reduced motion and
 * save-data never see the hidden initial state, so nothing is ever stuck away.
 *
 * `build(self)` receives the MatchMedia object; register tweens inside it.
 * The context is scoped to `ref` and killed on unmount / dep change.
 */
export const useGsapScene = (ref, build, deps = []) => {
  useEffect(() => {
    const node = ref.current
    if (!node) return

    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(build, node)
      return () => ctx.revert()
    })

    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps])
}

/**
 * A one-shot entrance (used by <Reveal /> and <CountUp />): runs only when the
 * element scrolls into view on a wide, calm, unmetered screen. Unlike
 * useGsapScene this is available outside React's render tree as plain helpers,
 * so primitives can hide-then-reveal their own child without every section
 * wiring a scene by hand.
 *
 * Returns the cleanup or `undefined` — never `null`. React keeps whatever an
 * effect returned as its `destroy` and calls it on any value that is not
 * undefined, so handing back null throws `destroy is not a function` and,
 * with no error boundary in main.jsx, unmounts the whole page.
 */
export const revealOnEnter = (node, fromVars, toVars) => {
  if (
    typeof window === 'undefined' ||
    !motionGated() ||
    !window.matchMedia('(min-width: 900px)').matches
  ) {
    return undefined
  }

  gsap.set(node, fromVars)
  const tween = gsap.to(node, {
    ...toVars,
    duration: toVars.duration ?? 0.9,
    ease: toVars.ease ?? 'power3.out',
    scrollTrigger: {
      trigger: node,
      start: 'top 85%',
      once: true,
    },
  })
  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    gsap.set(node, { clearProps: 'all' })
  }
}
