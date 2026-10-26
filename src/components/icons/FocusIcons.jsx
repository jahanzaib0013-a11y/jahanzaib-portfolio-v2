/**
 * Concept glyphs for the three capability rows in the Engineering focus list.
 * Stroke-based rather than filled brand geometry, which is the honest split:
 * a capability is an idea, so it gets a drawn mark, while a named product gets
 * its real logo from icons/TechLogos.jsx. The two read differently on purpose.
 *
 * Hand-written in the same style as icons/SocialIcons.jsx so this section needs
 * no icon package in the bundle.
 */

export const WebIcon = ({ size = 19, strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={strokeWidth}
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
    aria-hidden='true'
  >
    <rect x='2.5' y='3.5' width='13' height='9.5' rx='1.6' />
    <path d='M9 13v3.5M6.5 16.5h5' />
    <rect x='17.5' y='8.5' width='4' height='11' rx='1.3' />
  </svg>
)

export const AiIcon = ({ size = 19, strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={strokeWidth}
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
    aria-hidden='true'
  >
    <circle cx='6' cy='6' r='2.2' />
    <circle cx='18' cy='6' r='2.2' />
    <circle cx='12' cy='17.5' r='2.4' />
    <path d='M8.2 6h7.6M7.9 7.9l2.8 7.6M16.1 7.9l-2.8 7.6' />
  </svg>
)

export const SystemsIcon = ({ size = 19, strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={strokeWidth}
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
    aria-hidden='true'
  >
    <rect x='3' y='4' width='18' height='6.5' rx='1.6' />
    <rect x='3' y='13.5' width='18' height='6.5' rx='1.6' />
    <path d='M7 7.25h.01M7 16.75h.01M11 7.25h6M11 16.75h6' />
  </svg>
)
