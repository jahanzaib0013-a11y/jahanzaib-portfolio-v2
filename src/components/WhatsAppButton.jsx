import React from 'react'

const WhatsAppButton = () => {
  const PHONE = '923184129599'; // international, digits only
  const text = encodeURIComponent("Hi Jahanzaib, I saw your portfolio and would like to connect.");
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${text}`}
      target='_blank'
      rel='noreferrer'
      aria-label='Chat on WhatsApp'
      title='Chat on WhatsApp'
      className='fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(37,211,102,0.7)] transition-transform hover:scale-110'
    >
      <span className='absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60 animate-ping' />
      <svg width='30' height='30' viewBox='0 0 24 24' fill='#fff' className='relative'>
        <path d='M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.01c-.24.68-1.42 1.31-1.95 1.35-.5.05-.96.24-3.23-.67-2.73-1.08-4.46-3.86-4.6-4.04-.13-.18-1.1-1.46-1.1-2.79 0-1.33.7-1.98.94-2.25.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.81 2 .88 2.15.07.14.12.31.02.49-.09.18-.14.29-.28.45-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.27.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.18.69-.81.88-1.08.18-.27.36-.23.61-.14.25.09 1.6.76 1.87.9.27.14.45.2.52.32.07.11.07.66-.17 1.34z'/>
      </svg>
    </a>
  )
}

export default WhatsAppButton
