import ScrollEdgeEffect from './ScrollEdgeEffect'
import { ramp } from './ScopeCardArt'
import { CODERN_PARAGRAPHS } from '../aboutData'
import { useReveal } from '../hooks/useReveal'

/**
 * Figma node 708:739 "Section / Contact Info" — page y 1106, 1151.7 tall, 120 side
 * padding, 10 top and bottom. The trailing pad also carries the 104.3 Figma leaves
 * before the FAQ section starts at page y 2362.
 */
export default function CodernSection() {
  const card = useReveal()

  return (
    <section id="codern" className="shell sec-codern relative">
      {/*
       * Decoration / Circle (708:740): a 20%-opacity #D79A4E blob under a 400px Gaussian
       * blur, turned 90° and flipped. The export already contains the blur, which is why
       * the bitmap is 800px larger than its box on every side.
       */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        {/*
         * `decor-fit decor-stage` rather than `hidden lg:block`: the wash used to vanish below
         * lg, which was part of why the phone page looked bare. The stage scales about its own
         * top-left and the anchor is scaled by the same factor, so the blob keeps its position
         * relative to the section at every width. See `.decor-fit` in pasta-motion.css.
         *
         * 431 and up only, now — see the phone copy below.
         */}
        <div
          className="decor-fit decor-stage absolute hidden origin-top-left min-[431px]:block"
          style={{
            left: 'calc(596px * var(--decor-fit))',
            top: 'calc(25px * var(--decor-fit))',
            width: 1155,
            height: 1125,
            transform: 'rotate(90deg) scaleY(-1)',
          }}
        >
          <img
            src="/assets/figma/72033216c90ff7681fc2bf9386c77996c57c1e83.svg"
            alt=""
            className="absolute max-w-none"
            style={{ left: -800, top: -800, width: 2755, height: 2725 }}
          />
        </div>
        {/*
         * The same blob at 402, and NOT scaled — which is the correction. `1190:1329` is
         * "Decoration / Circle" at (611, 10) inside this section on the phone frame, still
         * 1125 x 1155: Figma does not shrink it for the phone, it keeps it at full size and lets
         * the canvas crop it. `decor-stage` was taking it to 100vw/1440 = 0.279 there, i.e. a
         * 314px blob with a 223px blur skirt sitting in the middle of the card instead of the
         * page-wide warm wash this section is supposed to sit in — a large part of why the phone
         * background read as wrong.
         *
         * That is also the policy `AboutDecor`'s own `Wash()` and the homepage's two washes
         * already argue for and for the same reason: it is one soft gradient thousands of px
         * across, a centred slice of it reads as the same tint at any viewport, and scaling it
         * removes the only thing standing between a narrow /guide and flat white. The 402 frame
         * is anchored at 1:1 about the centre line, as everywhere else on this page.
         *
         * At 611 the box starts 209px past a 402 canvas, but the export bakes in the 400px layer
         * blur with an 800px bleed on every side (hence the 2755 x 2725 bitmap against the 1155 x
         * 1125 box), so what lands on screen is the blur's left tail — which is the whole of what
         * Figma shows there too.
         */}
        <div
          className="absolute origin-top-left min-[431px]:hidden"
          style={{
            left: 'calc(50% - 201px + 611px)',
            top: 10,
            width: 1155,
            height: 1125,
            transform: 'rotate(90deg) scaleY(-1)',
          }}
        >
          <img
            src="/assets/figma/72033216c90ff7681fc2bf9386c77996c57c1e83.svg"
            alt=""
            className="absolute max-w-none"
            style={{ left: -800, top: -800, width: 2755, height: 2725 }}
          />
        </div>
      </div>

      {/* The card's corners RAMP: `1190:1330` is `rounded-[16px]` and `708:741` is
          `rounded-[24px]`, so the flat `rounded-3xl` was the desktop value worn at 402, where
          the card is 354 wide instead of 1200. 15.792 + 8.208 is 16.000 at 402 and exactly
          24.000 at `--fl` = 1, i.e. `rounded-3xl` unchanged at 1440. */}
      <div
        ref={card.ref}
        className={`relative z-10 mx-auto flex max-w-[1200px] flex-col justify-center overflow-hidden rounded-[calc(15.792px_+_8.208*var(--fl))] bg-white shadow-soft ${card.cls}`}
      >
        <div className="relative w-full">
          <img
            src="/assets/figma/a36ebf838df297eb767fed223d861f66757fe4a2.png"
            alt="หน้าจอแพลตฟอร์ม Codern"
            /* The screenshot's own top corners are 20 at 1440 (`708:742`) and 16 on the phone
               (`1190:1331`) — Figma insets them 4 inside the desktop card's 24 and flush with
               the phone card's 16. 15.896 + 4.104 is 16.000 at 402 and exactly 20.000 at
               `--fl` = 1. */
            /* `mm-settle` — the largest image on /guide used to paint in the same frame as the
               card it sits in, so the card's arrival and its contents' were one event. Now it
               settles in from 0.94 a beat later. Safe on this element specifically: the card is
               `overflow-hidden` so the growth is clipped rather than overlapping a neighbour,
               and nothing else here owns `scale` — the ramps above are radius and aspect only. */
            className="mm-settle aspect-[1954/1154] w-full rounded-t-[calc(15.896px_+_4.104*var(--fl))] object-cover"
          />
          {/*
           * The screenshot's bottom fades out under a progressive blur. Figma's 160 is
           * against a 709-tall image in the 1200 column — 22.6% of it. As a hard 160px the
           * band stayed put while the image shrank with the column, so at 390 it covered
           * 76% of a 211-tall screenshot and the whole thing rendered as a black smear.
           * The fraction is the invariant, not the pixel count.
           */}
          <ScrollEdgeEffect
            tone="dark"
            flip
            maskAlpha={0.9}
            className="absolute inset-x-0 bottom-0 h-[22.6%]"
          />
        </div>

        {/*
         * The card's own padding and the gap under its eyebrow, both solved through Figma's
         * two frames instead of being flat-floored:
         *
         *   padding  40 at 1440 (`708:744`, the description inset 40 in the 1200 card)
         *            16 at 402  (`1190:1333`, the header inset 16 in the 354 card)
         *   eyebrow  20 at 1440 (`708:744` ends at 76, the title container starts at 96)
         *            12 at 402  (`1190:1334` ends at 30, `1190:1335` starts at 42)
         *
         * `24 + 16` gave 24.4 of padding at 402 — half again what the frame asks for, on the
         * one screen where the card is 354 wide and the paragraphs are now 13 lines long.
         */}
        <div className="flex w-full flex-col" style={{ gap: ramp(12, 20), padding: ramp(16, 40) }}>
          <p className="fl-eyebrow leading-[1.5] font-medium text-brand-yellow">02</p>
          {/* Title-to-body: `708:746` stacks its Title (h67) and Description (y71) 4 apart at
              1440; `1190:1333` stacks the same pair 12 apart on the phone (Title y42 h39,
              Description y93), the whole phone header being a flat 3-child stack on a uniform
              12. It was a flat `gap-1`. 4.000 at `--fl` = 1, so 1440 does not move. */}
          <div className="flex flex-col gap-[calc(12.208px_-_8.208*var(--fl))]">
            <h2 className="fl-section leading-[1.4] font-semibold">แพลตฟอร์ม Codern</h2>
            {/* one blank 36px line between the paragraphs, as Figma sets them */}
            <div className="fl-lead flex flex-col gap-[calc(24px_+_12*var(--fl))] leading-[1.5] font-light">
              {CODERN_PARAGRAPHS.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
