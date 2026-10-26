// One source for the two brand marks the navbar and the footer both draw.
// 17px matches the navbar's strip; the footer uses the same size for parity.

export const GithubIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.02 10.02 0 0 0 22 12c0-5.52-4.48-10-10-10z'/>
  </svg>
)

export const LinkedinIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V10.2H6.1V17h2.24zM7.22 9.24a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM18 17v-3.73c0-2-.43-3.53-2.76-3.53-1.12 0-1.87.61-2.18 1.2h-.03v-1.01H10.9V17h2.24v-3.36c0-.89.17-1.75 1.27-1.75 1.08 0 1.1 1.01 1.1 1.81V17H18z'/>
  </svg>
)

export const SOCIALS = [
  { name: 'GitHub', url: 'https://github.com/jahanzaib0013-a11y', Icon: GithubIcon },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/jahanzaib-iftikhar-227298223', Icon: LinkedinIcon },
]
