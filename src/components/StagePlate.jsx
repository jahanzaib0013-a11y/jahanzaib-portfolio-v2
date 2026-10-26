import { useEffect, useRef, useState } from 'react'

import { useDampedValue } from '../utils/scroll'

/**
 * One plate: a section's background. On a wide screen it is scrubbed by scroll
 * instead of played on a timeline — scroll down and it advances, scroll up and it
 * rewinds. On a narrow screen there is no scrub at all: the plate autoplays on a
 * loop behind the veil while its section is on screen.
 *
 * Three delivery modes, best available first, all declared in constants/stages.js:
 *
 *   sequence  /public/stages/<id>/frame-001…NNN stills, index chosen from scroll
 *             progress. Precise, no decoder, no seek jitter — the frame scrub a
 *             generated transition video is cut into.
 *   video     one clip, two performance modes. On a wide screen it is seeked
 *             through currentTime, driven by the scrub; on a narrow one it loops
 *             on its own, because there is no wheel to scrub with there.
 *   poster    a still plate with a slow progress-driven zoom. Always the fallback,
 *             and the only mode on reduced-motion or save-data screens.
 *
 * Its own module because two layers need it: <ScrollStage /> mounts a plate per
 * section behind the prose, and <Hero /> mounts one inside its own section, where
 * the fixed layer could never show through the terrain it paints.
 */

const frameUrl = (plate, n) =>
  `/stages/${plate.id}/frame-${String(n).padStart(3, '0')}.${plate.frameExt || 'webp'}`

const Plate = ({ plate, active, progress, allowVideo, allowSequence, autoVideo }) => {
  const { video, poster, pin, frameCount = 0 } = plate
  const imgRef = useRef(null)
  const videoRef = useRef(null)
  const decoded = useRef(new Set())
  const [pinFailed, setPinFailed] = useState(false)
  const [seqFailed, setSeqFailed] = useState(false)

  // A hotlinked plate is a network dependency, and network dependencies fail:
  // the shipped still is always the fallback, never a broken-image frame.
  const remote = !!pin && !pinFailed
  const still = remote ? pin : poster

  const damped = useDampedValue(active ? progress : 0, { rate: 7 })

  const mode = frameCount > 1 && allowSequence && !seqFailed
    ? 'sequence'
    : video && allowVideo
      ? 'video'
      : 'poster'
  const index = mode === 'sequence'
    ? Math.min(frameCount - 1, Math.max(0, Math.round(damped * (frameCount - 1))))
    : 0

  // Keep the playhead's neighbours decoded so a fast scrub never lands on a blank frame.
  useEffect(() => {
    if (mode !== 'sequence') return
    const url = frameUrl(plate, index + 1)
    if (imgRef.current && imgRef.current.getAttribute('src') !== url) imgRef.current.src = url
    ;[index - 1, index + 1].forEach((n) => {
      if (n < 0 || n >= frameCount || decoded.current.has(n)) return
      decoded.current.add(n)
      const img = new Image()
      img.decoding = 'async'
      img.src = frameUrl(plate, n + 1)
    })
  }, [plate, index, mode, frameCount])

  useEffect(() => {
    if (mode !== 'video') return
    const node = videoRef.current
    if (!node) return
    if (autoVideo) {
      // A touch visitor has no wheel, so the clip is motion rather than a scrub:
      // loop it while this plate owns the screen, park it otherwise. A rejected
      // autoplay (iOS Low Power Mode) leaves the poster attribute showing — the
      // degradation is the browser's own.
      if (active) node.play().catch(() => {})
      else node.pause()
      return
    }
    if (!active) {
      node.pause()
      return
    }
    const duration = Number.isFinite(node.duration) ? node.duration : 0
    if (!duration) return
    const next = Math.min(duration - 0.05, Math.max(0, damped * duration))
    if (Math.abs(node.currentTime - next) > 0.04) node.currentTime = next
  }, [mode, damped, active, autoVideo])

  const style =
    mode === 'sequence'
      ? { transform: `translate3d(0, ${(damped - 0.5) * -2.4}%, 0)` }
      : mode === 'poster'
        ? { transform: `scale(${1.04 + damped * 0.1}) translate3d(0, ${(damped - 0.5) * -2}%, 0)` }
        : undefined

  return (
    <div
      className='absolute inset-0 pointer-events-none transition-opacity duration-[900ms] ease-out'
      style={{ opacity: active ? 1 : 0 }}
      data-plate={plate.id}
      data-plate-mode={mode}
      data-plate-autoplay={mode === 'video' && autoVideo ? '' : undefined}
      data-plate-frame={mode === 'sequence' ? index + 1 : undefined}
      data-plate-playhead={damped.toFixed(3)}
    >
      {mode === 'sequence' && (
        <img
          ref={imgRef}
          src={frameUrl(plate, 1)}
          alt=''
          decoding='async'
          onError={() => setSeqFailed(true)}
          className='w-full h-full object-cover'
          style={style}
        />
      )}

      {mode === 'video' && (
        <video
          ref={videoRef}
          src={video}
          poster={poster}
          muted
          playsInline
          autoPlay={autoVideo || undefined}
          loop={autoVideo || undefined}
          preload={active ? 'auto' : 'metadata'}
          disablePictureInPicture
          aria-label={plate.caption}
          className='w-full h-full object-cover'
        />
      )}

      {mode === 'poster' && (
        <img
          src={still}
          alt=''
          decoding='async'
          loading={active ? 'eager' : 'lazy'}
          referrerPolicy={remote ? 'no-referrer' : undefined}
          onError={() => { if (remote) setPinFailed(true) }}
          className='w-full h-full object-cover'
          style={style}
        />
      )}
    </div>
  )
}

export default Plate
