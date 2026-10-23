
import { BrowserRouter } from "react-router-dom";

import { About, Blog, Contact, Experience, Feedbacks, Hero, Marquee, Navbar, Tech, Works, WhatsAppButton, StarsCanvas } from "./components";

const App = () => {
  return (
    <BrowserRouter>
      <div className='relative z-0 bg-primary'>
        <div className='bg-hero-pattern bg-cover bg-no-repeat bg-center'>
          <Navbar />
          <Hero />
        </div>
        <Marquee />
        <About />
        <Tech />
        <Experience />
        <Works />
        <Blog />
        {/* <Feedbacks /> */}
        <div className='relative z-0'>
          <Contact />
          <StarsCanvas />
        </div>
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}

export default App;