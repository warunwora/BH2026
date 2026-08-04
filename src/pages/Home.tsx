import HomeBackground from '../components/HomeBackground'
import Hero from '../components/Hero'
import Calendar from '../components/Calendar'
import Steps from '../components/Steps'
import Prizes from '../components/Prizes'

/**
 * Figma paints this page's decorations in one background frame anchored to the 1440 page
 * frame rather than inside the sections, so the four sections share one positioning
 * context whose top is the frame's y = 0. `isolate` keeps the decoration layer from
 * escaping behind the site chrome.
 */
export default function Home() {
  return (
    /*
     * `lg:min-h-[5178px]` is the height of the Figma background frame (935:451). The canvas
     * is absolutely positioned, so it contributes no height of its own; without a floor here
     * the content measures ~4690 and the footer climbs to 4937, which leaves the last 241px
     * of artwork — the cream strands and the cheese, which hang well below the red band —
     * sitting on the footer's logo row. Pinning the page to the frame's own height fixes it
     * height-independently, where tuning Prizes' bottom margin would re-break the moment any
     * section's height moved.
     */
    /*
     * `overflow-x-clip` and not `overflow-x-hidden`, and here rather than only on <html>.
     * Two separate reasons:
     *
     *   - `clip` clips without making the box a scroll container, so nothing inside can be
     *     panned sideways. `hidden` would create a scrollport that a touch drag can move.
     *   - the clip has to be *inside* the document, not on it. Under mobile emulation Chrome
     *     grows the layout viewport to cover any horizontal overflow, so a decoration hanging
     *     80px off the right edge made the ICB 80px wider than the screen — which is what let
     *     the page be dragged sideways onto empty white, and what pushed the fixed navbar
     *     (`inset-x-0`, so ICB-wide) out of the screen's centre. Clipping at the page box
     *     stops the overflow ever reaching the viewport, so the ICB stays exactly 100vw.
     *
     * `overflow-y` stays `visible` — clip is the one non-visible value allowed to pair with
     * it — so the closing artwork still hangs below its section as the design has it.
     */
    /*
     * `pb-[17.5vw]` is the gap the closing band needs to clear the footer, and it has to be
     * padding HERE rather than a margin on Prizes: the canvas is `inset-0` on this box, and a
     * child's bottom margin falls outside it, so the band's bottom edge stopped at the last
     * section instead of at the footer and the gap rendered plain white. 17.5vw is 251.5/1440,
     * the distance from the red blob's bottom to the Figma frame's bottom edge. From `lg` up
     * `min-h` binds instead and Prizes carries Figma's own 247px margin.
     */
    <div className="relative isolate overflow-x-clip pb-[17.5vw] lg:pb-0 lg:min-h-[5178px]">
      <HomeBackground />
      <Hero />
      <Calendar />
      <Steps />
      <Prizes />
    </div>
  )
}
