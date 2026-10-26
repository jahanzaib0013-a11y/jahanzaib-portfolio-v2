import { useEffect, useRef, useState } from 'react'

export const clamp01 = (n) => Math.min(1, Math.max(0, n))

/**
 * The three preferences every stage rule is built from.
 *
 * Kept as tiny predicates rather than inline queries so the scrub rule and the
 * auto rule below compose the same facts, and so a component asking a narrower
 * question — "is a hover a thing this visitor has?" — reads the same answer the
 * stage itself uses.
 */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const prefersSaveData = () =>
  typeof window !== 'undefined' && !!navigator.connection?.saveData

/** Touch-first devices. Anything on this page that a hover reveals has to reveal itself instead. */
export const noHoverDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

/**
 * There are three kinds of stage visitor, and the two rules below sort them:
 *
 *   scrub    a wide, calm, unmetered screen. The plate is driven by the scroll
 *            wheel — the reader drives, it follows — so the hero can be pinned
 *            and every sequence can be scrubbed.
 *   auto     a narrow, calm, unmetered screen. A touch visitor cannot scrub (the
 *            gesture fights the page, and the stills cost ~10 MB up front), so
 *            the hero plays its film once on a clock and background plates loop.
 *   static   reduced motion, save data, or anything else. Posters only — nothing
 *            moves without being asked to.
 *
 * Both <ScrollStage /> and <StagePin /> read these, so a plate and the hold in
 * front of it can never disagree about which visitor they are drawing for.
 */
export const stageScrubEnabled = () => {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  if (window.matchMedia('(max-width: 899px)').matches) return false
  return !prefersSaveData()
}

/**
 * The touch counterpart of the scrub rule, for the hero film and the looping
 * background plates: narrow, calm and unmetered, all three or nothing.
 */
export const stageFilmAutoEnabled = () => {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  if (prefersSaveData()) return false
  return window.matchMedia('(max-width: 899px)').matches
}

/**
 * One rAF-throttled scroll/resize subscription, shared shape.
 *
 * requestAnimationFrame never runs in a background tab, so a scroll that lands while
 * the page is hidden — a restored scroll position, keyboard scrolling, a screen
 * reader — would otherwise leave whatever it measures frozen on a stale value until
 * the tab came back. Measure inline for that case; keep the rAF gate for the one
 * that actually repaints.
 *
 * Returns the cleanup, so every caller gets the same background-tab behaviour
 * without repeating it.
 */
export const attachScrollMeasure = (measure) => {
  let frame = 0

  const run = () => {
    frame = 0
    measure()
  }

  const onScroll = () => {
    if (document.hidden) {
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      measure()
      return
    }
    if (!frame) frame = window.requestAnimationFrame(run)
  }

  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  return () => {
    if (frame) window.cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}

/**
 * Which [data-stage] section owns the sample line, and how far through it the
 * page has travelled.
 *
 * progress: 0 when the section top reaches the line, 1 a `data-stage-scrub`
 * distance later (or at the section bottom when no scrub distance is set).
 * One rAF-throttled listener for the whole page — every plate reads from the
 * same subscription instead of installing its own scroll handler.
 */
export const useStageScroll = () => {
  const [state, setState] = useState({ id: null, progress: 0 })

  useEffect(() => {
    const measure = () => {
      const nodes = document.querySelectorAll('[data-stage]')
      if (!nodes.length) return

      // Sample above the fold: the plate should be committed by the time the
      // reader's eye reaches the section body.
      const line = window.innerHeight * 0.45
      let next = null

      for (const node of nodes) {
        const rect = node.getBoundingClientRect()
        if (rect.top <= line && rect.bottom > line) {
          const scrub = Number(node.dataset.stageScrub) || 0
          const span = scrub > 0 ? scrub : Math.max(1, rect.height - line)
          next = { id: node.dataset.stage, progress: clamp01((line - rect.top) / span) }
          break
        }
      }

      if (!next) {
        // Between sections (or above the first): hold the last passed plate at its end.
        const passed = [...nodes].filter((n) => n.getBoundingClientRect().top <= line)
        const node = passed[passed.length - 1]
        if (!node) return
        next = { id: node.dataset.stage, progress: 1 }
      }

      setState((prev) =>
        prev.id === next.id && Math.abs(prev.progress - next.progress) < 0.002
          ? prev
          : next,
      )

      if (import.meta.env.DEV) window.__stage = next
    }

    // DEV: a handle to force one measurement, for driving the scrub from a context
    // where rAF does not run (an automated tab reports document.hidden === true).
    if (import.meta.env.DEV) window.__stageMeasure = measure

    return attachScrollMeasure(measure)
  }, [])

  return state
}

/**
 * A pinned plate measures itself.
 *
 * <StagePin /> knows the exact distance its block spends on screen, so it publishes
 * the playhead here and <ScrollStage /> reads it back. That keeps the sequence and
 * the hold on the same ruler: frame one lands when the block starts sticking, the
 * last frame lands inside the tail, and nothing of the clip is spent on the scroll
 * *into* the section, which the reader never sees held.
 *
 * A module store rather than a prop, because the plate layer is a fixed overlay and
 * the track lives deep inside the section tree.
 */
const pinListeners = new Map()
const pinValues = new Map()

export const publishPinProgress = (stage, value) => {
  if (pinValues.get(stage) === value) return
  pinValues.set(stage, value)
  pinListeners.get(stage)?.forEach((push) => push(value))
}

/**
 * The progress a <StagePin /> is publishing for `stage`, or null when that plate is
 * not pinned (a narrow window, reduced motion, save data) and the shared sample line
 * should drive it instead.
 */
export const usePinProgress = (stage) => {
  const [value, setValue] = useState(() => (stage ? pinValues.get(stage) ?? null : null))

  useEffect(() => {
    if (!stage) {
      setValue(null)
      return
    }
    const set = pinListeners.get(stage) ?? new Set()
    set.add(setValue)
    pinListeners.set(stage, set)
    // The track may have measured before this subscribed.
    setValue(pinValues.get(stage) ?? null)
    return () => {
      set.delete(setValue)
      if (!set.size) pinListeners.delete(stage)
    }
  }, [stage])

  return value
}

/**
 * The same store, outside React. For a consumer that repaints on every scroll event
 * (a canvas), a setState per event is a re-render of its whole subtree for nothing.
 * Calls `fn` with the current value straight away, then on every change. Returns the
 * unsubscribe.
 */
export const subscribePin = (stage, fn) => {
  const set = pinListeners.get(stage) ?? new Set()
  set.add(fn)
  pinListeners.set(stage, set)
  fn(pinValues.get(stage) ?? null)
  return () => {
    set.delete(fn)
    if (!set.size) pinListeners.delete(stage)
  }
}

/**
 * Only whether `stage` is pinned at all. Re-renders when that flips, never while the
 * playhead moves — so a section can mount its pinned layers without re-rendering on
 * every scroll event.
 */
export const usePinActive = (stage) => {
  const [active, setActive] = useState(() => pinValues.get(stage) != null)
  useEffect(() => subscribePin(stage, (v) => setActive(v != null)), [stage])
  return active
}

/**
 * Eases a value toward its target on the frame clock and stops looping once it
 * is at rest, so an idle page costs nothing. Rate-based, so the feel is the same
 * at 60fps and 144fps.
 */
export const useDampedValue = (target, { rate = 6, epsilon = 0.0015 } = {}) => {
  const [value, setValue] = useState(target)
  const current = useRef(target)

  // Nothing paints while the tab is hidden and requestAnimationFrame is paused,
  // so easing has no audience: jump straight to the target and let the loop
  // resume on the next change once the page is visible again.
  useEffect(() => {
    if (!document.hidden) return
    current.current = target
    setValue(target)
  }, [target])

  useEffect(() => {
    let frame = 0
    let last = performance.now()

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      current.current += (target - current.current) * (1 - Math.exp(-rate * dt))
      if (Math.abs(target - current.current) < epsilon) current.current = target
      setValue(current.current)
      if (current.current !== target) frame = window.requestAnimationFrame(step)
    }

    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [target, rate, epsilon])

  return value
}
