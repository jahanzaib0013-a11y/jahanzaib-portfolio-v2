import { useEffect } from 'react'

/**
 * Pointer-driven perspective tilt.
 *
 * Ported from the hover-parallax pattern in the Sketchbook reference study: the
 * element rotates toward the cursor inside a perspective volume, and children that
 * carry translateZ read as standing off the page. Transform-only, so it never
 * triggers layout, and the rAF loop stops itself once the pose has settled.
 *
 * Attach `ref` to the element to tilt. Its parent must set `perspective`, and the
 * element itself needs `transform-style: preserve-3d` for child depth.
 */
export const useTilt = (ref, { max = 6, lift = 10, rate = 7 } = {}) => {
  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Fine pointer only, and never against reduced-motion.
    const fine = window.matchMedia('(pointer: fine)')
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || calm.matches) return

    let frame = 0
    let active = false
    let px = 0
    let py = 0
    let cx = 0
    let cy = 0
    let cz = 0
    let last = 0

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016
      last = now
      // Rate-based damping: same feel at 30 fps and 120 fps.
      const k = 1 - Math.exp(-rate * dt)
      cx += (px - cx) * k
      cy += (py - cy) * k
      cz += ((active ? lift : 0) - cz) * k

      node.style.transform =
        `rotateX(${(-cy * max).toFixed(3)}deg) rotateY(${(cx * max).toFixed(3)}deg) translate3d(0, 0, ${cz.toFixed(2)}px)`

      const settled =
        Math.abs(px - cx) < 0.001 && Math.abs(py - cy) < 0.001 && Math.abs(cz - (active ? lift : 0)) < 0.05
      if (settled) {
        frame = 0
        if (!active) node.style.transform = ''
        return
      }
      frame = window.requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame) return
      last = performance.now()
      frame = window.requestAnimationFrame(tick)
    }

    const onMove = (event) => {
      const rect = node.getBoundingClientRect()
      px = ((event.clientX - rect.left) / rect.width) * 2 - 1
      py = ((event.clientY - rect.top) / rect.height) * 2 - 1
      start()
    }
    const onEnter = () => {
      active = true
      start()
    }
    const onLeave = () => {
      active = false
      px = 0
      py = 0
      start()
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerenter', onEnter)
    node.addEventListener('pointerleave', onLeave)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerenter', onEnter)
      node.removeEventListener('pointerleave', onLeave)
      node.style.transform = ''
    }
  }, [ref, max, lift, rate])
}
