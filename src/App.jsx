import { BrowserRouter } from "react-router-dom";

import {
  About,
  ArchitectureShowcase,
  Blog,
  Contact,
  Experience,
  Hero,
  Marquee,
  Mascot,
  Navbar,
  Statement,
  Tech,
  Works,
  WhatsAppButton,
  Footer
} from "./components";

const App = () => {
  return (
    <BrowserRouter>
      <div className='relative z-0 bg-paper'>
        {/* One stacking context above the fixed plate layer, so every section —
            positioned or not — paints over the background instead of under it. */}
        <div className='relative z-10'>
          <div>
            <Navbar />
            <Hero />
          </div>
          <Marquee />
          <About />
          <ArchitectureShowcase />
          {/* Dark moment #1 — the manifesto band between the desk sections. */}
          <Statement />
          <Tech />
          <Experience />
          <Works />
          <Blog />
          <div>
            <Contact />
          </div>
          <Footer />
        </div>
        {/* Page-wide overlays live out here, not inside the z-10 content block:
            siblings of a lower stacking context still paint above it when their
            own z-index says so, which is what puts the mascot (z-30) over the
            sections and under the navbar and the WhatsApp button (both z-40). */}
        <Mascot />
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}

export default App;
