import { useEffect, useMemo, useState } from 'react'

import { usePinProgress, useStageScroll, stageFilmAutoEnabled, stageScrubEnabled } from '../utils/scroll'
import { stagePlates } from '../constants/stages'
import Plate from './StagePlate'

/**
 * ScrollStage — the page's environmental layer.
 *
 * One fixed layer, one plate per section. On a wide screen each is scrubbed by
 * scroll position instead of played on a timeline: scroll down and it advances,
 * scroll up and it rewinds. On a narrow one there is no scrub — the active plate
 * autoplays on a loop behind the veil instead (the `auto` rule below). The plate
 * itself — its three delivery modes, and the pre-decode that keeps a fast scrub
 * off blank frames — lives in <StagePlate />. This module is only about which
 * plate is showing, how far through it we are, and how much paper goes over it so
 * the prose stays readable.
 *
 * The hero is deliberately not in this layer: it paints its own background, so a
 * plate behind the page could never show through it. <Hero /> mounts its sequence
 * inside its own section instead.
 */

// How much paper sits over a plate that has no opinion of its own.
const DEFAULT_VEIL = 0.78

const useMediaRules = () => {
  const [rules, setRules] = useState({
    fine: true,
    wide: true,
    calm: false,
    cheap: false,
    scrub: true,
    auto: false,
  })
  useEffect(() => {
    const mq = (query) => window.matchMedia(query)
    const fine = mq('(pointer: fine)')
    const wide = mq('(min-width: 900px)')
    const calm = mq('(prefers-reduced-motion: reduce)')
    const list = [fine, wide, calm]
    const on = () =>
      setRules({
        fine: fine.matches,
        wide: wide.matches,
        calm: calm.matches,
        cheap: !!navigator.connection?.saveData,
        // Read from the shared rule so a plate and the <StagePin /> in front of it
        // can never disagree about whether the sequence is running.
        scrub: stageScrubEnabled(),
        // The touch sibling: same preferences, opposite width test. Both are false
        // under reduced motion or save data, so the pair never disagree about
        // whether motion is allowed at all.
        auto: stageFilmAutoEnabled(),
      })
    on()
    list.forEach((m) => m.addEventListener('change', on))
    return () => list.forEach((m) => m.removeEventListener('change', on))
  }, [])
  return rules
}

const FrameStrip = ({ plate, progress }) => {
  const total = plate.frameCount
  const cells = Math.min(total, 14)
  const active = Math.min(cells - 1, Math.max(0, Math.round(progress * (cells - 1))))
  return (
    <div className='absolute bottom-6 left-6 hidden xl:block'>
      <div className='flex items-end gap-1.5' aria-hidden='true'>
        {Array.from({ length: cells }, (_, n) => (
          <span
            key={n}
            className={`block w-6 h-px origin-left transition-transform duration-300 ease-out ${
              n === active ? 'scale-y-[3] bg-blueprint' : 'bg-mute/60'
            }`}
          />
        ))}
      </div>
      <p className='mt-3 font-mono text-eyebrow uppercase text-mute'>
        {plate.caption} · frame {String(active + 1).padStart(3, '0')}/{String(total).padStart(3, '0')}
      </p>
    </div>
  );
}

const ScrollStage = () => {
  const rules = useMediaRules()
  const { id: activeId, progress: lineProgress } = useStageScroll()
  // A pinned plate measures itself and publishes its playhead; null while no pin owns
  // the screen. <StagePin /> holds a block still for exactly the distance a sequence
  // scrubs, so a clip can never start before its hold or run past it. Nothing here is
  // pinned today — the hero, which is, mounts its own plate — but the fallback keeps
  // the two clocks from ever disagreeing.
  const pinProgress = usePinProgress(rules.scrub ? activeId : null)
  const progress = pinProgress ?? lineProgress

  // The hero's plate belongs to the hero, so this layer never sees it.
  const plates = useMemo(
    () => stagePlates.filter((p) => p.id !== 'hero' && (p.poster || p.video)),
    [],
  )

  // A section can ask for a shorter scrub than its own height: the plate then
  // runs out a fixed distance after the sample line and holds on its last frame.
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-stage]')
    nodes.forEach((node) => {
      const plate = stagePlates.find((p) => p.id === node.dataset.stage)
      if (plate?.scrubPx) node.setAttribute('data-stage-scrub', String(plate.scrubPx))
    })
  }, [])

  // A fixed plate layer is "in viewport" for every plate at once, so native lazy
  // loading cannot help: mount the active plate and its neighbours only, and keep
  // them mounted so scrolling back never re-fetches.
  const [mounted, setMounted] = useState(() => new Set(plates.slice(0, 2).map((p) => p.id)))

  useEffect(() => {
    if (!activeId) return
    const i = plates.findIndex((p) => p.id === activeId)
    if (i < 0) return
    setMounted((prev) => {
      const next = new Set(prev)
      let changed = false
      ;[i - 1, i, i + 1].forEach((n) => {
        const plate = plates[n]
        if (plate && !next.has(plate.id)) { next.add(plate.id); changed = true }
      })
      return changed ? next : prev
    })
  }, [activeId, plates])

  if (!plates.length) return null

  const activePlate = plates.find((p) => p.id === activeId) || plates[0]
  // The hero owns its own scene; the plate layer only takes over from the first
  // wrapped section onward.
  const live = !!activeId
  // Dev override so the seek path can be exercised in a narrow test viewport.
  const allowVideo = rules.scrub || rules.auto || (import.meta.env.DEV && !!window.__forceVideo)
  const veil = activePlate.veil ?? DEFAULT_VEIL

  return (
    <div
      className='fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ease-out'
      style={{ opacity: live ? 1 : 0 }}
      aria-hidden='true'
      data-stage-layer={live ? activePlate.id : 'hero'}
    >
      {plates.filter((plate) => mounted.has(plate.id)).map((plate) => (
        <Plate
          key={plate.id}
          plate={plate}
          active={plate.id === activePlate.id}
          progress={plate.id === activePlate.id ? progress : 0}
          allowVideo={allowVideo}
          allowSequence={rules.scrub}
          autoVideo={rules.auto}
        />
      ))}

      {/* Paper veil: the plate stays atmosphere, body copy keeps its contrast.
          Each plate asks for its own strength — a sequence nobody can see is worse
          than no sequence at all — and the gradient tracks it proportionally. */}
      <div
        className='absolute inset-0 bg-paper transition-opacity duration-[900ms] ease-out'
        style={{ opacity: veil }}
      />
      <div
        className='absolute inset-0 bg-gradient-to-b from-paper via-paper/30 to-paper transition-opacity duration-[900ms] ease-out'
        style={{ opacity: veil / DEFAULT_VEIL }}
      />

      {live && !rules.calm && rules.wide && rules.fine && activePlate.frameCount > 1 && (
        <FrameStrip plate={activePlate} progress={progress} />
      )}
    </div>
  );
}

export default ScrollStage
