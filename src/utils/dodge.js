import { useEffect } from 'react'

/**
 * Cursor repulsion.
 *
 * While the pointer rests on a piece of reading text inside the section being
 * watched, the node slides away from the cursor's side; the moment the pointer
 * leaves that text, the target returns to zero and it eases back to exactly the
 * place it came from. The target is a function of the cursor alone, never of where
 * the dodge has already put the node — that feedback turns one step aside into a
 * run down the rail and back. Transform-only and self-stopping, on the same damping
 * contract as utils/tilt.js, so it costs nothing while nobody is reading.
 *
 * Attach `ref` to the element to push. It must own its horizontal placement
 * through a property other than `transform`, which is where the rail lives.
 */

// The elements that count as reading. Buttons, links and cards are deliberately
// out: hovering a control is not the same as settling in to a paragraph.
const TEXT_SELECTOR = 'h1, h2, h3, h4, p, li, blockquote, figcaption, dt, dd'

// How far he gives way at full reach — a step aside, not a journey along the rail —
// and how fast the give settles (per second).
const MAX_PX = 60
const RATE = 7

// How wide the push is felt along the rail, as a fraction of the viewport, and how
// much of it a cursor at the far end of the section still gets. Only the horizontal
// gap counts, since that is the only axis he can move on.
const REACH = 0.5
const FLOOR = 0.3

// Dead band around his centre, in px. Inside it the side he already chose is held:
// sampling the side live makes it flip on a few px of hand tremor, and because the
// push is strongest there, that reads as him running the width of the rail and back.
const HYST = 40

// The dodge may not undo the rail's own margins. The right side is wider because
// the WhatsApp button owns the bottom-right corner.
const EDGE_LEFT = 24
const EDGE_RIGHT = 96

const clamp = (min, max, v) => Math.min(max, Math.max(min, v))

export const useDodge = (ref, { stageId, active = true } = {}) => {
  useEffect(() => {
    const node = ref.current
    if (!node || !active || !stageId) return undefined

    // No cursor to dodge on a touch screen.
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    let frame = 0
    let target = 0
    let current = 0
    let last = 0
    // Committed side: 1 right, -1 left, 0 until the cursor has clearly picked one.
    let side = 0

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016
      last = now
      const next = current + (target - current) * (1 - Math.exp(-RATE * dt))
      const settled = Math.abs(target - next) < 0.15

      current = settled ? target : next
      node.style.setProperty('--dodge', current.toFixed(2))

      frame = settled ? 0 : window.requestAnimationFrame(tick)
    }

    const aim = (value) => {
      target = value
      if (!frame) {
        last = performance.now()
        frame = window.requestAnimationFrame(tick)
      }
    }

    const onMove = (event) => {
      const piece =
        event.target instanceof Element ? event.target.closest(TEXT_SELECTOR) : null
      // Off the text, or over a different section's text: he goes back where he was.
      if (!piece || !piece.closest(`[data-stage='${stageId}']`)) {
        side = 0
        aim(0)
        return
      }

      const { left, width } = node.getBoundingClientRect()
      // Where the rail has him, with the dodge taken back out. Reading his live rect
      // instead would let every step he takes move the goalposts.
      const base = left - current
      const gap = base + width / 2 - event.clientX
      // Latched, not sampled: he only changes his mind once the cursor has crossed
      // the dead band, so a tremor on top of him cannot send him the other way.
      if (gap > HYST) side = 1
      else if (gap < -HYST) side = -1
      // Repulsion along the rail: the side he committed to is the side he leaves, and
      // the closer the cursor sits the further he goes.
      const near = clamp(0, 1, 1 - Math.abs(gap) / (window.innerWidth * REACH))
      const want = side * MAX_PX * (FLOOR + (1 - FLOOR) * near)
      const back = EDGE_LEFT - base
      const fwd = window.innerWidth - EDGE_RIGHT - (base + width)

      aim(clamp(Math.min(0, back), Math.max(0, fwd), want))
    }

    const onLeave = () => aim(0)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      node.style.removeProperty('--dodge')
    }
  }, [ref, stageId, active])
}
