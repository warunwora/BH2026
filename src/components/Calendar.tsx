import SectionHeader from './SectionHeader'
import { TIMELINE_HIGHLIGHTS, TIMELINE_STEPS } from '../data'
import { useReveal } from '../hooks/useReveal'

const spaghetti = '/assets/figma/ace844a0c921e340e3257f408b288273f191b3d8.png'
const addToCalendar = '/assets/figma/7aa7415392999a4ea5000911a14f8b9228b4344a.svg'

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
 * At `lg` the row exists, so Figma's slice is reproducible: the 834-wide image is
 * re-expressed as a percentage of the card it sits in — 834.211/700 for the wide card,
 * 834.211/476 for the narrow one — with `left` as the same percentage of the card. That
 * scales the whole bowl with the column and shows the identical slice at any width from
 * 1024 up, where the hard 834px only showed the correct one at exactly 1440.
 *
 * Below `lg` the phone frame now specifies the slice, so the old corner-garnish invention
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
const TONE = {
  red: {
    card: 'from-red-grad-from to-red-grad-to',
    /* 1190:604 below lg, 935:451's own slice from lg up */
    bowl: 'left-[40.678%] [transform:rotate(-7.73deg)] lg:left-[24.073%] lg:w-[119.173%]',
  },
  yellow: {
    card: 'from-yellow-grad-from to-yellow-grad-to',
    /* 1190:613 is the same plate mirrored and turned most of the way round */
    bowl:
      'left-[43.503%] [transform:rotate(174.71deg)_scaleY(-1)] ' +
      'lg:left-[-115.86%] lg:w-[175.254%]',
  },
}

/** Shared by both tones: 1190:604's box below lg, then Figma's own top offset from lg up. */
const BOWL_BOX =
  'absolute aspect-[834.211/441.197] w-[106.29%] top-[9.505%] ' +
  'lg:top-[12.16%] lg:[transform:none]'

/* Phone-specified type and metrics. Each ramp passes through the 402 frame's value and
   lands on the verified 1440 value, so the desktop design is untouched. */
const HL_DATE = 'text-[calc(27.532px_+_18.468*var(--fl))]' /* 1190:597 — 28 @402, 46 @1440 */
const HL_LABEL = 'text-[calc(19.922px_+_3.078*var(--fl))]' /* 1190:598 — 20 @402, 23 @1440 */
const STEP_DATE = 'text-[calc(23.792px_+_8.208*var(--fl))]' /* 1190:616 — 24 @402, 32 @1440 */
const BODY = 'text-[calc(15.922px_+_3.078*var(--fl))]' /* 1190:617 — 16 @402, 19 @1440 */
/** 16 inset and a 16 radius on the phone (1190:595), 24 and 24 at 1440. */
const CARD_BOX = 'p-[calc(16px_+_8*var(--fl))] rounded-[calc(16px_+_8*var(--fl))]'
/** 12 between every card on the phone (1190:594), 24 at 1440. */
const STACK_GAP = 'gap-[calc(12px_+_12*var(--fl))]'

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
      style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
      /* 500 is the Figma height at 1440; 1190:595/605 fix the phone card at 200, and the
         ramp between them passes through 200 at exactly 402. The old 208 floor came from
         guessing what the phone card's content asks for — it asks for 142. */
      className={`relative flex min-h-[calc(192px_+_308*var(--fl))] min-w-0 flex-col justify-between gap-6 overflow-hidden bg-gradient-to-b text-white ${CARD_BOX} ${TONE[item.tone].card} ${reveal.cls}`}
    >
      <div className={`pointer-events-none overflow-hidden ${BOWL_BOX} ${TONE[item.tone].bowl}`}>
        <img
          src={spaghetti}
          alt=""
          aria-hidden
          className="absolute top-[-34.47%] left-[-0.01%] h-[134.47%] w-[100.01%] max-w-none"
        />
      </div>
      {/* 1190:596 sets the date and label 4 apart; at 1440 they still butt on their leading */}
      <div className="relative flex flex-col gap-1 lg:gap-0">
        <p className={`${HL_DATE} leading-[1.4] font-medium`}>{item.date}</p>
        <p className={`${HL_LABEL} leading-[1.4] font-normal`}>{item.label}</p>
      </div>
      {/* 1190:600 — a 24 icon 8 from its label on the phone, 36 and 12 at 1440 */}
      <p className="fl-lead relative flex items-center gap-[calc(8px_+_4*var(--fl))] leading-[1.5]">
        <img
          src={addToCalendar}
          alt=""
          aria-hidden
          className="size-[calc(23.688px_+_12.312*var(--fl))] shrink-0"
        />
        เพิ่มไปยังปฏิทิน
      </p>
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
           * a screen of gradient between them, twice. Side by side at 768 each is 315x316, a
           * near-square that the bowl garnish fills. The 700/476 split is still Figma's, and
           * still only applies where Figma's row exists.
           */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-[700fr_476fr] ${STACK_GAP}`}>
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
      </div>
    </section>
  )
}
