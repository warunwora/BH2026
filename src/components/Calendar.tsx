import SectionHeader from './SectionHeader'
import { CALENDAR_NOTE, TIMELINE_HIGHLIGHTS, TIMELINE_STEPS } from '../data'
import { useReveal } from '../hooks/useReveal'

const spaghetti = '/assets/figma/ace844a0c921e340e3257f408b288273f191b3d8.png'
/*
 * `1235:81` / `1235:84` — `calendar_add_regular`. This replaced `add_circle_dash_light` (a
 * dashed ring around a plus) when the label was retyped; the glyph is now a calendar leaf
 * with a plus, so it is a different drawing and not a re-export of the same one.
 *
 * Figma boxes it 36x36 `overflow-clip` and insets the vector rather than exporting it at the
 * box's size — the SVG is 28.49 square — so the `<img>` needs that inset to land at the size
 * the design draws. Painting the asset straight into a 36 box, which is what the old
 * full-bleed export allowed, would scale the glyph up by 36/28.49 and crop its plus.
 */

/**
 * The row splits 700 / 476 inside the 1200 content column — expressed as grid `fr`
 * columns, because flex ratios round the split a few px off at this size.
 * `bowl` is where the spaghetti photo starts inside each card: the same 834-wide
 * image, pushed right in the wide card and pulled far left in the narrow one, so both
 * cards show a different slice of the same bowl.
 */
/*
 * `bowl` is the photo's geometry, and it is a two-composition problem.
 *
 * From `md` the row exists, so Figma's slice is reproducible: the 834-wide image is
 * re-expressed as a percentage of the card it sits in — 834.211/700 for the wide card
 * (708:171 in 708:162), 834.211/476 for the narrow one (708:180 in 708:172) — with `left` as
 * the same percentage of the card. That scales the whole bowl with the column and shows the
 * identical slice at any width from 768 up, where the hard 834px only showed the correct one
 * at exactly 1440.
 *
 * `md` and not `lg`, which is where this switch used to sit. Both slices are stated as
 * percentages of the card, and from 768 up the card is Figma's ROW card — a landscape box
 * beside its sibling — so the desktop slice is the one whose geometry the box has. Reading
 * the phone slice into it left the 768-1023 band with a tilted plate hung in the top third of
 * a card the desktop slice fills, and jumped the whole plate at 1024.
 *
 * Below `md` the phone frame specifies the slice, so the old corner-garnish invention
 * (two thirds of the card wide, hung off the bottom-right) is gone. 1190:604 / 1190:613
 * put the SAME 834:441 plate in the 354-wide card at 376.267 wide — 106.29% of the card,
 * so it overflows the right edge and is clipped by it — and tilt it. Figma reports the
 * rotated bounding boxes; the numbers below are their centres taken back to the unrotated
 * box, which is what CSS positions before it transforms:
 *
 *   red    bbox (132.33, -5.39) 399.607x247.784 @ -7.73deg  -> box (144, 19.01)
 *   yellow bbox (145.63,  2.09) 393.003x232.826 @ 174.71deg -> box (154, 19.00)
 *
 * as fractions of the 354x200 card: left 40.678% / 43.503%, top 9.505%.
 */
/*
 * ============================================ ONE PLATE, TWO WINDOWS (from `md` up)
 *
 * `708:171` (in the 700-wide card `708:162`) and `708:180` (in the 476-wide card `708:172`)
 * are not two plates. They are the SAME rectangle — same `imageRef`
 * (`ace844a0c921e340e3257f408b288273f191b3d8`), same `imageTransform`, same 834.2105 x
 * 441.1972 box, rotation 0 — laid across the row at very nearly the same absolute x and
 * clipped by each card's own `clipsContent`. Card A shows the plate's left 531.5px, card B
 * its right 282.7px, and the 24px gutter swallows what falls between. It is one photograph
 * of one bowl, cut by the gap between two cards.
 *
 * WHAT WAS WRONG, and why it only showed away from 1440. Each half used to be sized and
 * placed as a percentage of ITS OWN card — 119.173% / 24.073% of the 700 card and 175.254% /
 * -115.86% of the 476 one. Those two percentages resolve to the same 834.211px box at
 * exactly one viewport width, because the cards themselves are 700 and 476 at exactly one
 * viewport width: the row's split RAMPS (`--hl-split`, 0.5 at 768 -> 0.5952381 at 1440), so
 * below 1440 the two cards are different fractions of the row than Figma's, and the two
 * halves came out at different SCALES as well as different offsets. Measured on the live
 * page: at 1440 both halves are 834.2 wide and the join is Figma's; at 1024 they are 537.9
 * and 684.0, and at 768 they are 378.9 and 557.2. Two different-sized bowls, one per card —
 * which is exactly the "two separate plates that do not connect" the review reported.
 *
 * SO THE PLATE IS MEASURED AGAINST THE ROW, NOT AGAINST EITHER CARD. `.hl-row` carries
 * `container-type: inline-size` (below), so `cqw` is one percent of the ROW's width at every
 * viewport, and both halves take their width from the same unit. Figma's own three numbers,
 * as fractions of the 1200 column (`708:161`):
 *
 *   width  834.2105 / 1200 = 69.517542%   both halves
 *   left   168.5137 / 1200 = 14.042808%   card A's left edge IS the row's left edge
 *   right  100 - 14.042808 - 69.517542 = 16.439650%   card B's right edge IS the row's right
 *
 * Anchoring card B from the RIGHT is what keeps this independent of `--hl-split`: card B is
 * the last column, so its right edge is the row's right edge whatever the split does, and the
 * offset never has to name the split at all. That matters twice over — index.css carries an
 * `@supports not` fallback for `--hl-split` (CSS trig), and a `left` written in terms of it
 * would have gone invalid alongside it.
 *
 * At 1440 this resolves to left 168.514 / width 834.211 for card A and, for card B,
 * 476 - 197.276 - 834.211 = -555.486 from its own left edge, i.e. absolute x 288.514 —
 * Figma's number for card A to three decimals.
 *
 * IT ALSO CLOSES FIGMA'S OWN 4px SLIP. `708:171` sits at absolute x 288.5137 and `708:180` at
 * 292.5137: the file has the right half four pixels further right than the left half, so the
 * strands do not quite meet across the gutter even in the design. One shared origin is the
 * whole point of the composition, so both halves take card A's x and the seam closes. This is
 * a deliberate departure from the file, and the only one on this element.
 *
 * BELOW `md` NOTHING HERE APPLIES. The phone frame is genuinely two plates: `1190:604` and
 * `1190:613` are the same image but individually rotated (-7.727deg and +174.712deg, i.e. the
 * second one flipped) inside two stacked 354x200 cards, with no join to make. Every rule in
 * this block is `md:`-prefixed and the phone geometry above is untouched.
 */
const PLATE_W = 'md:w-[69.517542cqw]'

const TONE = {
  red: {
    card: 'from-red-grad-from to-red-grad-to',
    /* 1190:604 below md; from md up the plate's left edge, measured from the row's left,
       which is also this card's left. */
    bowl: `left-[40.678%] [transform:rotate(-7.73deg)] md:left-[14.042808cqw] ${PLATE_W}`,
  },
  yellow: {
    card: 'from-yellow-grad-from to-yellow-grad-to',
    /* 1190:613 is the same plate mirrored and turned most of the way round; from md up it is
       the SAME rectangle as the red card's, anchored to the row's right edge (see above) so
       the two windows show one continuous bowl. `left-auto` is required — `left` wins over
       `right` while both are set, and the phone rule above sets it. */
    bowl:
      'left-[43.503%] [transform:rotate(174.71deg)_scaleY(-1)] ' +
      `md:left-auto md:right-[16.439650cqw] ${PLATE_W}`,
  },
}

/** Shared by both tones: 1190:604's box below md, then Figma's own top offset from md up. */
/*
 * `--reveal-delay: 0ms` from `md` up, and only on this box. The two cards stagger by 70ms
 * (`i * 70`, below) because below `md` they are two stacked cards arriving one after the
 * other — but from `md` up they are two windows onto ONE plate, and `.mm-settle` reads
 * `--reveal-delay` for its own delay (micro-motion.css). Staggered, the two halves of the
 * bowl ran their 1.06 -> 1 settle 70ms apart, so for the length of the arrival the seam
 * opened and closed again. Overriding the property HERE rather than on the article leaves
 * the cards' own reveal ladder intact — that rule matches the `<article>`, this one only
 * reaches `.mm-settle`.
 *
 * The settle itself is safe for the join: both halves are now the same absolute rectangle, so
 * a `scale` about each one's own 50%/50% centre is a scale about the same point in the page,
 * and the plate grows and shrinks as one object rather than as two.
 */
const BOWL_BOX =
  'absolute aspect-[834.211/441.197] w-[106.29%] top-[9.505%] ' +
  'md:top-[12.16%] md:[transform:none] md:[--reveal-delay:0ms]'

/* Phone-specified type and metrics. Each ramp passes through the 402 frame's value and
   lands on the verified 1440 value, so the desktop design is untouched. */
const HL_DATE = 'text-[calc(27.532px_+_18.468*var(--fl))]' /* 1190:597 — 28 @402, 46 @1440 */
const HL_LABEL = 'text-[calc(19.922px_+_3.078*var(--fl))]' /* 1190:598 — 20 @402, 23 @1440 */
const STEP_DATE = 'text-[calc(23.792px_+_8.208*var(--fl))]' /* 1190:616 — 24 @402, 32 @1440 */
const BODY = 'text-[calc(15.922px_+_3.078*var(--fl))]' /* 1190:617 — 16 @402, 19 @1440 */
/**
 * 16 inset and a 16 radius on the phone, 24 and 24 at 1440. Re-verified live 2026-08-06 on
 * BOTH kinds of card this constant serves, since one token covering two components is only
 * safe while Figma agrees about them: `1190:595` (gradient highlight) and `1190:614` (white
 * divider row) are both `p-[16px] rounded-[16px]`, and `708:162` / `708:181` are both 24/24.
 * The ramp lands on 24.000 at `--fl` = 1, so the desktop pair is unchanged.
 */
const CARD_BOX = 'p-[calc(16px_+_8*var(--fl))] rounded-[calc(16px_+_8*var(--fl))]'
/** 12 between every card on the phone (1190:594), 24 at 1440. */
const STACK_GAP = 'gap-[calc(12px_+_12*var(--fl))]'

/*
 * ---------------------------------------------------- the highlight row's own split
 *
 * Figma's row is 700 / 476 inside the 1200 column: 708:162 is x0 w700, 708:172 is x724 w476,
 * so the gap is 24 and the three add to 1200 exactly. The phone frame has no row at all
 * (1190:594 is one stack of five), so the split only exists from `md`.
 *
 * It used to be `md:grid-cols-2 lg:grid-cols-[700fr_476fr]` — an even split for the whole
 * tablet band and then Figma's at 1024. Both halves are defensible on their own and the pair
 * is not: the proportion of the row is part of the composition, and jumping it 9.5 points at
 * one breakpoint is exactly the thing this page interpolates everywhere else. So the ratio
 * ramps, solved through both of its anchors the way every size in this repo is:
 *
 *     768   0.5        an even split. The narrow card carries `23 ก.ย.` plus a 37-character
 *                      label, and at 768 Figma's ratio would leave it 258 wide — narrower
 *                      than the 354 the PHONE gives it. So the row's low anchor is the
 *                      widest the narrow card can be, not a Figma number.
 *    1440   700/1176   = 0.5952381, Figma's own (708:162 / 708:172 above).
 *
 * `--fl` is a *length* (0px at 375, 1px at 1440), and a track fraction has to be a plain
 * number, so it is read back out with `tan(atan2(--fl, 1px))` — the same trick index.css
 * uses for `.hof-band`, since calc() will not divide a length by a length. At `--fl` = 1 the
 * ramp is 0.5952381 and the left track resolves to (1200 - 24) * 0.5952381 = 700.000, i.e.
 * Figma's number to a ten-thousandth of a pixel; the right track is `1fr`, so it takes the
 * remaining 476. Above 1440 `--fl` freezes and the column caps at 1200, so the split holds.
 *
 * `--hl-gap` restates STACK_GAP because the left track has to subtract the gap the row is
 * already carrying; the two must stay equal.
 *
 * `hl-row` on the element below is a HOOK, not a style — nothing in this file's stylesheets
 * sets it. The `tan(atan2(...))` above embeds a `var()`, so `grid-template-columns` PARSES on
 * a browser without CSS trig and only fails at computed-value time, where it resets to
 * `none` and the two cards stack from `md` up instead of forming Figma's 700/476 row. A
 * fallback therefore cannot be an earlier declaration in the same rule; it has to be a
 * separate `@supports not (...)` block, which index.css carries against this class. It beats
 * the Tailwind utility below because an unlayered rule outranks anything in `@layer`.
 */
const HL_ROW_VARS = {
  '--hl-gap': 'calc(12px + 12 * var(--fl))',
  '--hl-split': 'calc(0.44430273 + 0.15093537 * tan(atan2(var(--fl), 1px)))',
  /*
   * What makes `cqw` mean "one percent of the ROW" inside either card — see the plate note
   * above `TONE`. It is what lets the two halves of one photograph be sized and placed
   * against a single shared length instead of against two cards whose widths ramp apart.
   *
   * `inline-size` and never `size`: size containment would make this box compute its own
   * BLOCK size with its contents ignored, and the row's height is exactly what its two cards
   * supply. Inline-size containment applies `contain: layout style inline-size`, none of
   * which is paint containment — so no backdrop root is created here, which matters because
   * this page mounts ScrollEdgeEffect and that component's layers must keep sampling the
   * page (the standing rule is written out in ScrollEdgeEffect.tsx).
   *
   * Written as an inline style rather than as Tailwind's `@container` utility so it cannot be
   * separated from the two `--hl-*` values it exists to sit beside, and so it is impossible
   * to drop the container while leaving the `cqw` lengths that depend on it.
   */
  containerType: 'inline-size',
} as React.CSSProperties

const HL_ROW_COLS = 'md:grid-cols-[calc((100%_-_var(--hl-gap))*var(--hl-split))_minmax(0,1fr)]'

/**
 * One highlight card, revealing itself.
 *
 * Same reason as the scope cards and the prizes: from `md` up the pair is a row and shares a
 * trigger, but at 390 they stack into 500-odd px each and one trigger fired for the second
 * card at 1.06 of the viewport. The 70ms ladder is carried inline as `--reveal-delay`, which
 * is spent only on the reveal's own opacity and transform (index.css).
 */
function HighlightCard({ item, i }: { item: (typeof TIMELINE_HIGHLIGHTS)[number]; i: number }) {
  const reveal = useReveal<HTMLElement>()

  return (
    <article
      ref={reveal.ref}
      /*
       * The 70ms ladder is a PHONE ladder, and it has to be able to say so. Below `md` these
       * are two stacked cards and the second arriving a beat after the first is the whole
       * point; from `md` up they are two windows onto ONE plate (see the note above `TONE`),
       * and a stagger there tore the bowl in half — the reveal's own 24px rise ran 70ms apart
       * on the two cards, so the join opened by up to 11.7px (measured) for the length of the
       * arrival and closed again.
       *
       * So the delay is published through `--hl-stagger`, whose fallback IS the ladder, and
       * micro-motion.css zeroes that one variable from `md` up. An inline style cannot carry a
       * media query and would beat any class that tried to override `--reveal-delay` outright,
       * so the indirection is what makes the value reachable from CSS at all.
       */
      style={{ '--reveal-delay': `var(--hl-stagger, ${i * 70}ms)` } as React.CSSProperties}
      /* 500 is the Figma height at 1440; 1190:595/605 fix the phone card at 200, and the
         ramp between them passes through 200 at exactly 402. The old 208 floor came from
         guessing what the phone card's content asks for — it asks for 142. */
      className={`relative flex min-h-[calc(192px_+_308*var(--fl))] min-w-0 flex-col justify-between gap-6 overflow-hidden bg-gradient-to-b text-white ${CARD_BOX} ${TONE[item.tone].card} ${reveal.cls}`}
    >
      {/*
       * `mm-settle` — the plate lands a touch oversized and closes onto its resting size 140ms
       * behind the card, on the reveal's own curve. It SHRINKS (1.06 -> 1) rather than growing,
       * and that direction is forced: this box is `w-[106.29%]` of a card that clips it, so a
       * start under 1 could pull the plate's edge inside the card and show a seam where the
       * design shows food. Starting large can never expose anything, and every frame is inside
       * the `overflow-hidden` above — so the card cannot pan and the document cannot widen.
       * `scale` only, because the two `[transform:…]` classes below own `transform`. Full spec
       * on `.mm-settle` in styles/micro-motion.css.
       */}
      <div
        style={{ '--mm-settle-from': '1.06' } as React.CSSProperties}
        className={`mm-settle pointer-events-none overflow-hidden ${BOWL_BOX} ${TONE[item.tone].bowl}`}
      >
        <img
          src={spaghetti}
          alt=""
          aria-hidden
          className="absolute top-[-34.47%] left-[-0.01%] h-[134.47%] w-[100.01%] max-w-none"
        />
      </div>
      {/* 1190:596 sets the date and label 4 apart; at 1440 they still butt on their leading,
          so the pair is a ramp (4 @402 → 0 @1440) rather than a `lg:` step that dropped the
          whole 4 at one breakpoint. */}
      <div className="relative flex flex-col gap-[calc(4.104px_-_4.104*var(--fl))]">
        <p className={`${HL_DATE} leading-[1.4] font-medium`}>{item.date}</p>
        <p className={`${HL_LABEL} leading-[1.4] font-normal`}>{item.label}</p>
      </div>
      {/*
       * The "บันทึกลงปฏิทิน" row is REMOVED, on the user's instruction (2026-08-16), even though
       * Figma still draws it on all four cards (`708:170` / `708:179` at 1440, `1190:603` /
       * `1190:612` at 402). It was never wired to anything: a `<p>` with an icon, styled like a
       * control, with no handler, no href and no focusability — it promised to add the date to a
       * calendar and did nothing. Deleting it is the honest fix; if it comes back it needs a real
       * .ics download behind it, at which point it should be a `<button>`.
       */}
    </article>
  )
}

/** One date card, revealing itself — same reasoning as `HighlightCard`. */
function StepDateCard({ item, i }: { item: (typeof TIMELINE_STEPS)[number]; i: number }) {
  const reveal = useReveal<HTMLElement>()

  return (
    <article
      ref={reveal.ref}
      style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
      className={`flex flex-col bg-white shadow-soft ${CARD_BOX} ${reveal.cls}`}
    >
      <p className={`${STEP_DATE} leading-[1.4] font-medium text-gray-2`}>{item.date}</p>
      <p className={`${BODY} leading-[1.4] font-light`}>
        {/*
         * The lines are Figma's desktop line breaks — a 384-wide card there needs them.
         * 1190:617/621 run the same copy as one flowing line in a 322-wide card and let it
         * wrap, which is why the phone divider rows are 88 tall rather than 110. So the
         * breaks are only breaks from `md`, where the three-up row exists.
         */}
        {item.lines.map((line) => (
          <span key={line} className="inline md:block">
            {line}{' '}
          </span>
        ))}
      </p>
    </article>
  )
}

export default function Calendar() {
  const head = useReveal()

  return (
    // Figma: content sits 88.5 below the section top; the 451.5 tail is where the
    // garlic and fork decorations live before the next section starts.
    <section id="calendar" className="shell sec-calendar relative">
      {/* 1190:590 opens 24 between the header and the first card, 40 at 1440 */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-[calc(24px_+_16*var(--fl))]">
        <div ref={head.ref} className={head.cls}>
          <SectionHeader number="01" title="ปฏิทินการแข่งขัน" />
        </div>

        {/*
         * On the phone 1190:594 is ONE stack of five cards on a single 12 gap — the two tall
         * gradient cards and the three short white rows are the same list, not two groups. The
         * 24 that separated the groups at 1440 is therefore the same token as the gap inside
         * them, so all three gaps below ramp together.
         */}
        <div className={`flex flex-col ${STACK_GAP}`}>
          {/*
           * Two-up from `md`, not only from `lg`. Stacked at 768 these two became 712-wide
           * cards with a 316 floor — a date at the top, one line at the bottom and a third of
           * a screen of gradient between them, twice. Side by side at 768 each is 318x306, a
           * near-square that the bowl fills. The ratio between them ramps from an even split
           * at 768 to Figma's 700/476 at 1440 — see HL_ROW_VARS above.
           */}
          <div style={HL_ROW_VARS} className={`hl-row grid ${HL_ROW_COLS} ${STACK_GAP}`}>
            {TIMELINE_HIGHLIGHTS.map((item, i) => (
              <HighlightCard key={item.date} item={item} i={i} />
            ))}
          </div>

          {/* three cards, so two columns leaves the third orphaned beside a half-empty row.
              One column until there is room for all three at `md`. */}
          <div className={`grid md:grid-cols-3 ${STACK_GAP}`}>
            {TIMELINE_STEPS.map((item, i) => (
              <StepDateCard key={item.date} item={item} i={i} />
            ))}
          </div>
        </div>

        {/*
         * `1235:79` — a footnote Figma added under the grid. It sits inside the stack's own
         * gap rather than carrying a margin: the section's gap token is what separates the
         * header from the cards, and this is the same rhythm one step further down.
         *
         * Gray 02 Light, on `fl-note` — 12 on the phone frame (`1297:2057`) and 20 at 1440,
         * the same rank the prize footnote uses. See the note on `fl-note` in index.css for
         * why that pair sits outside the main type ladder.
         */}
        <p className="fl-note leading-[1.5] font-light text-gray-2">{CALENDAR_NOTE}</p>
      </div>
    </section>
  )
}
