import { useState, useEffect } from 'react';

import { SOCIALS } from './icons/SocialIcons';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'work', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
];

// The live clock blinks its colon — a machine that is obviously running,
// not a screenshot of a time. Only the FIRST colon is the blinking one:
// "05:19:43 PM" splits into "05" + ":" + "19:43 PM", so the seconds and the
// meridiem survive the cut.
const Clock = ({ time }) => {
  if (!time) return <span>--:--:--</span>;
  const cut = time.indexOf(':');
  if (cut === -1) return <span>{time}</span>;
  return (
    <>
      {time.slice(0, cut)}
      <span className='clock-blink' aria-hidden='true'>:</span>
      {time.slice(cut + 1)}
    </>
  );
};

const Footer = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    /* data-tone keeps the token vocabulary flipping all the way down; the
       night background makes the finale continuous with Contact above. */
    <footer data-tone='dark' className='w-full bg-night border-t border-rule py-14'>
      <div className='shell grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10'>
        {/* Identity */}
        <div>
          <p className='font-display text-h3 text-ink tracking-tight'>Jahanzaib Iftikhar</p>
          <p className='mt-2 text-caption text-graphite'>
            Full-Stack AI Engineer · Node.js · Next.js · PostgreSQL
          </p>
          <p className='mt-4 flex items-center gap-2 font-mono text-eyebrow uppercase text-ok'>
            <span className='w-1.5 h-1.5 rounded-full bg-ok animate-pulse' aria-hidden='true' />
            Available for new work
          </p>
          <div className='mt-5 flex items-center gap-4 text-graphite'>
            {SOCIALS.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target='_blank'
                rel='noreferrer'
                aria-label={name}
                className='transition-colors duration-200 hover:text-ink'
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Local time */}
        <div>
          <p className='font-mono text-eyebrow uppercase text-mute'>Local Time (PKT)</p>
          <p className='mt-3 font-mono text-[1.75rem] tabular-nums text-ink leading-none'>
            <Clock time={time} />
          </p>
          <p className='mt-2 text-caption text-graphite'>Gujranwala, Pakistan</p>
        </div>

        {/* Index */}
        <nav aria-label='Footer' className='md:text-right'>
          <p className='font-mono text-eyebrow uppercase text-mute'>Index</p>
          <div className='mt-3 flex flex-wrap gap-x-5 gap-y-2 text-label font-medium text-graphite md:justify-end'>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className='rule-link hover:text-ink transition-colors'>
                {n.label}
              </a>
            ))}
          </div>
          <p className='mt-5 font-mono text-eyebrow uppercase text-mute'>
            © {new Date().getFullYear()} Jahanzaib Iftikhar
          </p>
        </nav>
      </div>

      {/* Closing credits — tiny, mono, last word of the theater. */}
      <div className='shell mt-12 pt-6 border-t border-rule flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
        <p className='font-mono text-eyebrow uppercase text-mute'>
          Designed &amp; built by Jahanzaib — Three.js · GSAP · Framer Motion
        </p>
      </div>
    </footer>
  );
};

export default Footer;
