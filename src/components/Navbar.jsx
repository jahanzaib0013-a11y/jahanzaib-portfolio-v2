import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

import { styles } from '../style'
import { navLinks } from '../constants/index'
import { SOCIALS } from './icons/SocialIcons'

const Navbar = () => {
  const [active, setActive] = useState('')
  const [toggle, setToggle] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // The header strip is 64px; anything living inside it gets to pick the
  // navbar's palette. The hero already dims the room itself (`house-dark`,
  // written by TheaterScreen); this does the same for the standing dark
  // sections. A count, not a some(): two dark moments can brush the strip
  // together across a boundary — the class lifts only when none do.
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-tone='dark']")
    if (!nodes.length) return

    // One rAF-throttled subscription (shared helper — same one the stages use).
    let raf = 0
    const measure = () => {
      let under = 0
      nodes.forEach((n) => {
        const rect = n.getBoundingClientRect()
        // Overlaps the header band [0, 64)?
        if (rect.top < 64 && rect.bottom > 0) under += 1
      })
      document.documentElement.classList.toggle('inverted', under > 0)
      raf = 0
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      // Leave no residue for the hero's own mechanism to fight with.
      document.documentElement.classList.remove('inverted')
    }
  }, [])

  // 1px progress hairline. A light spring keeps it fluid without a rAF of its own.
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = navLinks
      .map((nav) => document.getElementById(nav.id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const match = navLinks.find((nav) => nav.id === visible.target.id)
          if (match) setActive(match.title)
        }
      },
      { rootMargin: '-72px 0px -55% 0px', threshold: [0.15, 0.5] }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
        scrolled ? 'bg-paper/95 backdrop-blur-sm border-b border-rule' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className={`${styles.shell} ${styles.paddingX} flex justify-between items-center h-16`}>
        <a
          href={import.meta.env.BASE_URL}
          className='flex items-baseline gap-2.5 group'
          onClick={(e) => {
            e.preventDefault()
            setActive('')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <span className='font-display text-[0.9375rem] font-bold tracking-[-0.01em] text-ink'>
            Jahanzaib
          </span>
          <span className='hidden xs:inline font-mono text-eyebrow uppercase text-mute group-hover:text-blueprint transition-colors duration-200'>
            AI Engineer
          </span>
        </a>

        {/* Desktop links */}
        <ul className='hidden lg:flex items-center gap-8'>
          {navLinks.map((nav) => {
            const isActive = active === nav.title
            return (
              <li key={nav.id}>
                <a
                  href={`#${nav.id}`}
                  onClick={() => setActive(nav.title)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative font-mono text-eyebrow uppercase pb-1 transition-colors duration-200 ${
                    isActive ? 'text-ink' : 'text-mute hover:text-ink'
                  }`}
                >
                  {nav.title}
                  <span
                    className={`absolute left-0 -bottom-px h-px w-full origin-left bg-blueprint transition-transform duration-200 ease-out ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    aria-hidden='true'
                  />
                </a>
              </li>
            )
          })}
        </ul>

        {/* Desktop right */}
        <div className='hidden lg:flex items-center gap-5'>
          <span className='inline-flex items-center gap-2 font-mono text-eyebrow uppercase text-graphite'>
            <span className='w-1.5 h-1.5 rounded-full bg-flare animate-pulse' aria-hidden='true' />
            Available
          </span>
          <div className='flex items-center gap-3 pl-5 border-l border-rule text-graphite'>
            {SOCIALS.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target='_blank'
                rel='noreferrer'
                aria-label={name}
                className='transition-colors duration-200 hover:text-blueprint'
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className='lg:hidden'>
          <button
            type='button'
            onClick={() => setToggle(!toggle)}
            aria-label={toggle ? 'Close menu' : 'Open menu'}
            aria-expanded={toggle}
            className='w-10 h-10 -mr-2 flex flex-col items-center justify-center gap-[5px] text-ink'
          >
            <span className={`block w-[18px] h-px bg-current transition-transform duration-200 ${toggle ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`block w-[18px] h-px bg-current transition-transform duration-200 ${toggle ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Scroll-progress hairline under the fixed header — the page telling you how far in it is,
          without a scrollbar's coarseness. Inverts with the room. */}
      <motion.div
        aria-hidden='true'
        className='scroll-progress absolute left-0 bottom-0 h-px w-full origin-left'
        style={{ scaleX: progress }}
      />

      {toggle && (
        <div className='lg:hidden bg-paper border-t border-rule nav-mobile-panel'>
          <ul className={`${styles.shell} ${styles.paddingX} py-2`}>
            {navLinks.map((nav) => (
              <li key={nav.id} className='border-b border-rule last:border-b-0'>
                <a
                  href={`#${nav.id}`}
                  onClick={() => {
                    setToggle(false)
                    setActive(nav.title)
                  }}
                  className='block py-4 font-mono text-label uppercase text-ink'
                >
                  {nav.title}
                </a>
              </li>
            ))}
          </ul>
          <div className={`${styles.shell} ${styles.paddingX} py-4 flex items-center justify-between border-t border-rule`}>
            <span className='inline-flex items-center gap-2 font-mono text-eyebrow uppercase text-graphite'>
              <span className='w-1.5 h-1.5 rounded-full bg-flare animate-pulse' aria-hidden='true' />
              Available for roles
            </span>
            <div className='flex items-center gap-4 text-graphite'>
              {SOCIALS.map(({ name, url, Icon }) => (
                <a key={name} href={url} target='_blank' rel='noreferrer' aria-label={name}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
