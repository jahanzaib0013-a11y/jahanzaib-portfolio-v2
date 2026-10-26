import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { stagePlates } from '../constants/stages'
import {
  attachScrollMeasure,
  clamp01,
  publishPinProgress,
  stageScrubEnabled,
} from '../utils/scroll'

/**
 * Holds a section's opening block on screen while its plate scrubs through a
 * generated sequence, then lets it go.
 *
 * The block sticks at the top of a track that is its own height plus the plate's
 * hold, so the page keeps advancing while nothing on screen moves except the plate
 * behind it. This component also *owns* the plate's playhead for as long as it
 * holds: it publishes 0→1 across exactly the distance the block is pinned, so the
 * sequence cannot start before the hold or run past it — every frame plays inside
 * this portion of the page and nowhere else.
 *
 * The hold is `leadPx + scrubPx + tailPx`. One `pxPerFrame` of scroll buys one frame, so the
 * stills are never spread so thin that a normal flick skips them, and the tail is
 * spent on the closing frame before the block lets go — the last still is seen, not
 * scrolled past on the way out.
 *
 * The track is sized off the block's measured height rather than assumed to be one
 * viewport, because a sticky child only travels `track − child`. Size the track off
 * a guess and a block that runs taller than the viewport travels short: the sequence
 * would still be mid-clip when the page started moving again.
 *
 * When the sequence is not running at all — reduced motion, save data, a narrow
 * window — the track collapses to a plain fragment and publishes nothing, so the
 * plate falls back to the shared sample line and the section scrolls like any other.
 */
const StagePin = ({ stage, children }) => {
  const trackRef = useRef(null)
  const childRef = useRef(null)
  const plate = stagePlates.find((p) => p.id === stage)
  const [box, setBox] = useState(null)

  // Is this visitor getting a pinned sequence at all, and how tall is the block?
  useLayoutEffect(() => {
    const node = childRef.current
    if (!node || !plate?.pinPx || plate.frameCount < 1) return
    if (!stageScrubEnabled()) {
      publishPinProgress(stage, null)
      return
    }
    const measure = () => setBox({ child: node.offsetHeight })
    measure()
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    ro?.observe(node)
    return () => ro?.disconnect()
  }, [plate, stage])

  const hold = plate?.pinPx ?? 0
  const pinned = !!box && hold > 0

  useEffect(() => {
    if (!pinned || !plate?.scrubPx) return
    const node = trackRef.current
    if (!node) return

    const measure = () => {
      // The sticky child starts sticking when the track's top crosses the viewport
      // top and lets go one hold-distance later, so -rect.top is the travel.
      const travel = clamp01(-node.getBoundingClientRect().top / hold) * hold
      // The first `leadPx` of the hold is spent dimming the room, not on the clip:
      // frame one is still on screen until the lights are down.
      const progress = clamp01((travel - (plate.leadPx ?? 0)) / plate.scrubPx)
      publishPinProgress(stage, progress)
      // Raw pixels into the hold, for layers that are choreographed around the clip
      // (house lights) rather than along it.
      publishPinProgress(`${stage}:travel`, travel)
      if (import.meta.env.DEV) window.__pin = { stage, travel: Math.round(travel), progress }
    }

    // DEV: a handle to force one measurement, for driving the scrub from a context
    // where rAF does not run (an automated tab reports document.hidden === true).
    if (import.meta.env.DEV) window.__pinMeasure = measure

    return attachScrollMeasure(measure)
  }, [pinned, hold, plate, stage])

  // The wrapper is always there so the block can be measured before it is pinned —
  // an extra div costs nothing, a wrong track height costs the whole sequence.
  return (
    <div
      ref={trackRef}
      className={pinned ? 'relative' : undefined}
      style={pinned ? { height: box.child + hold } : undefined}
    >
      <div ref={childRef} className={pinned ? 'sticky top-0' : undefined}>
        {children}
      </div>
    </div>
  )
}

export default StagePin
