import SectionHeader from './SectionHeader'
import { PRIZES } from '../data'
import { useReveal } from '../hooks/useReveal'

/** Figma centres these two titles in their column; the outer two sit flush left. */
const CENTRED = [1, 2]

/* Phone-specified type. Both ramps pass through the 402 frame's value and land on the
   ladder's 1440 value, so the desktop row does not move. */
const TITLE = 'text-[calc(23.948px_+_2.052*var(--fl))]' /* 1190:761 — 24 @402, 26 @1440 */
const BODY = 'text-[calc(17.922px_+_3.078*var(--fl))]' /* 1190:762 — 18 @402, 21 @1440 */

/**
 * One prize, revealing itself.
 *
 * D5 — the four used to be children of one `reveal-group`. Correct at 1440, where they are a
 * single 1400-wide row and all four measured 0.50 of the viewport. At 390 they are a 2x2, and
 * the same trigger fired for the bottom pair at 1.32 of the viewport, below the fold. Each
 * card observes itself now; the 70ms ladder is carried inline as `--reveal-delay`, which is
 * spent only on the reveal's own opacity and transform (index.css).
 */
function PrizeCard({ prize, i }: { prize: (typeof PRIZES)[number]; i: number }) {
  const reveal = useReveal<HTMLElement>()

  return (
    <article
      ref={reveal.ref}
      style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
      /* 260 wide is 1190:758; 320 is 935:451's. Both `shrink-0`, because below `lg` the card
         is now a carousel slide and must not compress to fit the rail. */
      className={`flex w-[260px] shrink-0 snap-start flex-col gap-[calc(24px_+_16*var(--fl))] lg:w-[320px] ${reveal.cls}`}
    >
      <div className="aspect-square rounded-xl bg-white" />
      <div
        className={`flex flex-col gap-[calc(12px_+_4*var(--fl))] text-white ${CENTRED.includes(i) ? 'lg:items-center' : ''}`}
      >
        {/*
         * The old `min-h: 2.8em` reserved two lines of title so the four bodies shared a
         * baseline in the 2x2 — the 150–190 wide cards made two of the titles wrap. 1190:761
         * settles it: on the phone the card is 260 and every title is one 34-tall line, which
         * is why the cards are 384 (357 for the one-line ชมเชย body). Nothing to reserve.
         */}
        <h3 className={`${TITLE} leading-[1.4] font-medium`}>{prize.title}</h3>
        <p className={`${BODY} w-full leading-[1.5] font-light`}>{prize.body}</p>
      </div>
    </article>
  )
}

export default function Prizes() {
  const head = useReveal()

  return (
    // Figma: 165.5 of red above the header and below the grid.
    <section
      id="prizes"
      /*
       * Figma leaves 248 of page between this section's end (4820) and the footer (5068);
       * the wave-and-cheese band lives in that gap, with only its tips riding under the
       * footer card. Without the margin the footer starts at 4821 and buries the band,
       * which is what made it read as oversized.
       *
       * The gap below `lg` is `pb-[17.5vw]` on the page wrapper (pages/Home.tsx), not a margin
       * here: a bottom margin sits OUTSIDE the wrapper's box, so the canvas — which stretches
       * to that box — stopped at this section's bottom edge and the gap came out plain white.
       *
       * No `bg-brand-red` here either. The phone red field is painted inside the canvas now
       * (HomeBackground), because as this section's own background it was opaque and covered
       * the cheese pile and the cream strands that belong on top of it. 1190:751 confirms it
       * for the phone frame too — the band is a 1373x721 blob hung off (-486, -78), i.e. art,
       * not a section fill.
       */
      className="shell sec-prizes relative lg:mb-[247px]"
    >
      {/* 1190:750 opens 24 between the header and the rail, 40 at 1440 */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-[calc(24px_+_16*var(--fl))]">
        <div ref={head.ref} className={head.cls}>
          <SectionHeader
            light
            number="03"
            title="รางวัลของการแข่งขัน"
            description="ทีมที่ได้รับรางวัลที่ 1-3 ในการแข่งขันจะมีสิทธิได้รับการพิจารณาสอบสัมภาษณ์ในภาควิชาที่กำหนดของคณะวิศวกรรมศาสตร์"
          />
        </div>

        {/*
         * Figma sizes all four cards 320 wide on 40 gaps = 1400, but anchors the row inside
         * the 1200 content column, so the fourth card lands 80px past the 1440 frame and gets
         * clipped — the ชมเชย prize is unreadable in Figma's own render. Keeping the 320 cards
         * and centring the whole 1400 track in the frame instead (20 either side) is the
         * reading that loses no content; shrinking to 270 would reflow every description.
         */}
        {/*
         * Re-read live off Figma 708:271 "Prizes Grid" (2026-07-31). Settling the question a
         * previous round got wrong twice:
         *
         *   - The plate is `Light Background`, a plain `bg-white rounded-[12px]` square with
         *     no fill and no child. Figma really does reserve an empty box — there is no
         *     missing export to go and find. So it stays, per "ทำตาม Figma ไปเลย".
         *   - Cards 2 and 3 centre their text block (`items-center`), 1 and 4 do not. Their
         *     text is 315 of the 320, so it reads flush; it is kept because it is the spec.
         *
         * The 2x2 that used to stand in below `lg` is gone. 1190:757 declares a 354-wide box
         * and then puts the four 260-wide cards at x 0 / 284 / 568 / 852 inside it — an
         * 1112-wide track in a 354 window on a 24 gap. That is a horizontal carousel, and it
         * is built as one below: a real scroll container, snapped, no visible scrollbar.
         *
         * The rail is pulled out to the screen edges by the section's own gutter and the
         * gutter is re-applied as the track's padding, so the first card is flush to the 24
         * gutter (1190:757 sits at x24) and the cards can still bleed to the bezel as they
         * scroll. `pb`/`-mb` cancel in layout and exist only to give the reveal's
         * translateY(24px) somewhere to live inside a box that has to clip its Y axis.
         *
         * At `lg` the wrapper is `display: contents` — it leaves the layout entirely rather
         * than becoming a second box the 1400 row would have to escape from, so from 1024 up
         * the track is the same direct child of the column it always was.
         */}
        <div
          className="-mx-[var(--fl-gutter)] -mb-6 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-[var(--fl-gutter)] pb-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] lg:contents [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="รางวัลของการแข่งขัน"
        >
          <div className="flex w-max gap-[calc(24px_+_16*var(--fl))] px-[var(--fl-gutter)] lg:-mx-[100px] lg:w-[1400px] lg:max-w-none lg:items-start lg:px-0">
            {PRIZES.map((prize, i) => (
              <PrizeCard key={prize.title} prize={prize} i={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
