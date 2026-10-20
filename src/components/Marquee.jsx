import React from 'react'
import { technologies } from '../constants'

const Marquee = () => {
  const items = [...technologies, ...technologies];
  return (
    <div className='relative w-full border-y border-white/5 bg-black-100/40 py-6'>
      <div className='marquee-mask overflow-hidden'>
        <div className='animate-marquee flex w-max items-center gap-12'>
          {items.map((tech, i) => (
            <div key={i} className='flex items-center gap-3 shrink-0'>
              <img src={tech.icon} alt={tech.name} className='w-7 h-7 object-contain' />
              <span className='text-secondary text-[16px] font-semibold whitespace-nowrap'>
                {tech.name}
              </span>
              <span className='text-[#915eff] text-[18px] ml-9'>◆</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Marquee
