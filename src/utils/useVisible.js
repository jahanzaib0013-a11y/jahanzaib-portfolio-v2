import { useState, useEffect } from 'react'

// Returns true while the referenced element is on (or near) screen.
// Used to pause off-screen WebGL canvases without any visual change:
// they resume ~300px before entering the viewport.
export default function useVisible(ref, rootMargin = '300px') {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])

  return visible
}
