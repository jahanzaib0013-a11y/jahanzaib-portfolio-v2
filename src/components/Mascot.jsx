import { Suspense, lazy, useEffect, useRef, useState } from 'react'

import { useDodge } from '../utils/dodge'
import {
  attachScrollMeasure,
  clamp01,
  prefersReducedMotion,
  prefersSaveData,
  useStageScroll,
} from '../utils/scroll'

// Three.js is heavy, so the plate loads in an async chunk.
const MascotCanvas = lazy(() => import('./canvas/MascotCanvas'))

/**
 * The mascot: the 3D figure on a rail along the bottom edge of the viewport. He
 * walks in when About reaches the sample line, leaves before the Footer, and
 * narrates every stop from a speech cloud. He also steps aside for the reader:
 * hovering the text of his own section pushes him the other way, and he walks back
 * the moment the cursor moves off it.
 */

// One line per [data-stage] section, in DOM order. Each stop gets the same slice of
// the walk, so a short section and a long one are both given a full sentence.
const TALK = [
  { id: 'about', line: 'First stop: what I actually spend my days on.' },
  { id: 'architecture', line: 'Here is how the systems I build fit together.' },
  { id: 'tech', line: 'The stack I reach for, and why each piece earns it.' },
  { id: 'experience', line: 'Where I have worked, and what I took from it.' },
  { id: 'work', line: 'Selected work — real projects with real numbers.' },
  { id: 'blog', line: 'I write this down so you can skip my mistakes.' },
  { id: 'contact', line: 'Last stop. Say hello, I answer fast.' },
]

// He is 200px wide, so he never mounts on a narrow screen, and a reduced-motion or
// save-data visitor never sees a walk at all.
const WIDE_QUERY = '(min-width: 900px)'

// The hero's film runs from under the nav to the foot of its section, which is the
// band the rail lives in. The plate is 216px and the cloud adds roughly 80px over his
// head, so this is the clearance that keeps him off the picture entirely.
const RAIL_BAND = 300

// Above the first [data-stage] the shared sample line holds on to the last plate it
// passed — the hero is not a stage — so the rail alone cannot tell when we are back in
// the theatre. The film has to be asked directly.
const clearOfFilm = () => {
  const film = document.querySelector('[data-film]')
  if (!film) return true
  const { top, bottom } = film.getBoundingClientRect()
  return bottom <= window.innerHeight - RAIL_BAND || top >= window.innerHeight
}

const gateOpen = () =>
  typeof window !== 'undefined' &&
  !prefersReducedMotion() &&
  !prefersSaveData() &&
  window.matchMedia(WIDE_QUERY).matches

const Mascot = () => {
  const [enabled, setEnabled] = useState(gateOpen)
  // Latched once the walk has started, so scrolling back to the hero does not tear
  // down the WebGL context and re-fetch the model on the way back down.
  const [started, setStarted] = useState(false)
  // False while the film occupies his band. Defaults to true because the only way in
  // to the rail is from About, which is nowhere near it.
  const [offFilm, setOffFilm] = useState(true)
  const { id, progress } = useStageScroll()
  const runnerRef = useRef(null)

  useEffect(() => {
    const queries = [
      window.matchMedia(WIDE_QUERY),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ]
    const onChange = () => setEnabled(gateOpen())
    queries.forEach((query) => query.addEventListener('change', onChange))
    return () => queries.forEach((query) => query.removeEventListener('change', onChange))
  }, [])

  useEffect(() => {
    if (!enabled || !started) return undefined
    // Same rAF-throttled, background-tab-safe sampler the rest of the page reads from.
    // setState bails out on an unchanged boolean, so this only re-renders on a crossing.
    return attachScrollMeasure(() => setOffFilm(clearOfFilm()))
  }, [enabled, started])

  const stop = TALK.findIndex((section) => section.id === id)
  const atEnd = stop === TALK.length - 1 && progress >= 0.99
  const walking = stop >= 0 && !atEnd && offFilm

  useEffect(() => {
    if (walking) setStarted(true)
  }, [walking])

  // 0 at About, 1 by the Footer: one stop each, eased inside it by section progress.
  const rail = stop >= 0 ? (stop + clamp01(progress)) / TALK.length : 0

  // Only while he is actually on screen: the hook needs the runner node, and this is
  // the one combination of flags that is true in the same commit that mounts it.
  useDodge(runnerRef, {
    stageId: walking ? id : null,
    active: walking && started && enabled,
  })

  if (!enabled || !started) return null

  return (
    <div className={`mascot-root${walking ? '' : ' is-off'}`} aria-hidden='true'>
      <div className='mascot-runner' ref={runnerRef} style={{ '--rail': rail }}>
        {/* Keyed so the cloud replays its pop on every new stop. */}
        <p className='mascot-cloud' key={stop >= 0 ? id : 'idle'}>
          {stop >= 0 ? TALK[stop].line : ''}
        </p>
        <Suspense fallback={<div className='mascot-plate' aria-hidden='true' />}>
          <MascotCanvas />
        </Suspense>
      </div>
    </div>
  )
}

export default Mascot
