import { useEffect, useRef } from 'react'

import { attachScrollMeasure, clamp01, subscribePin } from '../utils/scroll'

/**
 * The hero's film, shown as a screen in a darkened room.
 *
 * Why a canvas and not an <img> swap: an image can only ever show one still, so at
 * any scroll speed the clip advances in steps. Here the playhead is a real number —
 * frame 72.4 is frame 72 with 40% of frame 73 laid over it — and it is eased on the
 * frame clock, so every pixel of scroll moves the picture a little and a wheel notch
 * glides instead of jumping. With the clip cut at its native 24 fps that reads
 * smoother than the video itself, which can only ever show whole frames.
 *
 * The screen runs from just under the nav to the foot of the page, edge to edge at
 * the sides — so every line of the hero copy sits *on* the picture, and the strip
 * the nav floats on stays room. At rest it holds no light: the page is the plain
 * white room, and the film only surfaces as the lights go down, crossfading out of
 * the paper rather than cutting to it. The frame is cover-fitted into the screen: a
 * little of the sides is cropped on wide windows, never letterboxed.
 *
 * The room is choreographed off raw pixels into the hold (`<stage>:travel`):
 *
 *   lead    house lights go down: terrain, card and spec strip fade, the room goes
 *           dark, the screen comes up to full colour.
 *   scrub   the film plays, every frame; the copy returns over it piece by piece.
 *   wash    the closing frame blurs and whitens, the lights come back up and the
 *           copy turns dark again on the pale picture.
 *   card    the 3D specimen card and the spec strip arrive; the scan re-builds.
 *   hold    nothing moves — a moment to play with the card — then the page goes on.
 *
 * Everything is written as CSS variables on <html> (`--house` 0 lit → 1 dark,
 * `--reel` 0 → 1 clip, `--wash`, `--card`), never React state, so nothing
 * re-renders while the reader scrolls.
 *
 * Mounted in one of two ways. On a wide, calm screen <StagePin /> publishes a
 * playhead for the reader's scroll wheel to push around. On a narrow, calm screen
 * there is no wheel worth scrubbing with, so the film clocks itself: the `auto`
 * path plays the same travel once, lead to card, and stops sitting exactly where
 * the static hero already sits — no reader input, same closing frame, same card.
 * After that pass, scrolling back up toward the hero rewinds the reel through the
 * same travel in reverse, settling on frame one at the top of the page; it never
 * plays forward again on its own. Reduced motion or save data gets neither mode;
 * the hero is the scene it has always been.
 */
const frameUrl = (plate, n) =>
  `/stages/${plate.id}/frame-${String(n).padStart(3, '0')}.${plate.frameExt || 'webp'}`

const smooth = (x) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

// Easing rate for the playhead, per second. Higher is tighter to the scroll wheel.
const RATE = 9

const TheaterScreen = ({ plate, auto = false, paused = false }) => {
  const canvasRef = useRef(null)
  const counterRef = useRef(null)
  const barRef = useRef(null)
  // The auto clock lives inside the effect below; these two let the pause effect
  // reach it without re-running that effect (a re-run would re-pump every frame).
  const pausedRef = useRef(paused)
  const clockRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const root = document.documentElement
    const ctx = canvas.getContext('2d', { alpha: false })
    const n = plate.frameCount
    const lead = plate.leadPx ?? 0
    const scrub = plate.scrubPx
    const wash = plate.washPx ?? 0
    const card = plate.cardPx ?? 0
    const filmEnd = lead + scrub
    const washEnd = filmEnd + wash

    const images = new Array(n)
    const ready = new Uint8Array(n)
    let target = 0
    let current = 0
    let frame = 0
    let last = 0
    let disposed = false
    let drawn = -1
    let cardShown = true

    // ---- the timeline ----------------------------------------------------------

    const levels = (t) => {
      const down = lead > 0 ? smooth(t / lead) : 1
      const washed = wash > 0 ? smooth((t - filmEnd) / wash) : t > filmEnd ? 1 : 0
      const house = down * (1 - washed)
      // Before the film ends the card simply leaves with the lights; after it, it
      // waits for the wash to finish and then has its own entrance.
      const cardIn =
        t <= filmEnd ? 1 - house : card > 0 ? smooth((t - washEnd) / card) : t > washEnd ? 1 : 0
      // Terrain fades out during the lead and stays hidden through wash/hold — only
      // the white paper remains once the film has started.
      const terrain = t < lead ? smooth(1 - t / lead) : 0
      return { house, washed, cardIn, terrain }
    }

    // ---- drawing ---------------------------------------------------------------

    const loadedAtOrBelow = (i) => {
      for (let k = i; k >= 0; k--) if (ready[k]) return images[k]
      for (let k = i + 1; k < n; k++) if (ready[k]) return images[k]
      return null
    }

    // Cover-fit: crop the source to the screen's aspect, centred.
    const blit = (img, alpha) => {
      const w = canvas.width
      const h = canvas.height
      const sw = img.naturalWidth || plate.frameWidth
      const sh = img.naturalHeight || plate.frameHeight
      const screen = w / h
      let cw = sw
      let ch = sh
      if (screen > sw / sh) ch = sw / screen
      else cw = sh * screen
      ctx.globalAlpha = alpha
      ctx.drawImage(img, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, w, h)
    }

    const paint = (playhead) => {
      const a = Math.floor(playhead)
      const b = Math.min(n - 1, a + 1)
      const mix = playhead - a
      const base = loadedAtOrBelow(a)
      if (!base) return
      blit(base, 1)
      // Lay the next frame over at the fractional part: a straight linear blend,
      // A·(1−m) + B·m, which is what makes the motion continuous between stills.
      if (b !== a && mix > 0.002 && ready[b]) blit(images[b], mix)
      ctx.globalAlpha = 1
    }

    const draw = (force) => {
      const t = current
      const { house, washed, cardIn, terrain } = levels(t)
      root.style.setProperty('--house', house.toFixed(4))
      root.style.setProperty('--wash', washed.toFixed(4))
      root.style.setProperty('--card', cardIn.toFixed(4))
      root.style.setProperty('--terrain', terrain.toFixed(4))
      root.classList.toggle('house-dark', house > 0.5)
      root.classList.toggle('card-away', cardIn < 0.5)

      // The scan re-builds itself as the card comes back after the film.
      const showing = cardIn > 0.15
      if (showing && !cardShown && t > filmEnd) window.dispatchEvent(new Event('hero:rescan'))
      cardShown = showing

      const playhead = clamp01((t - lead) / scrub) * (n - 1)
      // How far through the clip, 0–1, for anything timed to the film itself — the
      // hero copy arrives over the picture piece by piece on this clock.
      root.style.setProperty('--reel', (playhead / (n - 1)).toFixed(4))

      // Past the last frame nothing in the picture changes; don't repaint it.
      if (force || Math.abs(playhead - drawn) > 0.0005) {
        paint(playhead)
        drawn = playhead
      }

      const shown = Math.min(n, Math.round(playhead) + 1)
      if (counterRef.current) {
        counterRef.current.textContent = `${String(shown).padStart(3, '0')} / ${n}`
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${(playhead / (n - 1)).toFixed(4)})`

      if (import.meta.env.DEV) {
        window.__theater = {
          travel: Math.round(t),
          target: Math.round(target),
          playhead,
          frame: shown,
          house,
          wash: washed,
          card: cardIn,
        }
      }
    }

    // ---- the playhead's clock ----------------------------------------------------

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      current += (target - current) * (1 - Math.exp(-RATE * dt))
      if (Math.abs(target - current) < 0.35) current = target
      draw()
      frame = current !== target ? window.requestAnimationFrame(step) : 0
    }

    const kick = () => {
      if (disposed) return
      // No frame clock in a background tab: land on the target so whatever is
      // measured or restored there is exact, not a stale ease.
      if (document.hidden) {
        if (frame) window.cancelAnimationFrame(frame)
        frame = 0
        current = target
        draw()
        return
      }
      if (!frame) {
        last = performance.now()
        frame = window.requestAnimationFrame(step)
      }
    }

    let unsubscribe = () => {}
    let stopClock = () => {}

    if (auto) {
      // ---- the auto film's clock ------------------------------------------------
      //
      // There is no scroll wheel on the device this serves, so wall-clock time
      // stands in for one: the film plays itself through the same travel the scrub
      // would have covered, in the same order — lead, film, wash, card — and stops
      // on the end state the static hero already sits at.
      const LEAD_S = 0.9
      const WASH_S = 0.9
      const CARD_S = 0.9
      const FILM_S = (n - 1) / 24
      const total = LEAD_S + FILM_S + WASH_S + CARD_S
      const travelAt = (s) => {
        if (s < LEAD_S) return (lead * s) / LEAD_S
        if (s < LEAD_S + FILM_S) return lead + (scrub * (s - LEAD_S)) / FILM_S
        if (s < LEAD_S + FILM_S + WASH_S)
          return lead + scrub + (wash * (s - LEAD_S - FILM_S)) / WASH_S
        return lead + scrub + wash + (card * (s - LEAD_S - FILM_S - WASH_S)) / CARD_S
      }

      let elapsed = 0
      let autoLast = 0
      let autoFrame = 0
      // Latched when the one forward pass is over, never cleared: rewinding the
      // film must not "unfinish" it, or a pause/resume flip could restart the
      // clock. The film plays forward exactly once per visit.
      let finished = false

      // The clock only decides where the playhead should be; the move itself is the
      // same eased `step()` the scrub path uses, so the film reads identically.
      const tick = (now) => {
        autoFrame = 0
        const dt = Math.min((now - autoLast) / 1000, 0.05)
        autoLast = now
        elapsed = Math.min(elapsed + dt, total)
        if (elapsed >= total) finished = true
        target = travelAt(elapsed)
        kick()
        if (elapsed < total) autoFrame = window.requestAnimationFrame(tick)
      }

      stopClock = () => {
        if (autoFrame) window.cancelAnimationFrame(autoFrame)
        autoFrame = 0
      }
      const startClock = () => {
        if (disposed || autoFrame || finished) return
        autoLast = performance.now()
        autoFrame = window.requestAnimationFrame(tick)
      }

      // The rewind. The clock is done, but the reader can still ask for the film
      // back: scrolling up while any part of the hero is on screen walks `elapsed`
      // back down, and the same eased `step()` that played the reel out plays it in
      // reverse — no second clock, just a lower target for the one that exists.
      // The rewind is metered so one hero-height of upward scroll spans the whole
      // pass, which lands the reel on frame one just as the page reaches its top.
      // Scrolling down again buys nothing, and the film never restarts on its own.
      const section = canvas.closest('section')
      const rewindPerPx = total / Math.max(480, section?.offsetHeight || window.innerHeight)
      let lastY = window.scrollY
      unsubscribe = attachScrollMeasure(() => {
        const y = Math.max(0, window.scrollY)
        const dy = y - lastY
        lastY = y
        // Only once the pass is over, only upward, only with the hero in sight.
        if (!finished || dy >= 0) return
        const rect = section?.getBoundingClientRect()
        if (!rect || rect.bottom <= 0) return
        const up = -dy
        elapsed = Math.max(0, elapsed - up * rewindPerPx)
        // Scroll top: the film settles on frame one, the timeline on zero.
        if (y <= 1) elapsed = 0
        target = travelAt(elapsed)
        kick()
      })

      clockRef.current = { start: startClock, stop: stopClock }
      if (!pausedRef.current) startClock()
    } else {
      unsubscribe = subscribePin(`${plate.id}:travel`, (v) => {
        target = v ?? 0
        kick()
      })
      // A cold load can land mid-hold (restored scroll): start there, don't ease in.
      current = target
    }

    // ---- sizing --------------------------------------------------------------------

    const resize = () => {
      const box = canvas.parentElement.getBoundingClientRect()
      if (!(box.width > 0 && box.height > 0)) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(box.width * dpr)
      canvas.height = Math.round(box.height * dpr)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      draw(true)
    }
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
    ro?.observe(canvas.parentElement)
    resize()

    // ---- frames, in order, a few at a time ------------------------------------------

    let cursor = 0
    const pump = () => {
      if (disposed || cursor >= n) return
      const i = cursor++
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (disposed) return
        ready[i] = 1
        // Repaint only if this still is anywhere near what is on screen.
        const near = clamp01((current - lead) / scrub) * (n - 1)
        if (Math.abs(i - near) < 2 || i === 0) draw(true)
        pump()
      }
      img.onerror = pump
      img.src = frameUrl(plate, i + 1)
      images[i] = img
    }
    for (let k = 0; k < 6; k++) pump()

    if (import.meta.env.DEV) window.__theaterReady = () => ready.reduce((s, v) => s + v, 0)

    return () => {
      disposed = true
      stopClock()
      clockRef.current = null
      unsubscribe()
      ro?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      for (const v of ['--house', '--reel', '--wash', '--card', '--terrain']) root.style.removeProperty(v)
      root.classList.remove('house-dark', 'card-away')
    }
  }, [plate, auto])

  // Pause control for the auto clock, on its own effect so flipping it never
  // re-initialises the film: the clock keeps its elapsed time and resumes where it
  // left off. Once the pass is finished the start is a no-op, so leaving and
  // returning to the hero can never restart the film — from there only the rewind
  // moves the playhead. The scrub path has no use for it — its playhead is wherever
  // the reader's scroll left it, screen or no screen.
  useEffect(() => {
    pausedRef.current = paused
    if (!auto) return
    if (paused) clockRef.current?.stop()
    else clockRef.current?.start()
  }, [paused, auto])

  return (
    <div className='absolute inset-0 pointer-events-none' aria-hidden='true'>
      {/* The room. */}
      <div className='absolute inset-0 bg-[#09080d]' style={{ opacity: 'var(--house, 0)' }} />

      {/* The screen: from under the nav to the foot of the page, edge to edge —
          no frame, no letterbox. Invisible at rest; it surfaces with the lights.
          `data-film` names this rectangle for anything that has to keep out of it —
          the mascot reads it to stay off the picture. */}
      <figure data-film className='absolute top-16 inset-x-0 bottom-0'>
        <div className='absolute inset-0 overflow-hidden'>
          <canvas
            ref={canvasRef}
            className='block w-full h-full'
            style={{
              // 0 while the room is lit — the white page, nothing else — then up
              // with the lights and held through the wash by the same max().
              opacity: 'max(var(--house, 0), var(--wash, 0))',
              // The closing frame goes soft and pale, a backdrop for the card.
              filter:
                'blur(calc(var(--wash, 0) * 9px)) saturate(calc(1 - 0.35 * var(--wash, 0)))',
              transform: 'scale(calc(1 + 0.04 * var(--wash, 0)))',
            }}
          />
          {/* White wash over the closing frame — full opacity so the picture
              dissolves into the page's paper rather than lingering behind it. */}
          <div className='absolute inset-0 bg-paper' style={{ opacity: 'var(--wash, 0)' }} />
          {/* A soft shade on the side the copy sits on, so the titles read over any
              frame. Only with the lights down. */}
          <div
            className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent'
            style={{ opacity: 'var(--house, 0)' }}
          />
        </div>

        {/* Slate: reel, timecode and a progress rule, laid over the foot of the
            picture, only once the lights are down. */}
        <figcaption
          className='absolute left-0 right-0 bottom-3 px-6 sm:px-10 lg:px-14 font-mono text-eyebrow uppercase text-white/55'
          style={{ opacity: 'var(--house, 0)' }}
        >
          <div className='h-px w-full bg-white/15 overflow-hidden'>
            <div ref={barRef} className='h-full w-full origin-left bg-flare' style={{ transform: 'scaleX(0)' }} />
          </div>
          <div className='mt-1.5 flex items-baseline justify-between gap-4'>
            <span>Reel 01 · {plate.caption}</span>
            <span ref={counterRef} className='tabular-nums'>
              001 / {plate.frameCount}
            </span>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}

export default TheaterScreen
