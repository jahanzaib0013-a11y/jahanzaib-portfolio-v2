import { useEffect, useRef, useState } from 'react'

import { noHoverDevice, prefersReducedMotion } from '../utils/scroll'

/**
 * WipeReveal — a fading scratch overlay.
 *
 * The image is hidden under a white canvas. Moving the cursor erases the canvas
 * in a soft brush, revealing the image underneath — but the wipe fades back to
 * white on its own, like water soaking in and drying out. Only the recently
 * wiped area stays visible.
 *
 * Touch gets the same reveal without the gesture: the row wipes itself once, the
 * first time it is well on screen, along a scripted path, and dries on exactly the
 * clock a scratch would. Finger-scratching is gone there — it fought the page's
 * scroll — so a swipe across the row moves the page like any other pixel.
 */
const BRUSH_RADIUS = 30
const BRUSH_SOFTNESS = 0.6
// How fast old wipes fade back to white (higher = faster). Applied per frame.
const FADE_RATE = 0.038
// Frames the wiped image stays fully clear after the cursor stops, before any
// drying begins.
const HOLD_FRAMES = 30
// Drying frames after the hold, before the overlay snaps fully white so the
// image never leaves a faint ghost behind.
const DRY_FRAMES = 70
// Seconds the scripted touch wipe takes to sweep the row — in the rhythm of a
// real hand stroke, a touch slower.
const AUTO_SECONDS = 1.6

const WipeReveal = ({ children, className }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const lastPos = useRef(null)
  const strokePos = useRef(null)
  const moved = useRef(false)
  const idle = useRef(0)
  const animFrame = useRef(null)
  // The scripted reveal for touch: { t, active }, advanced by the same draw loop.
  const auto = useRef({ t: 0, active: false })
  // The draw loop parks when the row is idle; this is how the auto-wipe wakes it.
  const wakeRef = useRef(null)
  // Both fixed for the life of the page — a visitor neither grows nor loses a
  // hover mid-visit — so they are detected once, at mount.
  const [touch] = useState(() => noHoverDevice())
  const [calm] = useState(() => prefersReducedMotion())

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#f7f6f9'
      ctx.fillRect(0, 0, rect.width, rect.height)
    }

    const eraseAt = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out'
      const grad = ctx.createRadialGradient(x, y, 0, x, y, BRUSH_RADIUS)
      grad.addColorStop(0, 'rgba(0,0,0,1)')
      grad.addColorStop(BRUSH_SOFTNESS, 'rgba(0,0,0,0.7)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }

    let lastNow = performance.now()

    // Erase a continuous line from the last erased point to (x, y), interpolating
    // between frames so fast strokes stay a line instead of dots. The cursor and
    // the scripted auto-wipe share it.
    const strokeTo = (x, y) => {
      const prev = strokePos.current
      if (prev) {
        const dx = x - prev.x
        const dy = y - prev.y
        const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 8))
        for (let s = 1; s <= steps; s++) {
          eraseAt(prev.x + (dx * s) / steps, prev.y + (dy * s) / steps)
        }
      } else {
        eraseAt(x, y)
      }
      strokePos.current = { x, y }
    }

    const draw = (now) => {
      animFrame.current = null
      const dt = Math.min((now - lastNow) / 1000, 0.05)
      lastNow = now

      if (auto.current.active) {
        // The scripted wipe: one pass left to right, a slow sine through the middle
        // of the row, then hand over to the same hold → dry → opaque-white cycle a
        // real scratch gets.
        auto.current.t = Math.min(1, auto.current.t + dt / AUTO_SECONDS)
        const t = auto.current.t
        strokeTo(
          container.offsetWidth * (0.08 + 0.84 * t),
          container.offsetHeight * (0.5 + Math.sin(t * Math.PI * 2) * 0.15),
        )
        if (t >= 1) {
          auto.current.active = false
          strokePos.current = null
          idle.current = 0
        }
      } else if (moved.current && lastPos.current) {
        // The stroke only breaks when the cursor leaves the row or the canvas
        // fully dries.
        const cur = lastPos.current
        strokeTo(cur.x, cur.y)
        moved.current = false
        idle.current = 0
      } else if (idle.current < HOLD_FRAMES) {
        // Hold: the wipe stays fully clear for a beat before drying begins.
        idle.current++
      } else if (idle.current < HOLD_FRAMES + DRY_FRAMES) {
        // Drying: translucent white coats cover the trail a little each frame.
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = `rgba(247, 246, 249, ${FADE_RATE})`
        ctx.fillRect(0, 0, container.offsetWidth, container.offsetHeight)
        idle.current++
      } else if (idle.current === HOLD_FRAMES + DRY_FRAMES) {
        // One opaque coat guarantees pure white — translucent layers stall just
        // short of full coverage and leave a permanent ghost.
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = '#f7f6f9'
        ctx.fillRect(0, 0, container.offsetWidth, container.offsetHeight)
        strokePos.current = null
        idle.current++
      }

      // The loop runs only while there are frames worth painting; an idle row parks
      // it instead of repainting white sixty times a second until the page closes.
      // Strokes and the auto-wipe wake it, and the last coat above is its last
      // frame — nothing new draws after it.
      if (auto.current.active || moved.current || idle.current <= HOLD_FRAMES + DRY_FRAMES) {
        animFrame.current = requestAnimationFrame(draw)
      }
    }

    // Idempotent: an event landing mid-frame simply joins the running loop.
    const wake = () => {
      if (animFrame.current == null) animFrame.current = requestAnimationFrame(draw)
    }
    wakeRef.current = wake

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const onMove = (e) => {
      e.preventDefault()
      lastPos.current = getPos(e)
      moved.current = true
      wake()
    }

    const onLeave = () => {
      lastPos.current = null
      strokePos.current = null
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseenter', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    // Touch listeners exist only for hover devices that happen to have a
    // touchscreen too — the same devices that keep `touch-none` below. On a real
    // phone the row is plain scrollable content and the auto-wipe is the reveal.
    if (!touch) {
      canvas.addEventListener('touchstart', onMove, { passive: false })
      canvas.addEventListener('touchmove', onMove, { passive: false })
      canvas.addEventListener('touchend', onLeave)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()
    wake()

    return () => {
      if (animFrame.current != null) cancelAnimationFrame(animFrame.current)
      wakeRef.current = null
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseenter', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('touchstart', onMove)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onLeave)
      ro.disconnect()
    }
  }, [touch])

  // The touch reveal: the row wipes itself once, the first time it is half on
  // screen — then dries on the same clock a scratch would. Reduced motion skips the
  // whole thing; the cover simply stays, which is the resting state anyway.
  useEffect(() => {
    if (!touch || calm) return
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        auto.current = { t: 0, active: true }
        wakeRef.current?.()
      },
      { threshold: 0.5 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [touch, calm])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className || ''}`}>
      {children}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full cursor-crosshair ${touch ? 'touch-pan-y' : 'touch-none'}`}
        style={{ zIndex: 2 }}
      />
    </div>
  )
}

export default WipeReveal
