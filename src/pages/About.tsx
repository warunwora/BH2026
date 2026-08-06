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
       tomatoes and pots were landing on the footer's link columns.

       `min-[1440px]:` and no longer `lg:`. The floor exists to hand the page-absolute
       decoration canvas the frame height its pins are measured against, and that canvas only
       renders from 1440 up now (see the long note at the top of AboutDecor). Below 1440 the
       four sections come to less than 4888 — ~4260 at 1024, since the type ladder is tighter
       than Figma's 1440 sizes while the column shrinks with the gutter — so the floor was
       padding the page out with ~630px of white above the footer and drawing the tomatoes and
       the pots down inside it, a long way under the address plate they belong beside. With
       the floor released, the wrapper's bottom is the contact section's bottom at every width
       under 1440, which is the edge `<Narrow>` hangs that group off. */
    /* `overflow-x-clip`: see the note on the same class in Home.tsx. */
    <div className="relative isolate overflow-x-clip min-[1440px]:min-h-[4888px]">
      <AboutDecor />
      <ScopeSection />
      <CodernSection />
      <FaqSection />
      <ContactSection />
    </div>
  )
}
