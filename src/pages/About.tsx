import { AboutDecor } from '../components/AboutDecor'
import ScopeSection from '../components/ScopeSection'
import CodernSection from '../components/CodernSection'
import FaqSection from '../components/FaqSection'
import ContactSection from '../components/ContactSection'

/**
 * Figma paints this page's decorations in one background frame anchored to the 1440 page
 * frame rather than inside the sections, so the four sections share one positioning
 * context whose top is the frame's y = 0. `isolate` keeps the decoration layer from
 * escaping behind the site chrome.
 */
export default function About() {
  return (
    /* The height of background frame 935:858 — see the note in Home.tsx; same defect, the
       tomatoes and pots were landing on the footer's link columns. */
    /* `overflow-x-clip`: see the note on the same class in Home.tsx. */
    <div className="relative isolate overflow-x-clip lg:min-h-[4888px]">
      <AboutDecor />
      <ScopeSection />
      <CodernSection />
      <FaqSection />
      <ContactSection />
    </div>
  )
}
