import React,{useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {styles} from '../style'
import {navLinks} from '../constants/index'
import {logo,menu,close} from '../assets'

const GithubIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.02 10.02 0 0 0 22 12c0-5.52-4.48-10-10-10z'/></svg>
)
const LinkedinIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V10.2H6.1V17h2.24zM7.22 9.24a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM18 17v-3.73c0-2-.43-3.53-2.76-3.53-1.12 0-1.87.61-2.18 1.2h-.03v-1.01H10.9V17h2.24v-3.36c0-.89.17-1.75 1.27-1.75 1.08 0 1.1 1.01 1.1 1.81V17H18z'/></svg>
)

const socials = [
  { name: 'GitHub', url: 'https://github.com/jahanzaib0013-a11y', Icon: GithubIcon },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/jahanzaib-iftikhar-227298223', Icon: LinkedinIcon },
]

const Navbar = () => {
  const [active,setActive]=useState('')
  const[toggle,setToggle]=useState(false)
  return (
    <nav
    className={`${styles.paddingX} w-full flex items-center py-5 fixed top-0 z-20 bg-primary`}>
      <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
        <Link
          to="/"
          className='items-center flex gap-2'
          onClick={()=>{
            setActive("")
            window.scrollTo(0,0)
          }}>
            <img src={logo} alt="logo" className='w-9 h-9 object-contain'></img>
            <p className='text-white text-[18px] font-bold cursor-pointer flex'>
              Jahanzaib &nbsp;
             <span className='sm:block hiddensrc/assets/jahanzaib-high-resolution-logo.png'>| Hero Dev</span>
             </p>
        </Link>
        <div className='hidden sm:flex flex-row items-center gap-8'>
          <ul className='list-none flex flex-row gap-8'>
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`${
                  active === nav.title ? "text-white" : "text-secondary"
                } hover:text-white text-[18px] font-medium cursor-pointer`}
                onClick={() => setActive(nav.title)}
              >
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
          <div className='flex items-center gap-2 pl-2 border-l border-white/10'>
            {socials.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target='_blank'
                rel='noreferrer'
                title={name}
                aria-label={name}
                className='w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-secondary transition-colors hover:text-white hover:border-[#915eff] hover:bg-[#915eff]/15'
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
              <div className='sm:hidden flex flex-1 justify-end items-center'>
              <img src={toggle?close:menu}
              alt='menu'
              className='w-[28px] h-[28px]
              object-contain cursor-pointer'
              onClick={()=>setToggle(!toggle)}/>
              <div className={`${!toggle?"hidden":"flex p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl"}`}>
                <ul className='list-none flex justify-end items-start flex-col gap-4'>
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              className={`${
                active === nav.title ? "text-white" : "text-secondary"
              } font-poppins font-medium text-[16px] cursor-pointer`}
              onClick={() => {setToggle(!toggle); setActive(Link.title)}}
            >
              <a href={`#${nav.id}`}>{nav.title}</a>
            </li>
          ))}
          <li className='flex items-center gap-3 pt-2 mt-1 border-t border-white/10 w-full'>
            {socials.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target='_blank'
                rel='noreferrer'
                aria-label={name}
                className='w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-secondary hover:text-white hover:border-[#915eff]'
              >
                <Icon />
              </a>
            ))}
          </li>
        </ul>
              </div>
              </div>
              

      </div>
    </nav>
  )
}

export default Navbar