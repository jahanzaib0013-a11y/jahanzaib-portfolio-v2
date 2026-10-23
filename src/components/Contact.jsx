import React from "react";
import { motion } from "framer-motion";

import { styles } from "../style";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

const Contact = () => {
  const EMAIL = "jahanzaib0013@gmail.com";
  const PHONE = "+923184129599";
  const PHONE_DISPLAY = "+92 318 4129599";
  const meetBody = encodeURIComponent(
    "Hi Jahanzaib,\n\nI'd like to book an interview. A few times that work for me:\n- \n- \n\nLooking forward to it!"
  );
  const meetHref = `mailto:${EMAIL}?subject=${encodeURIComponent("Interview request (Google Meet)")}&body=${meetBody}`;
  const zoomHref = `mailto:${EMAIL}?subject=${encodeURIComponent("Interview request (Zoom)")}&body=${meetBody}`;
  const emailHref = `mailto:${EMAIL}?subject=${encodeURIComponent("Hello Jahanzaib")}`;

  const Icon = ({ d }) => (
    <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>{d}</svg>
  );

  return (
    <div className='xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden'>
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex-[0.85] bg-black-100 p-8 rounded-2xl'
      >
        <p className={styles.sectionSubText}>Get in touch</p>
        <h3 className={styles.sectionHeadText}>Contact.</h3>
        <p className='mt-3 text-secondary text-[15px] leading-[24px]'>
          Hiring or want to work together? Pick whatever's easiest.
        </p>

        {/* quick options */}
        <div className='mt-8 flex flex-col gap-4'>
          {/* Book an interview */}
          <div className='p-5 rounded-xl bg-tertiary border border-white/5'>
            <div className='flex items-center gap-4'>
              <span className='w-11 h-11 rounded-xl bg-[#915eff]/15 flex items-center justify-center text-[#00cea8]'>
                <Icon d={<><rect x='2' y='6' width='14' height='12' rx='2'/><path d='M16 10l6-3v10l-6-3'/></>} />
              </span>
              <div>
                <p className='text-white font-semibold text-[16px]'>Book an Interview</p>
                <p className='text-secondary text-[13px]'>Google Meet or Zoom — I'll send a calendar invite.</p>
              </div>
            </div>
            <div className='mt-4 flex flex-wrap gap-3'>
              <a href={meetHref} className='flex items-center gap-2 px-4 h-10 rounded-full bg-[#915eff] text-white text-[13.5px] font-semibold transition-transform hover:scale-105'>
                <span className='w-2 h-2 rounded-full bg-green-300'/> Google Meet
              </a>
              <a href={zoomHref} className='flex items-center gap-2 px-4 h-10 rounded-full bg-white/10 border border-white/15 text-white text-[13.5px] font-semibold transition-colors hover:bg-white/20'>
                <span className='w-2 h-2 rounded-full bg-[#2D8CFF]'/> Zoom
              </a>
            </div>
          </div>

          {/* Email — opens the visitor's mail client, address not shown */}
          <a href={emailHref} className='group flex items-center gap-4 p-5 rounded-xl bg-tertiary border border-white/5 transition-colors hover:border-[#915eff]/60'>
            <span className='w-11 h-11 shrink-0 rounded-xl bg-[#915eff]/15 flex items-center justify-center text-[#00cea8]'>
              <Icon d={<><rect x='2' y='4' width='20' height='16' rx='2'/><path d='M2 7l10 6 10-6'/></>} />
            </span>
            <div className='min-w-0'>
              <p className='text-white font-semibold text-[16px]'>Email Me</p>
              <p className='text-secondary text-[13px] group-hover:text-white transition-colors'>Opens your mail app — write me directly.</p>
            </div>
            <span className='ml-auto text-[#00cea8] text-[18px] opacity-0 group-hover:opacity-100 transition-opacity'>→</span>
          </a>

          {/* Call */}
          <div className='flex items-center gap-4 p-5 rounded-xl bg-tertiary border border-white/5'>
            <span className='w-11 h-11 shrink-0 rounded-xl bg-[#915eff]/15 flex items-center justify-center text-[#00cea8]'>
              <Icon d={<path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z'/>} />
            </span>
            <div className='min-w-0'>
              <p className='text-white font-semibold text-[16px]'>Call Me</p>
              <p className='text-secondary text-[13px]'>{PHONE_DISPLAY}</p>
            </div>
            <a href={`tel:${PHONE}`} className='ml-auto px-4 h-10 flex items-center rounded-full bg-[#915eff] text-white text-[13.5px] font-semibold transition-transform hover:scale-105 whitespace-nowrap'>
              Call Now
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className='xl:flex-1 xl:h-auto md:h-[550px] h-[350px]'
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
