import Hero from './Hero';
import Marquee from './Marquee';
import Mascot from './Mascot';
import Navbar from './Navbar';
import About from './About';
import ArchitectureShowcase from './ArchitectureShowcase';
import Statement from './Statement';
import Tech from './Tech';
import Experience from './Experience';
import Works from './Works';
import Blog from './Blog';
import WhatsAppButton from './WhatsAppButton';
import Feedbacks from './Feedbacks';
import Contact from './Contact';
import Footer from './Footer';

// Canvas scenes are code-split: import them from './canvas/*' where they render,
// so three.js stays out of the entry chunk and text can paint first. Mascot is
// exported here anyway — it is an overlay, not a scene, and lazy-loads its own
// plate, which keeps the same property.
export {
  Hero,
  Marquee,
  Mascot,
  Navbar,
  About,
  ArchitectureShowcase,
  Statement,
  Tech,
  Experience,
  Works,
  Blog,
  WhatsAppButton,
  Feedbacks,
  Contact,
  Footer,
}
