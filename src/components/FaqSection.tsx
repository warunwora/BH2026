import { useState } from 'react'
import SectionHeader from './SectionHeader'
import { PhoneGarlic } from './AboutDecor'
import { ramp } from './ScopeCardArt'
import { FAQS } from '../aboutData'
import { useReveal } from '../hooks/useReveal'

/**
 * The mascot, Figma's "Decoration / Star" — one crop, two placements.
 *
 * The bitmap is 1400x973 and both frames show the same slice of it through the same window,
 * so the insets below are shared and only the window's box changes: pinned over the section at
 * `lg`, in the flow at the top of the column below it. `get_design_context` on `1190:1340`
 * returns `h-[166.84%] left-[-33.11%] top-0 w-[194.88%]` — byte-identical to `708:738`'s crop,
 * which is what licenses one component for both.
 *
 * The four percentages are also self-consistent, which is the check that they are being read
 * against the right box: 1.9488 x 354 = 689.88 across and 1.6684 x 287.351 = 479.42 down is an
 * aspect of 1.4390, and the bitmap's own 1400/973 is 1.4389 — i.e. the slice is UNDISTORTED.
 * (This file used to record the bitmap as 1736x2054, which would have made it a 1.7x horizontal
 * stretch; `file` on the asset says 1400x973.)
 */
function Star({ className }: { className: string }) {
  return (
    /*
     * `overflow-clip`, not `overflow-hidden`. This box holds a 690px-wide bitmap in a 354 window
     * and `hidden` would make that a scrollport — touch-pannable on the phone, and one more
     * place for `documentElement.scrollWidth` to escape `clientWidth`. Same rule as every other
     * over-sized-art box on this page.
     */
    <div aria-hidden className={`pointer-events-none overflow-clip ${className}`}>
      <img
        src="/assets/figma/15683452949f0984de16e5631de71122be94c4ff.png"
        alt=""
        className="absolute top-0 left-[-33.11%] h-[166.84%] w-[194.88%] max-w-none"
      />
    </div>
  )
}

/*
 * ------------------------------------------------------------------ the question rows' type
 *
 * Both ranks are overridden here rather than taken from the ladder in index.css, because at 402
 * the ladder is a size below what `1190:1338` sets and the phone frame is now the authority at
 * that end. Each is a two-anchor ramp landing EXACTLY on the desktop rank at `--fl` = 1, so
 * 1440 does not move by a pixel:
 *
 *   question  `1190:1348` 18 @402  ->  23 @1440 (`fl-title-sm`'s own ceiling)
 *   answer    `1190:1351` 16 @402  ->  19 @1440 (`fl-body`'s)
 *
 * Figma's own 1440 figures are larger again (`708:713` is 39 tall over one line at 1.4, i.e. 28;
 * `708:716` is 72 over two at 1.5, i.e. 24) — the ladder is deliberately tighter than those and
 * that decision is untouched here. Only the narrow end moves.
 */
const Q_SIZE = ramp(18, 23)
const A_SIZE = ramp(16, 19)

/**
 * The two gaps this section is built from, both solved through Figma's two frames:
 *
 *   BLOCK  60 at 1440 — `708:704`'s title column: the "03" block ends at 247.705 and the
 *          mascot's reserved footprint starts at 307.705; the two columns are 620 and 680
 *          apart in a 1200 row, i.e. also 60.
 *          24 at 402 — `1190:1340` ends at 287.35 and the header starts at 311.35; the header
 *          ends at 392.35 and the question grid starts at 416.35.
 *   ROW    40 at 1440 — `708:717`, a divider at y 167 between rows ending at 127 and
 *          starting at 207: 40 above it and 40 below.
 *          16 at 402 — `1190:1352`, the same divider at y 105 between 89 and 121.
 */
const BLOCK_GAP = ramp(24, 60)
const ROW_GAP = ramp(16, 40)

/**
 * The exported Figma icon is the expanded (minus) state only, so the collapsed
 * plus is composed from two copies of that same asset rather than hand-drawn.
 */
function ToggleIcon({ open }: { open: boolean }) {
  return (
    /* `mm-icon-pop` as well as `mm-press-child`: the row is a ~700px-wide button whose only
       feedback was the press, so on the way to it there was nothing to say it was a control.
       The glyph swells on hover and shrinks on press — the same pair the footer's social
       rows use. */
    /* 32 at 1440 (`708:714`), 24 at 402 (`1190:1349`). It was a flat `size-8`, which on the
       354 phone column took 32 of a row whose question is set at 17. */
    <span
      aria-hidden
      className="mm-press-child mm-icon-pop relative block shrink-0"
      style={{ width: ramp(24, 32), height: ramp(24, 32) }}
    >
      <img
        src="/assets/figma/0e681a2a1d4944287c14f80f1e46ef1bd044ab87.svg"
        alt=""
        className="absolute inset-0 size-full"
      />
      <img
        src="/assets/figma/0e681a2a1d4944287c14f80f1e46ef1bd044ab87.svg"
        alt=""
        data-open={open}
        className="mm-toggle-bar absolute inset-0 size-full"
      />
    </span>
  )
}

/**
 * One question, revealing itself.
 *
 * The list is taller than the viewport at every width, so it cannot share one trigger: as a
 * `reveal-group` the rows measured 0.91 / 1.05 / 1.22 of the viewport at 1440 at the frame
 * they were told to animate, i.e. three of the four spent their arrival below the fold. Same
 * fix as the scope cards and the prizes — a reveal per row, with the 70ms ladder carried
 * inline as `--reveal-delay` so it survives the split (index.css).
 */
function FaqRow({
  faq,
  i,
  open,
  onToggle,
}: {
  faq: (typeof FAQS)[number]
  i: number
  open: boolean
  onToggle: () => void
}) {
  const reveal = useReveal()

  return (
    /*
     * One real box per question, and the rule between two questions is a border on the lower
     * one rather than a separator element beside it.
     *
     * This used to be a `<div className="contents">` holding a separator and the row, which
     * made the whole list's reveal a no-op: `display: contents` generates no box, so
     * `opacity`, `transform` and every `transition-delay` the group handed these children were
     * simply dropped. Measured: all four children `display: "contents"`, `opacity: "0"`,
     * `transform: "none"` — fully visible on screen with nothing to animate — while the
     * heading beside them revealed normally. On the largest block of `/guide` the title moved
     * and the questions did not.
     *
     * The spacing is unchanged to the half-pixel. The `<dl>` keeps its own gap, and a row
     * after the first adds the border plus a top pad of that same gap, which is exactly what
     * the zero-height separator sitting between two gaps came to.
     */
    <div
      ref={reveal.ref}
      style={
        {
          '--reveal-delay': `${i * 70}ms`,
          /* the divider's own half of the row gap; the `<dl>` carries the other half */
          paddingTop: i > 0 ? ROW_GAP : undefined,
        } as React.CSSProperties
      }
      className={`flex flex-col ${
        i > 0 ? 'border-t-[0.5px] border-brand-yellow' : ''
      } ${reveal.cls}`}
    >
      <dt>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          /*
           * The gap before the toggle RAMPS to 0, and that is the whole of why this list ran
           * taller than Figma's on the phone. It was a flat `gap-6`, i.e. the 1440 figure worn
           * at 402: Figma's desktop row is 640 wide with its widest question given 584 and a 32
           * toggle at x 608, so 24 of gap — but the phone row is 354 with the question given the
           * full 330 (`1190:1355` is `flex-[1_0_0]` at 330, `1190:1356` at x 330), i.e. NO gap.
           * Holding 24 there took the question column down to 306 and wrapped questions Figma
           * keeps on one line, which is most of the extra air the list carried.
           *
           * `ramp(0, 24)` is 0.000 at 402 and exactly 24.000 at `--fl` = 1 — 1440 unchanged.
           * Wrapped in `max(0px, …)` because that ramp's intercept is negative (-0.624px, so it
           * is under 375 that it would go negative): a negative `gap` is an invalid value, the
           * declaration would be DROPPED, and the element would silently fall back to whatever
           * the cascade left — the same guard `sec-prizes` and `sec-faq` use in index.css.
           */
          /*
           * NO red on hover. It was `mm-link … hover:text-brand-red`, and on a question that can
           * run two lines a whole paragraph changing colour is far too loud for "you may click
           * this" — it also reads as a state (active/selected) rather than as an invitation.
           *
           * The affordance is MOVEMENT instead: `.mm-faq-row` leans the question 2px right, and
           * the toggle glyph already swells via `mm-icon-pop`. Two small things at the two ends
           * of the row, so the whole row reads as one control without any of it recolouring.
           * `mm-link` is dropped with the colour it existed to time.
           */
          className="mm-faq-row flex w-full items-center text-left leading-[1.4] font-medium"
          style={{ gap: `max(0px, ${ramp(0, 24)})`, fontSize: Q_SIZE }}
        >
          {/* `min-w-0` so a long Thai question wraps inside the row instead of forcing the
              flex line wider than 354 and pushing the toggle off the column — the questions
              have no spaces to break at, so the flex base size is the whole string. */}
          <span className="min-w-0 flex-1">{faq.q}</span>
          <ToggleIcon open={open} />
        </button>
      </dt>
      {/*
       * The answer stays mounted and its grid row collapses to 0fr, so closing animates as
       * well as opening. The 16 gap Figma puts between question and answer lives inside the
       * clipped row as padding — as a flex gap it would survive the collapse and leave a hole
       * under a closed question.
       */}
      {/*
       * `mm-collapse-lift` is the modifier that makes the answer part of the same gesture as the
       * row: the copy starts 8px above its resting place and rides down with the growing track,
       * so it emerges from under the question instead of fading in inside a box that happens to
       * be getting taller. It is a modifier and not a change to `.mm-collapse` because that base
       * class also drives the phone nav's panel, which is a menu under a thumb and wants none of
       * it. Same `--mm-base` as the track and the toggle's rotation — see micro-motion.css.
       */}
      <dd className={`mm-collapse mm-collapse-lift ${open ? 'is-open' : ''}`}>
        {/* `font-normal` stated rather than inherited: `1190:1351` is Noto Sans Thai **Regular**,
            and the answers are the one place on this page where a Description node is NOT set
            Light. The document root carries no `font-weight`, so 400 was already what resolved
            here — this pins it against the surrounding `font-light` Descriptions. */}
        <div className="pt-4 leading-[1.5] font-normal" style={{ fontSize: A_SIZE }}>
          {faq.a}
        </div>
      </dd>
    </div>
  )
}

/**
 * Figma node 708:702 "Section / Features" — page y 2362, 1024 tall, 120 side padding,
 * a 500 title column and the questions sharing a 60 gap, both vertically centred. The
 * 124.705 pads are what centring a 774.59 row inside 1024 comes to.
 */
export default function FaqSection() {
  /*
   * A ONE-AT-A-TIME accordion, everything shut on arrival.
   *
   * This is a deliberate departure from Figma, on the user's instruction: the frames draw every
   * question expanded — each toggle is in its minus state — which is how a static mock shows the
   * content, not how it should behave. So the state is no longer a set of the CLOSED ones with
   * every row open by default; it is the single open index, starting at `null`.
   *
   * `number | null` rather than a Set is the honest shape for the rule: "only one can be open"
   * is unrepresentable in a set, so a set would let a future edit reintroduce two. Opening a row
   * therefore closes the previous one by construction, and clicking the open row closes it.
   *
   * Both directions animate because every answer stays MOUNTED — `.mm-collapse` collapses its
   * grid row to `0fr` rather than unmounting, so the outgoing row shrinks on the same curve the
   * incoming one grows on, and swapping between two questions reads as one exchange rather than
   * a snap plus a grow.
   */
  const [open, setOpen] = useState<number | null>(null)
  const head = useReveal()

  return (
    <section id="faq" className="shell sec-faq relative">
      {/*
       * The #FFEAB4 field that tints this whole band cream — and it MUST NOT BE CLIPPED.
       *
       * Read straight off the REST API, both frames, offsets relative to the section's own box:
       *
       *              clipsContent   field offset      field size
       *    402       **false**      (-1326, -65)      3055 x 1175   `1190:1339` in `1190:1338`
       *   1440       **false**      ( -791, -30)      3023 x 1163   `708:703`  in `708:702`
       *
       * Three things were wrong and they compounded:
       *
       * - The wrapper was `overflow-clip`. Figma's section sets `clipsContent: false` at BOTH
       *   anchors, and the field is deliberately taller than the section — 1175 in a 966 box on
       *   the phone — so its curved top and bottom edges live OUTSIDE it. Clipping them is what
       *   turned the band into a flat rectangle with hard horizontal cuts.
       * - It was CENTRED (`left-1/2 top-1/2` + `-translate-1/2`) on a section whose height is
       *   content-driven. Figma anchors it to the section's top-left, so centring made the
       *   overhang drift with the copy — measured 57/136 at 402 against 45/124 at 1440, i.e.
       *   which slice of the curve you saw depended on how the questions happened to wrap.
       * - The size was the desktop 3023x1163 held flat, so the phone was 1.06% under its own
       *   frame on top of everything else.
       *
       * Now: anchored top-left like Figma, every figure a two-anchor ramp landing exactly on the
       * 1440 value at `--fl` = 1, and nothing clipping it. The horizontal overhang (the field is
       * 3023 wide on a 1440 canvas) is contained by the page root's `overflow-x-clip` in
       * pages/About.tsx, which is where containment belongs — not here, where it would also eat
       * the vertical curve. The field stays behind this section's own `z-10` copy, and the
       * Contact section is a LATER sibling so its content paints over the curve that hangs into
       * it, which is exactly the layering Figma draws.
       *
       * `scale-y-[-1]` is unchanged: it flips about the element's own centre, so the box the
       * offsets position is unaffected.
       */}
      {/*
       * ------------------------------------------ why the HEIGHT is `100% + …` and not Figma's
       *
       * The height used to be Figma's own, ramped `1175 -> 1163`. Both ends are transcribed
       * correctly and the pair is still wrong, because Figma's height is only meaningful
       * alongside Figma's SECTION height — and this section is nowhere near it:
       *
       *     width   section (measured)   Figma's section   field overhang below the section
       *      402         779.9                966                330  (Figma: 144)
       *      768         620.1                 —                 498
       *     1024         808.3                 —                 316
       *     1280         923.1                 —                 206
       *     1440         994.8               1024                138  (Figma: 109)
       *
       * The section is short for two reasons that are both deliberate and neither reversible
       * here: the type ladder is tighter than Figma's 1440 sizes, and the accordion ships with
       * every answer COLLAPSED while Figma's frames draw all five EXPANDED. So a fixed height
       * anchored at the top necessarily runs further and further past the section's bottom as
       * the section shrinks — measured 498px past it at 768.
       *
       * That overhang is what put the cream behind the next section's `04` / ติดต่อทีมงาน
       * heading, which Figma draws on WHITE. Sampled at the heading's own gutter column, the
       * painted curve (not the box — the box's bottom corner is well below the curve there)
       * sat BELOW the eyebrow at 402, 768, 1024 and 1440, clearing it only at 1280.
       *
       * So the field is sized from the box it belongs to instead. Both overhangs are Figma's
       * own, at Figma's own anchors, and the section supplies the rest:
       *
       *     top    65 @402 -> 30 @1440     (unchanged — this end was always right)
       *     bottom 144 @402 -> 109 @1440   (1110 - 966, and 1133 - 1024)
       *     height 100% + top + bottom
       *
       * Now the curve lands in the white gap above the contact heading at every width —
       * measured clearance 103…130px, against Figma's own 95 at 1440 — and it tracks the
       * accordion: opening a row grows the section and the field grows with it, where before
       * the copy slid down inside a field that could not follow.
       */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src="/assets/figma/5b4f0c1a6c5aa6f21d4a8c19dce31ff99afb3877.svg"
          alt=""
          className="absolute max-w-none scale-y-[-1]"
          style={{
            left: 'calc(-1339.92px + 548.92 * var(--fl))' /* -1326 @402 -> -791 @1440 */,
            top: 'calc(-65.9105px + 35.9105 * var(--fl))' /* -65 -> -30 */,
            width: 'calc(3055.83px - 32.83 * var(--fl))' /* 3055 -> 3023 */,
            /* 100% + top overhang + bottom overhang: 209 @402 -> 139 @1440 */
            height: 'calc(100% + 210.821px - 71.821 * var(--fl))',
          }}
        />
      </div>

      {/*
       * `1343:438` — the garlic, which Figma makes this section's LAST child and which is what
       * the /guide phone page was missing entirely. Mounted here and not in `AboutDecor`'s page
       * canvas for two reasons: Figma parents it to this section, so the section's own closing
       * edge is the anchor it wants; and the canvas is `-z-10`, which would put it UNDER the
       * cream field above and hide the third of it that overlaps. Here it paints over the field
       * (both are position-auto, so tree order decides) and under the `z-10` copy below.
       *
       * The geometry, the scale and why the phone frame's own `hypot()` numbers are not used are
       * all written up beside `PHONE_GARLIC` in AboutDecor.tsx.
       */}
      <PhoneGarlic />

      {/*
       * The two-up, and where it has to stop being one.
       *
       * Figma's 1440 row is a 500 title column beside a 640 question grid, 60 apart
       * (`708:704` at x 120, `708:709` at x 680) — which is 41.6667% + 5% + 53.3333% of the
       * 1200 column, exactly. Written as those fractions the split is Figma's at EVERY width
       * instead of only at 1440, and that is the whole fix for this band: the column used to
       * be `400 + 100·--fl`, a px ramp that shrinks far slower than the row does, so at 1024
       * it took 461 of the 861 available and left the questions 348 — narrower than the phone
       * column, at desktop type sizes. Measured out, that pushed the question list to ~991
       * tall against Figma's 847 and the section to ~1240 against its 1024, i.e. 216px of
       * drift handed to every decoration pinned below it. At 41.6667% the questions get 456
       * at 1024 and the section comes to ~955.
       *
       * The break is `md` and not `lg`: 834 (iPad portrait) and 1024 (landscape) both have to
       * keep the 1440 composition, and at 768 the split is still 272 + 348, which holds a
       * one-line heading (14 Thai glyphs at 30px ≈ 210) and a two-line question. One column
       * is the phone frame's answer (`1190:1341` and `1190:1344` are stacked at 354) and it
       * starts where the 41.6667% column can no longer hold the heading.
       */}
      <div
        className="relative z-10 mx-auto flex max-w-[1200px] flex-col md:flex-row md:items-center"
        /* One token on both axes, which is what Figma has: the 1440 row's two columns are 60
           apart and its title column stacks its own blocks 60 apart, and the phone frame
           stacks everything 24 apart. `5%` of the 1200 column would also be exactly 60 — but
           an inline `gap` outranks any class, so writing the column gap as a percentage here
           would have been a rule that silently never applied. */
        style={{ gap: BLOCK_GAP }}
      >
        <div
          className="flex flex-col md:w-[41.6667%] md:shrink-0 md:justify-center md:self-stretch"
          style={{ gap: BLOCK_GAP }}
        >
          {/* Below `lg` Figma puts the mascot at the TOP of the column, in the flow, at the
              full column width: `1190:1340` is 354x287.35 at the section's own y 0, with the
              header 24 under it. That replaces a `decor-stage` copy hung off the section's
              top-RIGHT corner, which existed only to keep the old pinned position from
              landing on the heading — Figma's own answer is to give it its own room. */}
          {/* `aspect-[1211/983]` is `1190:1340`'s own ratio and resolves the 354 column to
              287.351 — Figma's stated height to three decimals. It was `853/693`, the DESKTOP
              window's ratio, which came to 287.60: right to a quarter-pixel, but this is the box
              the section's 24 gaps and its 966.351 total are measured from, so it is stated from
              the frame that owns it. */}
          <Star className="relative aspect-[1211/983] w-full lg:hidden" />
          {/* The reveal wraps the header alone. It used to be this whole column, which is the
              same thing while the column's other child is invisible — but the mascot is not,
              below `lg`, and a background mascot sliding in is not a reveal desktop has. */}
          <div ref={head.ref} className={head.cls}>
            <SectionHeader number="03" title="คำถามที่พบบ่อย" />
          </div>
          {/* Figma reserves the mascot's footprint in this column with a hidden copy of
              it, which is what pushes the heading up off the section's centre line. */}
          <div aria-hidden className="hidden aspect-[1736/2054] w-full lg:block" />
        </div>

        <dl className="flex flex-1 flex-col" style={{ gap: ROW_GAP }}>
          {FAQS.map((faq, i) => (
            <FaqRow
              key={faq.q}
              faq={faq}
              i={i}
              open={open === i}
              /* Clicking the open row shuts it; clicking any other row moves the single open
                 index, which closes the previous one as a consequence rather than as a step. */
              onToggle={() => setOpen((prev) => (prev === i ? null : i))}
            />
          ))}
        </dl>
      </div>

      {/*
       * Decoration / Star, `lg` and up — Figma draws the mascot over the section, cropped by
       * its box, pinned at (-72, 263) of the section (`708:738`). `decor-fit decor-stage`
       * scales that box by 100vw/1440 about the pin, so at 1024 it is a 0.71 copy sitting in
       * the same relationship to the two-up as the 1440 one: 606 wide across a 359 title
       * column, overlapping the questions by the same fraction it does at 1440.
       *
       * Below `lg` this box is not drawn at all — the in-flow copy in the title column above
       * is Figma's own phone placement, and two would be two mascots.
       */}
      <Star className="decor-fit decor-stage absolute top-[263px] left-[-72px] z-20 hidden h-[693px] w-[853px] origin-top-left lg:block" />
    </section>
  )
}
