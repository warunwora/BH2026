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
      {/*
       * The guide page's `<h1>`, `sr-only` because Figma gives this page no visible page-level
       * title: `708:440` opens straight into the numbered sections (01 ขอบเขตเนื้อหา,
       * 02 แพลตฟอร์ม Codern, 03 คำถามที่พบบ่อย, 04 ติดต่อทีมงาน), each of which is an `<h2>` and
       * must stay one. Hall of Fame differs — `1297:131` is a real page title there, so that
       * page promotes its own element rather than hiding one.
       *
       * The string is Figma's own name for this route, from the navbar and footer nav
       * (`708:847` / `708:871` / `1297:332`), so no copy is invented. `.sr-only` is absolutely
       * positioned and contributes no box, so the first section still starts the page.
       */}
      <h1 className="sr-only">คู่มือการแข่งขัน</h1>
      <ScopeSection />
      <CodernSection />
      <FaqSection />
      <ContactSection />
    </div>
  )
}
