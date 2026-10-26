import { useEffect, useRef } from 'react'

/**
 * Shared motion helpers for the canvas scenes.
 *
 * The rule these encode: never animate with a fixed per-frame lerp factor. A
 * `lerp(cur, target, 0.08)` moves twice as far per second on a 120 Hz display as
 * on a 30 Hz one, which reads as a machine-dependent site. Damping expressed as
 * a rate plus a real delta is identical on every refresh rate.
 */
export const damp = (current, target, rate, dt) =>
  current + (target - current) * (1 - Math.exp(-rate * dt))

/** Same curve, applied componentwise to a Vector3 without allocating a target. */
export const dampVec3 = (vec, x, y, z, rate, dt) => {
  const k = 1 - Math.exp(-rate * dt)
  vec.x += (x - vec.x) * k
  vec.y += (y - vec.y) * k
  vec.z += (z - vec.z) * k
  return vec
}

/**
 * Pointer in normalised device coordinates, tracked on the window rather than
 * the canvas. The hero plate is ~260px wide, so canvas-local pointer events
 * would only fire while the cursor is already on it — this makes the scene
 * respond to the cursor anywhere on the page.
 */
export const useWindowPointer = () => {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return pointer
}

/**
 * How far an element has travelled out of the viewport: 0 while it is parked at
 * the top, 1 once it has scrolled fully past. Written to a ref (not state) so a
 * scroll never triggers a React render — scenes read it inside useFrame.
 */
export const useExitProgress = (ref) => {
  const progress = useRef(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const span = rect.height || window.innerHeight
      const raw = -rect.top / span
      progress.current = Math.min(1, Math.max(0, raw))
    }
    const onScroll = () => {
      // One measurement per frame, at most.
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    // Listeners go up regardless of the ref: scenes often mount their wrapper in a
    // later commit (after feature detection), and the hook must still catch it.
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])

  return progress
}
