import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { SectionWrapper } from "../hoc";
import { fadeIn } from "../utils/motion";
import { gsap, motionGated } from "../utils/gsapClient";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

const EMAIL = "jahanzaib0013@gmail.com";
const PHONE = "+923184129599";
const PHONE_DISPLAY = "+92 318 4129599";
const CAL_30 = "https://cal.com/jahan-zaib-hbyjx4/30min";
const EMAIL_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent("Hello Jahanzaib — Project / Role Inquiry")}`;

const Arrow = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' className='inline-block shrink-0'>
    <path d='M7 17L17 7M9 7h8v8' />
  </svg>
);

// The CTA leans a few pixels toward the cursor while it is nearby — the last
// bit of life before the credits. Wide, calm, mouse-driven screens only; on
// touch and under reduced motion the button simply sits still.
const MAGNET_RADIUS = 90;
const MAGNET_PULL = 6;

function useMagnetic(elRef) {
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (!motionGated() || !window.matchMedia("(min-width: 900px) and (pointer: fine)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      if (Math.abs(dx) < MAGNET_RADIUS && Math.abs(dy) < MAGNET_RADIUS) {
        xTo((dx / MAGNET_RADIUS) * MAGNET_PULL);
        yTo((dy / MAGNET_RADIUS) * MAGNET_PULL);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    // Listen on the parent, not the button: once the pill shifts, its own
    // pointermove stream would stutter as the cursor slips off it.
    const zone = el.parentElement ?? el;
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", onLeave);
    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [elRef]);
}

const Row = ({ label, title, detail, action, secondary }) => (
  <div className='grid grid-cols-1 md:grid-cols-[168px_1fr_auto] gap-x-10 gap-y-3 py-7 border-t border-rule'>
    <p className='font-mono text-eyebrow uppercase text-blueprint pt-1'>{label}</p>

    <div className='min-w-0'>
      <p className='text-[0.9375rem] font-medium text-ink'>{title}</p>
      <p className='mt-1 text-caption text-graphite break-words'>{detail}</p>
    </div>

    <div className='flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end'>
      {secondary}
      {action}
    </div>
  </div>
);

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const ctaRef = useRef(null);
  useMagnetic(ctaRef);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const linkCls = "rule-link inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink hover:text-blueprint";

  return (
    <>
      {/* The closing line, spoken before the rows: the theater's last frame
          gets the display type it deserves. One h2 per line — the mask box
          is a div, and a div has no business inside a heading. */}
      <div className='mb-12'>
        <Reveal y={24} duration={0.8}>
          <h2 className='font-display text-h1 text-ink leading-[1.05] tracking-[-0.015em]'>
            Let&rsquo;s build
          </h2>
        </Reveal>
        <Reveal y={24} duration={0.8} delay={0.08}>
          <h2 className='font-display text-h1 text-ink leading-[1.05] tracking-[-0.015em]'>
            something that ships.
          </h2>
        </Reveal>
      </div>

      <SectionHead
        index='07'
        title='Get in touch'
        meta='Replies within a day'
        blurb='Hiring, or have a production AI project that needs building end to end? Pick whichever channel suits you.'
      />

      <motion.div variants={fadeIn('', '', 0.1, 1)}>
        <Row
          label='Schedule'
          title='30-minute call'
          detail='Pick a slot — a Google Meet invite is sent automatically.'
          action={
            <a
              ref={ctaRef}
              href={CAL_30}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 h-11 px-5 rounded-card bg-night-ink text-night text-[0.9375rem] font-medium transition-colors duration-200 hover:bg-night-accent'
            >
              Open calendar <Arrow />
            </a>
          }
        />

        <Row
          label='Email'
          title={EMAIL}
          detail='Best for role specs, project scope and anything with attachments.'
          secondary={
            <button
              type='button'
              onClick={copyEmail}
              className='font-mono text-eyebrow uppercase text-mute hover:text-blueprint transition-colors duration-200 cursor-pointer'
            >
              {copied ? "Copied" : "Copy"}
            </button>
          }
          action={
            <a href={EMAIL_HREF} className={linkCls}>
              Write <Arrow />
            </a>
          }
        />
        <span aria-live='polite' className='sr-only'>{copied ? "Email address copied" : ""}</span>

        <Row
          label='Phone'
          title={PHONE_DISPLAY}
          detail='Call or WhatsApp, weekdays 10:00–19:00 PKT.'
          action={
            <a href={`tel:${PHONE}`} className={linkCls}>
              Call <Arrow />
            </a>
          }
        />
      </motion.div>
    </>
  );
};

export default SectionWrapper(Contact, "contact", { dark: true });
